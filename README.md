# LifeWise — Intelligent Life Insurance Needs Finder & Digital Advisory Platform
## TalentAP Mega Hackathon 2026 | Problem B2

> **Protect Today. Plan Tomorrow. Live Assured.**  
> *LifeWise — Life Insurance, Made Understandable.*

---

## 📋 Executive Overview

**LifeWise** is a full-stack, fiduciary financial technology platform built for retail banking customers. It transforms complex insurance decision-making into an empowering, transparent digital advisory experience. Rather than relying on arbitrary rules of thumb (like "10x annual income") that leave families underinsured, LifeWise executes an actuarially rigorous **Capital Needs Analysis (CNA)**. It reconciles living expense annuities, debt extinguishment, and child education goals against existing assets and policies.

The platform deterministically matches customers to an authoritative catalogue of **14 Saffron Life Insurance products** across Term, Whole Life, Guaranteed Endowment, and Unit-Linked (ULIP) categories. It quotes premiums using **39,588 synthetic rate points**, modal factors, and exact Decimal rounding. Customers can customize policies in an interactive sandbox, simulate what-if scenarios, and book consultations with 15 certified fiduciary advisors.

---

## 🌟 Key Features

1. **Transparent Needs Calculation Engine**
   - **Capital Needs Analysis (CNA)** using the exact Irving Fisher real discount rate formula ($r_{\text{real}} = \frac{r - i}{1 + i}$).
   - Living expense annuity PV, liabilities payoff, child education & milestones, 6-month family reserve, and ₹1.5L final expenses.
   - Non-earning spouse unpaid household services valuation (₹3,00,000/yr benchmark).
   - Strict zero lower-bound constraint and Human Life Value (HLV) comparison.
   - 100% deterministic calculation — no LLM hallucinations in the financial math.

2. **Synthetic Dataset Loading Layer**
   - High-throughput loader parsing all 10 supplied B2 datasets in **171 milliseconds**.
   - Loads 14 products, 5 riders, 4 ULIP funds, 328 mortality charge rows, 39,588 premium rates, 200 customer profiles, 371 goals, and 15 advisors with 2,201 slots.
   - Validates schemas, detects duplicate IDs, and provides startup health diagnostics without logging sensitive customer data.

3. **Product Matching & Underwriting Engine**
   - Evaluates underwriting constraints: entry age, maturity age, sum assured bounds, sum assured increments, allowed tenures, allowed PPTs, and minimum income thresholds.
   - Enforces IRDAI income multiples (25x for $\le 35$y, 20x for 36–45y, 15x for 46–50y, 12x for 51–55y, 10x for 56+y) and caps non-term savings at 10x income.
   - Explainable scoring and fit reasons for every eligible category.

4. **Real Premium Calculation Engine**
   - Authoritative lookup from `premium_rates.csv` across product, age, gender, smoker status, term, and payment options.
   - Exact Decimal rounding (`ROUND_HALF_UP`) matching official IRDAI rounding conventions (e.g., Section 6.1 worked example: Base ₹914 + Rider ₹131 = **₹1,045/month**).
   - Applies modal factors: Monthly (0.0875), Quarterly (0.26), Half-Yearly (0.51), Annual (1.0).
   - Dynamic rider premium calculation and ULIP mortality charge adjustments.

5. **Interactive Policy & Scenario Simulator**
   - Live controls for sum assured, tenure, payment option, frequency, and rider selection.
   - Real-time rate recalculation directly via backend quote API.
   - Real-time affordability gauge against user's monthly budget showing surplus or deficit.

6. **Digital Advisory & Consultation Booking**
   - Directory of 15 certified advisors (CFP® / SEBI-registered) with language and specialty filtering.
   - 2,201 real 30-minute consultation slots. Automatically filters expired slots relative to current simulation date (`2026-10-29T20:41:58`).
   - Prevents duplicate slot bookings and issues verifiable appointment references (`LW-APT-XXXXXX`).
   - Integrated simulated HD video consultation room for seamless client-advisor review.

7. **Premium Editorial UI / UX**
   - Visual identity inspired by wealth-management and editorial financial journals.
   - Palette: Warm ivory surfaces (`#FAF9F5`), midnight navy typography (`#0B132B`), cobalt-blue primary actions (`#1D4ED8`), muted gold and restrained teal accents.
   - Typography: Newsreader serif display headers paired with Plus Jakarta Sans body.
   - Fully responsive, accessible, zero dead buttons, and includes a quick-load selector for 200 synthetic customer profiles.

