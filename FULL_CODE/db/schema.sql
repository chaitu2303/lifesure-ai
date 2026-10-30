-- LifeWise SQLite Schema
-- Problem B2: Intelligent Life Insurance Needs Finder & Digital Advisory Platform

CREATE TABLE IF NOT EXISTS products (
    id VARCHAR(32) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(64) NOT NULL,
    insurer VARCHAR(128) NOT NULL,
    min_entry_age INTEGER NOT NULL,
    max_entry_age INTEGER NOT NULL,
    min_sum_assured NUMERIC(15, 2) NOT NULL,
    max_sum_assured NUMERIC(15, 2) NOT NULL,
    min_policy_term_years INTEGER NOT NULL,
    max_policy_term_years INTEGER NOT NULL,
    premium_payment_modes TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS advisors (
    id VARCHAR(32) PRIMARY KEY,
    name VARCHAR(128) NOT NULL,
    designation VARCHAR(128) NOT NULL,
    experience_years INTEGER NOT NULL,
    rating NUMERIC(3, 2) NOT NULL,
    languages TEXT NOT NULL,
    specializations TEXT NOT NULL,
    bio TEXT,
    avatar_url VARCHAR(512),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS appointments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    appointment_code VARCHAR(32) UNIQUE NOT NULL,
    slot_id VARCHAR(64) NOT NULL,
    advisor_id VARCHAR(32) NOT NULL,
    advisor_name VARCHAR(128) NOT NULL,
    client_name VARCHAR(128) NOT NULL,
    client_email VARCHAR(128) NOT NULL,
    client_phone VARCHAR(32) NOT NULL,
    slot_time VARCHAR(64) NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'confirmed',
    topic TEXT,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(advisor_id) REFERENCES advisors(id)
);

CREATE TABLE IF NOT EXISTS assessments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id VARCHAR(64) NOT NULL,
    full_name VARCHAR(128) NOT NULL,
    age INTEGER NOT NULL,
    annual_income NUMERIC(15, 2) NOT NULL,
    monthly_expenses NUMERIC(15, 2) NOT NULL,
    dependents_count INTEGER NOT NULL,
    retirement_age INTEGER NOT NULL,
    replacement_horizon_years INTEGER NOT NULL,
    total_liabilities NUMERIC(15, 2) NOT NULL,
    total_future_goals NUMERIC(15, 2) NOT NULL,
    eligible_existing_assets NUMERIC(15, 2) NOT NULL,
    existing_life_cover NUMERIC(15, 2) NOT NULL,
    monthly_budget NUMERIC(15, 2) NOT NULL,
    risk_profile VARCHAR(32) NOT NULL,
    income_replacement_pv NUMERIC(15, 2) NOT NULL,
    gross_protection_need NUMERIC(15, 2) NOT NULL,
    net_additional_cover NUMERIC(15, 2) NOT NULL,
    protection_gap NUMERIC(15, 2) NOT NULL,
    raw_input_json TEXT NOT NULL,
    computed_results_json TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS financial_assumptions (
    id VARCHAR(32) PRIMARY KEY,
    inflation_rate NUMERIC(5, 4) NOT NULL,
    discount_rate NUMERIC(5, 4) NOT NULL,
    emergency_reserve_months INTEGER NOT NULL,
    family_expense_factor NUMERIC(5, 4) NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
