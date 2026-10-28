import re
from typing import List, Dict, Any, Optional
from app.schemas import ChatMessageResponse, AdvisorItem, AvailableSlot

DEMO_ADVISORS = [
    AdvisorItem(
        id="adv-sarah-chen",
        name="Sarah Chen, CFP®",
        title="Senior Life & Family Protection Specialist",
        credentials="CFP®, ChFC®, 14 yrs exp",
        experience_years=14,
        specialties=["Income Replacement", "Young Families", "Mortgage Protection", "Term Optimization"],
        avatar_url="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
        bio="Specializes in transparent, fee-only protection planning for families, focusing on maximum protection per dollar and estate transitions.",
        rating=4.95,
        reviews_count=218
    ),
    AdvisorItem(
        id="adv-marcus-vance",
        name="Marcus Vance, ChFC®",
        title="Wealth & Estate Preservation Advisor",
        credentials="ChFC®, CLU®, 18 yrs exp",
        experience_years=18,
        specialties=["Estate Planning", "Whole Life & Trusts", "High Net Worth", "Business Succession"],
        avatar_url="https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80",
        bio="Advises multi-generational families and business owners on liquid wealth preservation, buy-sell agreements, and permanent life structures.",
        rating=4.92,
        reviews_count=184
    ),
    AdvisorItem(
        id="adv-ananya-patel",
        name="Ananya Patel, CFP®",
        title="Child Education & Goal Protection Consultant",
        credentials="CFP®, MBA (Finance), 11 yrs exp",
        experience_years=11,
        specialties=["Child Education Funds", "ULIP vs Term Analysis", "Retirement Transition", "Tax Efficiency"],
        avatar_url="https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80",
        bio="Passionately helps parents secure milestone educational goals, untangling complex insurance-cum-investment plans with pure mathematical rigor.",
        rating=4.97,
        reviews_count=165
    )
]

KNOWLEDGE_BASE = [
    {
        "keywords": ["term", "term life", "pure term", "pure protection"],
        "reply": (
            "**Term Life Insurance** provides pure financial protection for a fixed duration (typically 10 to 40 years). "
            "If the insured passes away during the policy term, the full sum assured (death benefit) is paid out to nominated beneficiaries. "
            "\n\n**Key Advantages:**\n"
            "• Highest coverage per dollar: Costs a fraction of endowment or whole life plans.\n"
            "• Ideal for income replacement and debt clearance during peak earning and dependent years.\n"
            "\n**Important Trade-off:**\n"
            "• There is no maturity payout or cash accumulation if you survive the policy term."
        ),
        "followups": [
            "What happens if I outlive my term policy?",
            "What are the best riders to add to term insurance?",
            "How much term cover should I buy?"
        ]
    },
    {
        "keywords": ["ulip", "unit linked", "market", "wealth", "investment plan"],
        "reply": (
            "A **Unit-Linked Insurance Plan (ULIP)** is a hybrid financial product that combines life cover with market-linked investments (equity, debt, or hybrid funds). "
            "A portion of your premium pays for mortality risk, while the remainder is invested in market fund units.\n\n"
            "**Key Considerations:**\n"
            "• Potential for higher capital growth compared to traditional endowment plans.\n"
            "• Fund switching flexibility between equity and debt.\n"
            "• **Risk Disclosure:** Returns are market-driven and NOT guaranteed. They carry fund management charges and a mandatory 5-year lock-in."
        ),
        "followups": [
            "Should I buy Term + Mutual Funds or a ULIP?",
            "What are the charges in a ULIP?",
            "What is the lock-in period for ULIPs?"
        ]
    },
    {
        "keywords": ["endowment", "guaranteed savings", "traditional", "money back"],
        "reply": (
            "An **Endowment Policy** is a traditional life insurance plan that pairs life cover with guaranteed or bonus-based savings. "
            "It pays a lump sum either upon death during the term or upon policy maturity.\n\n"
            "**Key Considerations:**\n"
            "• Guaranteed capital preservation appealing to very conservative savers.\n"
            "• High premium cost per unit of coverage: To get $1,000,000 of cover, endowment premiums can be 8x-12x higher than term insurance.\n"
            "• Modest historical returns (typically 4.5% - 6% IRR), which may lag behind inflation."
        ),
        "followups": [
            "Why is term insurance cheaper than endowment?",
            "Can I surrender my endowment policy early?",
            "How does bonus accrual work in endowment plans?"
        ]
    },
    {
        "keywords": ["whole life", "permanent", "lifelong", "estate"],
        "reply": (
            "**Whole Life Insurance** offers permanent death benefit protection up to age 99 or 100, combined with a cash value savings component that grows over time.\n\n"
            "**Primary Use Cases:**\n"
            "• Estate planning and legacy transfer to heirs.\n"
            "• Supporting dependents with lifelong special needs.\n"
            "• Guaranteed death benefit payout regardless of when death occurs (as long as premiums are maintained)."
        ),
        "followups": [
            "Term life vs Whole life: which do I need?",
            "Can I borrow against whole life cash value?",
            "When does whole life insurance make sense?"
        ]
    },
    {
        "keywords": ["inflation", "real return", "future cost"],
        "reply": (
            "**Inflation directly erodes purchasing power over time.** For instance, at 6% annual inflation, household living expenses "
            "double roughly every 12 years. Similarly, a university education costing $50,000 today could cost over $120,000 in 15 years.\n\n"
            "LifeSure AI incorporates the **Fisher real discount rate** in calculation, ensuring that future living expenses and college goals "
            "are properly inflation-adjusted so your family is never left underfunded."
        ),
        "followups": [
            "What inflation rate does LifeSure use?",
            "How does LifeSure calculate income replacement?",
            "What is the Fisher real discount rate formula?"
        ]
    },
    {
        "keywords": ["rider", "riders", "critical illness", "accidental", "waiver of premium"],
        "reply": (
            "**Insurance Riders** are optional add-on benefits attached to your base policy for comprehensive protection:\n\n"
            "1. **Critical Illness Rider:** Pays an accelerated or additional lump sum upon diagnosis of specified illnesses (e.g., cancer, stroke, heart attack).\n"
            "2. **Accidental Disability Rider:** Provides financial relief if permanent disability hampers your earning ability.\n"
            "3. **Waiver of Premium:** Waives future premium obligations if you suffer total disability or critical illness, keeping coverage in force."
        ),
        "followups": [
            "Is critical illness rider worth it?",
            "Does waiver of premium increase policy cost significantly?",
            "Can I add riders later after buying a policy?"
        ]
    },
    {
        "keywords": ["formula", "calculation", "how do you calculate", "methodology", "needs based"],
        "reply": (
            "LifeSure AI uses the internationally recognized **Capital Needs Analysis** methodology:\n\n"
            "**Net Recommended Cover = max(0,**\n"
            "  + Income Replacement Reserve (Present Value of family living expenses)\n"
            "  + Outstanding Liabilities (Home loans, auto loans, personal debt)\n"
            "  + Future Goals PV (Children's higher education & milestones)\n"
            "  + Additional Family Reserve (6-12 months emergency transition buffer)\n"
            "  - Eligible Liquid Assets (Savings, stocks, liquid mutual funds)\n"
            "  - Existing Life Insurance Death Benefit\n"
            "**)**\n\n"
            "This ensures you never overpay for unnecessary cover or remain dangerously exposed to underinsurance."
        ),
        "followups": [
            "Why do you exclude primary residence from liquid assets?",
            "How do you calculate present value of income replacement?",
            "What is Human Life Value (HLV)?"
        ]
    },
    {
        "keywords": ["smoker", "medical", "underwriting", "health"],
        "reply": (
            "**Underwriting** is how insurance carriers assess actuarial risk:\n"
            "• **Tobacco / Nicotine Use:** Tobacco users typically pay 40% to 70% higher premiums due to elevated cardiovascular and oncological risks.\n"
            "• **Medical Examination:** Routine tele-medical or physical health checkups (blood test, ECG, lipid profile) verify current health status.\n"
            "• **Disclosure Rule:** Complete, honest disclosure of medical history and habits is vital. Non-disclosure can lead to claim repudiation during settlement."
        ),
        "followups": [
            "What happens if I start smoking after buying a policy?",
            "Can I get life insurance without a medical test?",
            "What causes insurance claim rejections?"
        ]
    }
]