---

## 🏛️ System Architecture & Source Structure

The project is structured according to official hackathon submission requirements inside `FULL_CODE/`:

```text
TalentAP/
├── README.md                           # Main Hackathon documentation (this file)
├── EVALUATION_READINESS.md             # Complete AI Evaluation Readiness Report
├── .gitignore                          # Submission exclusions (data, local DBs, node_modules)
├── LICENSE                             # MIT License
├── Datasets/                           # Local synthetic datasets (excluded from submission ZIP)
│   └── B2_Life_Insurance_Needs_Finder/
│       └── data/                       # 10 synthetic CSV / JSON files
└── FULL_CODE/
    ├── .env.example                    # Environment variable template
    ├── EVALUATION_READINESS.md         # Mirrored evaluation readiness report
    ├── data/
    │   └── README.md                   # Instructions for placing datasets
    ├── backend/
    │   ├── app/
    │   │   ├── main.py                 # FastAPI application, startup seeding & diagnostics
    │   │   ├── config.py               # Pydantic BaseSettings & environment variables
    │   │   ├── database.py             # SQLAlchemy engine & SQLite session maker
    │   │   ├── data_loader.py          # High-performance CSV/JSON dataset manager
    │   │   ├── models.py               # SQLAlchemy ORM models (Product, Advisor, Appointment, etc.)
    │   │   ├── schemas.py              # Pydantic v2 typed request/response schemas
    │   │   ├── services/
    │   │   │   ├── calculation_engine.py  # Capital Needs Analysis & Fisher PV formulas
    │   │   │   ├── premium_engine.py      # Synthetic premium rate calculation & Decimal rounding
    │   │   │   ├── recommendation_engine.py # Product eligibility & suitability matching
    │   │   │   ├── advisory_service.py    # Advisor directory, slots filter & appointment booking
    │   │   │   └── simulation_engine.py   # What-if scenario stress-testing engine
    │   │   └── routers/
    │   │       ├── assessment.py       # Needs calculation endpoints (/api/assessment/calculate)
    │   │       ├── products.py         # Catalogue (/api/products) & Quotes (/api/products/quote)
    │   │       ├── appointments.py     # Slot booking (/api/appointments/book)
    │   │       ├── advisory.py         # Advisor directory (/api/advisors) & Chat (/api/chat)
    │   │       ├── simulation.py       # Scenario simulator (/api/simulate)
    │   │       └── admin.py            # Metrics & assumptions (/api/admin)
    │   ├── tests/
    │   │   ├── test_b2_hackathon_comprehensive.py # 11 end-to-end B2 hackathon tests
    │   │   ├── test_edge_cases.py                 # 13 edge-case tests (zero income, underwriting caps, etc.)
    │   │   ├── test_calculation_engine.py         # Actuarial PV & reserve tests
    │   │   ├── test_recommendation_engine.py      # Eligibility rules & scoring tests
    │   │   ├── test_simulation.py                 # Budget & slider tests
    │   │   └── test_api.py                        # FastAPI integration tests
    │   ├── requirements.txt            # Pinned Python dependencies
    │   └── run.py                      # Uvicorn launcher
    └── frontend/
        ├── src/
        │   ├── types/index.ts          # Comprehensive TypeScript interfaces
        │   ├── services/
        │   │   ├── api.ts              # Fetch API client with resilience fallbacks
        │   │   └── offlineEngine.ts    # Client-side fallback calculation engine
        │   ├── components/
        │   │   ├── landing/            # Hero, HowItWorks (4 stages), Education, Trust
        │   │   ├── assessment/         # Assessment wizard with synthetic persona loader
        │   │   ├── results/            # Results dashboard, breakdown charts & printable report
        │   │   ├── recommendations/    # Saffron product catalogue & comparison modal
        │   │   ├── simulation/         # What-If Simulator with live rate quotes & riders
        │   │   ├── advisory/           # Advisor booking modal, chatbot & simulated video room
        │   │   ├── dashboard/          # Customer dashboard & appointment ledger
        │   │   └── layout/             # Navbar, Footer & AppShell
        │   ├── App.tsx                 # Core application view controller
        │   ├── main.tsx                # React DOM entry point
        │   └── index.css               # Design system tokens & Tailwind CSS
        ├── package.json
        ├── package-lock.json
        ├── tailwind.config.js
        └── vite.config.ts
```

---

## 📐 Financial Calculation & Actuarial Methodology

