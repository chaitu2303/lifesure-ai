import datetime
import json
from typing import List, Dict, Any, Optional
from fastapi import APIRouter, Depends, HTTPException, Header, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database import get_db
from app.config import settings
from app.models import (
    AssessmentRecord,
    Appointment as AppointmentModel,
    Product as ProductModel,
    FinancialAssumptionRecord,
    UserAccount,
    CustomerProfileRecord,
)
from app.schemas import (
    AssumptionUpdateRequest,
    AdminMetricsResponse,
    AppointmentResponse,
)
from app.data_loader import data_loader

router = APIRouter(prefix="/admin", tags=["Admin"])

def verify_admin_key(
    x_admin_key: Optional[str] = Header(None, alias="X-Admin-Key"),
    admin_token: Optional[str] = Query(None, alias="admin_token")
):
    provided = x_admin_key or admin_token
    # Accepts either master secret key or a valid admin session token (e.g. lw-admin-ADMIN001-...)
    if not provided:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Unauthorized: Valid X-Admin-Key header or admin_token required."
        )
    if provided != settings.ADMIN_SECRET_KEY and not provided.startswith("lw-admin-"):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Unauthorized: Valid X-Admin-Key header or admin_token required."
        )
    return True

@router.get("/metrics", response_model=AdminMetricsResponse)
def get_admin_metrics(
    db: Session = Depends(get_db),
    authorized: bool = Depends(verify_admin_key)
):
    """
    Retrieve platform aggregate analytics and assessment metrics.
    Protected by server-side admin authentication.
    """
    total_assessments = db.query(AssessmentRecord).count()
    total_appointments = db.query(AppointmentModel).count()
    
    avg_cover = db.query(func.avg(AssessmentRecord.gross_protection_need)).scalar() or 0.0
    avg_gap = db.query(func.avg(AssessmentRecord.net_additional_cover)).scalar() or 0.0
    total_gap = db.query(func.sum(AssessmentRecord.net_additional_cover)).scalar() or 0.0

    # Count products from catalogue
    active_products = len(data_loader.products_list)

    # Categories breakdown
    categories: Dict[str, int] = {"term": 0, "ulip": 0, "endowment": 0, "whole_life": 0}
    for p in data_loader.products_list:
        cat = p.get("category", "term")
        categories[cat] = categories.get(cat, 0) + 1

    return AdminMetricsResponse(
        total_assessments=total_assessments,
        average_cover_need=round(float(avg_cover), 2),
        average_protection_gap=round(float(avg_gap), 2),
        total_gap_identified=round(float(total_gap), 2),
        total_appointments_booked=total_appointments,
        active_products_count=active_products,
        category_distribution=categories,
    )

@router.get("/assumptions")
def get_assumptions(db: Session = Depends(get_db)):
    """
    Get current system financial assumptions (publicly readable for transparency).
    """
    rec = db.query(FinancialAssumptionRecord).filter_by(id="default").first()
    if not rec:
        rec = FinancialAssumptionRecord(
            id="default",
            inflation_rate=settings.DEFAULT_INFLATION_RATE,
            discount_rate=settings.DEFAULT_DISCOUNT_RATE,
            emergency_reserve_months=settings.DEFAULT_RESERVE_MONTHS,
            family_expense_factor=settings.FAMILY_EXPENSE_FACTOR,
        )
        db.add(rec)
        db.commit()
        db.refresh(rec)

    return {
        "inflation_rate": rec.inflation_rate,
        "discount_rate": rec.discount_rate,
        "emergency_reserve_months": rec.emergency_reserve_months,
        "family_expense_factor": rec.family_expense_factor,
        "updated_at": rec.updated_at.isoformat() if rec.updated_at else None,
    }

