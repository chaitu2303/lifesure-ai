import datetime
from sqlalchemy import Column, Integer, String, Float, Boolean, Text, DateTime
from app.database import Base

class AssessmentRecord(Base):
    __tablename__ = "assessments"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    session_id = Column(String(64), index=True, nullable=True)
    full_name = Column(String(128), default="Valued Client")
    age = Column(Integer, nullable=False)
    annual_income = Column(Float, nullable=False)
    monthly_expenses = Column(Float, nullable=False)
    dependents_count = Column(Integer, default=0)
    retirement_age = Column(Integer, default=60)
    replacement_horizon_years = Column(Integer, default=15)
    
    total_liabilities = Column(Float, default=0.0)
    total_future_goals = Column(Float, default=0.0)
    eligible_existing_assets = Column(Float, default=0.0)
    existing_life_cover = Column(Float, default=0.0)
    monthly_budget = Column(Float, default=0.0)
    risk_profile = Column(String(32), default="moderate")

    # Calculated outputs
    income_replacement_pv = Column(Float, default=0.0)
    gross_protection_need = Column(Float, default=0.0)
    net_additional_cover = Column(Float, default=0.0)
    protection_gap = Column(Float, default=0.0)

    raw_input_json = Column(Text, nullable=False)
    computed_results_json = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)


class Product(Base):
    __tablename__ = "products"

    id = Column(String(64), primary_key=True)
    name = Column(String(128), nullable=False)
    category = Column(String(32), nullable=False)  # "term", "whole_life", "endowment", "ulip"
    tagline = Column(String(256), nullable=False)
    min_age = Column(Integer, default=18)
    max_age = Column(Integer, default=65)
    min_cover = Column(Float, default=500000.0)
    max_cover = Column(Float, default=50000000.0)
    cost_rating = Column(String(32), default="Low")  # "Low", "Moderate", "High"
    flexibility_rating = Column(String(32), default="Moderate")
    investment_component = Column(Boolean, default=False)
    description = Column(Text, nullable=False)
    key_benefits_json = Column(Text, nullable=False)   # JSON array of strings
    limitations_json = Column(Text, nullable=False)    # JSON array of strings
    ideal_for = Column(String(256), nullable=False)
    base_rate_per_lakh = Column(Float, default=120.0)  # Illustrative annual rate per $100k / ₹1Lakh
    is_active = Column(Boolean, default=True)


class Advisor(Base):
    __tablename__ = "advisors"

    id = Column(String(64), primary_key=True)
    name = Column(String(128), nullable=False)
    title = Column(String(128), nullable=False)
    credentials = Column(String(64), default="CFP®")
    experience_years = Column(Integer, default=10)
    specialties_json = Column(Text, nullable=False)  # JSON array
    avatar_url = Column(String(256), nullable=True)
    bio = Column(Text, nullable=False)
    rating = Column(Float, default=4.9)
    reviews_count = Column(Integer, default=120)


class Appointment(Base):
    __tablename__ = "appointments"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    appointment_code = Column(String(32), unique=True, index=True, nullable=False)
    client_name = Column(String(128), nullable=False)
    client_email = Column(String(128), nullable=False)
    client_phone = Column(String(32), nullable=False)
    advisor_id = Column(String(64), nullable=False)
    topic = Column(String(128), nullable=False)
    slot_time = Column(String(64), nullable=False)
    consultation_mode = Column(String(32), default="video")  # "video", "phone"
    status = Column(String(32), default="confirmed")        # "confirmed", "completed", "cancelled"
    notes = Column(Text, default="")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)


class FinancialAssumptionRecord(Base):
    __tablename__ = "financial_assumptions"

    id = Column(String(32), primary_key=True, default="default")
    inflation_rate = Column(Float, default=0.06)
    discount_rate = Column(Float, default=0.08)
    emergency_reserve_months = Column(Integer, default=6)
    family_expense_factor = Column(Float, default=0.75)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow)


class UserAccount(Base):
    __tablename__ = "user_accounts"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(String(64), unique=True, index=True, nullable=False)  # e.g. ADMIN001 or CUS-06ISGGSQ
    role = Column(String(32), nullable=False)  # "admin" or "customer"
    password_hash = Column(String(256), nullable=False)
    salt = Column(String(64), nullable=False)
    full_name = Column(String(128), nullable=False)
    email = Column(String(128), nullable=True)
    must_change_password = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True)
    linked_profile_id = Column(String(64), nullable=True)  # Links to customer profile in dataset if any
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    last_login_at = Column(DateTime, nullable=True)


class CustomerProfileRecord(Base):
    """
    Imported dataset customer profiles stored in database.
    Separated from user_accounts until explicitly registered/linked.
    """
    __tablename__ = "customer_profiles"

    profile_id = Column(String(64), primary_key=True, index=True)
    full_name = Column(String(128), nullable=False)
    age = Column(Integer, nullable=False)
    gender = Column(String(16), nullable=False)
    city = Column(String(64), nullable=False)
    city_tier = Column(Integer, default=1)
    employment_type = Column(String(64), default="salaried")
    occupation = Column(String(128), default="Professional")
    annual_income_inr = Column(Float, default=0.0)
    monthly_household_expenses_inr = Column(Float, default=0.0)
    marital_status = Column(String(32), default="married")
    record_source = Column(String(64), default="dataset_b2_synthetic")  # "dataset_b2_synthetic", "registered_user"
    import_status = Column(String(32), default="imported")             # "imported", "verified", "linked"
    has_assessment = Column(Boolean, default=True)
    raw_profile_json = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
