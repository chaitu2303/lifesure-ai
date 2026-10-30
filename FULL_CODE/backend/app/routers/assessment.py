import json
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import AssessmentRecord, FinancialAssumptionRecord
from app.schemas import (
    AssessmentCreateRequest,
    CalculationResultResponse,
    RecommendationsResponse,
)
from app.services.calculation_engine import FinancialCalculationEngine
from app.services.recommendation_engine import ProductRecommendationEngine

router = APIRouter(prefix="/assessment", tags=["Assessment"])

def get_current_assumptions_dict(db: Session) -> dict:
    assump = db.query(FinancialAssumptionRecord).filter_by(id="default").first()
    if assump:
        return {
            "inflation_rate": assump.inflation_rate,
            "discount_rate": assump.discount_rate,
            "emergency_reserve_months": assump.emergency_reserve_months,
            "family_expense_factor": assump.family_expense_factor,
        }
    return {}

@router.post("/calculate", response_model=CalculationResultResponse)
def calculate_needs_preview(
    payload: AssessmentCreateRequest,
    db: Session = Depends(get_db)
):
    """
    Calculate life insurance protection needs on the fly without persisting to database.
    Useful for instant preview and validation.
    """
    db_assumptions = get_current_assumptions_dict(db)
    result = FinancialCalculationEngine.evaluate_assessment(payload, db_assumptions)
    return result

@router.post("/submit", response_model=CalculationResultResponse)
def submit_and_save_assessment(
    payload: AssessmentCreateRequest,
    db: Session = Depends(get_db)
):
    """
    Evaluates financial assessment and persists record to database.
    """
    db_assumptions = get_current_assumptions_dict(db)
    result = FinancialCalculationEngine.evaluate_assessment(payload, db_assumptions)

    # Persist in DB
    record = AssessmentRecord(
        session_id=payload.session_id or "demo-session",
        full_name=payload.full_name,
        age=payload.age,
        annual_income=payload.annual_income,
        monthly_expenses=payload.monthly_expenses,
        dependents_count=payload.dependents_count,
        retirement_age=payload.retirement_age,
        replacement_horizon_years=result.assumptions_used["replacement_horizon_years"],
        total_liabilities=result.total_liabilities,
        total_future_goals=result.total_future_goals_pv,
        eligible_existing_assets=result.eligible_existing_assets,
        existing_life_cover=result.existing_life_cover,
        monthly_budget=payload.monthly_budget,
        risk_profile=payload.risk_profile,
        income_replacement_pv=result.income_replacement_pv,
        gross_protection_need=result.total_gross_protection_need,
        net_additional_cover=result.net_additional_cover,
        protection_gap=result.protection_gap,
        raw_input_json=payload.model_dump_json(),
        computed_results_json=result.model_dump_json(),
    )
    db.add(record)
    db.commit()
    db.refresh(record)

    result.assessment_id = record.id
    result.created_at = record.created_at
    return result

@router.get("/recent", response_model=List[dict])
def get_recent_assessments(
    limit: int = 10,
    db: Session = Depends(get_db)
):
    """
    Retrieve recently saved assessments for customer dashboard view.
    """
    records = (
        db.query(AssessmentRecord)
        .order_by(AssessmentRecord.created_at.desc())
        .limit(limit)
        .all()
    )
    results = []
    for r in records:
        results.append({
            "id": r.id,
            "session_id": r.session_id,
            "full_name": r.full_name,
            "age": r.age,
            "annual_income": r.annual_income,
            "monthly_expenses": r.monthly_expenses,
            "gross_protection_need": r.gross_protection_need,
            "net_additional_cover": r.net_additional_cover,
            "protection_gap": r.protection_gap,
            "risk_profile": r.risk_profile,
            "created_at": r.created_at.isoformat() if r.created_at else None,
        })
    return results

@router.get("/{assessment_id}", response_model=dict)
def get_assessment_by_id(
    assessment_id: int,
    db: Session = Depends(get_db)
):
    """
    Retrieve a full saved assessment record with inputs and computed results.
    """
    record = db.query(AssessmentRecord).filter(AssessmentRecord.id == assessment_id).first()
    if not record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Assessment ID {assessment_id} not found."
        )

    raw_input = json.loads(record.raw_input_json)
    computed_results = json.loads(record.computed_results_json)

    return {
        "id": record.id,
        "session_id": record.session_id,
        "full_name": record.full_name,
        "created_at": record.created_at.isoformat() if record.created_at else None,
        "inputs": raw_input,
        "results": computed_results,
    }
