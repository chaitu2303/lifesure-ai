import json
from typing import List, Dict, Any, Optional
from app.schemas import (
    AssessmentCreateRequest,
    CalculationResultResponse,
    ProductRecommendationItem,
    RecommendationsResponse,
)

DEMO_PRODUCTS = [
    {
        "id": "term-pure-shield",
        "name": "LifeSure Pure Term Shield",
        "category": "term",
        "category_label": "Term Life Insurance",
        "tagline": "Pure, uncompromised financial protection with maximum sum assured per dollar.",
        "ideal_for": "Income replacement, mortgage/liability coverage, young families with high dependencies.",
        "cost_rating": "Low (Best Value)",
        "flexibility_rating": "High",
        "investment_component": False,
        "key_benefits": [
            "Highest death benefit payout per dollar of premium paid",
            "Fixed guaranteed premiums throughout chosen term (10 to 40 years)",
            "Optional critical illness and accidental disability rider add-ons",
            "Tax-advantaged death benefit payout to nominated beneficiaries"
        ],
        "limitations": [
            "Pure protection: no maturity or cash refund if you survive the policy term",
            "Coverage ceases once the specified policy term expires",
            "Underwriting requires medical disclosure / health screening"
        ],
        "base_monthly_rate_factor": 25.0 # per $100k / ₹1Lakh
    },
    {
        "id": "ulip-smart-wealth",
        "name": "LifeSure Smart Wealth Advantage",
        "category": "ulip",
        "category_label": "Unit-Linked Insurance Plan (ULIP)",
        "tagline": "Dual-benefit hybrid combining life insurance protection with equity and debt market wealth creation.",
        "ideal_for": "Disciplined long-term investors (10+ years horizon) seeking market-linked returns alongside cover.",
        "cost_rating": "Moderate",
        "flexibility_rating": "High (Switch between equity/debt funds)",
        "investment_component": True,
        "key_benefits": [
            "Growth potential through professionally managed equity and balanced funds",
            "Tax-free fund switches between debt and equity based on market conditions",
            "Partial withdrawal facility after mandatory 5-year lock-in period",
            "Dual benefit: Death benefit or accumulated fund value at maturity"
        ],
        "limitations": [
            "Investment returns are subject to capital market fluctuations and are NOT guaranteed",
            "Higher mortality and fund management charges compared to direct mutual funds",
            "Requires minimum 5-year lock-in with optimal horizon of 10-15 years"
        ],
        "base_monthly_rate_factor": 75.0
    },
    {
        "id": "endowment-secure-future",
        "name": "LifeSure Secure Future Guaranteed",
        "category": "endowment",
        "category_label": "Guaranteed Endowment Plan",
        "tagline": "Disciplined savings plan with guaranteed maturity sum plus reversionary bonuses and life cover.",
        "ideal_for": "Conservative savers targeting specific milestone goals like child education or daughter's marriage.",
        "cost_rating": "High",
        "flexibility_rating": "Low",
        "investment_component": True,
        "key_benefits": [
            "Guaranteed maturity payout unaffected by stock market swings",
            "Accruing annual reversionary and terminal bonuses declared by insurer",
            "Structured discipline ensures funds are preserved for fixed milestone dates",
            "Built-in loan facility against policy surrender value after 3 years"
        ],
        "limitations": [
            "Substantially higher premium required for equivalent life cover compared to term insurance",
            "Historic internal rate of return (IRR) is typically modest (4.5% - 6.0%), often below equity inflation",
            "Surrender penalties in early years can result in capital loss if policy is lapsed"
        ],
        "base_monthly_rate_factor": 110.0
    },
    {
        "id": "whole-life-heritage",
        "name": "LifeSure Legacy Whole Life",
        "category": "whole_life",
        "category_label": "Whole Life Insurance",
        "tagline": "Lifelong permanent protection up to age 100 with guaranteed cash value buildup and legacy transfer.",
        "ideal_for": "Estate planning, generational wealth transfer, and supporting lifelong dependent family members.",
        "cost_rating": "High",
        "flexibility_rating": "Moderate",
        "investment_component": True,
        "key_benefits": [
            "Permanent protection guaranteed for entire lifetime (up to age 99/100)",
            "Guaranteed cash value accumulation accessible through policy loans",
            "Enables smooth estate transfer without probate delay or dispute",
            "Level premium payments that never increase with advancing age"
        ],
        "limitations": [
            "Significantly higher initial premium cost compared to term policies",
            "Cash value accumulates slowly in the initial 5 to 7 policy years",
            "Overkill for pure income replacement if dependents become independent later in life"
        ],
        "base_monthly_rate_factor": 95.0
    }
]


