import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.config import settings

client = TestClient(app)

def test_health_check_api():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "LifeWise" in data["service"]

def test_assessment_calculate_and_submit_api():
    payload = {
        "full_name": "Test User",
        "age": 35,
        "annual_income": 95000.0,
        "monthly_expenses": 4000.0,
        "dependents_count": 2,
        "retirement_age": 60,
        "replacement_horizon_years": 15,
        "liabilities": {
            "home_loan": 150000.0,
            "car_loan": 15000.0,
            "personal_loan": 0.0,
            "education_loan": 0.0,
            "credit_cards": 5000.0,
            "other_liabilities": 0.0
        },
        "future_goals": [
            {
                "name": "Child College",
                "target_amount": 75000.0,
                "years_until_goal": 12
            }
        ],
        "existing_assets": {
            "savings_account": 25000.0,
            "fixed_deposits": 20000.0,
            "mutual_funds_stocks": 40000.0,
            "pf_ppf_available": 15000.0,
            "other_liquid_assets": 0.0
        },
        "existing_life_cover": 100000.0,
        "monthly_budget": 120.0,
        "risk_profile": "moderate"
    }

    # 1. Preview calculation
    calc_res = client.post("/api/assessment/calculate", json=payload)
    assert calc_res.status_code == 200
    c_data = calc_res.json()
    assert c_data["net_additional_cover"] > 0
    assert c_data["total_liabilities"] == 170000.0
    assert c_data["eligible_existing_assets"] == 100000.0
    assert c_data["existing_life_cover"] == 100000.0

    # 2. Persist assessment
    sub_res = client.post("/api/assessment/submit", json=payload)
    assert sub_res.status_code == 200
    s_data = sub_res.json()
    assert s_data["assessment_id"] is not None

    # 3. Retrieve assessment
    get_res = client.get(f"/api/assessment/{s_data['assessment_id']}")
    assert get_res.status_code == 200
    g_data = get_res.json()
    assert g_data["full_name"] == "Test User"
    assert g_data["inputs"]["age"] == 35

def test_invalid_negative_expenses_validation():
    payload = {
        "full_name": "Invalid User",
        "age": 30,
        "annual_income": 50000.0,
        "monthly_expenses": -500.0, # Negative expense
        "dependents_count": 1
    }
    response = client.post("/api/assessment/calculate", json=payload)
    assert response.status_code == 422 # Validation error

def test_products_and_recommendations_api():
    # 1. List products
    prod_res = client.get("/api/products")
    assert prod_res.status_code == 200
    prods = prod_res.json()
    assert len(prods) >= 4
    categories = [p["category"] for p in prods]
    assert "term" in categories
    assert "ulip" in categories
    assert "endowment" in categories
    assert "whole_life" in categories

    # 2. Recommendations
    payload = {
        "full_name": "Demo Seeker",
        "age": 30,
        "annual_income": 80000.0,
        "monthly_expenses": 3000.0,
        "dependents_count": 2,
        "liabilities": {"home_loan": 100000.0},
        "monthly_budget": 80.0,
        "risk_profile": "moderate"
    }
    rec_res = client.post("/api/recommendations", json=payload)
    assert rec_res.status_code == 200
    r_data = rec_res.json()
    assert r_data["recommended_product_category"] == "term"
    assert len(r_data["all_recommendations"]) >= 4

def test_chat_advisory_api():
    res = client.post("/api/chat", json={"message": "What is the difference between Term and ULIP?"})
    assert res.status_code == 200
    data = res.json()
    assert "Term" in data["reply"]
    assert len(data["suggested_followups"]) > 0

def test_advisors_and_appointments_api():
    # 1. Get advisors
    adv_res = client.get("/api/advisors")
    assert adv_res.status_code == 200
    advs = adv_res.json()
    assert len(advs) >= 1
    adv_id = advs[0]["id"]

    # 2. Get available slots
    slots_res = client.get(f"/api/advisors/{adv_id}/slots")
    assert slots_res.status_code == 200
    slots = slots_res.json()
    assert len(slots) > 0
    chosen_slot = slots[0]["time_str"]

    # 3. Book appointment
    book_payload = {
        "advisor_id": adv_id,
        "client_name": "Sarah Miller",
        "client_email": "sarah.miller@example.com",
        "client_phone": "+1-555-019-2834",
        "topic": "Comprehensive Term Coverage & Home Loan Protection",
        "slot_time": f"Tomorrow {chosen_slot}",
        "consultation_mode": "video",
        "notes": "Looking to review life insurance protection for young family."
    }
    book_res = client.post("/api/appointments/book", json=book_payload)
    assert book_res.status_code == 200
    b_data = book_res.json()
    assert ("LW-APT-" in b_data["appointment_code"]) or ("LS-APT-" in b_data["appointment_code"]) or ("APT-" in b_data["appointment_code"])
    assert b_data["client_name"] == "Sarah Miller"
    assert b_data["status"] == "confirmed"

    # 4. List appointments filtered by email
    list_res = client.get("/api/appointments?client_email=sarah.miller@example.com")
    assert list_res.status_code == 200
    assert len(list_res.json()) >= 1

def test_admin_metrics_security():
    # 1. Request without admin key must fail 401
    unauth_res = client.get("/api/admin/metrics")
    assert unauth_res.status_code == 401

    # 2. Request with invalid key must fail 401
    bad_res = client.get("/api/admin/metrics", headers={"X-Admin-Key": "wrong-secret"})
    assert bad_res.status_code == 401

    # 3. Request with valid key must succeed 200
    auth_res = client.get("/api/admin/metrics", headers={"X-Admin-Key": settings.ADMIN_SECRET_KEY})
    assert auth_res.status_code == 200
    m_data = auth_res.json()
    assert "total_assessments" in m_data
    assert "average_protection_gap" in m_data

def test_policy_risk_analysis_api():
    res = client.get("/api/products/PRD-X4CBUF/risk-analysis?age=30&sum_assured=10000000&policy_term=30&monthly_budget=2500")
    assert res.status_code == 200
    data = res.json()
    assert data["policy_id"] == "PRD-X4CBUF"
    assert "risk_analysis" in data
    assert data["risk_analysis"]["financial_risk"]["status"] in ["low", "moderate", "high", "insufficient_data"]
    assert len(data["advantages"]) > 0
    assert len(data["evidence_sources"]) > 0

def test_reverse_budget_solver_api():
    res = client.get("/api/reverse-budget-solve?monthly_budget=1500&age=30&tenure=30")
    assert res.status_code == 200
    data = res.json()
    assert data["options_found_count"] > 0
    assert len(data["affordable_options"]) > 0
    top = data["affordable_options"][0]
    assert top["monthly_instalment"] <= 1500

def test_glossary_api():
    res = client.get("/api/glossary")
    assert res.status_code == 200
    data = res.json()
    assert data["total"] > 10
    assert len(data["entries"]) > 10

def test_glossary_sections_api():
    res = client.get("/api/glossary/sections")
    assert res.status_code == 200
    data = res.json()
    assert "sections" in data
    assert len(data["sections"]) >= 3

