import pytest
from app.data_loader import data_loader
from app.services.calculation_engine import FinancialCalculationEngine
from app.services.premium_engine import PremiumCalculationEngine, round_inr, multiply_and_round_inr
from app.services.recommendation_engine import ProductRecommendationEngine
from app.services.advisory_service import AdvisoryService
from app.schemas import (
    AssessmentCreateRequest,
    LiabilitiesInput,
    GoalItem,
    AssetsInput,
    PremiumQuoteRequest,
)


def test_datasets_integrity_and_row_counts():
    """Verify all synthetic datasets are loaded and match the official specification."""
    assert data_loader.is_loaded is True
    assert len(data_loader.products) == 14
    assert len(data_loader.riders) == 5
    assert len(data_loader.ulip_funds) == 4
    assert len(data_loader.ulip_mortality) == 328
    assert len(data_loader.premium_rates) == 39588
    assert len(data_loader.advisors) == 15
    assert len(data_loader.slots) == 2201
    assert len(data_loader.customer_profiles) == 200
    assert len(data_loader.customer_goals) == 371


def test_b2_official_worked_example_exact_match():
    """
    Validates the exact worked example in Section 6.1 of the B2 Specification:
    - Product: Saffron Kesaro Term (PRD-X4CBUF)
    - Male, Age 30, Non-Smoker
    - Cover: ₹1 Crore (10,000,000), 30-year policy term, regular pay, monthly mode
    - Rider: ₹50 Lakh (5,000,000) accidental death rider (RDR-LUR23D)
    - Expected Base Instalment: ₹914 / month
    - Expected Rider Instalment: ₹131 / month
    - Expected Total Monthly Instalment: ₹1,045 / month
    """
    res = PremiumCalculationEngine.calculate_non_linked_premium(
        product_id="PRD-X4CBUF",
        sum_assured=10000000.0,
        entry_age=30,
        policy_term_years=30,
        premium_payment_option="regular",
        gender="male",
        smoker_status="non_smoker",
        mode="monthly",
        selected_riders=[{"rider_id": "RDR-LUR23D", "rider_sum_assured": 5000000.0}],
    )

    assert res["eligible"] is True
    assert res["rate_per_1000_sa"] == 1.044
    assert res["band_factor"] == 1.00
    assert res["base_annual_premium"] == 10440.0
    assert res["modal_factor"] == 0.0875
    assert res["base_instalment"] == 914
    assert len(res["riders"]) == 1
    assert res["riders"][0]["instalment"] == 131
    assert res["total_instalment"] == 1045


def test_decimal_rounding_halves_round_up():
    """
    Ensures exact Decimal commercial rounding (halves round up: 0.5 -> 1)
    and prevents floating-point under-representation (e.g. 10440 * 0.0875 = 913.5 -> 914).
    """
    assert multiply_and_round_inr(10440.0, 0.0875) == 914
    assert multiply_and_round_inr(1500.0, 0.0875) == 131
    assert round_inr(913.5) == 914
    assert round_inr(913.49) == 913


