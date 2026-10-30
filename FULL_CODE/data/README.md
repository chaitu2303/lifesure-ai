# LifeWise — Dataset Directory

In accordance with official TalentAP Mega Hackathon 2026 rules, the synthetic datasets provided by the organizers must **NOT** be included in the final submission archive (`teamID_psID.zip`).

## Required Dataset Files

Place the following 10 files from the Problem B2 problem pack inside this directory (`FULL_CODE/data/`) or in the root `Datasets/B2_Life_Insurance_Needs_Finder/data/`:

1. `products.json` or `products.csv` (14 Saffron Life Insurance products)
2. `premium_rates.csv` (39,588 synthetic premium rate rows)
3. `riders.csv` (5 optional protective riders)
4. `ulip_funds.csv` (4 unit-linked investment funds)
5. `ulip_mortality_charges.csv` (328 gender- and age-specific mortality charge rates)
6. `customer_profiles.json` or `customer_profiles.csv` (200 retail banking synthetic customer profiles)
7. `customer_goals.csv` (371 milestone financial protection goals)
8. `reference_assumptions.json` (Actuarial living inflation, education inflation, and return defaults)
9. `advisors.csv` (15 certified financial advisory profiles)
10. `advisor_slots.csv` (2,201 available 30-minute consultation slots)

## Verification

Once placed, run the backend readiness verification:

```bash
cd backend
python -c "from app.data_loader import get_dataset_manager; mgr = get_dataset_manager(); print(mgr.get_diagnostics())"
```

Or call the API health endpoint:
```
GET http://127.0.0.1:8000/api/datasets/status
```
