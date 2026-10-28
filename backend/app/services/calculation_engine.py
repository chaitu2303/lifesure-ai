import math
from typing import List, Dict, Any, Optional
from app.schemas import (
    AssessmentCreateRequest,
    CalculationResultResponse,
    GoalBreakdownItem,
    AssumptionsOverride,
)
from app.config import settings

class FinancialCalculationEngine:
    """
    Transparent Needs-Based Financial Calculation Engine for Life Insurance.
    
    Formula:
    Net Additional Cover = max(0, 
        Income Replacement Reserve
        + Outstanding Liabilities
        + Future Goals PV
        + Additional Family Reserve
        - Eligible Existing Assets
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
        family_expense_factor: float = 0.75
    ) -> float:
        """
        Calculates the lump-sum capital needed today to generate an inflation-adjusted
        income stream replacing the breadwinner's household contribution for N years.
        
        Uses the exact annuity present value formula with real interest rate.
        """
        if monthly_expenses <= 0 or horizon_years <= 0:
            return 0.0

        annual_replacement_expense = monthly_expenses * 12.0 * family_expense_factor
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
        inflation_rate: float,
        discount_rate: float
    ) -> tuple[float, float, List[GoalBreakdownItem]]:
        """
        Calculates the future inflated cost and present value needed today for each goal.
        """
        total_fv = 0.0
        total_pv = 0.0
        breakdown: List[GoalBreakdownItem] = []

        for goal in goals:
            # Handle dictionary or Pydantic model
            name = goal.get("name") if isinstance(goal, dict) else goal.name
            target_amount = float(goal.get("target_amount") if isinstance(goal, dict) else goal.target_amount)
            years = int(goal.get("years_until_goal") if isinstance(goal, dict) else goal.years_until_goal)

            if target_amount <= 0 or years <= 0:
                continue

            # Inflated Future Value at the time of goal: FV = PV * (1 + inflation)^years
            fv = target_amount * math.pow(1.0 + inflation_rate, years)
            
            # Present value required today discounted at nominal discount rate: PV = FV / (1 + discount)^years
            pv = fv / math.pow(1.0 + discount_rate, years)

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
        reserve_months: int
    ) -> float:
        """
        Emergency transition reserve for the family (e.g. 6-12 months expenses).
        """
        if monthly_expenses <= 0 or reserve_months <= 0:
            return 0.0
        return round(monthly_expenses * reserve_months, 2)

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
        HLV = Annual Income * (1 - Personal Consumption) * Annuity PV(N, discount_rate)
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
    def estimate_illustrative_premium(net_cover: float, age: int) -> Dict[str, float]:
        """
        Provides an illustrative demo estimate of pure term life insurance monthly premium.
        NOT an insurer quote. Based on empirical demographic risk tables.
        """
        if net_cover <= 0:
            return {"low": 0.0, "median": 0.0, "high": 0.0}

        # Base annual cost per unit of 100,000 coverage
        # Age-adjusted multiplier
        if age < 30:
            base_rate_per_100k = 18.0
        elif age < 40:
            base_rate_per_100k = 28.0
        elif age < 50:
            base_rate_per_100k = 65.0
        elif age < 60:
            base_rate_per_100k = 140.0
        else:
            base_rate_per_100k = 290.0

        units = net_cover / 100000.0
        annual_median = units * base_rate_per_100k
        monthly_median = round(annual_median / 12.0, 2)
        
        # Low: preferred non-smoker (~20% discount)
        monthly_low = round(monthly_median * 0.80, 2)
        # High: standard plus / rated / smoker (~35% loading)
        monthly_high = round(monthly_median * 1.35, 2)

        return {
            "low": max(10.0, monthly_low),
            "median": max(15.0, monthly_median),
            "high": max(20.0, monthly_high),
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
        # Resolve assumptions: request overrides > stored db assumptions > config defaults
        inflation_rate = settings.DEFAULT_INFLATION_RATE
        discount_rate = settings.DEFAULT_DISCOUNT_RATE
        reserve_months = settings.DEFAULT_RESERVE_MONTHS
        family_expense_factor = settings.FAMILY_EXPENSE_FACTOR

        if db_assumptions:
            inflation_rate = db_assumptions.get("inflation_rate", inflation_rate)
            discount_rate = db_assumptions.get("discount_rate", discount_rate)
            reserve_months = db_assumptions.get("emergency_reserve_months", reserve_months)
            family_expense_factor = db_assumptions.get("family_expense_factor", family_expense_factor)

        if data.assumptions:
            if data.assumptions.inflation_rate is not None:
                inflation_rate = data.assumptions.inflation_rate
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
            # Baseline: years to retirement or default minimum
            years_to_retirement = max(10, data.retirement_age - data.age)
            horizon_years = min(35, max(settings.DEFAULT_INCOME_REPLACEMENT_YEARS, years_to_retirement))

        # 2. Income Replacement PV
        income_replacement_pv = cls.calculate_income_replacement_pv(
            monthly_expenses=data.monthly_expenses,
            horizon_years=horizon_years,
            inflation_rate=inflation_rate,
            discount_rate=discount_rate,
            family_expense_factor=family_expense_factor
        )

        # 3. Liabilities Total
        total_liabilities = round(data.liabilities.total, 2)

        # 4. Future Goals
        total_goals_fv, total_goals_pv, goals_breakdown = cls.calculate_future_goals(
            goals=data.future_goals,
            inflation_rate=inflation_rate,
            discount_rate=discount_rate
        )

        # 5. Additional Family Emergency Reserve
        additional_family_reserve = cls.calculate_additional_reserve(
            monthly_expenses=data.monthly_expenses,
            reserve_months=reserve_months
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
        eligible_existing_assets = round(data.existing_assets.total, 2)
        existing_life_cover = round(data.existing_life_cover, 2)
        total_existing_protection = round(eligible_existing_assets + existing_life_cover, 2)

        # 8. Net Recommended Additional Cover (Floor at 0.0)
        raw_gap = total_gross_protection_need - total_existing_protection
        net_additional_cover = round(max(0.0, raw_gap), 2)
        protection_gap = net_additional_cover

        # 9. Human Life Value for reference
        hlv_estimate = cls.calculate_human_life_value(
            annual_income=data.annual_income,
            current_age=data.age,
            retirement_age=data.retirement_age,
            discount_rate=discount_rate
        )

        # 10. Illustrative Premium Range
        premium_range = cls.estimate_illustrative_premium(net_additional_cover, data.age)

        # 11. Affordability evaluation
        if data.monthly_budget <= 0:
            affordability_status = "Unspecified Budget"
        elif data.monthly_budget >= premium_range["median"]:
            affordability_status = "Comfortable"
        elif data.monthly_budget >= premium_range["low"]:
            affordability_status = "Moderate Stretch"
        else:
            affordability_status = "Budget Constrained"

        assumptions_summary = {
            "inflation_rate": inflation_rate,
            "discount_rate": discount_rate,
            "real_rate": round(cls.calculate_real_rate(discount_rate, inflation_rate), 4),
            "emergency_reserve_months": reserve_months,
            "family_expense_factor": family_expense_factor,
            "replacement_horizon_years": horizon_years,
        }

        formula_explanation = (
            f"Net Additional Cover = max(0, Income Replacement ({income_replacement_pv:,.0f}) "
            f"+ Liabilities ({total_liabilities:,.0f}) + Future Goals ({total_goals_pv:,.0f}) "
            f"+ Family Reserve ({additional_family_reserve:,.0f}) - Eligible Assets ({eligible_existing_assets:,.0f}) "
            f"- Existing Cover ({existing_life_cover:,.0f})) = {net_additional_cover:,.0f}."
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
            net_additional_cover=net_additional_cover,
            protection_gap=protection_gap,
            human_life_value_estimate=hlv_estimate,
            affordability_status=affordability_status,
            monthly_budget=data.monthly_budget,
            estimated_monthly_premium_range=premium_range,
            assumptions_used=assumptions_summary,
            formula_explanation=formula_explanation,
        )
