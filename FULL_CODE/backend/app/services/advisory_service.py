import re
from datetime import datetime
from typing import List, Dict, Any, Optional
from app.schemas import ChatMessageResponse, AdvisorItem, AvailableSlot
from app.data_loader import data_loader

# Current simulation baseline timestamp (IST): October 29, 2026
CURRENT_SIMULATION_TIME = datetime(2026, 10, 29, 20, 41, 58)

KNOWLEDGE_BASE = [
    {
        "keywords": ["term", "term life", "pure term", "kesaro", "pure protection", "level term"],
        "reply": (
            "**Term Life Insurance** provides pure financial protection for a fixed duration (typically 5 to 40 years). "
            "If the insured passes away during the policy term, the full sum assured (death benefit) is paid to nominated beneficiaries.\n\n"
            "**Saffron Life Term Plans in LifeWise:**\n"
            "• **Saffron Kesaro Term (`PRD-X4CBUF`):** Flagship pure protection offering maximum sum assured per rupee, level term up to 40 years.\n"
            "• **Saffron Kesaro Loan Cover (`PRD-24CQIR`):** Decreasing cover specifically structured to mirror an amortising home loan balance.\n"
            "• **Saffron Kesaro Rising Cover (`PRD-KPBXLP`):** Increasing cover designed to combat lifestyle inflation over your career.\n"
            "• **Saffron Kesaro Return (`PRD-VDIJSF`):** 100% Return of Premium (TROP) upon survival.\n"
            "• **Saffron Kesaro Mini (`PRD-02YUOF`):** Small cover level term for first-time buyers with simplified underwriting.\n\n"
            "**Key Trade-off:** Pure risk cover has no maturity payout unless you choose a Return-of-Premium variant."
        ),
        "followups": [
            "What happens if I outlive my term policy?",
            "What are the best riders to add to Kesaro Term?",
            "How does Kesaro Loan Cover protect my home mortgage?"
        ]
    },
    {
        "keywords": ["ulip", "unit linked", "varnex", "market", "wealth", "investment plan"],
        "reply": (
            "A **Unit-Linked Insurance Plan (ULIP)** combines life insurance with market-linked investments in equity, debt, or hybrid funds. "
            "Part of your premium pays for mortality risk, while the remainder is invested into professionally managed units.\n\n"
            "**Saffron Life ULIP Plans in LifeWise:**\n"
            "• **Saffron Varnex Wealth (`PRD-UPERQ6`):** Regular pay wealth accumulation with fund switching flexibility.\n"
            "• **Saffron Varnex Wealth Limited Pay (`PRD-OTOY8G`):** Limited pay (5, 7, 10 years) for accelerated wealth building.\n"
            "• **Saffron Varnex Single Premium (`PRD-2WDWU3`):** One-time lump sum market deployment.\n\n"
            "**Available Funds:** Equity (80-100% equity), Balanced (40-60% equity), Bond Fund, and Money Market Fund.\n"
            "**Mandatory Rules:** 5-year lock-in period. Investment risk in investment portfolio is borne by the policyholder."
        ),
        "followups": [
            "What are the charges in a ULIP?",
            "Can I switch funds tax-free inside Saffron Varnex?",
            "What is the difference between Term + Mutual Funds vs ULIP?"
        ]
    },
    {
        "keywords": ["endowment", "sanvela", "nanhika", "guaranteed savings", "child plan", "money back"],
        "reply": (
            "An **Endowment Plan** pairs life cover with guaranteed capital preservation or bonus-based savings, paying out either on death or upon policy maturity.\n\n"
            "**Saffron Life Endowment Plans in LifeWise:**\n"
            "• **Saffron Nanhika Child Plan (`PRD-7HLWPZ`):** Dedicated child education plan with built-in premium waiver on parental death.\n"
            "• **Saffron Sanvela Guaranteed (`PRD-SD9E19`):** Non-participating guaranteed endowment unaffected by market swings.\n"
            "• **Saffron Sanvela Money Back (`PRD-QZM4KL`):** Periodic liquidity survival payouts throughout the policy term.\n"
            "• **Saffron Sanvela Par (`PRD-HJG1P7`):** Traditional participating endowment accruing annual reversionary bonuses."
        ),
        "followups": [
            "Why is term insurance cheaper than endowment plans?",
            "How does Saffron Nanhika protect my child's college fund?",
            "How do money-back survival benefits work?"
        ]
    },
    {
        "keywords": ["whole life", "amarvel", "permanent", "lifelong", "estate", "legacy"],
        "reply": (
            "**Whole Life Insurance** provides permanent lifelong death benefit protection up to age 99 or 100, combined with cash value accrual.\n\n"
            "**Saffron Life Whole Life Plans in LifeWise:**\n"
            "• **Saffron Amarvel Guaranteed (`PRD-BWKM04`):** Guaranteed non-par whole life cover up to age 99 with limited pay (10, 15 years, or single).\n"
            "• **Saffron Amarvel Par (`PRD-4V0ZZ7`):** Participating whole life up to age 100 with annual bonus accruals.\n\n"
            "**Ideal For:** Estate planning, multi-generational wealth preservation, and supporting lifelong dependent family members."
        ),
        "followups": [
            "When should I choose Whole Life over Term Life?",
            "Can I take a loan against Saffron Amarvel cash value?",
            "How does whole life help with generational wealth transfer?"
        ]
    },
    {
        "keywords": ["rider", "riders", "critical illness", "accidental death", "waiver of premium", "terminal illness"],
        "reply": (
            "**Saffron Life Optional Riders in LifeWise:**\n\n"
            "1. **Accidental Death Benefit (`RDR-LUR23D`):** Extra death benefit payout if death is caused by an accident.\n"
            "2. **Accidental Total & Permanent Disability (`RDR-I0Q2E6`):** Lump sum payout if accident causes permanent disability.\n"
            "3. **Critical Illness Rider (`RDR-GRH8AS`):** Lump sum payout upon diagnosis of 20 listed severe illnesses (e.g. cancer, stroke, heart attack).\n"
            "4. **Waiver of Premium (`RDR-XBHTE9`):** All future premiums waived upon disability or critical illness while policy remains active.\n"
            "5. **Terminal Illness Benefit (`RDR-ZG7SVA`):** Built-in free benefit paying up to ₹2 Crore early if life expectancy is under 6 months.\n\n"
            "**Statutory Limits:** Health riders capped at 100% of base annual premium; all other riders together capped at 30%."
        ),
        "followups": [
            "What is the 30% rider premium cap?",
            "How does the Waiver of Premium rider work?",
            "Is Terminal Illness benefit free on Saffron Kesaro?"
        ]
    },
    {
        "keywords": ["formula", "calculation", "how do you calculate", "methodology", "needs based", "hlv", "human life value"],
        "reply": (
            "LifeWise uses an actuarially grounded **Needs-Based Approach**:\n\n"
            "**Net Additional Cover = max(0,**\n"
            "  + PV of Future Family Support Needs (Income Replacement via Fisher Real Rate)\n"
            "  + Eligible Outstanding Liabilities (Home loans, personal loans, vehicle loans)\n"
            "  + Future Protection Goals PV (inflated at 8% for education, 5.5% for others)\n"
            "  + Emergency Reserve (6 months expenses) + Final Expenses (₹1.5 Lakh)\n"
            "  - Eligible Liquid Assets (Savings, FDs, mutual funds; excluding retirement funds)\n"
            "  - Existing Individual Life Cover\n"
            "**)** rounded to nearest ₹5 Lakh.\n\n"
            "We also calculate **Human Life Value (HLV)** as a comparison benchmark, capitalising future earnings net of personal consumption."
        ),
        "followups": [
            "Why are retirement savings excluded from available assets?",
            "What is the Fisher real discount rate formula?",
            "How does Human Life Value differ from Net Needs?"
        ]
    },
    {
        "keywords": ["inflation", "discount rate", "fisher", "assumptions"],
        "reply": (
            "**Inflation and Discount Assumptions in LifeWise:**\n\n"
            "• **General Inflation:** 5.5% per annum for ordinary living expenses.\n"
            "• **Education Inflation:** 8.0% per annum (higher historical rate for college and school expenses).\n"
            "• **Discount Rate:** 7.0% per annum (post-tax conservative return on payout invested safely).\n"
            "• **Fisher Real Rate:** `(Discount Rate - Inflation) / (1 + Inflation)`. At 7% discount and 5.5% inflation, the real rate is ~1.42%.\n\n"
            "All assumptions are fully configurable in the assessment and what-if simulator."
        ),
        "followups": [
            "Can I change the inflation rate in the simulator?",
            "Why is education inflation assumed higher than general inflation?",
            "What is the effect of higher discount rate on cover needed?"
        ]
    }
]

