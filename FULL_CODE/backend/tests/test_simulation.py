import pytest
from app.services.simulation_engine import SimulationEngine
from app.schemas import SimulationRequest

def test_simulation_inflation_increase_increases_net_cover():
    """
    Higher inflation must increase future costs and thus increase net recommended cover.
    """
    req_low_inflation = SimulationRequest(
        base_annual_income=80000.0,
        base_monthly_expenses=3500.0,
        base_dependents_count=2,
        base_liabilities=150000.0,
        base_future_goals=50000.0,
        base_existing_assets=20000.0,
        base_existing_cover=50000.0,
        simulated_replacement_years=15,
        simulated_inflation_rate=0.04,
        simulated_discount_rate=0.08,
        simulated_monthly_budget=100.0,
    )
    res_low = SimulationEngine.run_simulation(req_low_inflation)

    req_high_inflation = SimulationRequest(
        base_annual_income=80000.0,
        base_monthly_expenses=3500.0,
        base_dependents_count=2,
        base_liabilities=150000.0,
        base_future_goals=50000.0,
        base_existing_assets=20000.0,
        base_existing_cover=50000.0,
        simulated_replacement_years=15,
        simulated_inflation_rate=0.08, # Higher inflation
        simulated_discount_rate=0.08,
        simulated_monthly_budget=100.0,
    )
    res_high = SimulationEngine.run_simulation(req_high_inflation)

    assert res_high.simulated_net_cover > res_low.simulated_net_cover

def test_simulation_horizon_increase_increases_pv():
    req_10_yrs = SimulationRequest(
        base_annual_income=80000.0,
        base_monthly_expenses=3500.0,
        base_dependents_count=2,
        base_liabilities=0.0,
        base_future_goals=0.0,
        base_existing_assets=0.0,
        base_existing_cover=0.0,
        simulated_replacement_years=10,
        simulated_inflation_rate=0.06,
        simulated_discount_rate=0.08,
        simulated_monthly_budget=100.0,
    )
    res_10 = SimulationEngine.run_simulation(req_10_yrs)

    req_20_yrs = SimulationRequest(
        base_annual_income=80000.0,
        base_monthly_expenses=3500.0,
        base_dependents_count=2,
        base_liabilities=0.0,
        base_future_goals=0.0,
        base_existing_assets=0.0,
        base_existing_cover=0.0,
        simulated_replacement_years=20,
        simulated_inflation_rate=0.06,
        simulated_discount_rate=0.08,
        simulated_monthly_budget=100.0,
    )
    res_20 = SimulationEngine.run_simulation(req_20_yrs)

    assert res_20.simulated_income_replacement_pv > res_10.simulated_income_replacement_pv

def test_simulation_budget_sufficiency():
    req_budget_surplus = SimulationRequest(
        base_annual_income=80000.0,
        base_monthly_expenses=3500.0,
        base_dependents_count=2,
        base_liabilities=50000.0,
        base_future_goals=0.0,
        base_existing_assets=0.0,
        base_existing_cover=0.0,
        simulated_replacement_years=10,
        simulated_inflation_rate=0.06,
        simulated_discount_rate=0.08,
        simulated_monthly_budget=500.0, # High budget
    )
    res_surplus = SimulationEngine.run_simulation(req_budget_surplus)
    assert res_surplus.budget_sufficiency == "Surplus"
    assert res_surplus.budget_variance > 0