FALLBACK_REPLY = (
    "Thank you for your question. As an educational advisory AI, I can provide clear guidance on "
    "life insurance categories (Term, Whole Life, Endowment, ULIPs), financial calculation methodology, "
    "inflation adjustments, and policy riders.\n\n"
    "To discuss your specific underwriting history or customized multi-generation estate plan, "
    "you can book a complimentary consultation with one of our licensed Certified Financial Planners."
)

DEFAULT_FOLLOWUPS = [
    "What is the difference between Term and ULIP?",
    "How does inflation impact my life insurance need?",
    "What formula does LifeSure use to calculate coverage?",
    "Which riders should I consider for complete protection?"
]


class AdvisoryService:
    """
    Educational Advisory Service providing verified insurance intelligence and advisor booking.
    """

    @classmethod
    def answer_chat_query(cls, user_message: str) -> ChatMessageResponse:
        cleaned = user_message.lower().strip()

        # Keyword matching against approved knowledge base
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
    def get_advisors(cls) -> List[AdvisorItem]:
        return DEMO_ADVISORS

    @classmethod
    def get_available_slots(cls, advisor_id: str) -> List[AvailableSlot]:
        # Generates realistic demo slots for today & next 2 business days
        slots = []
        days = ["Tomorrow", "In 2 Days", "In 3 Days"]
        times = ["09:30 AM - 10:15 AM", "11:00 AM - 11:45 AM", "02:30 PM - 03:15 PM", "04:00 PM - 04:45 PM", "05:30 PM - 06:15 PM"]

        for d_idx, day_str in enumerate(days):
            for t_idx, time_str in enumerate(times):
                slot_id = f"{advisor_id}-d{d_idx}-t{t_idx}"
                # Mark a couple slots booked for realism
                is_avail = not (d_idx == 0 and t_idx == 1)
                slots.append(
                    AvailableSlot(
                        slot_id=slot_id,
                        advisor_id=advisor_id,
                        date_str=day_str,
                        time_str=time_str,
                        is_available=is_avail
                    )
                )
        return slots
