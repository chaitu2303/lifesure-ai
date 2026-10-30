import pytest
from app.services.calculation_engine import FinancialCalculationEngine
from app.schemas import (
    AssessmentCreateRequest,
    LiabilitiesInput,
    GoalItem,
    AssetsInput,
    AssumptionsOverride,
)

def test_fisher_real_rate_calculation():
    # Discount rate 8% (0.08), Inflation 6% (0.06)
    # Real rate = (0.08 - 0.06) / 1.06 = 0.02 / 1.06 = 0.0188679...
    real_rate = FinancialCalculationEngine.calculate_real_rate(0.08, 0.06)
    assert abs(real_rate - (0.02 / 1.06)) < 1e-6

def test_income_replacement_pv_positive():
    monthly_expenses = 5000.0
    horizon_years = 15
    inflation_rate = 0.06
    discount_rate = 0.08
    family_expense_factor = 0.75

    pv = FinancialCalculationEngine.calculate_income_replacement_pv(
        monthly_expenses=monthly_expenses,
        horizon_years=horizon_years,
        inflation_rate=inflation_rate,
        discount_rate=discount_rate,
        family_expense_factor=family_expense_factor
    )
    # Annual replacement expense = 5000 * 12 * 0.75 = 45,000
    # Over 15 years, PV must be positive and greater than 45,000 * 10
    assert pv > 450000.0
    assert pv < 45000 * 15 # Because discount rate > inflation rate, PV is less than simple undiscounted sum

def test_zero_expenses_or_zero_horizon():
    pv_zero_exp = FinancialCalculationEngine.calculate_income_replacement_pv(
        monthly_expenses=0.0, horizon_years=15, inflation_rate=0.06, discount_rate=0.08
    )
    assert pv_zero_exp == 0.0

    pv_zero_horiz = FinancialCalculationEngine.calculate_income_replacement_pv(
        monthly_expenses=5000.0, horizon_years=0, inflation_rate=0.06, discount_rate=0.08
    )
    assert pv_zero_horiz == 0.0

def test_future_goals_inflation_and_discount():
    goals = [
        GoalItem(name="Child College", target_amount=100000.0, years_until_goal=10),
        GoalItem(name="Marriage Fund", target_amount=50000.0, years_until_goal=15)
    ]
    inflation = 0.06
    discount = 0.08

    total_fv, total_pv, breakdown = FinancialCalculationEngine.calculate_future_goals(
        goals, inflation, discount
    )
    # Inflated FV must be greater than target amount today
    assert total_fv > 150000.0
    assert len(breakdown) == 2
    assert breakdown[0].future_value > 100000.0
    assert breakdown[0].present_value < breakdown[0].future_value

def test_net_additional_cover_zero_lower_bound():
    """
    If existing liquid assets and existing life cover exceed the gross need,
    Net Additional Cover must strictly floor at 0.0.
    """
    req = AssessmentCreateRequest(
        full_name="Wealthy Test User",
        age=40,
        annual_income=150000.0,
        monthly_expenses=3000.0,
        dependents_count=2,
        retirement_age=60,
        replacement_horizon_years=10,
        liabilities=LiabilitiesInput(home_loan=50000.0),
        future_goals=[],
        # Existing liquid assets of 5,000,000 and cover of 2,000,000
        existing_assets=AssetsInput(
            savings_account=1000000.0,
            mutual_funds_stocks=4000000.0
        ),
        existing_life_cover=2000000.0,
        monthly_budget=200.0,
        risk_profile="conservative"
    )

    res = FinancialCalculationEngine.evaluate_assessment(req)
    assert res.total_gross_protection_need > 0
    assert res.total_existing_protection == 7000000.0
    assert res.net_additional_cover == 0.0
    assert res.protection_gap == 0.0

def test_full_needs_calculation_formula():
    """
    Verify Net Additional Cover = Income Replacement + Liabilities + Goals + Reserve - Assets - Cover.
    """
    req = AssessmentCreateRequest(
        full_name="Standard Client",
        age=35,
        annual_income=100000.0,
        monthly_expenses=4000.0,
        dependents_count=2,
        retirement_age=60,
        replacement_horizon_years=15,
        liabilities=LiabilitiesInput(home_loan=200000.0, car_loan=25000.0),
        future_goals=[GoalItem(name="College", target_amount=80000.0, years_until_goal=10)],
        existing_assets=AssetsInput(savings_account=30000.0, mutual_funds_stocks=50000.0),
        existing_life_cover=100000.0,
        monthly_budget=150.0,
        risk_profile="moderate"
    )

    res = FinancialCalculationEngine.evaluate_assessment(req)

    expected_gross = (
        res.income_replacement_pv
        + res.total_liabilities
        + res.total_future_goals_pv
        + res.additional_family_reserve
    )
    assert abs(res.total_gross_protection_need - expected_gross) < 0.01

    expected_existing = res.eligible_existing_assets + res.existing_life_cover
    assert abs(res.total_existing_protection - expected_existing) < 0.01

    expected_net = max(0.0, expected_gross - expected_existing)
    assert abs(res.net_additional_cover - expected_net) < 0.01
    assert res.net_additional_cover > 0.0