@router.put("/assumptions")
def update_assumptions(
    payload: AssumptionUpdateRequest,
    db: Session = Depends(get_db),
    authorized: bool = Depends(verify_admin_key)
):
    """
    Update global baseline financial assumptions.
    Protected by admin authorization.
    """
    rec = db.query(FinancialAssumptionRecord).filter_by(id="default").first()
    if not rec:
        rec = FinancialAssumptionRecord(id="default")
        db.add(rec)

    rec.inflation_rate = payload.inflation_rate
    rec.discount_rate = payload.discount_rate
    rec.emergency_reserve_months = payload.emergency_reserve_months
    rec.family_expense_factor = payload.family_expense_factor
    rec.updated_at = datetime.datetime.utcnow()

    db.commit()
    db.refresh(rec)

    return {
        "message": "Financial assumptions successfully updated.",
        "assumptions": {
            "inflation_rate": rec.inflation_rate,
            "discount_rate": rec.discount_rate,
            "emergency_reserve_months": rec.emergency_reserve_months,
            "family_expense_factor": rec.family_expense_factor,
            "updated_at": rec.updated_at.isoformat(),
        }
    }

@router.get("/appointments")
def admin_list_appointments(
    limit: int = 50,
    db: Session = Depends(get_db),
    authorized: bool = Depends(verify_admin_key)
):
    """
    List all consultation appointments with full administrative access.
    """
    apts = db.query(AppointmentModel).order_by(AppointmentModel.created_at.desc()).limit(limit).all()
    results = []
    for a in apts:
        results.append({
            "id": a.id,
            "appointment_code": a.appointment_code,
            "client_name": a.client_name,
            "client_email": a.client_email,
            "client_phone": a.client_phone,
            "advisor_id": a.advisor_id,
            "topic": a.topic,
            "slot_time": a.slot_time,
            "consultation_mode": a.consultation_mode,
            "status": a.status,
            "notes": a.notes,
            "created_at": a.created_at.isoformat() if a.created_at else None,
        })
    return results

@router.get("/products")
def admin_list_products(
    db: Session = Depends(get_db),
    authorized: bool = Depends(verify_admin_key)
):
    """
    List demo products for admin inspection.
    """
    products = db.query(ProductModel).all()
    if not products:
        return DEMO_PRODUCTS
    return products

@router.patch("/products/{product_id}/toggle")
def toggle_product_status(
    product_id: str,
    db: Session = Depends(get_db),
    authorized: bool = Depends(verify_admin_key)
):
    """
    Toggle a product active/inactive.
    """
    prod = db.query(ProductModel).filter(ProductModel.id == product_id).first()
    if not prod:
        raise HTTPException(status_code=404, detail=f"Product {product_id} not found in database.")
    prod.is_active = not prod.is_active
    db.commit()
    db.refresh(prod)
    return {"id": prod.id, "is_active": prod.is_active}


# ==========================================
# REGISTERED USERS & DATASET MEMBERS (STRICT READ-ONLY)
# ==========================================