FALLBACK_REPLY = (
    "Welcome to LifeWise digital advisory. I can answer questions regarding life insurance categories "
    "(Term, Whole Life, Endowment, ULIPs), Saffron Life product features, calculation formulas, "
    "riders, and synthetic premium rates.\n\n"
    "For personalized guidance, you can also book a consultation with one of our certified advisors "
    "using the 'Book Advisor' feature."
)

DEFAULT_FOLLOWUPS = [
    "What is the difference between Saffron Kesaro Term and ULIP?",
    "How does LifeWise calculate my family's coverage need?",
    "What riders are available on Saffron Life products?",
    "How does Saffron Kesaro Loan Cover protect my home mortgage?"
]


class AdvisoryService:
    """
    Educational Advisory Service providing verified insurance intelligence,
    synthetic advisor directory search, and consultation booking.
    """
    _booked_slot_ids: set = set()

    @classmethod
    def answer_chat_query(cls, user_message: str) -> ChatMessageResponse:
        cleaned = user_message.lower().strip()
        best_match = None
        max_matches = 0

        for entry in KNOWLEDGE_BASE:
            matches = sum(1 for kw in entry["keywords"] if re.search(r'\b' + re.escape(kw) + r'\b', cleaned))
            if matches > max_matches:
                max_matches = matches
                best_match = entry

        if best_match and max_matches > 0:
            return ChatMessageResponse(
                reply=best_match["reply"],
                suggested_followups=best_match["followups"]
            )

        return ChatMessageResponse(
            reply=FALLBACK_REPLY,
            suggested_followups=DEFAULT_FOLLOWUPS
        )

    @classmethod
    def get_advisors(
        cls,
        language: Optional[str] = None,
        specialisation: Optional[str] = None,
        consultation_mode: Optional[str] = None,
        search_query: Optional[str] = None,
    ) -> List[AdvisorItem]:
        """
        Returns all 15 synthetic advisors from advisors.csv with optional filtering.
        """
        items: List[AdvisorItem] = []
        for adv in data_loader.advisors_list:
            # Language filter
            if language and language.lower() not in [l.lower() for l in adv.get("languages_list", [])]:
                continue
            # Specialisation filter
            if specialisation and specialisation.lower() not in [s.lower() for s in adv.get("specialisations_list", [])]:
                continue
            # Mode filter
            if consultation_mode and consultation_mode.lower() not in [m.lower() for m in adv.get("consultation_modes_list", [])]:
                continue
            # Search query filter
            if search_query:
                q = search_query.lower()
                name = adv.get("advisor_name", "").lower()
                specs = " ".join(adv.get("specialisations_list", [])).lower()
                langs = " ".join(adv.get("languages_list", [])).lower()
                if q not in name and q not in specs and q not in langs:
                    continue

            items.append(
                AdvisorItem(
                    id=adv["advisor_id"],
                    name=adv["advisor_name"],
                    title=adv["title"],
                    credentials=f"CFP®, ChFC®, {adv['experience_years']} yrs exp",
                    experience_years=adv["experience_years"],
                    specialties=adv["specialisations_list"],
                    avatar_url=adv.get("avatar_url"),
                    bio=adv.get("bio", ""),
                    rating=adv["rating"],
                    reviews_count=adv["reviews_count"],
                )
            )
        return items

    @classmethod
    def get_available_slots(cls, advisor_id: str) -> List[AvailableSlot]:
        """
        Retrieves slots for an advisor from advisor_slots.csv.
        Compares slot timestamp against CURRENT_SIMULATION_TIME (2026-10-29T20:41:58).
        Only slots starting in the future that are marked available and not booked locally are returned.
        """
        raw_slots = data_loader.slots_by_advisor.get(advisor_id, [])
        results: List[AvailableSlot] = []

        for s in raw_slots:
            slot_id = s["slot_id"]
            start_str = s["slot_start"]
            end_str = s["slot_end"]

            # Parse slot datetime
            try:
                start_dt = datetime.fromisoformat(start_str)
                end_dt = datetime.fromisoformat(end_str)
            except Exception:
                continue

            # Compare with current date: slots strictly before October 29, 2026 20:41 are past
            is_past = start_dt < CURRENT_SIMULATION_TIME
            is_already_booked = (s.get("status") == "booked") or (slot_id in cls._booked_slot_ids)
            is_available = (not is_past) and (not is_already_booked)

            # Format human-readable date & time
            date_str = start_dt.strftime("%A, %b %d, %Y")
            time_str = f"{start_dt.strftime('%I:%M %p')} - {end_dt.strftime('%I:%M %p')} IST"

            results.append(
                AvailableSlot(
                    slot_id=slot_id,
                    advisor_id=advisor_id,
                    date_str=date_str,
                    time_str=time_str,
                    is_available=is_available,
                )
            )

        return results

    @classmethod
    def mark_slot_booked(cls, slot_id: str) -> bool:
        """Reserve slot in memory to prevent duplicate bookings."""
        if slot_id in cls._booked_slot_ids:
            return False
        cls._booked_slot_ids.add(slot_id)
        return True
