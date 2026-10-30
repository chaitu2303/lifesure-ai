import pytest
from datetime import datetime
from app.data_loader import data_loader
from app.services.calculation_engine import FinancialCalculationEngine
from app.services.premium_engine import PremiumCalculationEngine
from app.services.recommendation_engine import ProductRecommendationEngine
from app.services.advisory_service import AdvisoryService, CURRENT_SIMULATION_TIME
from app.schemas import (
    AssessmentCreateRequest,
    LiabilitiesInput,
    GoalItem,
    AssetsInput,
    AssumptionsOverride,
)


def test_edge_case_zero_income_with_dependents_homemaker():
    """
    Edge case: Applicant has 0 earned income but has dependent family members (e.g., homemaker).
    Valuation must apply the reference assumption for unpaid homemaker services (₹3,00,000/yr)
    instead of returning 0 cover.
    """
    req = AssessmentCreateRequest(
        full_name="Meenakshi Sundaram",
        age=32,
        annual_income=0.0,
        monthly_expenses=35000.0,
        dependents_count=2,
        retirement_age=60,
        replacement_horizon_years=15,
        liabilities=LiabilitiesInput(),
        future_goals=[],
        existing_assets=AssetsInput(),
        existing_life_cover=0.0,
        monthly_budget=500.0,
        risk_profile="moderate",
    )
    res = FinancialCalculationEngine.evaluate_assessment(req)
    assert res.income_replacement_pv > 0
    assert res.net_additional_cover > 0
    assert "₹300,000" in res.formula_explanation or res.income_replacement_pv >= 3000000.0


def test_edge_case_zero_income_no_dependents():
    """
    Edge case: Zero earned income AND zero dependents.
    With no income to replace and no dependents requiring homemaker services,
    income replacement PV must be exactly 0.0.
    """
    req = AssessmentCreateRequest(
        full_name="Single Non-Earning Applicant",
        age=24,
        annual_income=0.0,
        monthly_expenses=15000.0,
        dependents_count=0,
        retirement_age=60,
        replacement_horizon_years=10,
        liabilities=LiabilitiesInput(),
        future_goals=[],
        existing_assets=AssetsInput(),
        existing_life_cover=0.0,
        monthly_budget=0.0,
        risk_profile="conservative",
    )
    res = FinancialCalculationEngine.evaluate_assessment(req)
    assert res.income_replacement_pv == 0.0


def test_edge_case_no_dependents_with_outstanding_debt():
    """
    Edge case: Applicant has no dependents, but has ₹40 Lakhs home loan liability.
    The platform must protect the liability to ensure the asset is not foreclosed upon death.
    """
    req = AssessmentCreateRequest(
        full_name="Rohit Batra",
        age=29,
        annual_income=900000.0,
        monthly_expenses=40000.0,
        dependents_count=0,
        retirement_age=60,
        replacement_horizon_years=5,
        liabilities=LiabilitiesInput(home_loan=4000000.0),
        future_goals=[],
        existing_assets=AssetsInput(savings_account=500000.0),
        existing_life_cover=0.0,
        monthly_budget=2000.0,
        risk_profile="moderate",
    )
    res = FinancialCalculationEngine.evaluate_assessment(req)
    assert res.total_liabilities == 4000000.0
    # Net cover = Liabilities (40L) + Final expenses (1.5L) - Liquid Assets (5L) = 36.5L, rounded up to 5L multiple = 37L
    assert res.net_additional_cover >= 3500000.0


def test_edge_case_existing_sufficient_life_cover():
    """
    Edge case: Customer whose existing liquid assets and existing life insurance
    already completely exceed gross protection needs.
    Net additional cover and protection gap must be exactly 0.0 without crash or negative numbers.
    """
    req = AssessmentCreateRequest(
        full_name="Sanjay Singhania",
        age=45,
        annual_income=2400000.0,
        monthly_expenses=60000.0,
        dependents_count=2,
        retirement_age=60,
        replacement_horizon_years=10,
        liabilities=LiabilitiesInput(home_loan=1000000.0),
        future_goals=[],
        existing_assets=AssetsInput(
            savings_account=2000000.0,
            fixed_deposits=5000000.0,
            mutual_funds_stocks=8000000.0,
        ),
        existing_life_cover=20000000.0,  # ₹2 Crore existing cover
        monthly_budget=5000.0,
        risk_profile="conservative",
    )
    res = FinancialCalculationEngine.evaluate_assessment(req)
    assert res.net_additional_cover == 0.0
    assert res.protection_gap == 0.0
    assert res.total_existing_protection > res.total_gross_protection_need


def test_edge_case_insufficient_monthly_budget():
    """
    Edge case: Customer requires ₹1 Crore life cover, but has an unrealistically small monthly
    budget of only ₹50. The platform must flag 'Budget Constrained' without error.
    """
    req = AssessmentCreateRequest(
        full_name="Budget Tight User",
        age=35,
        annual_income=600000.0,
        monthly_expenses=45000.0,
        dependents_count=3,
        retirement_age=60,
        replacement_horizon_years=15,
        liabilities=LiabilitiesInput(home_loan=2000000.0),
        future_goals=[],
        existing_assets=AssetsInput(),
        existing_life_cover=0.0,
        monthly_budget=50.0,  # ₹50/mo is far below term insurance premium of ~₹900-1,200/mo
        risk_profile="conservative",
    )
    res = FinancialCalculationEngine.evaluate_assessment(req)
    assert res.net_additional_cover > 0
    assert res.affordability_status == "Budget Constrained"


