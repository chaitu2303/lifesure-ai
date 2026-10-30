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
    if not provided or provided != settings.ADMIN_SECRET_KEY:
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