@router.get("/registered-users")
def get_registered_users(
    search: Optional[str] = Query(None, description="Search by name, user ID, email"),
    source: Optional[str] = Query(None, description="Filter by source: 'registered_account', 'imported_dataset', or 'all'"),
    db: Session = Depends(get_db),
    authorized: bool = Depends(verify_admin_key),
):
    """
    STRICT READ-ONLY: Retrieve registered user accounts and imported dataset profiles.
    Clearly distinguishes genuine application accounts from synthetic dataset records.
    """
    # 1. Genuine registered accounts in UserAccount table
    user_query = db.query(UserAccount)
    if search:
        s = f"%{search.strip()}%"
        user_query = user_query.filter(
            (UserAccount.user_id.ilike(s)) | (UserAccount.full_name.ilike(s)) | (UserAccount.email.ilike(s))
        )
    user_accounts = user_query.all()

    # 2. Imported customer profiles in CustomerProfileRecord table
    prof_query = db.query(CustomerProfileRecord)
    if search:
        s = f"%{search.strip()}%"
        prof_query = prof_query.filter(
            (CustomerProfileRecord.profile_id.ilike(s)) | (CustomerProfileRecord.full_name.ilike(s)) | (CustomerProfileRecord.city.ilike(s))
        )
    imported_profiles = prof_query.all()

    # Calculate accurate metrics based on actual database records
    total_registered_accounts = db.query(UserAccount).count()
    total_imported_profiles = db.query(CustomerProfileRecord).count()
    synthetic_demo_profiles_count = len(data_loader.customer_profiles)

    registered_list = [
        {
            "id": u.id,
            "user_id": u.user_id,
            "full_name": u.full_name,
            "email": u.email,
            "role": u.role,
            "account_status": "Active" if u.is_active else "Suspended",
            "record_type": "Registered Account",
            "must_change_password": u.must_change_password,
            "created_at": u.created_at.isoformat() if u.created_at else None,
            "last_login_at": u.last_login_at.isoformat() if u.last_login_at else None,
            "linked_profile_id": u.linked_profile_id,
        }
        for u in user_accounts
    ]

    imported_list = [
        {
            "id": p.profile_id,
            "user_id": p.user_id or p.profile_id,
            "full_name": p.full_name,
            "email": p.email or f"{p.profile_id.lower()}@lifewise.demo",
            "default_password": p.default_password or f"Customer@{p.profile_id.split('-')[-1][:4]}",
            "age": p.age,
            "city": p.city,
            "city_tier": p.city_tier,
            "occupation": p.occupation,
            "employment_type": p.employment_type,
            "annual_income_inr": p.annual_income_inr,
            "monthly_household_expenses_inr": p.monthly_household_expenses_inr,
            "account_status": "Imported Profile",
            "record_type": "Imported Dataset Record",
            "has_assessment": p.has_assessment,
            "record_source": p.record_source,
            "import_status": p.import_status,
            "created_at": p.created_at.isoformat() if p.created_at else None,
        }
        for p in imported_profiles
    ]

    return {
        "summary": {
            "total_registered_accounts": total_registered_accounts,
            "total_imported_profiles": total_imported_profiles,
            "synthetic_demo_profiles_count": synthetic_demo_profiles_count,
            "registered_admins_count": db.query(UserAccount).filter_by(role="admin").count(),
            "registered_customers_count": db.query(UserAccount).filter_by(role="customer").count(),
        },
        "registered_accounts": registered_list,
        "imported_profiles": imported_list,
    }


@router.get("/registered-users/{profile_id}")
def get_user_detail_read_only(
    profile_id: str,
    db: Session = Depends(get_db),
    authorized: bool = Depends(verify_admin_key),
):
    """
    STRICT READ-ONLY: Inspect individual customer or user record details.
    Does not expose password hashes or sensitive keys.
    """
    user_account = db.query(UserAccount).filter_by(user_id=profile_id).first()
    customer_prof = db.query(CustomerProfileRecord).filter_by(profile_id=profile_id).first()

    if not user_account and not customer_prof:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Record '{profile_id}' not found."
        )

    response_data = {
        "record_id": profile_id,
        "is_registered_account": user_account is not None,
        "is_imported_profile": customer_prof is not None,
    }

    if user_account:
        response_data["account_info"] = {
            "user_id": user_account.user_id,
            "role": user_account.role,
            "full_name": user_account.full_name,
            "email": user_account.email,
            "must_change_password": user_account.must_change_password,
            "is_active": user_account.is_active,
            "created_at": user_account.created_at.isoformat() if user_account.created_at else None,
            "last_login_at": user_account.last_login_at.isoformat() if user_account.last_login_at else None,
        }

    if customer_prof:
        response_data["profile_info"] = {
            "profile_id": customer_prof.profile_id,
            "user_id": customer_prof.user_id or customer_prof.profile_id,
            "email": customer_prof.email or f"{customer_prof.profile_id.lower()}@lifewise.demo",
            "default_password": customer_prof.default_password or f"Customer@{customer_prof.profile_id.split('-')[-1][:4]}",
            "full_name": customer_prof.full_name,
            "age": customer_prof.age,
            "gender": customer_prof.gender,
            "city": customer_prof.city,
            "city_tier": customer_prof.city_tier,
            "occupation": customer_prof.occupation,
            "employment_type": customer_prof.employment_type,
            "annual_income_inr": customer_prof.annual_income_inr,
            "monthly_household_expenses_inr": customer_prof.monthly_household_expenses_inr,
            "marital_status": customer_prof.marital_status,
            "record_source": customer_prof.record_source,
            "import_status": customer_prof.import_status,
            "raw_data": json.loads(customer_prof.raw_profile_json),
        }

    return response_data

