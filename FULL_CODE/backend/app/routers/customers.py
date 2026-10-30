from typing import List, Dict, Any, Optional
from fastapi import APIRouter, HTTPException, status
from app.data_loader import data_loader

router = APIRouter(prefix="/customers", tags=["Customers"])

@router.get("", response_model=List[Dict[str, Any]])
def list_customers(limit: int = 20):
    """
    List available sample customer profiles loaded from customer_profiles.json.
    """
    profiles = data_loader.customer_profiles[:limit]
    return [
        {
            "profile_id": p.get("profile_id"),
            "full_name": p.get("full_name"),
            "age": p.get("age"),
            "gender": p.get("gender"),
            "city": p.get("city"),
            "occupation": p.get("occupation"),
            "annual_income_inr": p.get("annual_income_inr"),
            "monthly_household_expenses_inr": p.get("monthly_household_expenses_inr"),
            "marital_status": p.get("marital_status"),
        }
        for p in profiles
    ]

@router.get("/{profile_id}", response_model=Dict[str, Any])
def get_customer_profile(profile_id: str):
    """
    Get full profile details for a customer profile by ID.
    """
    for p in data_loader.customer_profiles:
        if p.get("profile_id") == profile_id:
            return p
    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail=f"Customer profile '{profile_id}' not found."
    )
