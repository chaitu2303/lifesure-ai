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
    education_inflation_rate?: number;
    final_expenses_inr?: number;
    cover_rounding_inr?: number;
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
  is_eligible?: boolean;
  ineligibility_reasons?: string[];
  target_sum_assured?: number;
  target_term?: number;
}

export interface RecommendationsResponse {
  assessment_id?: number;
  net_additional_cover: number;
  recommended_product_category: string;
  primary_recommendation: ProductRecommendationItem;
  all_recommendations: ProductRecommendationItem[];
  methodology_note: string;
}

export interface ProductCatalogueItem {
  product_id: string;
  product_name?: string;
  name?: string;
  product_type: string;
  product_category?: string;
  insurer_name?: string;
  variant?: string;
  participation?: string;
  plain_language_summary?: string;
  min_entry_age: number;
  max_entry_age: number;
  max_maturity_age: number;
  min_sum_assured_inr?: number;
  max_sum_assured_inr?: number;
  sum_assured_step_inr?: number;
  category?: 'term' | 'ulip' | 'endowment' | 'whole_life';
  category_label?: string;
  allowed_policy_terms?: number[];
  allowed_premium_payment_terms?: string[];
  allowed_premium_modes?: string[];
  min_annual_income_inr?: number;
  eligible_riders?: string[];
  parsed_payment_options?: string[];
  parsed_allowed_terms?: number[];
  parsed_premium_modes?: string[];
  sa_band_factors?: Array<{ min_sa_inr: number; max_sa_inr: number | null; factor: number }>;
  riders_allowed?: string[];
  death_benefit?: string;
  maturity_benefit?: string;
  key_features?: string;
  key_exclusions?: string;
  min_annual_premium_inr?: number;
  max_annual_premium_inr?: number;
}

export interface RiderItem {
  rider_id: string;
  rider_name?: string;
  name?: string;
  rider_category?: string;
  category?: string;
  benefit?: string;
  rate_per_thousand?: number;
  description?: string;
  min_entry_age?: number;
  max_entry_age?: number;
  max_cover_age?: number;
  min_sum_assured_inr?: number;
  max_sum_assured_inr?: number;
  min_rider_sa_inr?: number;
  max_rider_sa_inr?: number;
  max_rider_sa_pct_of_base_sa?: number;
  rate_basis?: string;
  key_exclusions?: string;
}

export interface PremiumQuoteRequest {
  product_id: string;
  sum_assured: number;
  entry_age?: number;
  age?: number;
  policy_term_years?: number;
  policy_term?: number;
  premium_payment_option?: string;
  premium_payment_term?: string;
  gender?: 'male' | 'female';
  smoker_status?: 'non_smoker' | 'smoker';
  payment_mode?: 'annual' | 'half_yearly' | 'quarterly' | 'monthly';
  premium_mode?: 'annual' | 'half_yearly' | 'quarterly' | 'monthly' | string;
  selected_riders?: Array<{ rider_id: string; rider_sum_assured?: number; sum_assured?: number }>;
  riders?: Array<{ rider_id: string; rider_sum_assured?: number; sum_assured?: number }>;
  annualised_premium?: number;
}

export interface PremiumQuoteResult {
  eligible?: boolean;
  product_id: string;
  product_name: string;
  category?: string;
  category_label?: string;
  sum_assured: number;
  entry_age?: number;
  age?: number;
  policy_term_years?: number;
  policy_term?: number;
  premium_paying_term_years?: number;
  premium_payment_option?: string;
  premium_payment_term?: string;
  rate_per_1000_sa?: number;
  band_factor?: number;
  base_annual_premium: number;
  payment_mode?: string;
  premium_mode?: string;
  modal_factor: number;
  base_instalment: number;
  riders?: Array<{
    rider_id: string;
    rider_name: string;
    rider_sum_assured: number;
    annual_premium: number;
    instalment: number;
  }>;
  rider_warnings?: string[];
  total_instalment: number;
  total_annual_payable?: number;
  pricing_source?: string;
  error?: string;
}

export interface CustomerProfileSummary {
  profile_id: string;
  full_name: string;
  age: number;
  gender: string;
  city: string;
  occupation: string;
  annual_income_inr: number;
  monthly_household_expenses_inr: number;
  monthly_premium_budget_inr: number;
  risk_appetite: 'conservative' | 'moderate' | 'aggressive';
  smoker_status: string;
  dependents: {
    spouse?: { age: number; working: boolean; annual_income_inr: number };
    children?: Array<{ age: number }>;
    parents?: Array<{ age: number }>;
  };
  liabilities?: Array<{
    loan_type: string;
    outstanding_principal_inr: number;
  }>;
  existing_life_cover?: {
    individual_inr: number;
    employer_group_inr: number;
  };
  savings_and_investments?: {
    liquid_savings_inr: number;
    market_investments_inr: number;
    retirement_savings_inr: number;
  };
  goals?: Array<{
    goal_id: string;
    goal_type: string;
    target_amount_today_inr: number;
    years_until_goal?: number;
    target_year?: number;
  }>;
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
  notes?: string;
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