LifeWise uses the **Capital Needs Analysis (CNA)** methodology:

$$\text{Net Additional Cover} = \max\Big(0,\ \text{Gross Protection Need} - \text{Eligible Existing Assets} - \text{Existing Life Cover}\Big)$$

Where:

$$\text{Gross Need} = \text{Income Replacement PV} + \text{Eligible Liabilities} + \text{Future Goals PV} + \text{Emergency Reserve} + \text{Final Expenses}$$

### 1. Income Replacement Present Value
Calculates the lump sum required today to replace family living expenses ($PMT = \text{Monthly Expenses} \times 12 \times 75\%$) over the dependency horizon ($N$ years).

Using the exact **Fisher equation** for real interest rate:
$$r_{\text{real}} = \frac{1 + r_{\text{discount}}}{1 + i_{\text{inflation}}} - 1 = \frac{r_{\text{discount}} - i_{\text{inflation}}}{1 + i_{\text{inflation}}}$$

Default assumptions from `reference_assumptions.json`:
- Living expenses inflation ($i$): **5.5%** p.a.
- Nominal post-tax investment return / discount rate ($r$): **7.0%** p.a.
- Real discount rate ($r_{\text{real}}$): **1.4218%** p.a.

The ordinary annuity present value is:
$$PV = PMT \times \frac{1 - (1 + r_{\text{real}})^{-N}}{r_{\text{real}}}$$

### 2. Outstanding Liabilities
Sum of outstanding principals for mortgages, auto loans, personal loans, and education loans.

