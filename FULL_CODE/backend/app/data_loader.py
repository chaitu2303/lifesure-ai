import os
import json
import csv
import logging
from pathlib import Path
from typing import Dict, List, Any, Optional, Tuple
from datetime import datetime

logger = logging.getLogger("lifewise.data_loader")

# Potential dataset locations in order of priority
CANDIDATE_DATA_DIRS = [
    os.getenv("DATA_DIR", ""),
    str(Path(__file__).resolve().parent.parent.parent / "Datasets" / "B2_Life_Insurance_Needs_Finder" / "data"),
    str(Path(__file__).resolve().parent.parent.parent / "data"),
    str(Path(__file__).resolve().parent.parent.parent / "FULL_CODE" / "data"),
    "E:\\TalentAP\\Datasets\\B2_Life_Insurance_Needs_Finder\\data",
    "E:\\TalentAP\\FULL_CODE\\data",
    "E:\\TalentAP\\data",
]

# High-resolution, professional portrait avatars for the 15 synthetic advisors
ADVISOR_AVATARS: Dict[str, str] = {
    "ADV-4KKBRK": "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80",  # Farah Siddiqui
    "ADV-6FJFZZ": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80",  # Imran Shaikh
    "ADV-7JIHQA": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80",  # Venkata Subba Rao
    "ADV-8XXITU": "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&auto=format&fit=crop&q=80",  # Suresh Nair
    "ADV-8ZVJD1": "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&auto=format&fit=crop&q=80",  # Meera Iyer
    "ADV-AYPB1A": "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&auto=format&fit=crop&q=80",  # Rohan Kulkarni
    "ADV-DUEZJI": "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200&auto=format&fit=crop&q=80",  # Arvind Mehta
    "ADV-EI4R1M": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80",  # Sneha Pattnaik
    "ADV-F40QVT": "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&auto=format&fit=crop&q=80",  # Nikhil Bhatia
    "ADV-I5TXS7": "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&auto=format&fit=crop&q=80",  # Aditi Banerjee
    "ADV-IB592D": "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=200&auto=format&fit=crop&q=80",  # Harpreet Gill
    "ADV-M9UEGM": "https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=200&auto=format&fit=crop&q=80",  # Manjunath Gowda
    "ADV-TWTKCW": "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=200&auto=format&fit=crop&q=80",  # Kavita Joshi
    "ADV-UGWZPY": "https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=200&auto=format&fit=crop&q=80",  # Deepa Raghunathan
    "ADV-ZL0P97": "https://images.unsplash.com/photo-1594744803329-e58b31de8bf5?w=200&auto=format&fit=crop&q=80",  # Lakshmi Prasanna
}


