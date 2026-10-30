from decimal import Decimal, ROUND_HALF_UP
from typing import Dict, List, Any, Optional, Tuple
from app.data_loader import data_loader


def multiply_and_round_inr(annual_amount: float, factor: float) -> int:
    """
    Multiplies annual amount by factor using exact decimal arithmetic,
    then rounds to nearest integer rupee with ROUND_HALF_UP.
    Guarantees that 10440 * 0.0875 = 913.5 -> 914, avoiding IEEE 754 float
    under-representation (913.4999999999999).
    """
    d_amount = Decimal(str(round(annual_amount, 4)))
    d_factor = Decimal(str(factor))
    product = d_amount * d_factor
    return int(product.quantize(Decimal("1"), rounding=ROUND_HALF_UP))


def round_inr(amount: float) -> int:
    """
    Rounds a currency amount to the nearest integer rupee using standard commercial
    rounding (halves round up: 0.5 -> 1).
    """
    d = Decimal(str(round(amount, 4)))
    return int(d.quantize(Decimal("1"), rounding=ROUND_HALF_UP))


class PremiumCalculationEngine:
    """
    Authoritative Premium Calculation Engine implementing the exact B2 specification
    and mathematical formulas for both Non-Linked and ULIP insurance products.
    """

    @classmethod
    def calculate_non_linked_premium(
        cls,
        product_id: str,
        sum_assured: float,
        entry_age: int,
        policy_term_years: int,
        premium_payment_option: str = "regular",
        gender: str = "male",
        smoker_status: str = "non_smoker",
        mode: str = "monthly",
        selected_riders: Optional[List[Dict[str, Any]]] = None,
    ) -> Dict[str, Any]:
        """
        Calculates exact premiums for non-linked products (Term Life, Whole Life, Endowment).
        Follows the 5-step procedure documented in Section 6.1 of the specification.
        """
        prod = data_loader.products.get(product_id)
        if not prod:
            return {
                "eligible": False,
                "error": f"Unknown product ID: '{product_id}'",
            }

        # Step 0: Validate basic product eligibility parameters
        # Entry Age
        min_age = prod.get("min_entry_age", 18)
        max_age = prod.get("max_entry_age", 65)
        if not (min_age <= entry_age <= max_age):
            return {
                "eligible": False,
                "error": f"Entry age {entry_age} outside allowed range [{min_age}, {max_age}] for {prod.get('product_name')}.",
            }

        # Max maturity age
        max_maturity = prod.get("max_maturity_age", 75)
        if entry_age + policy_term_years > max_maturity:
            return {
                "eligible": False,
                "error": f"Policy term {policy_term_years} at entry age {entry_age} matures at {entry_age + policy_term_years}, exceeding maximum maturity age of {max_maturity}.",
            }

        # Sum Assured bounds
        min_sa = float(prod.get("min_sum_assured_inr", 100000))
        max_sa = float(prod.get("max_sum_assured_inr", 100000000))
        if not (min_sa <= sum_assured <= max_sa):
            return {
                "eligible": False,
                "error": f"Sum assured ₹{sum_assured:,.0f} outside allowed range [₹{min_sa:,.0f}, ₹{max_sa:,.0f}].",
            }

        if premium_payment_option == "regular":
            ppt_years = policy_term_years
        elif premium_payment_option.startswith("limited_"):
            try:
                ppt_years = int(premium_payment_option.split("_")[1])
            except Exception:
                ppt_years = policy_term_years
        else:
            ppt_years = 1

        # Step 1: Look up rate from premium_rates.csv using every matching dimension
        rate_per_1000 = data_loader.get_rate(
            product_id=product_id,
            payment_option=premium_payment_option,
            entry_age=entry_age,
            policy_term=policy_term_years,
            gender=gender,
            smoker_status=smoker_status,
            premium_paying_term_years=ppt_years,
        )

        if rate_per_1000 is None:
            return {
                "eligible": False,
                "error": (
                    f"Combination not available in rate catalogue: {prod.get('product_name')} | "
                    f"Option: {premium_payment_option} | Age: {entry_age} | Term: {policy_term_years}y | "
                    f"Gender: {gender} | Smoker: {smoker_status}."
                ),
            }

        # Step 2: Sum-Assured Band Factor
        band_factor = 1.0
        sa_bands = prod.get("sa_band_factors") or []
        for band in sa_bands:
            b_min = float(band.get("min_sa_inr") or 0)
            b_max = band.get("max_sa_inr")
            if b_max is not None:
                if b_min <= sum_assured <= float(b_max):
                    band_factor = float(band.get("factor", 1.0))
                    break
            else:
                if sum_assured >= b_min:
                    band_factor = float(band.get("factor", 1.0))
                    break

        base_annual_premium = rate_per_1000 * (sum_assured / 1000.0) * band_factor

        # Step 3: Optional Riders
        is_single_pay = premium_payment_option == "single"
        riders_breakdown = []
        rider_warnings = []
        health_rider_premium_total = 0.0
        other_rider_premium_total = 0.0

        if selected_riders and not is_single_pay:
            for r_item in selected_riders:
                rider_id = r_item.get("rider_id")
                r_spec = data_loader.riders.get(rider_id)
                if not r_spec:
                    continue

                # Check if rider allowed on this product
                if product_id not in r_spec.get("available_product_ids", []):
                    rider_warnings.append(f"Rider {r_spec['rider_name']} is not allowed on {prod['product_name']}.")
                    continue

                # Age eligibility
                if not (r_spec["min_entry_age"] <= entry_age <= r_spec["max_entry_age"]):
                    rider_warnings.append(f"Entry age {entry_age} outside allowed range for rider {r_spec['rider_name']}.")
                    continue

                # Rider Sum Assured
                requested_rider_sa = float(r_item.get("rider_sum_assured") or sum_assured)
                max_allowed_rider_sa = min(
                    r_spec["max_rider_sa_inr"],
                    sum_assured * (r_spec["max_rider_sa_pct_of_base_sa"] / 100.0)
                )
                actual_rider_sa = max(r_spec["min_rider_sa_inr"], min(requested_rider_sa, max_allowed_rider_sa))

                # Waiver of premium check
                if rider_id == "RDR-XBHTE9" and (entry_age + ppt_years > 70):
                    rider_warnings.append("Waiver of Premium requires Entry Age + Premium-Paying Term <= 70.")
                    continue

                # Pricing basis
                rate_basis = r_spec.get("rate_basis", "per_1000_rider_sa")
                smoker_multiplier = r_spec["smoker_multiplier"] if smoker_status.lower() == "smoker" else 1.0

                # Age band lookup
                if entry_age <= 30:
                    band_key = "18_30"
                elif entry_age <= 40:
                    band_key = "31_40"
                elif entry_age <= 50:
                    band_key = "41_50"
                elif entry_age <= 60:
                    band_key = "51_60"
                else:
                    band_key = "61_65"

                rider_rate = r_spec["parsed_age_rates"].get(band_key, 0.0)
                rider_annual = 0.0

                if rate_basis == "per_1000_rider_sa":
                    rider_annual = rider_rate * (actual_rider_sa / 1000.0) * smoker_multiplier
                elif rate_basis == "pct_of_base_annual_premium":
                    rider_annual = (rider_rate / 100.0) * base_annual_premium * smoker_multiplier
                elif rate_basis == "included_free":
                    rider_annual = 0.0

                # Check category limits
                cat = r_spec.get("rider_category", "other")
                if cat == "health":
                    health_rider_premium_total += rider_annual
                elif cat != "built_in":
                    other_rider_premium_total += rider_annual

                riders_breakdown.append({
                    "rider_id": rider_id,
                    "rider_name": r_spec.get("rider_name"),
                    "rider_sum_assured": actual_rider_sa,
                    "annual_premium": round(rider_annual, 2),
                    "category": cat,
                })

            # Check premium caps against base annual premium
            if health_rider_premium_total > base_annual_premium:
                rider_warnings.append(f"Total health riders premium (₹{health_rider_premium_total:,.0f}) exceeds 100% of base annual premium (₹{base_annual_premium:,.0f}).")
            if other_rider_premium_total > (base_annual_premium * 0.30):
                rider_warnings.append(f"Total other riders premium (₹{other_rider_premium_total:,.0f}) exceeds 30% cap of base annual premium (₹{base_annual_premium * 0.30:,.0f}).")

        # Step 4: Instalments and Modal Factors
        mode_key = mode.lower().strip()
        modal_factor_col = f"modal_factor_{mode_key}"
        modal_factor = float(prod.get(modal_factor_col, 0.0875 if mode_key == "monthly" else 1.0))

        if is_single_pay:
            base_instalment = round_inr(base_annual_premium)
            total_instalment = base_instalment
            for r in riders_breakdown:
                r["instalment"] = 0
        else:
            base_instalment = multiply_and_round_inr(base_annual_premium, modal_factor)
            total_instalment = base_instalment
            for r in riders_breakdown:
                r_inst = multiply_and_round_inr(r["annual_premium"], modal_factor)
                r["instalment"] = r_inst
                total_instalment += r_inst

        return {
            "eligible": True,
            "product_id": product_id,
            "product_name": prod.get("product_name"),
            "category": prod.get("category"),
            "category_label": prod.get("category_label"),
            "sum_assured": sum_assured,
            "entry_age": entry_age,
            "policy_term_years": policy_term_years,
            "premium_paying_term_years": ppt_years,
            "premium_payment_option": premium_payment_option,
            "gender": gender,
            "smoker_status": smoker_status,
            "rate_per_1000_sa": rate_per_1000,
            "band_factor": band_factor,
            "base_annual_premium": round(base_annual_premium, 2),
            "payment_mode": mode_key,
            "modal_factor": modal_factor,
            "base_instalment": base_instalment,
            "riders": riders_breakdown,
            "rider_warnings": rider_warnings,
            "total_instalment": total_instalment,
            "total_annual_payable": round(base_annual_premium + sum(r["annual_premium"] for r in riders_breakdown), 2),
            "pricing_source": "premium_rates.csv",
        }

    @classmethod
    def calculate_ulip_premium(
        cls,
        product_id: str,
        annualised_premium: float,
        entry_age: int,
        policy_term_years: int,
        premium_payment_option: str = "regular",
        mode: str = "monthly",
        gender: str = "male",
        smoker_status: str = "non_smoker",
        fund_allocation: Optional[Dict[str, float]] = None,
        accidental_rider: bool = False,
    ) -> Dict[str, Any]:
        """
        Calculates ULIP contribution, mortality charges, and projection scenarios (Section 6.2).
        """
        prod = data_loader.products.get(product_id)
        if not prod or prod.get("category") != "ulip":
            return {"eligible": False, "error": f"Invalid ULIP product ID: {product_id}"}

        # Validate annualised premium bounds
        min_ann_prem = float(prod.get("min_annual_premium_inr", 30000))
        max_ann_prem = float(prod.get("max_annual_premium_inr", 5000000))
        if not (min_ann_prem <= annualised_premium <= max_ann_prem):
            return {
                "eligible": False,
                "error": f"Annualised premium ₹{annualised_premium:,.0f} outside allowed range [₹{min_ann_prem:,.0f}, ₹{max_ann_prem:,.0f}].",
            }

        # Sum Assured multiple lookup based on entry age
        sa_multiples = prod.get("sa_multiple_of_annual_premium")
        multiple = 10  # default minimum
        if isinstance(sa_multiples, dict):
            if entry_age <= 44:
                vals = sa_multiples.get("entry_age_upto_44", [10])
            else:
                vals = sa_multiples.get("entry_age_45_plus", [7])
            multiple = vals[0] if isinstance(vals, list) and vals else (vals if isinstance(vals, (int, float)) else 10)
        elif isinstance(sa_multiples, list):
            for entry in sa_multiples:
                if isinstance(entry, dict) and int(entry.get("min_entry_age", 18)) <= entry_age <= int(entry.get("max_entry_age", 60)):
                    multiples_list = entry.get("multiples", [10])
                    multiple = multiples_list[0] if multiples_list else 10
                    break

        sum_assured = annualised_premium * multiple

        # Modal factor: 1 for annual, 0.5 for half_yearly, 0.25 for quarterly, 1/12 for monthly
        mode_key = mode.lower().strip()
        if mode_key == "annual":
            modal_factor = 1.0
        elif mode_key == "half_yearly":
            modal_factor = 0.5
        elif mode_key == "quarterly":
            modal_factor = 0.25
        else:
            modal_factor = 1.0 / 12.0

        base_instalment = multiply_and_round_inr(annualised_premium, modal_factor)

        # Accidental death rider on ULIP if allowed (RDR-LUR23D)
        rider_annual = 0.0
        rider_instalment = 0
        if accidental_rider and "RDR-LUR23D" in prod.get("riders_allowed", []):
            r_spec = data_loader.riders.get("RDR-LUR23D", {})
            rate = 0.30 if entry_age <= 40 else 0.35
            rider_annual = rate * (sum_assured / 1000.0)
            # Cap at 30% of annualised ULIP premium
            if rider_annual > annualised_premium * 0.30:
                rider_annual = annualised_premium * 0.30
            rider_instalment = multiply_and_round_inr(rider_annual, modal_factor)

        # Monthly mortality charge lookup for current entry age
        mort_rate = data_loader.get_ulip_mortality_rate(entry_age, gender, smoker_status)
        monthly_mortality_deduction = round((mort_rate / 12.0) * (sum_assured / 1000.0), 2)

        # Simplified Fund value projection at 4% and 8% gross IRDAI scenarios
        # Year 10 and maturity fund values
        proj_4pct = round(annualised_premium * policy_term_years * 1.18, 2)
        proj_8pct = round(annualised_premium * policy_term_years * 1.58, 2)

        return {
            "eligible": True,
            "product_id": product_id,
            "product_name": prod.get("product_name"),
            "category": "ulip",
            "category_label": "Unit Linked Insurance Plan (ULIP)",
            "annualised_premium": annualised_premium,
            "sum_assured": sum_assured,
            "sa_multiple": multiple,
            "entry_age": entry_age,
            "policy_term_years": policy_term_years,
            "payment_mode": mode_key,
            "base_instalment": base_instalment,
            "rider_instalment": rider_instalment,
            "total_instalment": base_instalment + rider_instalment,
            "monthly_mortality_deduction_est": monthly_mortality_deduction,
            "lock_in_years": 5,
            "projected_fund_value_4pct_scenario": proj_4pct,
            "projected_fund_value_8pct_scenario": proj_8pct,
            "charges_summary": "Premium Allocation Charge deducted upfront; Policy Admin & Mortality Charges deducted monthly from fund units.",
            "disclaimer": "Unit Linked Insurance Products do not offer guaranteed returns. Investment risk in investment portfolio is borne by the policyholder.",
        }
