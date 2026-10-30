import json
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.database import engine, Base, SessionLocal
from app.models import (
    Product as ProductModel,
    Advisor as AdvisorModel,
    FinancialAssumptionRecord,
    UserAccount,
    CustomerProfileRecord,
)
from app.services.auth_service import hash_password
from app.data_loader import data_loader
from app.routers import (
    assessment,
    simulation,
    products,
    advisory,
    appointments,
    admin,
    customers,
    auth,
)

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="LifeWise — Intelligent Life Insurance Needs Finder & Digital Advisory Platform API",
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
    Initialize database schema and seed products, advisors, and default assumptions
    from the authoritative synthetic datasets.
    """
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        # Seed default assumptions if missing
        ref = data_loader.reference_assumptions
        existing_assump = db.query(FinancialAssumptionRecord).filter_by(id="default").first()
        if not existing_assump:
            default_rec = FinancialAssumptionRecord(
                id="default",
                inflation_rate=float(ref.get("general_inflation_pct_pa", 5.5)) / 100.0,
                discount_rate=float(ref.get("post_tax_return_on_payout_pct_pa", 7.0)) / 100.0,
                emergency_reserve_months=int(ref.get("emergency_fund_months", 6)),
                family_expense_factor=(100.0 - float(ref.get("household_expense_share_of_deceased_pct", 25.0))) / 100.0,
            )
            db.add(default_rec)
            db.commit()

        # Seed/Sync products from data_loader (14 products)
        for p in data_loader.products_list:
            pid = p["product_id"]
            existing = db.query(ProductModel).filter_by(id=pid).first()
            if not existing:
                prod = ProductModel(
                    id=pid,
                    name=p.get("product_name", pid),
                    category=p.get("category", "term"),
                    tagline=p.get("plain_language_summary", p.get("key_features", "")),
                    min_age=int(p.get("min_entry_age") or 18),
                    max_age=int(p.get("max_entry_age") or 65),
                    min_cover=float(p.get("min_sum_assured_inr") or 500000.0),
                    max_cover=float(p.get("max_sum_assured_inr") or 100000000.0),
                    cost_rating="Low (Best Value)" if p.get("category") == "term" else ("Moderate" if p.get("category") == "ulip" else "High"),
                    flexibility_rating="High" if p.get("category") in ["term", "ulip"] else "Moderate",
                    investment_component=p.get("category") != "term",
                    description=p.get("plain_language_summary", ""),
                    key_benefits_json=json.dumps([p.get("death_benefit", ""), p.get("maturity_benefit", ""), p.get("key_features", "")]),
                    limitations_json=json.dumps([p.get("key_exclusions", "")]),
                    ideal_for=p.get("key_features", "Comprehensive financial protection"),
                    base_rate_per_lakh=100.0,
                    is_active=True,
                )
                db.add(prod)
        db.commit()

        # Seed/Sync advisors from data_loader (15 advisors)
        for a in data_loader.advisors_list:
            aid = a["advisor_id"]
            existing = db.query(AdvisorModel).filter_by(id=aid).first()
            if not existing:
                adv = AdvisorModel(
                    id=aid,
                    name=a.get("advisor_name", aid),
                    title=a.get("title", "Certified Insurance Advisor"),
                    credentials="CFP®, ChFC®, Saffron Certified",
                    experience_years=int(a.get("experience_years", 10)),
                    specialties_json=json.dumps(a.get("specialisations_list", [])),
                    avatar_url=a.get("avatar_url"),
                    bio=a.get("bio", ""),
                    rating=float(a.get("rating", 4.8)),
                    reviews_count=int(a.get("reviews_count", 150)),
                )
                db.add(adv)
        db.commit()

        # Seed initial administrator account (ADMIN001) if not existing
        admin_id = getattr(settings, "ADMIN_INITIAL_ID", "ADMIN001")
        initial_pw = getattr(settings, "ADMIN_INITIAL_PASSWORD", "Admin@123")
        existing_admin = db.query(UserAccount).filter_by(user_id=admin_id).first()
        if not existing_admin:
            pw_hash, salt = hash_password(initial_pw)
            admin_account = UserAccount(
                user_id=admin_id,
                role="admin",
                password_hash=pw_hash,
                salt=salt,
                full_name="Platform Chief Actuary & Governance Admin",
                email="admin@lifewise.internal",
                must_change_password=True,
                is_active=True,
            )
            db.add(admin_account)
            db.commit()

        # Import customer profiles into DB table customer_profiles and register user_accounts
        for cp in data_loader.customer_profiles:
            prof_id = cp.get("profile_id")
            creds = cp.get("login_credentials", {})
            user_id = creds.get("user_id", prof_id)
            email = creds.get("email", f"{prof_id.lower()}@lifewise.demo")
            default_pw = creds.get("default_password", f"Customer@{prof_id.split('-')[-1][:4]}")

            # 1. Sync CustomerProfileRecord
            existing_prof = db.query(CustomerProfileRecord).filter_by(profile_id=prof_id).first()
            if not existing_prof:
                rec = CustomerProfileRecord(
                    profile_id=prof_id,
                    user_id=user_id,
                    email=email,
                    default_password=default_pw,
                    full_name=cp.get("full_name", prof_id),
                    age=int(cp.get("age", 30)),
                    gender=cp.get("gender", "male"),
                    city=cp.get("city", "Bengaluru"),
                    city_tier=int(cp.get("city_tier", 1)),
                    employment_type=cp.get("employment_type", "salaried"),
                    occupation=cp.get("occupation", "Professional"),
                    annual_income_inr=float(cp.get("annual_income_inr", 0.0)),
                    monthly_household_expenses_inr=float(cp.get("monthly_household_expenses_inr", 0.0)),
                    marital_status=cp.get("marital_status", "married"),
                    record_source="dataset_b2_synthetic",
                    import_status="imported",
                    has_assessment=True,
                    raw_profile_json=json.dumps(cp),
                )
                db.add(rec)
            else:
                existing_prof.user_id = user_id
                existing_prof.email = email
                existing_prof.default_password = default_pw

            # 2. Register UserAccount for customer with hashed credentials so they can log in
            existing_account = db.query(UserAccount).filter_by(user_id=user_id).first()
            if not existing_account:
                pw_hash, salt = hash_password(default_pw)
                user_account = UserAccount(
                    user_id=user_id,
                    role="customer",
                    password_hash=pw_hash,
                    salt=salt,
                    full_name=cp.get("full_name", prof_id),
                    email=email,
                    must_change_password=False,
                    is_active=True,
                    linked_profile_id=prof_id,
                )
                db.add(user_account)

        db.commit()

    finally:
        db.close()

# Initialize DB on load and startup
init_db_and_seed()

@app.on_event("startup")
def on_startup():
    init_db_and_seed()

# Health & Diagnostics check
@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "tagline": settings.TAGLINE,
        "brand_voice": settings.BRAND_VOICE,
        "version": settings.VERSION,
        "database": settings.DATABASE_URL.split(":///")[0],
        "datasets_ready": data_loader.is_loaded,
    }

@app.get("/api/datasets/status")
def dataset_status():
    """
    Returns startup diagnostics, loaded file counts, and verified integrity.
    """
    return {
        "is_loaded": data_loader.is_loaded,
        "diagnostics": data_loader.diagnostics,
        "assumptions": data_loader.reference_assumptions,
    }

@app.get("/api/profiles")
def list_demo_profiles(limit: int = 50):
    """
    Returns synthetic customer profiles from customer_profiles.json
    for instant one-click testing and demonstration.
    """
    return data_loader.customer_profiles[:limit]

# Include API Routers
app.include_router(assessment.router, prefix=settings.API_PREFIX)
app.include_router(simulation.router, prefix=settings.API_PREFIX)
app.include_router(products.router, prefix=settings.API_PREFIX)
app.include_router(advisory.router, prefix=settings.API_PREFIX)
app.include_router(appointments.router, prefix=settings.API_PREFIX)
app.include_router(admin.router, prefix=settings.API_PREFIX)
app.include_router(customers.router, prefix=settings.API_PREFIX)
app.include_router(auth.router, prefix=settings.API_PREFIX)