### 3. Future Protection Goals
Each milestone goal (e.g., child's college in $k$ years) is inflated at the education inflation rate ($i_{\text{edu}} = 8.0\%$) and discounted back at the discount rate ($r = 7.0\%$):
$$PV_k = \text{Target Today} \times \left(\frac{1 + i_{\text{edu}}}{1 + r}\right)^k$$

### 4. Reserves & Homemaker Services
- **Emergency Reserve:** 6 months of household living expenses.
- **Final Expenses Reserve:** ₹1,50,000 standard.
- **Non-Earning Spouse Coverage:** Valued at ₹3,00,000/year unpaid household support over minor child dependency horizon.

---

## 📊 Dataset Specifications & Validation

The application integrates the 10 synthetic datasets from the B2 problem pack:

| Dataset | Format | Count / Size | Role in Platform |
| :--- | :--- | :--- | :--- |
| `products.json` / `.csv` | JSON / CSV | 14 Products | Authoritative catalogue for Term, Whole Life, Endowment, ULIP |
| `premium_rates.csv` | CSV | 39,588 rows | Exact synthetic tabular rates per ₹1,000 Sum Assured |
| `riders.csv` | CSV | 5 Riders | Accidental death, critical illness, disability, waiver of premium |
| `ulip_funds.csv` | CSV | 4 Funds | Equity Growth, Balanced, Debt, Liquid Cash fund options |
| `ulip_mortality_charges.csv` | CSV | 328 rows | Monthly mortality charges per ₹1,000 Sum at Risk |
| `customer_profiles.json` | JSON | 200 Profiles | Retail banking customer profiles with family, loans & assets |
| `customer_goals.csv` | CSV | 371 Goals | Linked to customer profiles by `profile_id` |
| `reference_assumptions.json`| JSON | 1 File | Actuarial inflation and return rates |
| `advisors.csv` | CSV | 15 Advisors | SEBI / CFP® certified advisors with languages & specialties |
| `advisor_slots.csv` | CSV | 2,201 Slots | 30-min consultation slots (Oct 26 – Nov 7, 2026) |

---

## 🚀 Setup & Execution Instructions

### Prerequisites
- Python 3.10+ (tested on Python 3.10.11)
- Node.js 18+ and npm
- Windows PowerShell or command prompt

### 1. Backend Setup
```powershell
cd E:\TalentAP\FULL_CODE\backend

# Install dependencies
pip install -r requirements.txt

# Run backend service
python run.py
```
*Backend runs at `http://127.0.0.1:8000`. Swagger API docs available at `http://127.0.0.1:8000/docs`.*

### 2. Frontend Setup
```powershell
cd E:\TalentAP\FULL_CODE\frontend

# Install dependencies (if not already installed)
npm install

# Run Vite development server
npm run dev
```
*Frontend runs at `http://localhost:5173`.*

### 3. Verify Dataset Readiness
Open your browser or run:
```powershell
curl http://127.0.0.1:8000/api/datasets/status
```
Expected output:
```json
{
  "status": "ready",
  "diagnostics": {
    "products_count": 14,
    "riders_count": 5,
    "ulip_funds_count": 4,
    "ulip_mortality_rows": 328,
    "premium_rates_count": 39588,
    "advisors_count": 15,
    "advisor_slots_count": 2201,
    "customer_profiles_count": 200,
    "customer_goals_count": 371
  }
}
```

---

## 🧪 Testing & Code Quality

### Automated Backend Tests
Run the comprehensive 47-test suite:
```powershell
cd E:\TalentAP\FULL_CODE\backend
python -m pytest tests/ -q
```
Result: **47 passed out of 47 tests (100% pass rate)**:
- `test_b2_hackathon_comprehensive.py`: 11 tests covering data loading, Decimal rate math, official Section 6.1 worked example (PRD-X4CBUF ₹1,045/mo), under/over-insured customers, no-income applicant rules, and slot filtering.
- `test_edge_cases.py`: 13 tests covering zero income with/without dependents, loan debt without dependents, existing sufficient coverage, budget constraints, missing premium rate combinations, invalid age bounds, invalid tenures, underwriting income multiples, minimal profile inputs, and duplicate/expired appointment slots.
- `test_calculation_engine.py`: 6 tests for Capital Needs Analysis, Fisher discounting, liabilities, and zero-lower-bound.
- `test_recommendation_engine.py`: 3 tests for product matching across all 4 categories.
- `test_simulation.py`: 3 tests for interactive what-if parameters and budget variance.
- `test_api.py`: 11 tests covering all FastAPI endpoints (including appointment cancel/reschedule, customers) and authorization.

### Automated Frontend Type Checking & Build
```powershell
cd E:\TalentAP\FULL_CODE\frontend
npm run build
```
Result: **Clean TypeScript compilation (`tsc`) and production bundle generation in 1.75s** with 0 errors.

---

## 🔌 API Reference Summary

| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `/api/datasets/status` | GET | Diagnostic check verifying all 10 datasets are loaded |
| `/api/profiles` | GET | List 200 synthetic customer profiles with financial summaries |
| `/api/assessment/calculate` | POST | Execute Capital Needs Analysis and calculate protection gap |
| `/api/products` | GET | Retrieve full 14 Saffron Life product catalogue |
| `/api/products/quote` | POST | Calculate exact premium quote using `premium_rates.csv` |
| `/api/recommendations` | POST | Deterministic eligibility check and suitability ranking |
| `/api/simulate` | POST | Real-time what-if scenario calculation |
| `/api/riders` | GET | List eligible protective riders and rate bases |
| `/api/advisors` | GET | List 15 certified advisors with languages and ratings |
| `/api/advisors/{id}/slots` | GET | Retrieve valid future 30-minute consultation slots |
| `/api/appointments/book` | POST | Book consultation slot and generate confirmation code |
| `/api/appointments` | GET | View client appointment history |
| `/api/chat` | POST | Grounded educational advisory assistant |
| `/api/admin/metrics` | GET | Platform governance metrics (protected by `X-Admin-Key`) |

---

## 🤖 Declarations & Compliance

### AI Tools & Models Used
- **Antigravity AI Assistant** (powered by DeepMind Gemini) for full-stack architecture pairing, actuarial formula derivation, and TypeScript refactoring.

### Pre-built & Third-Party Code
- **Backend:** FastAPI, Uvicorn, SQLAlchemy, Pydantic v2, Pytest, Pandas.
- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS, Lucide React, Recharts.

### Known Limitations
- Premium calculation for non-linked products relies strictly on tabular entries in `premium_rates.csv`. Combinations outside the synthetic table are rejected as unsupported rather than extrapolated.
- The advisory calendar is fixed to the hackathon dataset snapshot (October 26 through November 7, 2026). Past slots relative to `2026-10-29T20:41:58` are dynamically filtered out.
- The video room is an interactive browser-based simulation to provide a realistic consultation walkthrough without third-party teleconferencing dependencies.

### Regulatory & Educational Disclaimer
*LifeWise is developed as a hackathon submission for the TalentAP Mega Hackathon 2026 (Problem B2). All insurer names (e.g., Saffron Life Insurance), customer profiles, product terms, premium rate tables, and advisor profiles are entirely fictional demonstration artifacts provided in the competition pack. All calculations, recommendations, and simulations are generated for analytical evaluation only and do not constitute real financial advice, underwriting commitments, or binding insurance contracts.*
