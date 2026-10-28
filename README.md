# LifeSure AI — Intelligent Life Insurance Needs Finder & Digital Advisory Platform

> **A modern, transparent financial technology platform that calculates life insurance coverage needs, explains the mathematical results, recommends suitable insurance product categories, provides interactive financial simulations, and supports digital advisor consultation booking.**

---

## 🏛️ System Architecture

LifeSure AI is structured into two clean, decoupled tiers:

```
TalentAP/
├── backend/
│   ├── app/
│   │   ├── main.py                     # FastAPI application entry point, CORS & DB initialization
│   │   ├── config.py                   # Pydantic BaseSettings environment configuration
│   │   ├── database.py                 # SQLAlchemy engine, session maker & SQLite/PostgreSQL layer
│   │   ├── models.py                   # Assessment, Product, Advisor, Appointment & Assumptions ORM models
│   │   ├── schemas.py                  # Pydantic v2 schemas for request/response validation
│   │   ├── services/
│   │   │   ├── calculation_engine.py   # Capital Needs Analysis & Fisher real discount annuity PV
│   │   │   ├── recommendation_engine.py# Deterministic multi-category product scoring rules
│   │   │   ├── simulation_engine.py    # Real-time what-if scenario simulator
│   │   │   └── advisory_service.py     # Educational chatbot knowledge base & slot generator
│   │   └── routers/
│   │       ├── assessment.py           # /api/assessment endpoints (calculate, submit, retrieve)
│   │       ├── simulation.py           # /api/simulate endpoint
│   │       ├── products.py             # /api/products & /api/recommendations
│   │       ├── appointments.py         # /api/appointments booking & status updates
│   │       ├── advisory.py             # /api/chat & /api/advisors endpoints
│   │       └── admin.py                # /api/admin metrics, assumptions & product management
│   ├── tests/
│   │   ├── test_calculation_engine.py  # Unit tests for PV formulas, real rate, zero lower bound
│   │   ├── test_recommendation_engine.py # Tests for Term, ULIP, Endowment suitability
│   │   ├── test_simulation.py          # Tests for inflation/horizon sliders and budget variance
│   │   └── test_api.py                 # Full integration test suite for all FastAPI endpoints
│   ├── requirements.txt
│   └── run.py                          # Uvicorn runner script
├── frontend/
│   ├── src/
│   │   ├── types/index.ts              # TypeScript interfaces mirroring backend schemas
│   │   ├── services/api.ts             # API client methods with error handling
│   │   ├── components/
│   │   │   ├── layout/                 # Navbar & Footer
│   │   │   ├── landing/                # Hero, How It Works, Education, Features, Trust sections
│   │   │   ├── assessment/             # 7-step guided financial needs assessment wizard
│   │   │   ├── results/                # Interactive results dashboard, waterfall & timeline charts
│   │   │   ├── recommendations/        # Ranked product suitability & comparison matrix
│   │   │   ├── simulation/             # Live what-if sandbox sliders
│   │   │   ├── advisory/               # Educational chatbot, booking modal & simulated video room
│   │   │   ├── dashboard/              # Customer dashboard & appointment ledger
│   │   │   └── admin/                  # Protected admin portal with server-side auth
│   │   ├── App.tsx                     # Main view & state orchestrator
│   │   ├── index.css                   # Inter font, Tailwind CSS directives & print styles
│   │   └── main.tsx                    # React 18 DOM mount
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.js              # Navy & restrained teal fintech design system
│   └── vite.config.ts
├── .env.example                        # Sample environment configuration
└── README.md
```

---

## 📐 Financial Calculation Methodology

LifeSure AI rejects simplistic heuristics like "10x annual income," which ignore debt, inflation, specific children's education milestones, or existing investments.

The engine uses the internationally recognized **Capital Needs Analysis** methodology:

$$\text{Net Additional Cover} = \max\Big(0,\ \text{Gross Protection Need} - \text{Eligible Existing Assets} - \text{Existing Life Cover}\Big)$$

Where **Gross Protection Need** equals:

$$\text{Gross Need} = \text{Income Replacement PV} + \text{Outstanding Liabilities} + \text{Future Goals PV} + \text{Additional Family Reserve}$$

### 1. Income Replacement Present Value
Calculates the capital required today to fund annual household living expenses ($PMT = \text{Monthly Expenses} \times 12 \times 75\%$) for $N$ years, adjusted for inflation ($i$) and discount yield ($r$).

Using the Fisher relation for the exact real interest rate:
$$r_{\text{real}} = \frac{1 + r}{1 + i} - 1 = \frac{r - i}{1 + i}$$

The lump-sum ordinary annuity present value is:
$$PV = PMT \times \frac{1 - (1 + r_{\text{real}})^{-N}}{r_{\text{real}}}$$

