import math
from app.schemas import SimulationRequest, SimulationResponse
from app.services.calculation_engine import FinancialCalculationEngine
from app.config import settings

class SimulationEngine:
    """
    Real-time what-if scenario simulator for financial protection planning.
    """

    @classmethod
    def run_simulation(cls, req: SimulationRequest) -> SimulationResponse:
        # 1. Baseline calculation
        base_pv = FinancialCalculationEngine.calculate_income_replacement_pv(
            monthly_expenses=req.base_monthly_expenses,
            horizon_years=settings.DEFAULT_INCOME_REPLACEMENT_YEARS,
            inflation_rate=settings.DEFAULT_INFLATION_RATE,
            discount_rate=settings.DEFAULT_DISCOUNT_RATE,
            family_expense_factor=settings.FAMILY_EXPENSE_FACTOR,
            annual_income=req.base_annual_income,
            dependents_count=req.base_dependents_count,
        )
        base_gross = (
            base_pv
            + req.base_liabilities
            + req.base_future_goals
            + (req.base_monthly_expenses * settings.DEFAULT_RESERVE_MONTHS)
        )
        base_net = max(0.0, base_gross - req.base_existing_assets - req.base_existing_cover)

        # 2. Simulated recalculation
        sim_pv = FinancialCalculationEngine.calculate_income_replacement_pv(
            monthly_expenses=req.base_monthly_expenses,
            horizon_years=req.simulated_replacement_years,
            inflation_rate=req.simulated_inflation_rate,
            discount_rate=req.simulated_discount_rate,
            family_expense_factor=settings.FAMILY_EXPENSE_FACTOR,
            annual_income=req.base_annual_income,
            dependents_count=req.base_dependents_count,
        )
        
        sim_goals = req.base_future_goals * req.simulated_goals_scaling
        sim_reserve = req.base_monthly_expenses * settings.DEFAULT_RESERVE_MONTHS
        sim_gross = sim_pv + req.base_liabilities + sim_goals + sim_reserve
        
        computed_sim_net = max(0.0, sim_gross - req.base_existing_assets - req.base_existing_cover)

        # Allow user manual override for desired coverage if provided
        final_sim_cover = (
            req.simulated_desired_cover_override
            if req.simulated_desired_cover_override is not None
            else computed_sim_net
        )

        diff_amt = round(final_sim_cover - base_net, 2)
        diff_pct = round((diff_amt / base_net * 100.0), 2) if base_net > 0 else 0.0

        # Estimated monthly premium for simulated cover (baseline age assumed ~35 if not passed)
        prem_dict = FinancialCalculationEngine.estimate_illustrative_premium(final_sim_cover, age=35)
        est_prem = prem_dict["median"]

        # Budget sufficiency
        if req.simulated_monthly_budget <= 0:
            sufficiency = "Unspecified Budget"
            variance = 0.0
        else:
            variance = round(req.simulated_monthly_budget - est_prem, 2)
            if variance > 10.0:
                sufficiency = "Surplus"
            elif variance >= -10.0:
                sufficiency = "Balanced"
            else:
                sufficiency = "Deficit"

        return SimulationResponse(
            original_net_cover=round(base_net, 2),
            simulated_net_cover=round(final_sim_cover, 2),
            difference_amount=diff_amt,
            difference_percentage=diff_pct,
            simulated_income_replacement_pv=round(sim_pv, 2),
            simulated_liabilities=round(req.base_liabilities, 2),
            simulated_future_goals_pv=round(sim_goals, 2),
            simulated_family_reserve=round(sim_reserve, 2),
            simulated_gross_need=round(sim_gross, 2),
            estimated_monthly_premium=est_prem,
            budget_sufficiency=sufficiency,
            budget_variance=variance,
        )
