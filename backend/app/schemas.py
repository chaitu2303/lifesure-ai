from typing import List, Optional, Dict, Any, Literal
from pydantic import BaseModel, Field, field_validator
import datetime

# --- Assessment Inputs ---

class LiabilitiesInput(BaseModel):
    home_loan: float = Field(0.0, ge=0, description="Outstanding home loan balance")
    car_loan: float = Field(0.0, ge=0, description="Outstanding vehicle loans")
    personal_loan: float = Field(0.0, ge=0, description="Personal or unsecured loans")
    education_loan: float = Field(0.0, ge=0, description="Education loans")
    credit_cards: float = Field(0.0, ge=0, description="Revolving credit card debt")
    other_liabilities: float = Field(0.0, ge=0, description="Any other debts")

    @property
    def total(self) -> float:
        return (
            self.home_loan
            + self.car_loan
            + self.personal_loan
            + self.education_loan
            + self.credit_cards
            + self.other_liabilities
        )


class GoalItem(BaseModel):
    name: str = Field(..., min_length=1, max_length=128, description="Goal name, e.g. Child Higher Education")
    target_amount: float = Field(..., gt=0, description="Estimated goal cost in today's currency")
    years_until_goal: int = Field(..., ge=1, le=50, description="Years from today when money is required")


class AssetsInput(BaseModel):
    savings_account: float = Field(0.0, ge=0, description="Cash & bank savings")
    fixed_deposits: float = Field(0.0, ge=0, description="Fixed or recurring deposits")
    mutual_funds_stocks: float = Field(0.0, ge=0, description="Liquid equity, mutual funds, bonds")
    pf_ppf_available: float = Field(0.0, ge=0, description="Retirement / provident funds available for protection")
    other_liquid_assets: float = Field(0.0, ge=0, description="Other liquid investments (excluding primary home)")

    @property
    def total(self) -> float:
        return (
            self.savings_account
            + self.fixed_deposits
            + self.mutual_funds_stocks
            + self.pf_ppf_available
            + self.other_liquid_assets
        )


class AssumptionsOverride(BaseModel):
    inflation_rate: Optional[float] = Field(None, ge=0.01, le=0.20, description="Annual inflation rate, e.g. 0.06 for 6%")
    discount_rate: Optional[float] = Field(None, ge=0.01, le=0.25, description="Expected safe discount rate, e.g. 0.08 for 8%")
    emergency_reserve_months: Optional[int] = Field(None, ge=1, le=36, description="Emergency buffer in months")
    family_expense_factor: Optional[float] = Field(None, ge=0.40, le=1.0, description="Fraction of family expenses to replace")


class AssessmentCreateRequest(BaseModel):
    session_id: Optional[str] = Field(None, description="Optional anonymous session identifier")
    full_name: str = Field("Valued Client", min_length=2, max_length=128)
    age: int = Field(..., ge=18, le=85, description="Client age in years")
    annual_income: float = Field(..., ge=0, description="Gross annual household or personal income")
    monthly_expenses: float = Field(..., gt=0, description="Current monthly household living expenses")
    dependents_count: int = Field(0, ge=0, le=20, description="Number of financially dependent members")
    retirement_age: int = Field(60, ge=40, le=85, description="Target retirement age")
    replacement_horizon_years: Optional[int] = Field(None, ge=1, le=45, description="Years of income replacement needed")
    
    liabilities: LiabilitiesInput = Field(default_factory=LiabilitiesInput)
    future_goals: List[GoalItem] = Field(default_factory=list)
    existing_assets: AssetsInput = Field(default_factory=AssetsInput)
    existing_life_cover: float = Field(0.0, ge=0, description="Current term/life insurance death benefit in force")
    monthly_budget: float = Field(0.0, ge=0, description="Target monthly budget for insurance protection")
    risk_profile: Literal["conservative", "moderate", "aggressive"] = Field("moderate")
    
    assumptions: Optional[AssumptionsOverride] = None

    @field_validator("monthly_expenses")
    @classmethod
    def validate_monthly_expenses(cls, v):
        if v <= 0:
            raise ValueError("Monthly expenses must be greater than zero.")
        return v


# --- Calculation Engine Outputs ---

class GoalBreakdownItem(BaseModel):
    name: str
    target_amount_today: float
    years_until_goal: int
    future_value: float
    present_value: float


class CalculationResultResponse(BaseModel):
    # Core Components of the Formula
    income_replacement_pv: float
    total_liabilities: float
    total_future_goals_pv: float
    total_future_goals_fv: float
    future_goals_breakdown: List[GoalBreakdownItem]
    additional_family_reserve: float
    total_gross_protection_need: float
    eligible_existing_assets: float
    existing_life_cover: float
    total_existing_protection: float
    net_additional_cover: float  # Floored at 0
    protection_gap: float        # Equal to net_additional_cover
    
    # Financial Insights
    human_life_value_estimate: float
    affordability_status: str     # "Comfortable", "Moderate Stretch", "Budget Constrained"
    monthly_budget: float
    estimated_monthly_premium_range: Dict[str, float]  # low, median, high
    
    # Active Assumptions
    assumptions_used: Dict[str, Any]
    formula_explanation: str
    assessment_id: Optional[int] = None
    created_at: Optional[datetime.datetime] = None


