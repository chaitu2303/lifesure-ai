import json
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Product as ProductModel
from app.schemas import (
    AssessmentCreateRequest,
    RecommendationsResponse,
)
from app.services.calculation_engine import FinancialCalculationEngine
from app.services.recommendation_engine import (
    ProductRecommendationEngine,
    DEMO_PRODUCTS,
)

router = APIRouter(tags=["Products & Recommendations"])

@router.get("/products", response_model=List[dict])
def list_products(db: Session = Depends(get_db)):
    """
    List all available insurance products with features, categories, and illustrative parameters.
    """
    # Check if DB has products; if empty, return default demo list
    db_products = db.query(ProductModel).filter(ProductModel.is_active == True).all()
    if db_products:
        results = []
        for p in db_products:
            results.append({
                "id": p.id,
                "name": p.name,
                "category": p.category,
                "tagline": p.tagline,
                "min_age": p.min_age,
                "max_age": p.max_age,
                "min_cover": p.min_cover,
                "max_cover": p.max_cover,
                "cost_rating": p.cost_rating,
                "flexibility_rating": p.flexibility_rating,
                "investment_component": p.investment_component,
                "description": p.description,
                "key_benefits": json.loads(p.key_benefits_json) if p.key_benefits_json else [],
                "limitations": json.loads(p.limitations_json) if p.limitations_json else [],
                "ideal_for": p.ideal_for,
                "base_rate_per_lakh": p.base_rate_per_lakh,
            })
        return results

    # Fallback to hardcoded demo products
    return DEMO_PRODUCTS

@router.post("/recommendations", response_model=RecommendationsResponse)
def get_recommendations_for_assessment(
    payload: AssessmentCreateRequest,
    assessment_id: Optional[int] = None,
    db: Session = Depends(get_db)
):
    """
    Generate deterministic, explainable product recommendations matching
    protection needs, affordability constraints, and risk appetite.
    """
    calc_result = FinancialCalculationEngine.evaluate_assessment(payload)
    recommendations = ProductRecommendationEngine.evaluate_recommendations(
        assessment_input=payload,
        calc_result=calc_result,
        assessment_id=assessment_id
    )
    return recommendations