### 2. Outstanding Liabilities
Sum of all debts (mortgages, auto loans, personal loans, student debt, credit cards) to ensure families never face foreclosure or debt-servicing stress.

### 3. Future Goals (College & Milestones)
For each future milestone in $k$ years, the cost is inflated at rate $i$ and discounted back to present value at discount rate $r$:
$$FV_k = \text{Target Today} \times (1 + i)^k \implies PV_k = \frac{FV_k}{(1 + r)^k} = \text{Target Today} \times (1 + r_{\text{real}})^{-k}$$

### 4. Zero Lower Bound Enforcement
If eligible liquid assets and existing life insurance exceed total gross needs, the net recommended additional cover is strictly floored at **$0.00**.

---

## 🚀 Local Development Setup & Execution

### Prerequisites
- **Python 3.10+**
- **Node.js 18+ & npm 9+**

### Step 1: Backend Setup & Launch
Open a terminal in the project directory:

```bash
cd backend

# (Optional) Create and activate a virtual environment
python -m venv venv
# Windows:
.\venv\Scripts\activate
# Linux/macOS:
source venv/bin/activate

# Install Python requirements
pip install -r requirements.txt

# Run automated test suite to verify calculation & endpoints
python -m pytest -v

# Start the FastAPI server
python run.py
```
*The FastAPI backend will start at `http://127.0.0.1:8000`. Interactive OpenAPI documentation is available at `http://127.0.0.1:8000/docs`.*

### Step 2: Frontend Setup & Launch
Open a second terminal:

```bash
cd frontend

# Install node dependencies
npm install --legacy-peer-deps

# Build the production bundle to verify compilation
npm run build

# Start the Vite development server
npm run dev
```
*The React frontend will start at `http://localhost:5173`.*

---

## 🔒 Security & Admin Credentials

Administrative endpoints are secured on the backend via the `X-Admin-Key` header (or `admin_token` query parameter).

- **Default Demo Admin Key:** `lifesure-admin-key-2026`
- **Configurable in `.env`:** Set `ADMIN_SECRET_KEY` in environment variables.

### Admin Capabilities:
1. **Summary Analytics:** Total assessments, average coverage need, total protection gap identified, and appointment metrics.
2. **Global Financial Parameter Tuning:** Live adjustments to baseline inflation rate, discount rate, family expense factor, and emergency reserve duration.
3. **Product Catalog Governance:** Toggle active/disabled states for demo products.
4. **Appointment Management:** View and update status (Confirmed, Completed, Cancelled) for consultation bookings.

---

## 🧪 Automated Test Suite

Run backend test suite covering calculation correctness, zero lower bound, product recommendations, simulation dynamics, and API validation:

```bash
cd backend
python -m pytest -v
```

### Verified Test Coverage:
- `test_fisher_real_rate_calculation`: Exact Fisher equation validation.
- `test_income_replacement_pv_positive`: Annuity present value validation.
- `test_zero_expenses_or_zero_horizon`: Edge case handling.
- `test_future_goals_inflation_and_discount`: College and milestone present value calculations.
- `test_net_additional_cover_zero_lower_bound`: Zero lower bound when existing assets exceed needs.
- `test_full_needs_calculation_formula`: Complete arithmetic formula validation.
- `test_term_life_priority_for_high_protection_gap`: Term life prioritized for high cover needs.
- `test_ulip_suitability_for_moderate_risk_and_young_age`: Market wealth plan suitability scoring.
- `test_endowment_suitability_for_conservative_profile`: Conservative guaranteed savings matching.
- `test_simulation_inflation_increase_increases_net_cover`: Inflation slider validation.
- `test_simulation_budget_sufficiency`: Surplus, Balanced, Deficit evaluation.
- `test_health_check_api`: Service health check.
- `test_assessment_calculate_and_submit_api`: End-to-end calculation and database persistence.
- `test_invalid_negative_expenses_validation`: 422 HTTP validation error responses.
- `test_products_and_recommendations_api`: Multi-category recommendation generation.
- `test_chat_advisory_api`: Knowledgeable educational chatbot responses.
- `test_advisors_and_appointments_api`: Slot retrieval and appointment booking.
- `test_admin_metrics_security`: 401 unauthorized prevention and 200 authorization.

---

## ⚖️ Ethical Disclosures & Limitations

1. **Educational Estimates:** Calculations represent analytical estimations based on demographic actuarial tables and Capital Needs Analysis. They are not binding insurer quotations or underwriting commitments.
2. **Demo Products:** Products like *LifeSure Pure Term Shield* and *LifeSure Smart Wealth Advantage* are structured demo models to illustrate category trade-offs; they do not represent commercial solicitation.
3. **Privacy First:** The platform strictly avoids requesting sensitive personal identifiers such as government ID numbers (Aadhaar, SSN) or banking credentials.