# --- Product Recommendation Schemas ---

class ProductRecommendationItem(BaseModel):
    product_id: str
    name: str
    category: str  # "term", "whole_life", "endowment", "ulip"
    category_label: str
    tagline: str
    suitability_score: int  # 0 to 100
    is_primary: bool
    headline_reason: str
    fit_reasons: List[str]
    trade_offs: List[str]
    ideal_for: str
    cost_rating: str
    flexibility_rating: str
    investment_component: bool
    illustrative_monthly_cost: float
    cost_disclaimer: str = "Illustrative estimate based on typical demographic rates. Not an insurer quote."


class RecommendationsResponse(BaseModel):
    assessment_id: Optional[int] = None
    net_additional_cover: float
    recommended_product_category: str
    primary_recommendation: ProductRecommendationItem
    all_recommendations: List[ProductRecommendationItem]
    methodology_note: str


# --- Simulation Schemas ---

class SimulationRequest(BaseModel):
    base_annual_income: float = Field(..., ge=0)
    base_monthly_expenses: float = Field(..., gt=0)
    base_dependents_count: int = Field(0, ge=0)
    base_liabilities: float = Field(0.0, ge=0)
    base_future_goals: float = Field(0.0, ge=0)
    base_existing_assets: float = Field(0.0, ge=0)
    base_existing_cover: float = Field(0.0, ge=0)
    
    # Interactive Sliders
    simulated_replacement_years: int = Field(..., ge=1, le=45)
    simulated_inflation_rate: float = Field(..., ge=0.01, le=0.20)
    simulated_discount_rate: float = Field(..., ge=0.01, le=0.25)
    simulated_monthly_budget: float = Field(..., ge=0)
    simulated_desired_cover_override: Optional[float] = Field(None, ge=0)
    simulated_goals_scaling: float = Field(1.0, ge=0.5, le=2.0)


class SimulationResponse(BaseModel):
    original_net_cover: float
    simulated_net_cover: float
    difference_amount: float
    difference_percentage: float
    
    simulated_income_replacement_pv: float
    simulated_liabilities: float
    simulated_future_goals_pv: float
    simulated_family_reserve: float
    simulated_gross_need: float
    
    estimated_monthly_premium: float
    budget_sufficiency: str  # "Surplus", "Balanced", "Deficit"
    budget_variance: float


# --- Advisory & Appointment Schemas ---

class AdvisorItem(BaseModel):
    id: str
    name: str
    title: str
    credentials: str
    experience_years: int
    specialties: List[str]
    avatar_url: Optional[str] = None
    bio: str
    rating: float
    reviews_count: int


class AvailableSlot(BaseModel):
    slot_id: str
    advisor_id: str
    date_str: str
    time_str: str
    is_available: bool


class AppointmentCreateRequest(BaseModel):
    advisor_id: str = Field(..., min_length=2)
    client_name: str = Field(..., min_length=2, max_length=128)
    client_email: str = Field(..., min_length=5, max_length=128)
    client_phone: str = Field(..., min_length=7, max_length=20)
    topic: str = Field(..., min_length=3, max_length=128)
    slot_time: str = Field(..., min_length=5)
    consultation_mode: Literal["video", "phone"] = Field("video")
    notes: Optional[str] = Field("", max_length=500)


class AppointmentResponse(BaseModel):
    id: int
    appointment_code: str
    advisor_id: str
    advisor_name: str
    client_name: str
    client_email: str
    client_phone: str
    topic: str
    slot_time: str
    consultation_mode: str
    status: str
    notes: str
    created_at: datetime.datetime


# --- Chat Advisory Schemas ---

class ChatMessageRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=1000)
    session_id: Optional[str] = None
    context_data: Optional[Dict[str, Any]] = None


class ChatMessageResponse(BaseModel):
    reply: str
    suggested_followups: List[str]
    disclaimer: str = "LifeSure AI provides educational insurance information only. It does not sell policies or give legally binding underwriting commitments."


# --- Admin Schemas ---

class AssumptionUpdateRequest(BaseModel):
    inflation_rate: float = Field(..., ge=0.01, le=0.20)
    discount_rate: float = Field(..., ge=0.01, le=0.25)
    emergency_reserve_months: int = Field(..., ge=1, le=36)
    family_expense_factor: float = Field(..., ge=0.40, le=1.0)


class AdminMetricsResponse(BaseModel):
    total_assessments: int
    average_cover_need: float
    average_protection_gap: float
    total_gap_identified: float
    total_appointments_booked: int
    active_products_count: int
    category_distribution: Dict[str, int]
