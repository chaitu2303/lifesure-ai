import json
from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Product as ProductModel
from app.schemas import (
    AssessmentCreateRequest,
    RecommendationsResponse,
    PremiumQuoteRequest,
)
from app.data_loader import data_loader
from app.services.calculation_engine import FinancialCalculationEngine
from app.services.recommendation_engine import ProductRecommendationEngine
from app.services.premium_engine import PremiumCalculationEngine
from app.services.llm_risk_engine import PolicyRiskIntelligenceEngine

router = APIRouter(tags=["Products & Recommendations"])


@router.get("/products", response_model=List[dict])
def list_products(
    category: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """
    List all available insurance products from the authoritative Saffron Life catalogue
    with detailed eligibility parameters, features, and allowed payment options.
    """
    products = data_loader.products_list
    if category:
        products = [p for p in products if p.get("category") == category.lower()]
    return products


@router.get("/products/{product_id}")
def get_product_details(product_id: str):
    """
    Retrieve full configuration and underwriting rules for a specific insurance product.
    """
    prod = data_loader.products.get(product_id)
    if not prod:
        raise HTTPException(status_code=404, detail=f"Product with ID '{product_id}' not found.")
    return prod


@router.get("/riders", response_model=List[dict])
def list_riders():
    """
    List all 5 optional insurance riders with age eligibility, pricing basis, and caps.
    """
    return list(data_loader.riders.values())


@router.get("/ulip-funds", response_model=List[dict])
def list_ulip_funds():
    """
    List the 4 synthetic investment funds available inside ULIP products.
    """
    return list(data_loader.ulip_funds.values())


@router.post("/products/quote")
def calculate_real_premium_quote(payload: PremiumQuoteRequest):
    """
    Calculates exact premiums for non-linked products using premium_rates.csv
    or ULIPs using synthetic mortality tables and fund structures.
    """
    prod = data_loader.products.get(payload.product_id)
    if not prod:
        raise HTTPException(status_code=404, detail=f"Product with ID '{payload.product_id}' not found.")

    if prod.get("category") == "ulip":
        ann_prem = payload.annualised_premium or (payload.sum_assured / 10.0)
        has_accidental = any(r.get("rider_id") == "RDR-LUR23D" for r in (payload.selected_riders or []))
        result = PremiumCalculationEngine.calculate_ulip_premium(
            product_id=payload.product_id,
            annualised_premium=ann_prem,
            entry_age=payload.entry_age,
            policy_term_years=payload.policy_term_years,
            premium_payment_option=payload.premium_payment_option,
            mode=payload.payment_mode,
            gender=payload.gender,
            smoker_status=payload.smoker_status,
            accidental_rider=has_accidental,
        )
    else:
        result = PremiumCalculationEngine.calculate_non_linked_premium(
            product_id=payload.product_id,
            sum_assured=payload.sum_assured,
            entry_age=payload.entry_age,
            policy_term_years=payload.policy_term_years,
            premium_payment_option=payload.premium_payment_option,
            gender=payload.gender,
            smoker_status=payload.smoker_status,
            mode=payload.payment_mode,
            selected_riders=payload.selected_riders,
        )

    if not result.get("eligible"):
        raise HTTPException(status_code=400, detail=result.get("error", "Product parameters are ineligible."))

    return result


@router.post("/recommendations", response_model=RecommendationsResponse)
def get_recommendations_for_assessment(
    payload: AssessmentCreateRequest,
    assessment_id: Optional[int] = None,
    db: Session = Depends(get_db)
):
    """
    Generate deterministic, explainable product recommendations matching
    protection needs, underwriting constraints, and goal time horizons.
    """
    calc_result = FinancialCalculationEngine.evaluate_assessment(payload)
    recommendations = ProductRecommendationEngine.evaluate_recommendations(
        assessment_input=payload,
        calc_result=calc_result,
        assessment_id=assessment_id
    )
    return recommendations


@router.get("/products/{product_id}/risk-analysis")
def get_policy_risk_analysis(
    product_id: str,
    age: int = Query(30, description="Customer age"),
    annual_income: float = Query(1200000.0, description="Customer annual income in INR"),
    monthly_budget: float = Query(2500.0, description="Customer monthly premium budget in INR"),
    sum_assured: float = Query(10000000.0, description="Desired sum assured in INR"),
    policy_term: int = Query(30, description="Desired policy tenure in years"),
    gender: str = Query("male", description="Gender (male/female)"),
    smoker_status: str = Query("non_smoker", description="Smoker status (smoker/non_smoker)"),
    payment_option: str = Query("regular", description="Premium payment option"),
    payment_mode: str = Query("monthly", description="Payment frequency (annual, half_yearly, quarterly, monthly)"),
    dependents_count: int = Query(2, description="Number of dependents"),
    risk_profile: str = Query("moderate", description="Risk appetite"),
):
    """
    LLM & Policy Intelligence Engine:
    Returns structured 7-dimension risk report and advantages/disadvantages analysis
    strictly grounded in Saffron Life datasets (Section 12, 13, 14 of requirements).
    """
    analysis = PolicyRiskIntelligenceEngine.analyze_policy_risks(
        product_id=product_id,
        customer_age=age,
        annual_income=annual_income,
        monthly_budget=monthly_budget,
        target_sum_assured=sum_assured,
        target_policy_term=policy_term,
        dependents_count=dependents_count,
        risk_profile=risk_profile,
        gender=gender,
        smoker_status=smoker_status,
        payment_option=payment_option,
        payment_mode=payment_mode,
    )
    if analysis.get("status") == "error":
        raise HTTPException(status_code=404, detail=analysis.get("error"))
    return analysis


@router.get("/reverse-budget-solve")
def solve_coverage_by_budget(
    monthly_budget: float = Query(..., description="Monthly premium budget in INR"),
    age: int = Query(30, description="Applicant age"),
    tenure: int = Query(25, description="Desired policy term"),
    gender: str = Query("male", description="Gender"),
    smoker_status: str = Query("non_smoker", description="Smoker status"),
    category: Optional[str] = Query(None, description="Optional category filter (term, ulip, endowment, whole_life)"),
):
    """
    Reverse Budget Affordability Engine:
    'If my budget is ₹X/mo, what eligible coverage options can I explore?'
    Look up exact affordable coverage tiers directly from premium_rates.csv.
    """
    return PolicyRiskIntelligenceEngine.reverse_budget_solve(
        monthly_budget=monthly_budget,
        customer_age=age,
        target_tenure=tenure,
        gender=gender,
        smoker_status=smoker_status,
        preferred_category=category,
    )

