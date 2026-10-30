from typing import List, Dict, Any, Optional, Tuple
from app.schemas import (
    AssessmentCreateRequest,
    CalculationResultResponse,
    ProductRecommendationItem,
    RecommendationsResponse,
)
from app.data_loader import data_loader
from app.services.premium_engine import PremiumCalculationEngine


class ProductRecommendationEngine:
    """
    Explainable, deterministic product eligibility and recommendation engine
    evaluating all 14 synthetic products in the Saffron Life catalogue against
    customer profile, protection gap, liabilities, goals, budget, and underwriting rules.
    """

    @classmethod
    def check_product_eligibility(
        cls,
        product: Dict[str, Any],
        age: int,
        annual_income: float,
        sum_assured: float,
        policy_term: int,
        existing_cover: float = 0.0,
        spouse_income: float = 0.0,
    ) -> Tuple[bool, List[str]]:
        """
        Validates whether applicant meets product underwriting and financial eligibility.
        Returns (is_eligible, list_of_ineligibility_reasons).
        """
        reasons = []

        # 1. Entry Age
        min_age = product.get("min_entry_age", 18)
        max_age = product.get("max_entry_age", 65)
        if not (min_age <= age <= max_age):
            reasons.append(f"Age {age} is outside the allowed entry age window of {min_age} to {max_age} years.")

        # 2. Maximum Maturity Age
        max_maturity = product.get("max_maturity_age", 75)
        if (age + policy_term) > max_maturity:
            reasons.append(f"Policy term of {policy_term} years at age {age} matures at {age + policy_term}, exceeding maximum maturity age of {max_maturity}.")

        # 3. Sum Assured Bounds
        min_sa = float(product.get("min_sum_assured_inr") or 100000)
        max_sa = float(product.get("max_sum_assured_inr") or 100000000)
        if sum_assured < min_sa:
            reasons.append(f"Sum assured ₹{sum_assured:,.0f} is below minimum allowed of ₹{min_sa:,.0f}.")
        if sum_assured > max_sa:
            reasons.append(f"Sum assured ₹{sum_assured:,.0f} exceeds maximum allowed of ₹{max_sa:,.0f}.")

        # 4. Income Requirements & Non-Earning Applicant Rules
        if annual_income <= 0:
            if not product.get("non_earning_applicant_allowed", False):
                reasons.append("This product is not available to applicants with no earned income.")
            else:
                if spouse_income <= 0:
                    reasons.append("Non-earning applicant requires a working spouse with verifiable earned income.")
                else:
                    max_cover_cap = float(product.get("non_earning_max_cover_inr") or 5000000)
                    spouse_mult_cap = float(product.get("non_earning_max_multiple_of_spouse_income") or 5) * spouse_income
                    effective_cap = min(max_cover_cap, spouse_mult_cap)
                    if (existing_cover + sum_assured) > effective_cap:
                        reasons.append(f"Total individual cover (₹{existing_cover + sum_assured:,.0f}) exceeds non-earning applicant cap of ₹{effective_cap:,.0f}.")
        else:
            min_income = float(product.get("min_annual_income_inr") or 0)
            if annual_income < min_income:
                reasons.append(f"Annual income ₹{annual_income:,.0f} is below required minimum of ₹{min_income:,.0f}.")

            # 5. Financial Underwriting Cover Caps (Income Multiple Limit)
            income_limits = product.get("income_multiple_limits") or []
            max_mult = 10
            for lim in income_limits:
                if int(lim.get("min_age", 18)) <= age <= int(lim.get("max_age", 99)):
                    max_mult = int(lim.get("max_multiple_of_annual_income", 10))
                    break
            overall_cap = max_mult * annual_income
            if (existing_cover + sum_assured) > overall_cap:
                reasons.append(
                    f"Total individual cover (₹{existing_cover + sum_assured:,.0f}) exceeds financial underwriting limit "
                    f"of {max_mult}x income (₹{overall_cap:,.0f}) for age {age}."
                )

            # 6. Non-term sum assured cap (Whole life, Endowment, ULIP <= 10x income)
            cat = product.get("category")
            if cat in ["whole_life", "endowment", "ulip"]:
                non_term_cap = 10.0 * annual_income
                if sum_assured > non_term_cap:
                    reasons.append(f"New non-term cover (₹{sum_assured:,.0f}) exceeds 10x annual income limit (₹{non_term_cap:,.0f}).")

        return (len(reasons) == 0, reasons)

    @classmethod
    def evaluate_recommendations(
        cls,
        assessment_input: AssessmentCreateRequest,
        calc_result: CalculationResultResponse,
        assessment_id: Optional[int] = None
    ) -> RecommendationsResponse:
        net_cover = calc_result.net_additional_cover
        monthly_budget = assessment_input.monthly_budget
        age = assessment_input.age
        income = assessment_input.annual_income
        risk_profile = assessment_input.risk_profile.lower()
        dependents = assessment_input.dependents_count
        has_debt = calc_result.total_liabilities > 0
        has_child_goal = any("child" in g.name.lower() or "education" in g.name.lower() for g in assessment_input.future_goals)
        has_home_loan = assessment_input.liabilities.home_loan > 0

        # Term horizon
        target_term = max(10, min(35, assessment_input.retirement_age - age))

        candidate_scores: List[Dict[str, Any]] = []

        for prod in data_loader.products_list:
            pid = prod["product_id"]
            cat = prod["category"]
            pname = prod["product_name"]

            # Target sum assured for this product
            if cat == "term":
                min_s = float(prod.get("min_sum_assured_inr") or 1000000)
                max_s = float(prod.get("max_sum_assured_inr") or 100000000)
                target_sa = max(min_s, min(net_cover, max_s))
            else:
                # Savings / hybrid products take a fraction of the gap, capped at 10x income
                min_s = float(prod.get("min_sum_assured_inr") or 500000)
                max_s = float(prod.get("max_sum_assured_inr") or 20000000)
                target_sa = max(min_s, min(net_cover * 0.40, min(max_s, income * 8.0 if income > 0 else 2500000)))

            # Step enforcement
            step = float(prod.get("sum_assured_step_inr") or 100000)
            if step > 0:
                target_sa = round(target_sa / step) * step

            is_eligible, ineligibility_reasons = cls.check_product_eligibility(
                product=prod,
                age=age,
                annual_income=income,
                sum_assured=target_sa,
                policy_term=target_term,
                existing_cover=calc_result.existing_life_cover,
            )

            # Score product suitability
            base_score = 50
            fit_reasons = []
            trade_offs = []
            headline = ""

            if cat == "term":
                # Term life scoring
                if net_cover > 0:
                    base_score += 30
                    fit_reasons.append(f"Directly addresses your primary financial protection gap of ₹{net_cover:,.0f} with highest capital efficiency.")
                if has_debt:
                    base_score += 10
                    fit_reasons.append(f"Secures your outstanding liabilities of ₹{calc_result.total_liabilities:,.0f} so family avoids forced liquidation.")
                if dependents > 0:
                    base_score += 10
                    fit_reasons.append(f"Provides uninterrupted living expense replacement for your {dependents} dependent family member(s).")

                # Product specific variants
                if pid == "PRD-24CQIR" and has_home_loan:
                    base_score += 15
                    fit_reasons.append("Decreasing cover schedule tracks your amortising home loan balance, minimising premium expenditure.")
                    headline = "Tailor-made for home loan and debt protection."
                elif pid == "PRD-KPBXLP":
                    base_score += 8
                    fit_reasons.append("Sum assured increases over time to match rising cost of living and lifestyle inflation.")
                    headline = "Increasing cover to combat inflation over your career."
                elif pid == "PRD-VDIJSF":
                    if risk_profile == "conservative":
                        base_score += 5
                    fit_reasons.append("Returns 100% of total premiums paid upon policy survival.")
                    trade_offs.append("Higher premium than pure level term insurance for equivalent sum assured.")
                    headline = "Term protection with 100% money back on survival."
                elif pid == "PRD-02YUOF":
                    if income < 500000:
                        base_score += 20
                    headline = "Affordable, entry-level term protection with simplified underwriting."
                else:
                    headline = "Flagship pure protection plan with maximum sum assured per rupee."

                trade_offs.append("Pure risk cover: no maturity or cash value payout if you survive the policy term.")

            elif cat == "endowment":
                base_score = 35
                if risk_profile == "conservative":
                    base_score += 30
                    fit_reasons.append("Zero capital market exposure with guaranteed capital preservation and bonuses.")
                elif risk_profile == "aggressive":
                    base_score -= 15
                    trade_offs.append("Modest returns (typically 4.5% - 6% IRR) may lag behind long-term equity inflation.")

                if has_child_goal or len(assessment_input.future_goals) > 0:
                    base_score += 15
                    fit_reasons.append("Structured discipline ensures guaranteed funds are preserved for fixed milestone dates.")

                if pid == "PRD-7HLWPZ" and has_child_goal:
                    base_score += 10
                    fit_reasons.append("Built-in premium waiver ensures child's higher education funds are completed even in the breadwinner's absence.")
                    headline = "Dedicated child education protection with guaranteed milestone payouts."
                elif pid == "PRD-QZM4KL":
                    base_score += 10
                    fit_reasons.append("Regular survival money-back payouts provide liquidity every few years.")
                    headline = "Money-back liquidity paired with guaranteed life cover."
                else:
                    headline = "Traditional savings plan with capital preservation and life cover."

                trade_offs.append("Substantially higher premium required per lakh of life cover compared to term insurance.")

            elif cat == "ulip":
                base_score = 40
                if risk_profile in ["moderate", "aggressive"]:
                    base_score += 25
                    fit_reasons.append(f"Matches your '{risk_profile}' profile with tax-free equity and debt market wealth creation.")
                else:
                    base_score -= 15
                    trade_offs.append("Fund NAV is subject to market fluctuations and capital risk is borne by the investor.")

                if age < 45:
                    base_score += 15
                    fit_reasons.append(f"At age {age}, you have a multi-decade horizon to compound market-linked returns.")

                if monthly_budget >= 100:
                    base_score += 10
                    fit_reasons.append("Sufficient budget to support regular wealth accumulation contributions.")

                headline = "Dual wealth-creation vehicle combining market-linked growth with insurance cover."
                trade_offs.append("Mandatory 5-year lock-in period with upfront allocation and monthly mortality charges.")

            elif cat == "whole_life":
                base_score = 30
                if age >= 40:
                    base_score += 15
                    fit_reasons.append(f"Permanent life coverage up to age 99/100 guarantees wealth transfer for future generations.")
                if risk_profile == "conservative":
                    base_score += 10
                    fit_reasons.append("Participating bonuses or guaranteed additions build persistent policy cash value.")

                headline = "Lifelong protection and estate planning legacy up to age 100."
                trade_offs.append("Higher annual commitment suitable primarily for estate planning and legacy transfer.")

            # Calculate exact synthetic premium quote
            if cat == "ulip":
                ulip_ann_prem = max(30000.0, min(monthly_budget * 12.0 if monthly_budget > 0 else 60000.0, 500000.0))
                quote = PremiumCalculationEngine.calculate_ulip_premium(
                    product_id=pid,
                    annualised_premium=ulip_ann_prem,
                    entry_age=age,
                    policy_term_years=target_term,
                    mode="monthly",
                )
                monthly_cost = float(quote.get("total_instalment", 2500))
            else:
                quote = PremiumCalculationEngine.calculate_non_linked_premium(
                    product_id=pid,
                    sum_assured=target_sa,
                    entry_age=age,
                    policy_term_years=target_term,
                    premium_payment_option="regular" if "regular" in prod.get("parsed_payment_options", []) else prod["parsed_payment_options"][0],
                    gender="male",
                    smoker_status="non_smoker",
                    mode="monthly",
                )
                monthly_cost = float(quote.get("total_instalment", 1200)) if quote.get("eligible") else 0.0

            # Adjust score if ineligible
            if not is_eligible:
                base_score = max(20, base_score - 10)
                trade_offs.extend(ineligibility_reasons)

            final_score = min(98, max(20, base_score))

            candidate_scores.append({
                "product_id": pid,
                "name": pname,
                "category": cat,
                "category_label": prod.get("category_label", cat),
                "tagline": prod.get("plain_language_summary", prod.get("key_features", "")),
                "suitability_score": final_score,
                "is_primary": False,
                "headline_reason": headline or prod.get("plain_language_summary", ""),
                "fit_reasons": fit_reasons,
                "trade_offs": trade_offs,
                "ideal_for": prod.get("key_features", "Comprehensive life insurance protection"),
                "cost_rating": "Low (Best Value)" if cat == "term" else ("Moderate" if cat == "ulip" else "High"),
                "flexibility_rating": "High" if cat in ["term", "ulip"] else "Moderate",
                "investment_component": cat != "term",
                "illustrative_monthly_cost": monthly_cost,
                "cost_disclaimer": "Calculated using Saffron Life synthetic rate tables (premium_rates.csv). Demonstrative hackathon data.",
                "is_eligible": is_eligible,
                "ineligibility_reasons": ineligibility_reasons,
                "target_sum_assured": target_sa,
                "target_term": target_term,
            })

        # Sort by suitability score descending
        candidate_scores.sort(key=lambda x: x["suitability_score"], reverse=True)

        if candidate_scores:
            candidate_scores[0]["is_primary"] = True

        all_items = [ProductRecommendationItem(**c) for c in candidate_scores]
        primary = all_items[0] if all_items else None

        return RecommendationsResponse(
            assessment_id=assessment_id,
            net_additional_cover=net_cover,
            recommended_product_category=primary.category if primary else "term",
            primary_recommendation=primary,
            all_recommendations=all_items,
            methodology_note=(
                "Recommendations are generated deterministically by evaluating the customer's protection gap, "
                "underwriting eligibility constraints from Saffron Life catalogue, goal timelines, and risk tolerance. "
                "All premium calculations utilize the official synthetic premium_rates.csv table."
            ),
        )