def test_homemaker_non_earning_valuation():
    """
    If applicant has 0 earned income and dependent family members,
    valuation reflects the replacement value of unpaid homemaker services (₹3,00,000/yr).
    """
    req = AssessmentCreateRequest(
        full_name="Ananya Sharma (Homemaker)",
        age=30,
        annual_income=0.0,
        monthly_expenses=40000.0,
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
    # Over 15 years at ₹3L/yr, PV should be > 3,000,000
    assert res.income_replacement_pv >= 3000000.0
    assert res.net_additional_cover > 0


def test_adequately_covered_customer_zero_gap():
    """
    A customer whose existing liquid assets and life insurance fully meet gross needs
    must result in a net additional cover of exactly 0.0 without errors.
    """
    req = AssessmentCreateRequest(
        full_name="Well Covered Client",
        age=40,
        annual_income=1500000.0,
        monthly_expenses=50000.0,
        dependents_count=1,
        retirement_age=60,
        replacement_horizon_years=10,
        liabilities=LiabilitiesInput(),
        future_goals=[],
        existing_assets=AssetsInput(
            savings_account=1000000.0,
            fixed_deposits=2000000.0,
            mutual_funds_stocks=5000000.0,
        ),
        existing_life_cover=10000000.0,  # ₹1 Crore existing cover
        monthly_budget=1000.0,
        risk_profile="conservative",
    )

    res = FinancialCalculationEngine.evaluate_assessment(req)
    assert res.net_additional_cover == 0.0
    assert res.protection_gap == 0.0


def test_education_inflation_higher_than_general_inflation():
    """
    Child education goals must use education inflation (8.0%), which yields
    higher future values than ordinary living inflation (5.5%).
    """
    goals = [
        GoalItem(name="Child College Education", target_amount=1000000.0, years_until_goal=10),
        GoalItem(name="Family Car Upgrade", target_amount=1000000.0, years_until_goal=10),
    ]

    fv, pv, breakdown = FinancialCalculationEngine.calculate_future_goals(
        goals=goals,
        general_inflation_rate=0.055,
        education_inflation_rate=0.08,
        discount_rate=0.07,
    )

    edu_item = next(b for b in breakdown if "education" in b.name.lower())
    car_item = next(b for b in breakdown if "car" in b.name.lower())

    # 10L at 8% for 10 yrs = 10L * 1.08^10 = 2,158,925
    # 10L at 5.5% for 10 yrs = 10L * 1.055^10 = 1,708,144
    assert edu_item.future_value > car_item.future_value
    assert round(edu_item.future_value) == 2158925
    assert round(car_item.future_value) == 1708144


def test_product_ineligibility_over_maturity_age():
    """Combinations that exceed the maximum maturity age must be rejected with clear reasons."""
    prod = data_loader.products["PRD-02YUOF"]  # Saffron Kesaro Mini, max_maturity_age = 70
    is_el, reasons = ProductRecommendationEngine.check_product_eligibility(
        product=prod,
        age=55,
        annual_income=200000.0,
        sum_assured=1000000.0,
        policy_term=20,  # 55 + 20 = 75 > 70
    )
    assert is_el is False
    assert any("maturity" in r.lower() for r in reasons)


def test_product_income_multiple_limits():
    """Cover exceeding the financial underwriting multiple of income must be flagged."""
    prod = data_loader.products["PRD-X4CBUF"]  # Saffron Kesaro Term
    # Age 30: max multiple is 25x. Income 5 Lakhs -> Max cover is 1.25 Crore.
    # Requesting 2 Crore must trigger income multiple cap.
    is_el, reasons = ProductRecommendationEngine.check_product_eligibility(
        product=prod,
        age=30,
        annual_income=500000.0,
        sum_assured=20000000.0,  # 2 Crore = 40x income
        policy_term=25,
    )
    assert is_el is False
    assert any("underwriting limit" in r.lower() or "income" in r.lower() for r in reasons)


def test_rider_annual_premium_limits():
    """Health riders must not exceed 100% of base premium; other riders must not exceed 30%."""
    # Critical illness rider (RDR-GRH8AS) on Saffron Kesaro Term
    res = PremiumCalculationEngine.calculate_non_linked_premium(
        product_id="PRD-X4CBUF",
        sum_assured=2500000.0,
        entry_age=30,
        policy_term_years=20,
        premium_payment_option="regular",
        gender="male",
        smoker_status="non_smoker",
        mode="annual",
        selected_riders=[{"rider_id": "RDR-GRH8AS", "rider_sum_assured": 2500000.0}],
    )
    assert res["eligible"] is True
    # Base annual for 25L at age 30, term 20: rate is 1.042 * 2500 * 1.1 = 2865.5
    # Rider CI rate: 2.2 * 2500 = 5500. This is > 100% of base premium!
    assert len(res["rider_warnings"]) > 0
    assert any("exceeds" in w.lower() for w in res["rider_warnings"])


def test_ulip_calculation_and_fmc_rates():
    """ULIP premium quote includes modal breakdown, mortality estimate, and fund options."""
    res = PremiumCalculationEngine.calculate_ulip_premium(
        product_id="PRD-UPERQ6",
        annualised_premium=60000.0,
        entry_age=32,
        policy_term_years=20,
        mode="monthly",
        gender="male",
        smoker_status="non_smoker",
    )
    assert res["eligible"] is True
    assert res["category"] == "ulip"
    assert res["sa_multiple"] == 10
    assert res["sum_assured"] == 600000.0
    # Monthly base instalment: 60,000 / 12 = 5,000
    assert res["base_instalment"] == 5000
    assert res["monthly_mortality_deduction_est"] > 0
    assert res["lock_in_years"] == 5


def test_advisor_booking_prevents_duplicate_appointments():
    """Attempting to book the exact same slot for two different clients must return duplicate error."""
    slot_id = "SLT-TEST-UNIQUE-01"
    AdvisoryService._booked_slot_ids.discard(slot_id)

    # First booking succeeds
    success = AdvisoryService.mark_slot_booked(slot_id)
    assert success is True

    # Second booking must be rejected
    duplicate = AdvisoryService.mark_slot_booked(slot_id)
    assert duplicate is False
