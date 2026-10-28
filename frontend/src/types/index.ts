export interface LiabilitiesInput {
  home_loan: number;
  car_loan: number;
  personal_loan: number;
  education_loan: number;
  credit_cards: number;
  other_liabilities: number;
}

export interface GoalItem {
  id?: string;
  name: string;
  target_amount: number;
  years_until_goal: number;
}

export interface AssetsInput {
  savings_account: number;
  fixed_deposits: number;
  mutual_funds_stocks: number;
  pf_ppf_available: number;
  other_liquid_assets: number;
}

export interface AssessmentInput {
  session_id?: string;
  full_name: string;
  age: number;
  annual_income: number;
  monthly_expenses: number;
  dependents_count: number;
  retirement_age: number;
  replacement_horizon_years?: number;
  liabilities: LiabilitiesInput;
  future_goals: GoalItem[];
  existing_assets: AssetsInput;
  existing_life_cover: number;
  monthly_budget: number;
  risk_profile: 'conservative' | 'moderate' | 'aggressive';
}

export interface GoalBreakdownItem {
  name: string;
  target_amount_today: number;
  years_until_goal: number;
  future_value: number;
  present_value: number;
}

export interface CalculationResult {
  income_replacement_pv: number;
  total_liabilities: number;
  total_future_goals_pv: number;
  total_future_goals_fv: number;
  future_goals_breakdown: GoalBreakdownItem[];
  additional_family_reserve: number;
  total_gross_protection_need: number;
  eligible_existing_assets: number;
  existing_life_cover: number;
  total_existing_protection: number;
  net_additional_cover: number;
  protection_gap: number;
  human_life_value_estimate: number;
  affordability_status: string;
  monthly_budget: number;
  estimated_monthly_premium_range: {
    low: number;
    median: number;
    high: number;
  };
  assumptions_used: {
    inflation_rate: number;
    discount_rate: number;
    real_rate: number;
    emergency_reserve_months: number;
    family_expense_factor: number;
    replacement_horizon_years: number;
  };
  formula_explanation: string;
  assessment_id?: number;
  created_at?: string;
}

export interface ProductRecommendationItem {
  product_id: string;
  name: string;
  category: 'term' | 'ulip' | 'endowment' | 'whole_life';
  category_label: string;
  tagline: string;
  suitability_score: number;
  is_primary: boolean;
  headline_reason: string;
  fit_reasons: string[];
  trade_offs: string[];
  ideal_for: string;
  cost_rating: string;
  flexibility_rating: string;
  investment_component: boolean;
  illustrative_monthly_cost: number;
  cost_disclaimer: string;
}

export interface RecommendationsResponse {
  assessment_id?: number;
  net_additional_cover: number;
  recommended_product_category: string;
  primary_recommendation: ProductRecommendationItem;
  all_recommendations: ProductRecommendationItem[];
  methodology_note: string;
}

export interface SimulationRequest {
  base_annual_income: number;
  base_monthly_expenses: number;
  base_dependents_count: number;
  base_liabilities: number;
  base_future_goals: number;
  base_existing_assets: number;
  base_existing_cover: number;
  simulated_replacement_years: number;
  simulated_inflation_rate: number;
  simulated_discount_rate: number;
  simulated_monthly_budget: number;
  simulated_desired_cover_override?: number;
  simulated_goals_scaling: number;
}

export interface SimulationResponse {
  original_net_cover: number;
  simulated_net_cover: number;
  difference_amount: number;
  difference_percentage: number;
  simulated_income_replacement_pv: number;
  simulated_liabilities: number;
  simulated_future_goals_pv: number;
  simulated_family_reserve: number;
  simulated_gross_need: number;
  estimated_monthly_premium: number;
  budget_sufficiency: 'Surplus' | 'Balanced' | 'Deficit' | 'Unspecified Budget';
  budget_variance: number;
}

export interface Advisor {
  id: string;
  name: string;
  title: string;
  credentials: string;
  experience_years: number;
  specialties: string[];
  avatar_url?: string;
  bio: string;
  rating: number;
  reviews_count: number;
}

export interface AvailableSlot {
  slot_id: string;
  advisor_id: string;
  date_str: string;
  time_str: string;
  is_available: boolean;
}

export interface Appointment {
  id: number;
  appointment_code: string;
  advisor_id: string;
  advisor_name: string;
  client_name: string;
  client_email: string;
  client_phone: string;
  topic: string;
  slot_time: string;
  consultation_mode: 'video' | 'phone';
  status: 'confirmed' | 'completed' | 'cancelled';
  notes: string;
  created_at: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  suggested_followups?: string[];
  timestamp: Date;
}

export interface AdminMetrics {
  total_assessments: number;
  average_cover_need: number;
  average_protection_gap: number;
  total_gap_identified: number;
  total_appointments_booked: number;
  active_products_count: number;
  category_distribution: Record<string, number>;
}

export interface FinancialAssumptions {
  inflation_rate: number;
  discount_rate: number;
  emergency_reserve_months: number;
  family_expense_factor: number;
  updated_at?: string;
}