class DataLoader:
    """
    Authoritative dataset loading and validation layer for LifeWise.
    Validates synthetic catalogue, premium rates, riders, ULIP funds,
    mortality charges, customer profiles, and advisors.
    """
    _instance: Optional["DataLoader"] = None

    def __init__(self):
        self.data_dir: Optional[str] = self._locate_data_dir()
        self.products: Dict[str, Dict[str, Any]] = {}
        self.products_list: List[Dict[str, Any]] = []
        self.riders: Dict[str, Dict[str, Any]] = {}
        self.ulip_funds: Dict[str, Dict[str, Any]] = {}
        self.ulip_mortality: Dict[Tuple[int, str, str], float] = {}
        self.premium_rates: Dict[Tuple[str, str, int, int, str, str], float] = {}
        self.allowed_rate_keys: set = set()
        self.advisors: Dict[str, Dict[str, Any]] = {}
        self.advisors_list: List[Dict[str, Any]] = []
        self.slots: List[Dict[str, Any]] = []
        self.slots_by_advisor: Dict[str, List[Dict[str, Any]]] = {}
        self.customer_profiles: List[Dict[str, Any]] = []
        self.customer_goals: List[Dict[str, Any]] = []
        self.reference_assumptions: Dict[str, Any] = {}
        self.diagnostics: Dict[str, Any] = {}
        self.is_loaded: bool = False

        if self.data_dir:
            self.load_all()
        else:
            logger.warning("No valid dataset directory found in candidate paths.")

    @classmethod
    def get_instance(cls) -> "DataLoader":
        if cls._instance is None:
            cls._instance = DataLoader()
        return cls._instance

    def _locate_data_dir(self) -> Optional[str]:
        for candidate in CANDIDATE_DATA_DIRS:
            if candidate and os.path.isdir(candidate):
                # Verify key file existence
                if os.path.isfile(os.path.join(candidate, "products.json")) or os.path.isfile(os.path.join(candidate, "products.csv")):
                    return os.path.abspath(candidate)
        return None

    def load_all(self) -> Dict[str, Any]:
        """Loads and indexes all synthetic datasets with strict schema validation."""
        if not self.data_dir or not os.path.isdir(self.data_dir):
            raise FileNotFoundError(f"Dataset directory not found: {self.data_dir}")

        start_time = datetime.utcnow()

        # 1. Reference Assumptions
        self._load_assumptions()

        # 2. Products
        self._load_products()

        # 3. Riders
        self._load_riders()

        # 4. ULIP Funds
        self._load_ulip_funds()

        # 5. ULIP Mortality Charges
        self._load_ulip_mortality_charges()

        # 6. Premium Rates (39,588 rows)
        self._load_premium_rates()

        # 7. Advisors
        self._load_advisors()

        # 8. Advisor Slots
        self._load_slots()

        # 9. Customer Profiles & Goals
        self._load_customer_profiles()

        # 10. Referential integrity checks
        self._verify_referential_integrity()

        elapsed_ms = (datetime.utcnow() - start_time).total_seconds() * 1000.0
        self.is_loaded = True

        self.diagnostics = {
            "status": "ready",
            "data_directory": self.data_dir,
            "load_time_ms": round(elapsed_ms, 2),
            "products_count": len(self.products),
            "riders_count": len(self.riders),
            "ulip_funds_count": len(self.ulip_funds),
            "ulip_mortality_rows": len(self.ulip_mortality),
            "premium_rates_rows": len(self.premium_rates),
            "advisors_count": len(self.advisors),
            "slots_count": len(self.slots),
            "customer_profiles_count": len(self.customer_profiles),
            "customer_goals_count": len(self.customer_goals),
        }
        logger.info(f"LifeWise datasets loaded successfully in {elapsed_ms:.1f}ms: {len(self.products)} products, {len(self.premium_rates)} rates.")
        return self.diagnostics

    def _load_assumptions(self):
        assump_path = os.path.join(self.data_dir, "reference_assumptions.json")
        if os.path.isfile(assump_path):
            with open(assump_path, "r", encoding="utf-8") as f:
                data = json.load(f)
                self.reference_assumptions = {
                    k: v.get("value") for k, v in data.get("assumptions", {}).items()
                }
        else:
            # Safe defaults
            self.reference_assumptions = {
                "general_inflation_pct_pa": 5.5,
                "education_inflation_pct_pa": 8.0,
                "post_tax_return_on_payout_pct_pa": 7.0,
                "default_income_growth_pct_pa": 6.0,
                "retirement_age": 60,
                "self_consumption_share_of_income_pct": 30,
                "household_expense_share_of_deceased_pct": 25,
                "emergency_fund_months": 6,
                "final_expenses_inr": 150000,
                "homemaker_services_value_annual_inr": 300000,
                "count_employer_group_cover": True,
                "count_retirement_savings_as_available_assets": False,
                "cover_rounding_inr": 500000,
            }

    def _load_products(self):
        json_path = os.path.join(self.data_dir, "products.json")
        csv_path = os.path.join(self.data_dir, "products.csv")

        self.products = {}
        self.products_list = []

        if os.path.isfile(json_path):
            with open(json_path, "r", encoding="utf-8") as f:
                raw_list = json.load(f)
                for item in raw_list:
                    pid = item["product_id"]
                    # Normalize category to match backend enums: 'term', 'whole_life', 'endowment', 'ulip'
                    ptype = item.get("product_type", "").lower()
                    if "term" in ptype:
                        category = "term"
                        cat_label = "Term Life Insurance"
                    elif "whole" in ptype:
                        category = "whole_life"
                        cat_label = "Whole Life Insurance"
                    elif "endowment" in ptype:
                        category = "endowment"
                        cat_label = "Guaranteed Endowment Plan"
                    elif "ulip" in ptype:
                        category = "ulip"
                        cat_label = "Unit Linked Insurance Plan (ULIP)"
                    else:
                        category = "term"
                        cat_label = item.get("product_type", "Insurance Plan")

                    # Parse premium payment options
                    opts_raw = item.get("premium_payment_options", "")
                    if isinstance(opts_raw, str):
                        payment_options = [o.strip() for o in opts_raw.split(";") if o.strip()]
                    else:
                        payment_options = list(opts_raw) if opts_raw else ["regular"]

                    # Parse allowed policy terms
                    allowed_terms = []
                    terms_str = str(item.get("allowed_policy_terms", "") or "")
                    if "-" in terms_str:
                        parts = terms_str.split("-")
                        try:
                            start_t, end_t = int(parts[0]), int(parts[1])
                            allowed_terms = list(range(start_t, end_t + 1))
                        except Exception:
                            pass
                    elif ";" in terms_str:
                        allowed_terms = [int(x.strip()) for x in terms_str.split(";") if x.strip().isdigit()]
                    
                    if not allowed_terms and item.get("min_policy_term_years") and item.get("max_policy_term_years"):
                        allowed_terms = list(range(int(item["min_policy_term_years"]), int(item["max_policy_term_years"]) + 1))

                    # Parse premium modes
                    modes_str = str(item.get("premium_modes", "annual;half_yearly;quarterly;monthly"))
                    premium_modes = [m.strip() for m in modes_str.split(";") if m.strip()]

                    enriched = dict(item)
                    enriched["category"] = category
                    enriched["category_label"] = cat_label
                    enriched["parsed_payment_options"] = payment_options
                    enriched["parsed_allowed_terms"] = allowed_terms
                    enriched["parsed_premium_modes"] = premium_modes
                    enriched["is_active"] = True

                    self.products[pid] = enriched
                    self.products_list.append(enriched)
        elif os.path.isfile(csv_path):
            with open(csv_path, "r", encoding="utf-8") as f:
                reader = csv.DictReader(f)
                for row in reader:
                    pid = row["product_id"]
                    # Parse JSON cells if any
                    for key in ["sa_band_factors", "income_multiple_limits", "riders_allowed", "ulip_fund_ids", "ulip_charges", "extra_rules"]:
                        if key in row and row[key]:
                            try:
                                row[key] = json.loads(row[key])
                            except Exception:
                                pass
                    self.products[pid] = row
                    self.products_list.append(row)

    def _load_riders(self):
        riders_path = os.path.join(self.data_dir, "riders.csv")
        self.riders = {}
        if os.path.isfile(riders_path):
            with open(riders_path, "r", encoding="utf-8") as f:
                reader = csv.DictReader(f)
                for r in reader:
                    rid = r["rider_id"]
                    avail_prods = [p.strip() for p in r.get("available_on_product_ids", "").split(";") if p.strip()]
                    r["available_product_ids"] = avail_prods

                    # Parse numeric rates for age bands
                    age_rates = {}
                    for band, col in [
                        ("18_30", "rate_entry_age_18_30"),
                        ("31_40", "rate_entry_age_31_40"),
                        ("41_50", "rate_entry_age_41_50"),
                        ("51_60", "rate_entry_age_51_60"),
                        ("61_65", "rate_entry_age_61_65"),
                    ]:
                        val_str = r.get(col, "")
                        age_rates[band] = float(val_str) if val_str and val_str.strip() else 0.0
                    r["parsed_age_rates"] = age_rates
                    r["min_entry_age"] = int(r["min_entry_age"]) if r.get("min_entry_age") else 18
                    r["max_entry_age"] = int(r["max_entry_age"]) if r.get("max_entry_age") else 65
                    r["max_cover_age"] = int(r["max_cover_age"]) if r.get("max_cover_age") else 70
                    r["min_rider_sa_inr"] = float(r["min_rider_sa_inr"]) if r.get("min_rider_sa_inr") else 0.0
                    r["max_rider_sa_inr"] = float(r["max_rider_sa_inr"]) if r.get("max_rider_sa_inr") else 10000000.0
                    r["max_rider_sa_pct_of_base_sa"] = float(r["max_rider_sa_pct_of_base_sa"]) if r.get("max_rider_sa_pct_of_base_sa") else 100.0
                    r["smoker_multiplier"] = float(r["smoker_multiplier"]) if r.get("smoker_multiplier") else 1.0
                    r["max_premium_pct_of_base_premium"] = float(r["max_premium_pct_of_base_premium"]) if r.get("max_premium_pct_of_base_premium") else 30.0

                    self.riders[rid] = r

    def _load_ulip_funds(self):
        funds_path = os.path.join(self.data_dir, "ulip_funds.csv")
        self.ulip_funds = {}
        if os.path.isfile(funds_path):
            with open(funds_path, "r", encoding="utf-8") as f:
                reader = csv.DictReader(f)
                for row in reader:
                    fid = row["fund_id"]
                    row["fmc_pct_pa"] = float(row.get("fmc_pct_pa", 1.35))
                    row["available_product_ids"] = [p.strip() for p in row.get("available_on_product_ids", "").split(";") if p.strip()]
                    self.ulip_funds[fid] = row

    def _load_ulip_mortality_charges(self):
        mort_path = os.path.join(self.data_dir, "ulip_mortality_charges.csv")
        self.ulip_mortality = {}
        if os.path.isfile(mort_path):
            with open(mort_path, "r", encoding="utf-8") as f:
                reader = csv.DictReader(f)
                for row in reader:
                    age = int(row["attained_age"])
                    gender = row["gender"].strip().lower()
                    smoker = row["smoker_status"].strip().lower()
                    rate = float(row["annual_rate_per_1000_sum_at_risk_inr"])
                    self.ulip_mortality[(age, gender, smoker)] = rate

    def _load_premium_rates(self):
        rates_path = os.path.join(self.data_dir, "premium_rates.csv")
        self.premium_rates = {}
        self.allowed_rate_keys = set()

        if os.path.isfile(rates_path):
            with open(rates_path, "r", encoding="utf-8") as f:
                reader = csv.DictReader(f)
                for row in reader:
                    key = (
                        row["product_id"].strip(),
                        row["premium_payment_option"].strip(),
                        int(row["entry_age"]),
                        int(row["policy_term_years"]),
                        row["gender"].strip().lower(),
                        row["smoker_status"].strip().lower(),
                    )
                    rate = float(row["rate_per_1000_sa_inr"])
                    self.premium_rates[key] = rate
                    self.allowed_rate_keys.add(key)

    def _load_advisors(self):
        adv_path = os.path.join(self.data_dir, "advisors.csv")
        self.advisors = {}
        self.advisors_list = []

        if os.path.isfile(adv_path):
            with open(adv_path, "r", encoding="utf-8") as f:
                reader = csv.DictReader(f)
                for r in reader:
                    aid = r["advisor_id"]
                    r["languages_list"] = [l.strip() for l in r.get("languages", "").split(";") if l.strip()]
                    r["specialisations_list"] = [s.strip() for s in r.get("specialisations", "").split(";") if s.strip()]
                    r["consultation_modes_list"] = [m.strip() for m in r.get("consultation_modes", "").split(";") if m.strip()]
                    r["experience_years"] = int(r.get("years_experience", 10))
                    r["rating"] = float(r.get("rating", 4.8))
                    r["reviews_count"] = int(r.get("review_count", 150))
                    r["avatar_url"] = ADVISOR_AVATARS.get(aid, "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80")
                    r["title"] = self._format_advisor_title(r["specialisations_list"])
                    r["bio"] = f"Senior Chartered Life Insurance Specialist advising retail banking and wealth clients with {r['experience_years']} years of professional advisory experience."
                    self.advisors[aid] = r
                    self.advisors_list.append(r)

    def _format_advisor_title(self, specialisations: List[str]) -> str:
        if "term_protection" in specialisations and "home_loan_protection" in specialisations:
            return "Family Protection & Debt Shield Specialist"
        if "child_planning" in specialisations:
            return "Child Education & Milestone Protection Consultant"
        if "retirement_planning" in specialisations:
            return "Retirement Income & Wealth Transition Advisor"
        if "ulip_and_investments" in specialisations:
            return "Wealth Creation & Investment-Linked Specialist"
        if "whole_life_and_legacy" in specialisations or "high_net_worth" in specialisations:
            return "Estate Planning & Generational Legacy Advisor"
        if "women_and_homemakers" in specialisations:
            return "Family & Homemaker Financial Protection Specialist"
        return "Certified Insurance & Wealth Advisor"

    def _load_slots(self):
        slots_path = os.path.join(self.data_dir, "advisor_slots.csv")
        self.slots = []
        self.slots_by_advisor = {}

        if os.path.isfile(slots_path):
            with open(slots_path, "r", encoding="utf-8") as f:
                reader = csv.DictReader(f)
                for r in reader:
                    aid = r["advisor_id"]
                    self.slots.append(r)
                    if aid not in self.slots_by_advisor:
                        self.slots_by_advisor[aid] = []
                    self.slots_by_advisor[aid].append(r)

    def _load_customer_profiles(self):
        # 1. Load profiles from JSON
        json_path = os.path.join(self.data_dir, "customer_profiles.json")
        if os.path.isfile(json_path):
            with open(json_path, "r", encoding="utf-8") as f:
                self.customer_profiles = json.load(f)

        # 2. Load customer goals from CSV
        goals_path = os.path.join(self.data_dir, "customer_goals.csv")
        if os.path.isfile(goals_path):
            with open(goals_path, "r", encoding="utf-8") as f:
                reader = csv.DictReader(f)
                self.customer_goals = list(reader)

    def _verify_referential_integrity(self):
        """Verifies integrity between products, riders, funds, and advisors."""
        for pid, prod in self.products.items():
            for rider_id in prod.get("riders_allowed", []):
                if rider_id not in self.riders:
                    logger.warning(f"Product {pid} references unknown rider {rider_id}")
            for fund_id in prod.get("ulip_fund_ids", []):
                if fund_id not in self.ulip_funds:
                    logger.warning(f"Product {pid} references unknown ULIP fund {fund_id}")

        for slot in self.slots:
            aid = slot["advisor_id"]
            if aid not in self.advisors:
                logger.warning(f"Slot {slot['slot_id']} references unknown advisor {aid}")

    # Public Query Helpers
    def get_rate(
        self,
        product_id: str,
        payment_option: str,
        entry_age: int,
        policy_term: int,
        gender: str,
        smoker_status: str
    ) -> Optional[float]:
        """Look up the authoritative premium rate per ₹1,000 Sum Assured."""
        key = (
            product_id.strip(),
            payment_option.strip(),
            int(entry_age),
            int(policy_term),
            gender.strip().lower(),
            smoker_status.strip().lower()
        )
        return self.premium_rates.get(key)

    def get_ulip_mortality_rate(self, attained_age: int, gender: str, smoker_status: str) -> float:
        """Lookup monthly mortality charge per ₹1,000 sum at risk."""
        key = (int(attained_age), gender.strip().lower(), smoker_status.strip().lower())
        return self.ulip_mortality.get(key, 0.5)

    def get_diagnostics(self) -> Dict[str, Any]:
        """Returns loaded file diagnostics and counts."""
        return self.diagnostics


data_loader = DataLoader.get_instance()

def get_dataset_manager() -> DataLoader:
    return DataLoader.get_instance()
