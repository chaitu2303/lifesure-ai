# Life insurance glossary (plain language)

This glossary explains the words used in this data pack. Facts marked **[IRDAI]** are real Indian regulatory rules, quoted from the documents listed under *Sources* at the end (current as of October 2026). Everything about **Saffron Life** (products, rates, underwriting rules) is fictional. The products are not IRDAI-approved and nothing here is financial advice.

## People and roles

- **Policyholder (proposer):** the person who buys and owns the policy and pays the premium.
- **Life assured (insured):** the person whose life is covered. Usually the same as the policyholder.
- **Nominee:** the person(s) who receive the money if the life assured dies. **[IRDAI]** Nomination is mandatory, a policyholder may nominate one or more persons and set each person's share, and the nomination can be changed at any time during the policy term (Master Circular on Protection of Policyholders' Interests, 2024, Part A).
- **IRDAI:** Insurance Regulatory and Development Authority of India, the regulator of insurance companies in India.
- **Advisor:** in this pack, a fictional Saffron Life specialist the customer can book for a video, chat or phone consultation.

## Money words

- **Sum assured (SA), or cover:** the amount the policy promises to pay, for example ₹1 crore on death.
- **Premium:** what the policyholder pays for the policy.
- **Policy term:** how long the policy (and the cover) lasts, for example 30 years.
- **Premium paying term (PPT):** how long premiums are paid. It can equal the policy term (**regular pay**), be shorter (**limited pay**, e.g. pay for 10 years for 30 years of cover) or be a single payment (**single pay**).
- **Premium mode:** how often premiums are paid (annual, half-yearly, quarterly, monthly). In this pack each Saffron product has *modal factors* that convert the annual premium into an instalment. Paying monthly costs a little more in total.
- **Grace period:** **[IRDAI]** extra time after the due date to pay a premium: 15 days when premiums are paid monthly and 30 days for quarterly, half-yearly or annual payment. The policy stays in force during the grace period (Master Circular on Life Insurance Products, 2024, Section I, item 8).
- **Lapse and revival:** if a premium is not paid even after the grace period, the policy can *lapse* (stop). Most policies can be *revived* within a period stated in the policy by paying the arrears.
- **Rider:** an optional add-on to a base policy for extra benefits (accidental death, critical illness, waiver of premium …) at extra cost. **[IRDAI]** The premium for health-related or critical-illness riders cannot exceed 100% of the base product's premium, and the premiums of all other riders put together cannot exceed 30% of it. A rider's benefit cannot exceed the base sum assured, except accidental death riders, which can go up to three times the base sum assured (Master Circular on Life Insurance Products, 2024, para 7.17). Saffron Life's own rider limits are stricter (see `riders.csv`).
- **Waiver of premium:** if a stated event happens (e.g. critical illness or disability), future premiums are waived and the policy continues.
- **Underwriting:** how the insurer assesses risk before accepting a proposal, using age, health, smoking habit, income and occupation. *Financial underwriting* limits cover to a multiple of income. Saffron's multiples in `products.csv` are fictional.
- **Smoker / non-smoker rates:** tobacco users pay higher premiums because their mortality risk is higher.

## Types of life insurance

- **Term insurance:** pure protection. It pays the sum assured if the life assured dies during the term and pays nothing on survival. For the same premium it gives the highest cover.
  - **Level term:** the cover stays the same throughout.
  - **Increasing cover term:** the cover rises over time, for example to keep up with inflation.
  - **Decreasing cover term:** the cover falls over time, typically to match a reducing loan.
  - **Return of premium (ROP) term:** gives back the premiums paid if the life assured survives the term. It costs much more than plain term cover.
- **Whole life insurance:** cover for the whole of life (in practice to a high age such as 99 or 100), so a payout is almost certain. Often used to leave a legacy.
- **Endowment plan:** savings plus life cover. It pays on death during the term or on survival to maturity. A **money-back** plan pays parts of the sum assured at intervals during the term.
- **Participating (par) / non-participating (non-par):** a *par* policy shares in the insurer's profits through **bonuses**, which are not guaranteed. A *non-par* policy has fixed, guaranteed benefits.
- **Bonus:** for par policies, an amount added to the benefits. A *simple reversionary bonus* is declared yearly as ₹ per ₹1,000 SA and paid with the claim or at maturity. A *terminal bonus* may be added at the end. Neither is guaranteed in advance.
- **ULIP (Unit Linked Insurance Plan):** insurance plus market-linked investment. After charges, premiums buy **units** of investment funds. The **fund value** goes up or down with the markets, and the investment risk is borne by the policyholder.

## ULIP words

