import pytest
from app.services.calculation_engine import FinancialCalculationEngine
from app.services.recommendation_engine import ProductRecommendationEngine
from app.schemas import (
    AssessmentCreateRequest,
    LiabilitiesInput,
    GoalItem,
    AssetsInput,
)

def test_term_life_priority_for_high_protection_gap():
    """
    When a customer has a substantial net protection gap and dependent family members,
    Term Life Insurance must be recommended as the primary product category.
    """
    req = AssessmentCreateRequest(
        full_name="Family Provider",
        age=32,
        annual_income=90000.0,
        monthly_expenses=4500.0,
        dependents_count=3,
        retirement_age=60,
        replacement_horizon_years=20,
        liabilities=LiabilitiesInput(home_loan=250000.0),
        future_goals=[GoalItem(name="Child College", target_amount=100000.0, years_until_goal=12)],
        existing_assets=AssetsInput(savings_account=20000.0),
        existing_life_cover=50000.0,
        monthly_budget=100.0,
        risk_profile="moderate"
    )

    calc_res = FinancialCalculationEngine.evaluate_assessment(req)
    rec_res = ProductRecommendationEngine.evaluate_recommendations(req, calc_res)

    assert rec_res.recommended_product_category == "term"
    assert rec_res.primary_recommendation.category == "term"
    assert rec_res.primary_recommendation.suitability_score >= 80
    assert len(rec_res.primary_recommendation.fit_reasons) > 0
    assert len(rec_res.primary_recommendation.trade_offs) > 0

def test_ulip_suitability_for_moderate_risk_and_young_age():
    req = AssessmentCreateRequest(
        full_name="Young Professional",
        age=27,
        annual_income=120000.0,
        monthly_expenses=3000.0,
        dependents_count=0,
        retirement_age=60,
        replacement_horizon_years=10,
        liabilities=LiabilitiesInput(),
        future_goals=[],
        existing_assets=AssetsInput(savings_account=50000.0, mutual_funds_stocks=100000.0),
        existing_life_cover=500000.0,
        monthly_budget=300.0,
        risk_profile="aggressive"
    )

    calc_res = FinancialCalculationEngine.evaluate_assessment(req)
    rec_res = ProductRecommendationEngine.evaluate_recommendations(req, calc_res)

    ulip_item = next(r for r in rec_res.all_recommendations if r.category == "ulip")
    assert ulip_item.suitability_score >= 70
    assert "market-linked" in " ".join(ulip_item.fit_reasons).lower() or "aggressive" in " ".join(ulip_item.fit_reasons).lower()

def test_endowment_suitability_for_conservative_profile():
    req = AssessmentCreateRequest(
        full_name="Conservative Saver",
        age=45,
        annual_income=70000.0,
        monthly_expenses=3000.0,
        dependents_count=1,
        retirement_age=60,
        replacement_horizon_years=10,
        liabilities=LiabilitiesInput(),
        future_goals=[GoalItem(name="Fixed Child Marriage", target_amount=40000.0, years_until_goal=8)],
        existing_assets=AssetsInput(fixed_deposits=50000.0),
        existing_life_cover=100000.0,
        monthly_budget=150.0,
        risk_profile="conservative"
    )

    calc_res = FinancialCalculationEngine.evaluate_assessment(req)
    rec_res = ProductRecommendationEngine.evaluate_recommendations(req, calc_res)

    endow_item = next(r for r in rec_res.all_recommendations if r.category == "endowment")
    assert endow_item.suitability_score >= 65
    assert len(endow_item.trade_offs) >= 2