class ProductRecommendationEngine:
    """
    Deterministic, explainable product recommendation rules matching protection needs,
    affordability constraints, time horizons, and risk profiles.
    """

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
        risk_profile = assessment_input.risk_profile.lower()
        dependents = assessment_input.dependents_count
        has_future_goals = len(assessment_input.future_goals) > 0
        has_debt = calc_result.total_liabilities > 0

        scores: Dict[str, int] = {}
        fit_reasons_map: Dict[str, List[str]] = {}
        headline_map: Dict[str, str] = {}

        # -------------------------------------------------------------
        # 1. EVALUATE TERM LIFE INSURANCE
        # -------------------------------------------------------------
        term_score = 50 # Baseline
        term_reasons = []

        if net_cover > 0:
            term_score += 35
            term_reasons.append(f"Essential to close your calculated protection gap of {net_cover:,.0f} with highest cost-efficiency.")
        else:
            term_score += 10
            term_reasons.append("Your existing assets and cover currently match baseline needs; minimal additional cover required.")

        if has_debt:
            term_score += 10
            term_reasons.append(f"Outstanding debt ({calc_result.total_liabilities:,.0f}) requires immediate low-cost death benefit protection.")

        if dependents > 0:
            term_score += 10
            term_reasons.append(f"Provides uninterrupted living expense replacement for your {dependents} dependent family member(s).")

        if monthly_budget > 0 and monthly_budget < calc_result.estimated_monthly_premium_range["median"] * 1.5:
            term_score += 10
            term_reasons.append("Best match for your monthly budget, offering maximum sum assured per dollar.")

        scores["term"] = min(98, max(40, term_score))
        fit_reasons_map["term"] = term_reasons
        headline_map["term"] = "Top recommendation for closing your protection gap with maximum capital efficiency."

        # -------------------------------------------------------------
        # 2. EVALUATE ULIP
        # -------------------------------------------------------------
        ulip_score = 40
        ulip_reasons = []

        if risk_profile in ["moderate", "aggressive"]:
            ulip_score += 25
            ulip_reasons.append(f"Matches your '{risk_profile}' risk profile with market-linked asset growth.")
        else:
            ulip_score -= 15
            ulip_reasons.append("Conservative risk profile may experience discomfort with market-linked NAV volatility.")

        if age < 45:
            ulip_score += 15
            ulip_reasons.append(f"At age {age}, you have a long investment runway (10-15+ years) to compound returns.")
        else:
            ulip_score -= 10
            ulip_reasons.append("Shorter horizon before retirement reduces the benefit of market compounding.")

        if monthly_budget >= 100:
            ulip_score += 10
            ulip_reasons.append("Sufficient budget to support regular wealth accumulation contributions.")
        else:
            ulip_score -= 15
            ulip_reasons.append("Low budget makes pure term insurance a more urgent priority than investment bundles.")

        scores["ulip"] = min(95, max(25, ulip_score))
        fit_reasons_map["ulip"] = ulip_reasons
        headline_map["ulip"] = "Suitable for wealth creation plus insurance if protection needs are comfortably affordable."

        # -------------------------------------------------------------
        # 3. EVALUATE ENDOWMENT PLAN
        # -------------------------------------------------------------
        endow_score = 35
        endow_reasons = []

        if risk_profile == "conservative":
            endow_score += 30
            endow_reasons.append("Appeals to conservative preferences with zero market risk and guaranteed capital preservation.")
        elif risk_profile == "aggressive":
            endow_score -= 20
            endow_reasons.append("Returns (typically 4.5%-6.0% IRR) lag behind diversified equity for aggressive growth.")

        if has_future_goals:
            endow_score += 15
            endow_reasons.append("Can be timed to mature precisely when future financial milestones (education/marriage) arrive.")

        if net_cover > 5000000: # Very large gap: endowment cannot cover it affordably
            endow_score -= 25
            endow_reasons.append(f"Due to your large protection requirement ({net_cover:,.0f}), an endowment plan would have prohibitive premium costs.")

        scores["endowment"] = min(90, max(20, endow_score))
        fit_reasons_map["endowment"] = endow_reasons
        headline_map["endowment"] = "Ideal for risk-averse savers prioritizing guaranteed milestone payouts over maximum cover."

        # -------------------------------------------------------------
        # 4. EVALUATE WHOLE LIFE
        # -------------------------------------------------------------
        whole_score = 30
        whole_reasons = []

        if age >= 40:
            whole_score += 15
            whole_reasons.append(f"At age {age}, whole life serves estate planning and legacy transfer to adult children.")
        else:
            whole_score += 5
            whole_reasons.append("Lifelong permanent coverage guarantees wealth transfer regardless of age of demise.")

        if calc_result.eligible_existing_assets > 2000000:
            whole_score += 20
            whole_reasons.append("High existing net worth makes permanent estate preservation and tax-efficient transfer relevant.")

        if net_cover > 0 and monthly_budget < 150:
            whole_score -= 20
            whole_reasons.append("Higher premium cost per unit of death benefit makes it less practical under current budget constraints.")

        scores["whole_life"] = min(90, max(20, whole_score))
        fit_reasons_map["whole_life"] = whole_reasons
        headline_map["whole_life"] = "Permanent lifelong coverage for estate legacy planning and multigenerational wealth preservation."

        # Determine primary winner
        # Rule of thumb: If net_cover > 0, Protection First principle gives Term Life high priority unless user has very high budget & zero gap
        ranked_categories = sorted(scores.keys(), key=lambda k: scores[k], reverse=True)
        primary_cat = ranked_categories[0]

        recommendations_list: List[ProductRecommendationItem] = []

        for p in DEMO_PRODUCTS:
            cat = p["category"]
            score = scores.get(cat, 50)
            is_primary = (cat == primary_cat)
            
            # Illustrative monthly cost estimation
            rate_factor = p["base_monthly_rate_factor"]
            # Scale slightly with age and cover
            units = max(1.0, min(net_cover, 10000000.0) / 100000.0)
            cost_multiplier = 1.0 + max(0, age - 30) * 0.03
            illustrative_cost = round(units * rate_factor * cost_multiplier / 12.0, 2)
            # Bound realistic demo minimum
            illustrative_cost = max(25.0, illustrative_cost)

            item = ProductRecommendationItem(
                product_id=p["id"],
                name=p["name"],
                category=p["category"],
                category_label=p["category_label"],
                tagline=p["tagline"],
                suitability_score=score,
                is_primary=is_primary,
                headline_reason=headline_map.get(cat, ""),
                fit_reasons=fit_reasons_map.get(cat, []),
                trade_offs=p["limitations"],
                ideal_for=p["ideal_for"],
                cost_rating=p["cost_rating"],
                flexibility_rating=p["flexibility_rating"],
                investment_component=p["investment_component"],
                illustrative_monthly_cost=illustrative_cost,
                cost_disclaimer="Simulated illustrative estimate for educational comparison only. Actual premiums depend on underwriting."
            )
            recommendations_list.append(item)

        # Sort recommendations list so primary is first, then by suitability score descending
        recommendations_list.sort(key=lambda x: (x.is_primary, x.suitability_score), reverse=True)

        return RecommendationsResponse(
            assessment_id=assessment_id,
            net_additional_cover=net_cover,
            recommended_product_category=primary_cat,
            primary_recommendation=recommendations_list[0],
            all_recommendations=recommendations_list,
            methodology_note=(
                "Recommendations apply deterministic rule-based multi-attribute utility theory, "
                "prioritizing adequate protection capital adequacy, affordability, time horizon, and stated risk appetite. "
                "Products are demo offerings and do not constitute an endorsement or commercial distribution."
            )
        )
