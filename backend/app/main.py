import json
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.database import engine, Base, SessionLocal
from app.models import Product as ProductModel, FinancialAssumptionRecord
from app.services.recommendation_engine import DEMO_PRODUCTS
from app.routers import (
    assessment,
    simulation,
    products,
    advisory,
    appointments,
    admin,
)

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="LifeSure AI — Intelligent Life Insurance Needs Finder & Digital Advisory Platform API",
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def init_db_and_seed():
    """
    Initialize database schema and seed demo products and default assumptions.
    """
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        # Seed default assumptions if missing
        existing_assump = db.query(FinancialAssumptionRecord).filter_by(id="default").first()
        if not existing_assump:
            default_rec = FinancialAssumptionRecord(
                id="default",
                inflation_rate=settings.DEFAULT_INFLATION_RATE,
                discount_rate=settings.DEFAULT_DISCOUNT_RATE,
                emergency_reserve_months=settings.DEFAULT_RESERVE_MONTHS,
                family_expense_factor=settings.FAMILY_EXPENSE_FACTOR,
            )
            db.add(default_rec)
            db.commit()

        # Seed products if empty
        existing_products = db.query(ProductModel).count()
        if existing_products == 0:
            for p in DEMO_PRODUCTS:
                prod = ProductModel(
                    id=p["id"],
                    name=p["name"],
                    category=p["category"],
                    tagline=p["tagline"],
                    min_age=18,
                    max_age=65,
                    min_cover=500000.0,
                    max_cover=50000000.0,
                    cost_rating=p["cost_rating"],
                    flexibility_rating=p["flexibility_rating"],
                    investment_component=p["investment_component"],
                    description=p["tagline"],
                    key_benefits_json=json.dumps(p["key_benefits"]),
                    limitations_json=json.dumps(p["limitations"]),
                    ideal_for=p["ideal_for"],
                    base_rate_per_lakh=p["base_monthly_rate_factor"],
                    is_active=True,
                )
                db.add(prod)
            db.commit()
    finally:
        db.close()

# Initialize DB on load and startup
init_db_and_seed()

@app.on_event("startup")
def on_startup():
    init_db_and_seed()

# Health check
@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "database": settings.DATABASE_URL.split(":///")[0],
    }

# Include API Routers
app.include_router(assessment.router, prefix=settings.API_PREFIX)
app.include_router(simulation.router, prefix=settings.API_PREFIX)
app.include_router(products.router, prefix=settings.API_PREFIX)
app.include_router(advisory.router, prefix=settings.API_PREFIX)
app.include_router(appointments.router, prefix=settings.API_PREFIX)
app.include_router(admin.router, prefix=settings.API_PREFIX)
