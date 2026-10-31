from typing import List, Dict, Any, Optional
from fastapi import APIRouter, HTTPException, status, Query, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import UserAccount, CustomerProfileRecord
from app.data_loader import data_loader
from app.services.calculation_engine import FinancialCalculationEngine
from app.schemas import AssessmentCreateRequest

router = APIRouter(prefix="/customers", tags=["Customers"])

def _map_profile_to_assessment(prof: Dict[str, Any]) -> tuple[AssessmentCreateRequest, Any]:
    dep_count = 0
    if prof.get("dependents"):
        d = prof["dependents"]
        if d.get("spouse"):
            dep_count += 1
        dep_count += len(d.get("children", []))
        dep_count += len(d.get("parents", []))

    tot_liab = sum(l.get("outstanding_principal_inr", 0) for l in prof.get("liabilities", []))
    ex_cover = prof.get("existing_life_cover", {}).get("employer_group_inr", 0) + prof.get("existing_life_cover", {}).get("individual_inr", 0)
    assets = prof.get("savings_and_investments", {}).get("liquid_savings_inr", 0) + prof.get("savings_and_investments", {}).get("market_investments_inr", 0)

    goals = []
    for g in prof.get("goals", []):
        goals.append({
            "name": g.get("name", "Goal"),
            "target_amount": g.get("target_amount_today_inr", 0),
            "years_until_goal": max(1, g.get("target_year", 2040) - 2026),
        })

    risk = prof.get("preferences", {}).get("risk_appetite", "moderate")
    if risk not in ["conservative", "moderate", "aggressive"]:
        risk = "aggressive" if risk in ["high", "very_high"] else "moderate"

    req = AssessmentCreateRequest(
        full_name=prof["full_name"],
        age=prof["age"],
        annual_income=prof["annual_income_inr"],
        monthly_expenses=prof["monthly_household_expenses_inr"],
        dependents_count=dep_count,
        retirement_age=60,
        total_liabilities=tot_liab,
        future_goals=goals,
        eligible_existing_assets=assets,
        existing_life_cover=ex_cover,
        monthly_budget=prof.get("preferences", {}).get("monthly_premium_budget_inr", 1500),
        risk_profile=risk,
        smoker_status=prof.get("health", {}).get("smoker_status", "non_smoker"),
        gender=prof.get("gender", "male"),
    )
    result = FinancialCalculationEngine.evaluate_assessment(req, {})
    return req, result

@router.get("", response_model=List[Dict[str, Any]])
def list_customers(
    limit: int = 50,
    search: Optional[str] = Query(None, description="Search by name, ID or city"),
    category: Optional[str] = Query(None, description="Filter by employment category"),
):
    """
    List available customer members loaded directly from authoritative customer_profiles.json.
    Supports read-only exploration and search for demo switcher and admin explorer.
    """
    profiles = data_loader.customer_profiles
    if search:
        s = search.lower().strip()
        profiles = [
            p for p in profiles
            if s in p.get("full_name", "").lower()
            or s in p.get("profile_id", "").lower()
            or s in p.get("city", "").lower()
            or s in p.get("occupation", "").lower()
        ]
    if category:
        c = category.lower().strip()
        profiles = [p for p in profiles if c in p.get("employment_type", "").lower()]

    output = []
    for p in profiles[:limit]:
        output.append({
            "profile_id": p.get("profile_id"),
            "full_name": p.get("full_name"),
            "age": p.get("age"),
            "gender": p.get("gender"),
            "city": p.get("city"),
            "city_tier": p.get("city_tier", 1),
            "occupation": p.get("occupation"),
            "employment_type": p.get("employment_type"),
            "annual_income_inr": p.get("annual_income_inr"),
            "monthly_household_expenses_inr": p.get("monthly_household_expenses_inr"),
            "marital_status": p.get("marital_status"),
            "has_assessment": True,
            "profile_date": p.get("profile_date", "2026-10-01"),
        })
    return output

@router.get("/{profile_id}", response_model=Dict[str, Any])
def get_customer_profile(profile_id: str, db: Session = Depends(get_db)):
    """
    Get full profile details for a customer profile by ID or user_id, including
    their computed assessment, protection need, and plan data.
    """
    found = None
    for p in data_loader.customer_profiles:
        if p.get("profile_id") == profile_id:
            found = p
            break

    # If not in synthetic JSON dataset, check if it is a registered UserAccount
    if not found:
        user_acc = db.query(UserAccount).filter_by(user_id=profile_id.strip()).first()
        if user_acc:
            # If user is linked to an existing profile
            if user_acc.linked_profile_id:
                for p in data_loader.customer_profiles:
                    if p.get("profile_id") == user_acc.linked_profile_id:
                        found = dict(p)
                        found["full_name"] = user_acc.full_name
                        found["email"] = user_acc.email
                        found["profile_id"] = user_acc.user_id
                        break
            
            # If user was freshly registered (no linked synthetic profile)
            if not found:
                found = {
                    "profile_id": user_acc.user_id,
                    "full_name": user_acc.full_name,
                    "age": 30,
                    "gender": "male",
                    "city": "Mumbai",
                    "city_tier": 1,
                    "occupation": "Professional",
                    "employment_type": "salaried_private",
                    "annual_income_inr": 1200000,
                    "monthly_household_expenses_inr": 50000,
                    "monthly_premium_budget_inr": 2000,
                    "marital_status": "married",
                    "has_assessment": True,
                    "email": user_acc.email,
                }

    if not found:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Customer profile '{profile_id}' not found."
        )

    req, res = _map_profile_to_assessment(found)
    return {
        "profile": found,
        "assessment_input": req.model_dump(),
        "calculation_result": res.model_dump(),
    }