- **Fund / NAV:** each fund has a **Net Asset Value (NAV)** per unit, the market value of the fund's assets per unit after fund charges. Fund value = number of units × NAV.
- **Premium allocation charge:** a percentage taken from each premium before units are bought.
- **Policy administration charge:** a fixed monthly charge for running the policy.
- **Mortality charge:** the monthly cost of the life cover, charged on the **sum at risk** (death benefit minus fund value).
- **Fund management charge (FMC):** a yearly percentage of fund value, deducted through the NAV.
- **Switch:** moving money from one fund to another inside the ULIP.
- **Lock-in period:** **[IRDAI]** Linked insurance products have a lock-in period of 5 years. During it, policy proceeds are not payable to the policyholder except on death or other covered contingencies (Master Circular on Life Insurance Products, 2024, Section I, item 4). If premiums stop during the lock-in, the money moves to a *discontinued policy fund* and is paid out only after the lock-in ends (para 40).
- **Partial withdrawal:** **[IRDAI]** taking out part of the fund. In linked policies it is allowed only after the 5-year lock-in (Master Circular on Protection of Policyholders' Interests, 2024, Part A).

## Benefits and documents

- **Death benefit:** what is paid if the life assured dies during the policy term.
- **Maturity benefit:** what is paid if the life assured survives to the end of the term (none for plain term insurance).
- **Survival benefit:** amounts paid during the term while the life assured is alive (e.g. money-back instalments).
- **Surrender / surrender value:** ending a policy early and the amount paid back. Pure term plans usually have no surrender value. Surrender values are not tabulated in this pack.
- **Benefit illustration:** a personalised table showing what a policy may pay. **[IRDAI]** For products whose benefits are not all fixed in rupees at the start (for example par plans and ULIPs), benefit illustrations must show guaranteed and non-guaranteed benefits at gross investment returns of **4% and 8% a year** (Master Circular on Life Insurance Products, 2024, para 33.1 for non-linked products other than annuities; para 54.7.1 for unit-linked products). These rates are prescribed for illustration only; they are not guarantees or predictions. This rule describes what insurers must do when selling; it is not a requirement for hackathon apps.
- **Customer Information Sheet (CIS):** **[IRDAI]** a short document given with every policy that explains in simple words the type of insurance, the sum assured, the benefits, the exclusions and other key terms (Master Circular on Life Insurance Products, 2024, Section I, item 2).
- **Free-look period:** **[IRDAI]** a period of **30 days from the date of receipt of the policy document** in which the policyholder can review the terms and, if not satisfied, cancel the policy. It applies to policies with a term of one year or more (Master Circular on Life Insurance Products, 2024, Section I, item 5; Master Circular on Protection of Policyholders' Interests, 2024).
- **Exclusions:** situations in which the policy does not pay, or pays less. **[IRDAI]** For example, if the life assured dies by suicide within 12 months of the start (or revival) of the policy:
  - *Non-linked plans:* the nominee is entitled to at least 80% of premiums paid, or the surrender value if higher, provided the policy is in force (Master Circular on Life Insurance Products, 2024, para 21).
  - *Unit-linked plans (ULIPs):* the nominee receives the fund value on the date death is intimated, plus any charges other than fund-management and guarantee charges deducted after the date of death (same circular, para 35).
- **Policy cannot be contested after 3 years:** **[IRDAI]** "No policy of life insurance shall be contestable on any ground whatsoever after the expiry of three years" from the date of issuance of the policy, commencement of risk, revival or the rider, whichever is later (Master Circular on Life Insurance Products, 2024, Section I, item 10; also Master Circular on Protection of Policyholders' Interests, 2024, Part A). The underlying law is Section 45 of the Insurance Act, 1938. In the first three years, an insurer may question a policy, for example over facts not disclosed in the proposal.

## Claims

- **Claim:** a request for payment under the policy, e.g. by the nominee after a death.
- **Claim settlement timelines:** **[IRDAI]** a death claim must be settled within 15 days of intimation, or within 45 days if it warrants investigation (Master Circular on Protection of Policyholders' Interests, 2024, Part A).
- **Claim settlement ratio:** the share of claims an insurer paid out of the claims it decided in a year. Saffron Life is fictional and has no such figure.

## Planning words

- **Human Life Value (HLV):** a way to estimate cover from **income**. It is the present value of the money a person would have earned and spent on their family over their remaining working life, after taking out what they spend on themselves. There is no single official formula: growth, discount rate, taxes and the share spent on oneself are assumptions.
- **Needs approach (Net Needs Approach / Needs Analysis):** a way to estimate cover from the **family's needs**. Add up what the family would need if the person died: future living expenses for a chosen number of years, outstanding loans, future goals such as children's education, and final expenses. Then subtract the resources already available, such as existing life cover and savings. The result is the *net* need. Again there is no single official formula.
- **Coverage gap:** recommended cover minus existing cover. If it is zero or negative, the person may not need more cover.
- **Present value / discount rate:** money needed in the future is worth less today, because today's money can earn a return. Discounting at a rate converts future amounts into today's value.
- **Inflation:** the rise in prices over time. A goal costing ₹20 lakh today will cost more in 10 years.
- **Emergency fund:** cash kept aside for a few months of expenses.
- **Group term life (employer cover):** life cover provided by an employer to employees. It usually ends when the person leaves that employer.
- **Final expenses:** one-time costs at death (funeral, legal and administrative costs).

## Sources

The **[IRDAI]** facts above are from:

1. IRDAI, *Master Circular on Life Insurance Products*, Ref. IRDAI/ACTL/MSTCIR/MISC/89/6/2024, dated 12 June 2024 (irdai.gov.in).
2. IRDAI, *Master Circular on Protection of Policyholders' Interests, 2024*, Ref. IRDAI/PP&GR/CIR/MISC/117/9/2024, dated 5 September 2024 (irdai.gov.in).

Regulations change. Check irdai.gov.in for the latest position before relying on any of them outside this hackathon.