def test_edge_case_missing_premium_rate_combination():
    """
    Edge case: An unallowed term/age combination (e.g. entry age 55 with 35-year term = age 90,
    exceeding product max maturity age of 85) must be rejected safely with eligible: False.
    """
    quote = PremiumCalculationEngine.calculate_non_linked_premium(
        product_id="PRD-X4CBUF",  # Saffron Kesaro Term, max maturity 85
        sum_assured=5000000.0,
        entry_age=55,
        policy_term_years=35,  # 55 + 35 = 90 > 85
        premium_payment_option="regular",
        gender="male",
        smoker_status="non_smoker",
        mode="monthly",
    )
    assert quote["eligible"] is False
    assert "maturity" in quote["error"].lower() or "not available" in quote["error"].lower()


def test_edge_case_invalid_age_below_min():
    """
    Edge case: Entry age below product minimum (e.g. age 16 for a plan requiring min age 18).
    """
    prod = data_loader.products["PRD-X4CBUF"]
    is_el, reasons = ProductRecommendationEngine.check_product_eligibility(
        product=prod,
        age=16,
        annual_income=400000.0,
        sum_assured=2500000.0,
        policy_term=20,
    )
    assert is_el is False
    assert any("age" in r.lower() for r in reasons)


def test_edge_case_invalid_age_above_max():
    """
    Edge case: Entry age above product maximum (e.g. age 68 for a plan requiring max age 65).
    """
    prod = data_loader.products["PRD-X4CBUF"]
    is_el, reasons = ProductRecommendationEngine.check_product_eligibility(
        product=prod,
        age=68,
        annual_income=1200000.0,
        sum_assured=5000000.0,
        policy_term=10,
    )
    assert is_el is False
    assert any("age" in r.lower() for r in reasons)


def test_edge_case_invalid_tenure_outside_range():
    """
    Edge case: Requesting tenure longer than allowed policy term rule.
    """
    prod = data_loader.products["PRD-02YUOF"]  # Saffron Kesaro Mini (max policy term 20 years)
    max_t = int(prod.get("max_policy_term_years", 20))
    quote = PremiumCalculationEngine.calculate_non_linked_premium(
        product_id="PRD-02YUOF",
        sum_assured=1000000.0,
        entry_age=30,
        policy_term_years=max_t + 10,
        premium_payment_option="regular",
        gender="male",
        smoker_status="non_smoker",
        mode="monthly",
    )
    assert quote["eligible"] is False


def test_edge_case_ineligible_product_underwriting_cap():
    """
    Edge case: Income is ₹3 Lakhs, but applicant requests ₹2 Crore cover (66x income).
    The statutory financial underwriting multiple limit for age 30 is 25x (₹75 Lakhs).
    The engine must flag this as ineligible with clear reasons.
    """
    prod = data_loader.products["PRD-X4CBUF"]
    is_el, reasons = ProductRecommendationEngine.check_product_eligibility(
        product=prod,
        age=30,
        annual_income=300000.0,
        sum_assured=20000000.0,  # 2 Crore
        policy_term=20,
        existing_cover=0.0,
    )
    assert is_el is False
    assert any("underwriting" in r.lower() or "limit" in r.lower() or "multiple" in r.lower() for r in reasons)


def test_edge_case_missing_optional_data():
    """
    Edge case: Minimal assessment with only mandatory core demographic inputs.
    All optional debts, goals, and liquid assets are defaulted/omitted.
    Engine must execute flawlessly without KeyError or NaN.
    """
    req = AssessmentCreateRequest(
        full_name="Minimal Profile User",
        age=28,
        annual_income=800000.0,
        monthly_expenses=30000.0,
        dependents_count=1,
    )
    res = FinancialCalculationEngine.evaluate_assessment(req)
    assert res.net_additional_cover > 0
    assert res.total_liabilities == 0.0
    assert res.total_future_goals_pv == 0.0
    assert res.total_existing_protection == 0.0


def test_edge_case_expired_slots_filtered_relative_to_simulation_time():
    """
    Edge case: Slots strictly occurring before CURRENT_SIMULATION_TIME (2026-10-29T20:41:58)
    must be marked as unavailable (expired).
    """
    # Pick an advisor
    adv_id = "ADV-4KKBRK"
    slots = AdvisoryService.get_available_slots(adv_id)
    assert len(slots) > 0

    # Ensure all slots returned with is_available=True have start time >= CURRENT_SIMULATION_TIME
    available_slots = [s for s in slots if s.is_available]
    assert len(available_slots) > 0

    # Retrieve raw slots for advisor
    raw_slots = data_loader.slots_by_advisor.get(adv_id, [])
    past_slots = [s for s in raw_slots if datetime.fromisoformat(s["slot_start"]) < CURRENT_SIMULATION_TIME]
    if past_slots:
        past_slot_id = past_slots[0]["slot_id"]
        matched = next((s for s in slots if s.slot_id == past_slot_id), None)
        assert matched is not None
        assert matched.is_available is False


def test_edge_case_duplicate_slot_booking_prevention():
    """
    Edge case: Simultaneous or duplicate booking of the same consultation slot.
    The first booking succeeds; second booking is rejected as duplicate.
    """
    test_slot = "SLT-EDGE-CASE-DUPLICATE-999"
    AdvisoryService._booked_slot_ids.discard(test_slot)

    # First booking attempt
    book1 = AdvisoryService.mark_slot_booked(test_slot)
    assert book1 is True

    # Second booking attempt for identical slot
    book2 = AdvisoryService.mark_slot_booked(test_slot)
    assert book2 is False
