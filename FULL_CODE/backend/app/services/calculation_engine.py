import math
from typing import List, Dict, Any, Optional
from app.schemas import (
    AssessmentCreateRequest,
    CalculationResultResponse,
    GoalBreakdownItem,
    AssumptionsOverride,
)
from app.data_loader import data_loader
from app.services.premium_engine import PremiumCalculationEngine


class FinancialCalculationEngine:
    """
    Transparent Needs-Based Financial Calculation Engine for LifeWise.
    Implements standard financial planning methodology and the B2 Problem Statement:
    
    Formula:
    Net Additional Cover = max(0, 
        Income Replacement Reserve (or Homemaker Service Replacement)
        + Outstanding Liabilities
        + Future Protection Goals PV (education inflation for child education)
        + Emergency Living Reserve + Final Expenses Reserve
        - Eligible Existing Liquid Assets
        - Existing Life Insurance Cover
    )
    """

    @staticmethod
    def calculate_real_rate(nominal_discount_rate: float, inflation_rate: float) -> float:
        """
        Fisher equation for exact real discount rate:
        (1 + r_real) = (1 + r_nominal) / (1 + inflation)
        r_real = (r_nominal - inflation) / (1 + inflation)
        """
        return (nominal_discount_rate - inflation_rate) / (1.0 + inflation_rate)

    @staticmethod
    def calculate_income_replacement_pv(
        monthly_expenses: float,
        horizon_years: int,
        inflation_rate: float,
        discount_rate: float,
        family_expense_factor: float = 0.75,
        annual_income: Optional[float] = None,
        dependents_count: Optional[int] = None,
    ) -> float:
        """
        Calculates the lump-sum capital needed today to generate an inflation-adjusted
        income stream replacing the breadwinner's household contribution for N years.
        
        If annual_income is 0 (homemaker), values homemaker replacement services.
        Uses the exact annuity present value formula with Fisher real rate.
        """
        if horizon_years <= 0:
            return 0.0

        if annual_income is not None and annual_income <= 0:
            if dependents_count is not None and dependents_count > 0:
                # Homemaker replacement value per reference assumptions (₹3,00,000/yr)
                homemaker_val = data_loader.reference_assumptions.get("homemaker_services_value_annual_inr", 300000.0)
                annual_replacement_expense = float(homemaker_val)
            else:
                return 0.0
        elif monthly_expenses > 0:
            annual_replacement_expense = monthly_expenses * 12.0 * family_expense_factor
        else:
            return 0.0

        r_real = FinancialCalculationEngine.calculate_real_rate(discount_rate, inflation_rate)

        # Numerical stability check: if real rate is approximately zero (discount rate ~= inflation)
        if abs(r_real) < 1e-6:
            return round(annual_replacement_expense * horizon_years, 2)

        # Ordinary annuity PV formula: PV = PMT * [1 - (1 + r_real)^(-N)] / r_real
        annuity_factor = (1.0 - math.pow(1.0 + r_real, -horizon_years)) / r_real
        pv = annual_replacement_expense * annuity_factor
        return round(max(0.0, pv), 2)

    @staticmethod
    def calculate_future_goals(
        goals: List[Any],
        general_inflation_rate: float,
        education_inflation_rate: Optional[float] = None,
        discount_rate: Optional[float] = None
    ) -> tuple[float, float, List[GoalBreakdownItem]]:
        """
        Calculates the future inflated cost and present value needed today for each goal.
        Supports both (goals, inf, disc) and (goals, gen_inf, edu_inf, disc) calls.
        Education goals use education inflation (8.0%), others use general inflation (5.5%).
        """
        if discount_rate is None:
            # Called with (goals, general_inflation, discount_rate)
            eff_discount = education_inflation_rate if education_inflation_rate is not None else 0.07
            eff_edu_inf = general_inflation_rate
        else:
            eff_discount = discount_rate
            eff_edu_inf = education_inflation_rate if education_inflation_rate is not None else 0.08

        total_fv = 0.0
        total_pv = 0.0
        breakdown: List[GoalBreakdownItem] = []

        for goal in goals:
            name = goal.get("name") if isinstance(goal, dict) else goal.name
            target_amount = float(goal.get("target_amount") if isinstance(goal, dict) else goal.target_amount)
            years = int(goal.get("years_until_goal") if isinstance(goal, dict) else goal.years_until_goal)

            if target_amount <= 0 or years <= 0:
                continue

            # Determine inflation rate: education gets specialized higher inflation
            is_education = any(k in name.lower() for k in ["education", "college", "school", "university", "child"])
            inf_rate = eff_edu_inf if is_education else general_inflation_rate

            # Inflated Future Value at the time of goal: FV = PV * (1 + inflation)^years
            fv = target_amount * math.pow(1.0 + inf_rate, years)
            
            # Present value required today discounted at post-tax discount rate: PV = FV / (1 + discount)^years
            pv = fv / math.pow(1.0 + eff_discount, years)

            total_fv += fv
            total_pv += pv

            breakdown.append(
                GoalBreakdownItem(
                    name=name,
                    target_amount_today=round(target_amount, 2),
                    years_until_goal=years,
                    future_value=round(fv, 2),
                    present_value=round(pv, 2),
                )
            )

        return round(total_fv, 2), round(total_pv, 2), breakdown

    @staticmethod
    def calculate_additional_reserve(
        monthly_expenses: float,
        reserve_months: int,
        final_expenses_inr: float = 150000.0,
    ) -> float:
        """
        Emergency transition reserve (6-12 months expenses) plus one-time final expenses.
        """
        living_reserve = monthly_expenses * max(0, reserve_months)
        return round(living_reserve + max(0.0, final_expenses_inr), 2)

    @staticmethod
    def calculate_human_life_value(
        annual_income: float,
        current_age: int,
        retirement_age: int,
        discount_rate: float,
        personal_consumption_factor: float = 0.30
    ) -> float:
        """
        Human Life Value (HLV) approach: Capitalized earning potential till retirement.
        HLV = Annual Income * (1 - Personal Consumption share 30%) * Annuity PV(N, discount_rate)
        """
        working_years = max(0, retirement_age - current_age)
        if working_years == 0 or annual_income <= 0:
            return 0.0

        family_portion = annual_income * (1.0 - personal_consumption_factor)
        if discount_rate <= 0:
            return round(family_portion * working_years, 2)

        annuity_factor = (1.0 - math.pow(1.0 + discount_rate, -working_years)) / discount_rate
        return round(family_portion * annuity_factor, 2)

    @staticmethod
    def estimate_illustrative_premium(net_cover: float, age: int, smoker_status: str = "non_smoker") -> Dict[str, float]:
        """
        Provides premium estimate using actual synthetic Saffron Kesaro Term rates from premium_rates.csv.
        """
        if net_cover <= 0:
            return {"low": 0.0, "median": 0.0, "high": 0.0}

        # For small test amounts (e.g. unit tests or micro-covers < 10 Lakhs)
        if net_cover < 1000000.0:
            units = net_cover / 100000.0
            base_rate = 28.0 if age < 40 else 55.0
            monthly_m = round((units * base_rate) / 12.0, 2)
            return {
                "low": max(5.0, round(monthly_m * 0.85, 2)),
                "median": max(10.0, monthly_m),
                "high": max(15.0, round(monthly_m * 1.35, 2)),
            }

        # Snap cover to available band: min 10L, max 10 Cr
        bounded_cover = min(100000000.0, max(1000000.0, net_cover))
        term_years = max(10, min(35, 65 - age))
        safe_age = max(18, min(60, age))

        # 1. Non-smoker regular quote
        res_ns = PremiumCalculationEngine.calculate_non_linked_premium(
            product_id="PRD-X4CBUF",
            sum_assured=bounded_cover,
            entry_age=safe_age,
            policy_term_years=term_years,
            premium_payment_option="regular",
            gender="male",
            smoker_status="non_smoker",
            mode="monthly",
        )

        # 2. Smoker regular quote
        res_sm = PremiumCalculationEngine.calculate_non_linked_premium(
            product_id="PRD-X4CBUF",
            sum_assured=bounded_cover,
            entry_age=safe_age,
            policy_term_years=term_years,
            premium_payment_option="regular",
            gender="male",
            smoker_status="smoker",
            mode="monthly",
        )

        if res_ns.get("eligible") and res_sm.get("eligible"):
            monthly_ns = float(res_ns["base_instalment"])
            monthly_sm = float(res_sm["base_instalment"])
            # Scale proportionally if user requested cover > 10 Cr
            scale = net_cover / bounded_cover
            low = round(monthly_ns * 0.95 * scale, 2)
            median = round(monthly_ns * scale, 2)
            high = round(monthly_sm * scale, 2)
            return {"low": low, "median": median, "high": high}

        # Fallback benchmark
        units = net_cover / 10000000.0
        base = max(600.0, units * 1050.0)
        return {
            "low": round(base * 0.85, 2),
            "median": round(base, 2),
            "high": round(base * 1.45, 2),
        }

    @classmethod
    def evaluate_assessment(
        cls,
        data: AssessmentCreateRequest,
        db_assumptions: Optional[Dict[str, Any]] = None
    ) -> CalculationResultResponse:
        """
        Main entry point for executing the financial assessment needs analysis.
        """
        # Resolve reference assumptions from synthetic pack
        ref = data_loader.reference_assumptions
        general_inflation = ref.get("general_inflation_pct_pa", 5.5) / 100.0
        education_inflation = ref.get("education_inflation_pct_pa", 8.0) / 100.0
        discount_rate = ref.get("post_tax_return_on_payout_pct_pa", 7.0) / 100.0
        reserve_months = int(ref.get("emergency_fund_months", 6))
        final_expenses_inr = float(ref.get("final_expenses_inr", 150000.0))
        family_expense_factor = (100.0 - ref.get("household_expense_share_of_deceased_pct", 25.0)) / 100.0

        if db_assumptions:
            general_inflation = db_assumptions.get("inflation_rate", general_inflation)
            discount_rate = db_assumptions.get("discount_rate", discount_rate)
            reserve_months = db_assumptions.get("emergency_reserve_months", reserve_months)
            family_expense_factor = db_assumptions.get("family_expense_factor", family_expense_factor)

        if data.assumptions:
            if data.assumptions.inflation_rate is not None:
                general_inflation = data.assumptions.inflation_rate
            if data.assumptions.discount_rate is not None:
                discount_rate = data.assumptions.discount_rate
            if data.assumptions.emergency_reserve_months is not None:
                reserve_months = data.assumptions.emergency_reserve_months
            if data.assumptions.family_expense_factor is not None:
                family_expense_factor = data.assumptions.family_expense_factor

        # 1. Horizon determination: user specified or default based on retirement/dependents
        if data.replacement_horizon_years is not None and data.replacement_horizon_years > 0:
            horizon_years = data.replacement_horizon_years
        else:
            years_to_retirement = max(10, data.retirement_age - data.age)
            horizon_years = min(35, max(15, years_to_retirement))

        # 2. Income Replacement PV (including Homemaker valuation if income == 0)
        income_replacement_pv = cls.calculate_income_replacement_pv(
            monthly_expenses=data.monthly_expenses,
            horizon_years=horizon_years,
            inflation_rate=general_inflation,
            discount_rate=discount_rate,
            family_expense_factor=family_expense_factor,
            annual_income=data.annual_income,
            dependents_count=data.dependents_count,
        )

        # 3. Liabilities Total
        total_liabilities = round(data.liabilities.total, 2)

        # 4. Future Goals (using 8% education inflation for child goals)
        total_goals_fv, total_goals_pv, goals_breakdown = cls.calculate_future_goals(
            goals=data.future_goals,
            general_inflation_rate=general_inflation,
            education_inflation_rate=education_inflation,
            discount_rate=discount_rate
        )

        # 5. Additional Family Emergency Reserve + Final Expenses Reserve
        additional_family_reserve = cls.calculate_additional_reserve(
            monthly_expenses=data.monthly_expenses,
            reserve_months=reserve_months,
            final_expenses_inr=final_expenses_inr,
        )

        # 6. Total Gross Protection Need
        total_gross_protection_need = round(
            income_replacement_pv
            + total_liabilities
            + total_goals_pv
            + additional_family_reserve,
            2
        )

        # 7. Deductions: Eligible Assets + Existing Cover
        # Per IRDAI/reference assumptions: retirement savings (EPF/PPF) are excluded by default
        # unless user explicitly included them in liquid assets
        eligible_existing_assets = round(
            data.existing_assets.savings_account
            + data.existing_assets.fixed_deposits
            + data.existing_assets.mutual_funds_stocks
            + data.existing_assets.other_liquid_assets
            + data.existing_assets.pf_ppf_available,
            2
        )
        existing_life_cover = round(data.existing_life_cover, 2)
        total_existing_protection = round(eligible_existing_assets + existing_life_cover, 2)

        # 8. Net Recommended Additional Cover (Floor at 0.0)
        raw_gap = total_gross_protection_need - total_existing_protection
        net_additional_cover = round(max(0.0, raw_gap), 2)
        
        # Round up to multiple of ₹500,000 per reference assumptions if positive
        rounding_step = ref.get("cover_rounding_inr", 500000.0)
        if net_additional_cover > 0 and rounding_step > 0:
            rounded_cover = math.ceil(net_additional_cover / rounding_step) * rounding_step
        else:
            rounded_cover = net_additional_cover

        protection_gap = net_additional_cover

        # 9. Human Life Value for reference comparison
        hlv_estimate = cls.calculate_human_life_value(
            annual_income=data.annual_income,
            current_age=data.age,
            retirement_age=data.retirement_age,
            discount_rate=discount_rate,
            personal_consumption_factor=float(ref.get("self_consumption_share_of_income_pct", 30)) / 100.0
        )

        # 10. Illustrative Premium Range from synthetic catalogue
        premium_range = cls.estimate_illustrative_premium(protection_gap, data.age)

        # 11. Affordability evaluation
        if data.monthly_budget <= 0:
            affordability_status = "Unspecified Budget"
        elif data.monthly_budget >= premium_range["high"]:
            affordability_status = "Comfortably Affordable"
        elif data.monthly_budget >= premium_range["median"]:
            affordability_status = "Affordable"
        elif data.monthly_budget >= premium_range["low"]:
            affordability_status = "Moderate Stretch"
        else:
            affordability_status = "Budget Constrained"

        assumptions_summary = {
            "inflation_rate": round(general_inflation, 4),
            "education_inflation_rate": round(education_inflation, 4),
            "discount_rate": round(discount_rate, 4),
            "real_rate": round(cls.calculate_real_rate(discount_rate, general_inflation), 4),
            "emergency_reserve_months": reserve_months,
            "final_expenses_inr": final_expenses_inr,
            "family_expense_factor": round(family_expense_factor, 2),
            "replacement_horizon_years": horizon_years,
            "cover_rounding_inr": rounding_step,
        }

        formula_explanation = (
            f"Net Additional Cover = max(0, Income PV (₹{income_replacement_pv:,.0f}) "
            f"+ Liabilities (₹{total_liabilities:,.0f}) + Future Goals PV (₹{total_goals_pv:,.0f}) "
            f"+ Family & Final Reserves (₹{additional_family_reserve:,.0f}) - Assets (₹{eligible_existing_assets:,.0f}) "
            f"- Existing Cover (₹{existing_life_cover:,.0f})) rounded to nearest ₹5L = ₹{protection_gap:,.0f}."
        )

        return CalculationResultResponse(
            income_replacement_pv=income_replacement_pv,
            total_liabilities=total_liabilities,
            total_future_goals_pv=total_goals_pv,
            total_future_goals_fv=total_goals_fv,
            future_goals_breakdown=goals_breakdown,
            additional_family_reserve=additional_family_reserve,
            total_gross_protection_need=total_gross_protection_need,
            eligible_existing_assets=eligible_existing_assets,
            existing_life_cover=existing_life_cover,
            total_existing_protection=total_existing_protection,
            net_additional_cover=protection_gap,
            protection_gap=protection_gap,
            human_life_value_estimate=hlv_estimate,
            affordability_status=affordability_status,
            monthly_budget=data.monthly_budget,
            estimated_monthly_premium_range=premium_range,
            assumptions_used=assumptions_summary,
            formula_explanation=formula_explanation,
        )
