import {
  AssessmentInput,
  CalculationResult,
  GoalBreakdownItem,
  ProductRecommendationItem,
  RecommendationsResponse,
  SimulationRequest,
  SimulationResponse,
  Advisor,
  AvailableSlot,
  Appointment,
} from '../types';

const DEFAULT_INFLATION = 0.06;
const DEFAULT_DISCOUNT = 0.08;
const FAMILY_EXPENSE_FACTOR = 0.75;
const RESERVE_MONTHS = 6;

function calculateRealRate(discountRate: number, inflationRate: number): number {
  return (discountRate - inflationRate) / (1.0 + inflationRate);
}

export const offlineEngine = {
  calculateNeeds(input: AssessmentInput): CalculationResult {
    const inflation = DEFAULT_INFLATION;
    const discount = DEFAULT_DISCOUNT;
    const rReal = calculateRealRate(discount, inflation);
    const horizonYears = input.replacement_horizon_years || 15;

    // 1. Income Replacement PV
    const annualReplacement = (input.monthly_expenses || 60000) * 12 * FAMILY_EXPENSE_FACTOR;
    let incomePV = annualReplacement * horizonYears;
    if (Math.abs(rReal) >= 1e-6) {
      const factor = (1.0 - Math.pow(1.0 + rReal, -horizonYears)) / rReal;
      incomePV = annualReplacement * factor;
    }
    incomePV = Math.round(Math.max(0, incomePV));

    // 2. Liabilities
    const totalLiabilities = Object.values(input.liabilities || {}).reduce(
      (sum, val) => sum + Number(val || 0),
      0
    );

    // 3. Goals
    let totalGoalsFV = 0;
    let totalGoalsPV = 0;
    const breakdown: GoalBreakdownItem[] = (input.future_goals || []).map((goal) => {
      const target = Number(goal.target_amount || 0);
      const years = Number(goal.years_until_goal || 10);
      const fv = Math.round(target * Math.pow(1.0 + inflation, years));
      const pv = Math.round(fv / Math.pow(1.0 + discount, years));
      totalGoalsFV += fv;
      totalGoalsPV += pv;
      return {
        name: goal.name,
        target_amount_today: target,
        years_until_goal: years,
        future_value: fv,
        present_value: pv,
      };
    });

    // 4. Reserve
    const familyReserve = Math.round((input.monthly_expenses || 60000) * RESERVE_MONTHS);

    // 5. Gross Need
    const grossNeed = incomePV + totalLiabilities + totalGoalsPV + familyReserve;

    // 6. Offsets
    const eligibleAssets = Object.values(input.existing_assets || {}).reduce(
      (sum, val) => sum + Number(val || 0),
      0
    );
    const existingCover = Number(input.existing_life_cover || 0);
    const totalExisting = eligibleAssets + existingCover;

    // 7. Net Additional Cover (Protection Gap)
    const netCover = Math.max(0, grossNeed - totalExisting);

    // 8. Human Life Value Estimate
    const workingYearsLeft = Math.max(5, (input.retirement_age || 60) - (input.age || 30));
    const hlv = Math.round((input.annual_income || 1200000) * workingYearsLeft * 0.7);

    // 9. Premium Estimation (Based on Indian pure term benchmarks ~₹1,000/mo per ₹1 Cr for young healthy adult)
    const ageFactor = 1.0 + Math.max(0, (input.age || 28) - 25) * 0.035;
    const medianPremium = Math.max(600, Math.round((netCover / 10000000) * 1100 * ageFactor));
    const lowPremium = Math.round(medianPremium * 0.85);
    const highPremium = Math.round(medianPremium * 1.25);

    // 10. Affordability
    let affordability: 'Comfortably Affordable' | 'Affordable' | 'Tight Budget' | 'Budget Strained' = 'Comfortably Affordable';
    const budget = input.monthly_budget || 2000;
    if (budget >= highPremium) affordability = 'Comfortably Affordable';
    else if (budget >= medianPremium) affordability = 'Affordable';
    else if (budget >= lowPremium) affordability = 'Tight Budget';
    else affordability = 'Budget Strained';

    return {
      income_replacement_pv: incomePV,
      total_liabilities: totalLiabilities,
      total_future_goals_pv: totalGoalsPV,
      total_future_goals_fv: totalGoalsFV,
      future_goals_breakdown: breakdown,
      additional_family_reserve: familyReserve,
      total_gross_protection_need: grossNeed,
      eligible_existing_assets: eligibleAssets,
      existing_life_cover: existingCover,
      total_existing_protection: totalExisting,
      net_additional_cover: netCover,
      protection_gap: netCover,
      human_life_value_estimate: hlv,
      affordability_status: affordability,
      monthly_budget: budget,
      estimated_monthly_premium_range: {
        low: lowPremium,
        median: medianPremium,
        high: highPremium,
      },
      assumptions_used: {
        inflation_rate: inflation,
        discount_rate: discount,
        real_rate: Number(rReal.toFixed(4)),
        emergency_reserve_months: RESERVE_MONTHS,
        family_expense_factor: FAMILY_EXPENSE_FACTOR,
        replacement_horizon_years: horizonYears,
      },
      formula_explanation: 'Capital Needs Analysis = max(0, Income PV + Liabilities + Goals PV + Reserve - Assets - Existing Cover)',
      assessment_id: 1042,
      created_at: new Date().toISOString(),
    };
  },

  getRecommendations(input: AssessmentInput, assessmentId: number = 1042): RecommendationsResponse {
    const calc = this.calculateNeeds(input);
    const netCover = calc.net_additional_cover;

    const termMonthly = calc.estimated_monthly_premium_range.median;
    const ulipMonthly = Math.round(termMonthly * 3.5);
    const endowMonthly = Math.round(termMonthly * 5.0);
    const wholeLifeMonthly = Math.round(termMonthly * 6.5);

    const products: ProductRecommendationItem[] = [
      {
        product_id: 'term-pure-shield',
        name: 'LifeSure Pure Term Shield',
        category: 'term',
        category_label: 'Pure Term Life Insurance',
        tagline: 'High sum assured pure indemnity for family living expenses & home loans.',
        suitability_score: 96,
        is_primary: true,
        headline_reason: 'Optimal coverage-to-cost ratio for eliminating your protection gap.',
        fit_reasons: [
          'High sum assured coverage at the lowest possible monthly premium',
          'Guaranteed fixed level premium throughout your 20–30 year chosen tenure',
          'Covers outstanding mortgage and child education funds directly upon claim',
          'Tax exempt death benefit payout under Section 10(10D)',
        ],
        trade_offs: [
          'Pure risk protection with zero maturity refund if you survive the tenure',
          'Requires standard medical health disclosure',
        ],
        ideal_for: 'Salaried professionals, young families, and home loan borrowers.',
        cost_rating: 'Low (~₹1,200/mo per ₹1 Cr)',
        flexibility_rating: 'High',
        investment_component: false,
        illustrative_monthly_cost: termMonthly,
        cost_disclaimer: 'Illustrative quote for healthy non-smoker.',
      },
      {
        product_id: 'ulip-smart-wealth',
        name: 'LifeSure Smart Wealth Advantage',
        category: 'ulip',
        category_label: 'Unit-Linked Insurance Plan (ULIP)',
        tagline: 'Dual-purpose market-linked equity wealth building with embedded cover.',
        suitability_score: 78,
        is_primary: false,
        headline_reason: 'Combines long-term wealth compounding with baseline life protection.',
        fit_reasons: [
          'Market-linked equity and debt portfolio growth managed by top fund managers',
          'Unlimited free switches between debt and equity assets',
          'Tax-advantaged capital gains after mandatory 5-year lock-in period',
        ],
        trade_offs: [
          'Returns are subject to market volatility and are not guaranteed',
          'Mortality charges deduct from unit balance',
        ],
        ideal_for: 'Disciplined investors seeking market returns with life cover.',
        cost_rating: 'Moderate',
        flexibility_rating: 'Very High',
        investment_component: true,
        illustrative_monthly_cost: ulipMonthly,
        cost_disclaimer: 'Returns depend on market performance of underlying funds.',
      },
      {
        product_id: 'endowment-secure-future',
        name: 'LifeSure Guaranteed Secure Future',
        category: 'endowment',
        category_label: 'Guaranteed Endowment Plan',
        tagline: 'Disciplined savings with guaranteed lump-sum maturity payout + bonuses.',
        suitability_score: 72,
        is_primary: false,
        headline_reason: 'Guarantees milestone funds for non-negotiable child education targets.',
        fit_reasons: [
          'Guaranteed maturity payout unaffected by stock market fluctuations',
          'Accruing annual reversionary and terminal bonuses',
          'Disciplined forced savings structure for specific milestones',
        ],
        trade_offs: [
          'Net internal rate of return typically 4.5% - 6.0% p.a.',
          'Early surrender before maturity carries significant capital penalties',
        ],
        ideal_for: 'Risk-averse families funding specific non-negotiable life events.',
        cost_rating: 'High',
        flexibility_rating: 'Low',
        investment_component: true,
        illustrative_monthly_cost: endowMonthly,
        cost_disclaimer: 'Bonuses declared annually based on insurer surplus.',
      },
      {
        product_id: 'whole-life-legacy',
        name: 'LifeSure Permanent Whole Life & Legacy',
        category: 'whole_life',
        category_label: 'Whole Life Estate Shield',
        tagline: 'Guaranteed lifetime protection up to age 100 with cash surrender value.',
        suitability_score: 64,
        is_primary: false,
        headline_reason: 'Provides tax-free intergenerational estate transfer & permanent liquidity.',
        fit_reasons: [
          'Lifelong guaranteed death benefit covering the insured up to age 100',
          'Guaranteed cash value accumulation accessible via policy loans',
          'Ideal vehicle for equalizing inheritance among heirs',
        ],
        trade_offs: [
          'Substantially higher ongoing premium commitment',
          'Over-insures once children are independent and debts are paid',
        ],
        ideal_for: 'High-net-worth estate planning, business succession, and lifetime legacy.',
        cost_rating: 'Very High',
        flexibility_rating: 'Moderate',
        investment_component: true,
        illustrative_monthly_cost: wholeLifeMonthly,
        cost_disclaimer: 'Premiums payable for 15-20 years or until age 65.',
      },
    ];

    return {
      assessment_id: assessmentId,
      net_additional_cover: netCover,
      recommended_product_category: 'Pure Term Life Insurance',
      primary_recommendation: products[0],
      all_recommendations: products,
      methodology_note: 'Recommendations generated via deterministic CFP® Capital Needs Analysis ranking protection leverage and cost efficiency.',
    };
  },

  runSimulation(req: SimulationRequest): SimulationResponse {
    const baseCalc = this.calculateNeeds({
      full_name: 'Client',
      age: 28,
      annual_income: req.base_annual_income,
      monthly_expenses: req.base_monthly_expenses,
      dependents_count: req.base_dependents_count,
      replacement_horizon_years: 15,
      liabilities: { home_loan: req.base_liabilities, car_loan: 0, personal_loan: 0, education_loan: 0, credit_cards: 0, other_liabilities: 0 },
      future_goals: [{ id: 'g1', name: 'Goals', target_amount: req.base_future_goals, years_until_goal: 10 }],
      existing_assets: { savings_account: req.base_existing_assets, fixed_deposits: 0, mutual_funds_stocks: 0, pf_ppf_available: 0, other_liquid_assets: 0 },
      existing_life_cover: req.base_existing_cover,
      monthly_budget: req.simulated_monthly_budget,
      risk_profile: 'moderate',
    });

    const baseNet = baseCalc.net_additional_cover;

    // Simulated
    const simRReal = calculateRealRate(req.simulated_discount_rate, req.simulated_inflation_rate);
    const simAnnualExpense = req.base_monthly_expenses * 12 * FAMILY_EXPENSE_FACTOR;
    let simIncomePV = simAnnualExpense * req.simulated_replacement_years;
    if (Math.abs(simRReal) >= 1e-6) {
      simIncomePV = simAnnualExpense * ((1.0 - Math.pow(1.0 + simRReal, -req.simulated_replacement_years)) / simRReal);
    }
    simIncomePV = Math.round(Math.max(0, simIncomePV));

    const simGoalsPV = Math.round(req.base_future_goals * req.simulated_goals_scaling);
    const simReserve = Math.round(req.base_monthly_expenses * RESERVE_MONTHS);
    const simGross = simIncomePV + req.base_liabilities + simGoalsPV + simReserve;
    const computedSimNet = Math.max(0, simGross - req.base_existing_assets - req.base_existing_cover);

    const finalSimCover = req.simulated_desired_cover_override !== undefined
      ? req.simulated_desired_cover_override
      : computedSimNet;

    const diffAmt = finalSimCover - baseNet;
    const diffPct = baseNet > 0 ? Number(((diffAmt / baseNet) * 100).toFixed(2)) : 0;
    const estPrem = Math.max(500, Math.round((finalSimCover / 10000000) * 1150));

    let sufficiency: 'Surplus' | 'Balanced' | 'Deficit' | 'Unspecified Budget' = 'Balanced';
    const variance = (req.simulated_monthly_budget || 0) - estPrem;
    if (!req.simulated_monthly_budget || req.simulated_monthly_budget <= 0) {
      sufficiency = 'Unspecified Budget';
    } else if (variance >= 200) {
      sufficiency = 'Surplus';
    } else if (variance >= -100) {
      sufficiency = 'Balanced';
    } else {
      sufficiency = 'Deficit';
    }

    return {
      original_net_cover: baseNet,
      simulated_net_cover: finalSimCover,
      difference_amount: diffAmt,
      difference_percentage: diffPct,
      simulated_income_replacement_pv: simIncomePV,
      simulated_liabilities: req.base_liabilities,
      simulated_future_goals_pv: simGoalsPV,
      simulated_family_reserve: simReserve,
      simulated_gross_need: simGross,
      estimated_monthly_premium: estPrem,
      budget_sufficiency: sufficiency,
      budget_variance: variance,
    };
  },

  getAdvisors(): Advisor[] {
    return [
      {
        id: 'adv-priya',
        name: 'Priya Sharma',
        title: 'Senior Fiduciary Wealth Planner',
        credentials: 'CFP®, ChFC®, SEBI RIA',
        experience_years: 12,
        specialties: ['Term Life Strategy', 'Mortgage Protection', 'Child Education Trust'],
        avatar_url: './images/advisor_priya.jpg',
        bio: 'Priya specialises in zero-commission, fee-only family protection planning and mortgage risk insulation across tier-1 metropolitan families.',
        rating: 4.95,
        reviews_count: 248,
      },
      {
        id: 'adv-rajesh',
        name: 'Rajesh Menon',
        title: 'Retirement & Estate Strategist',
        credentials: 'CFP®, MBA (Finance)',
        experience_years: 16,
        specialties: ['Whole Life Trusts', 'Intergenerational Wealth', 'Retirement Preservation'],
        avatar_url: './images/advisor_priya.jpg',
        bio: 'Rajesh advises established families and founders on structured estate liquidity and business succession insurance.',
        rating: 4.92,
        reviews_count: 310,
      },
    ];
  },

  getAdvisorSlots(advisorId: string): AvailableSlot[] {
    return [
      { slot_id: 's1', advisor_id: advisorId, date_str: '2024-08-16', time_str: '10:00 AM', is_available: true },
      { slot_id: 's2', advisor_id: advisorId, date_str: '2024-08-16', time_str: '11:30 AM', is_available: true },
      { slot_id: 's3', advisor_id: advisorId, date_str: '2024-08-16', time_str: '02:00 PM', is_available: true },
      { slot_id: 's4', advisor_id: advisorId, date_str: '2024-08-16', time_str: '04:30 PM', is_available: true },
      { slot_id: 's5', advisor_id: advisorId, date_str: '2024-08-17', time_str: '10:00 AM', is_available: true },
      { slot_id: 's6', advisor_id: advisorId, date_str: '2024-08-17', time_str: '03:00 PM', is_available: true },
    ];
  },

  bookAppointment(payload: {
    advisor_id: string;
    client_name: string;
    client_email: string;
    client_phone: string;
    topic: string;
    slot_time: string;
    consultation_mode: 'video' | 'phone';
    notes?: string;
  }): Appointment {
    const code = `LS-AUG-${Math.floor(1000 + Math.random() * 9000)}`;
    const advisorName = payload.advisor_id === 'adv-rajesh' ? 'Rajesh Menon' : 'Priya Sharma';

    const newAppt: Appointment = {
      id: Date.now(),
      appointment_code: code,
      advisor_id: payload.advisor_id,
      advisor_name: advisorName,
      client_name: payload.client_name,
      client_email: payload.client_email,
      client_phone: payload.client_phone,
      topic: payload.topic,
      slot_time: payload.slot_time,
      consultation_mode: payload.consultation_mode,
      status: 'confirmed',
      notes: payload.notes || 'Booked via LifeSure Web Advisory Platform',
      created_at: new Date().toISOString(),
    };

    try {
      const existing = JSON.parse(localStorage.getItem('lifesure_appointments') || '[]');
      existing.unshift(newAppt);
      localStorage.setItem('lifesure_appointments', JSON.stringify(existing));
    } catch {
      // Local storage fallback
    }

    return newAppt;
  },

  getAppointments(email?: string): Appointment[] {
    try {
      const stored = JSON.parse(localStorage.getItem('lifesure_appointments') || '[]');
      if (stored.length > 0) return stored;
    } catch {
      // ignore
    }

    // Default demo confirmed appointment
    return [
      {
        id: 101,
        appointment_code: 'LS-AUG-1042',
        advisor_id: 'adv-priya',
        advisor_name: 'Priya Sharma',
        client_name: 'Chaitanya Verma',
        client_email: email || 'chaitanya@example.com',
        client_phone: '+91 98765 43210',
        topic: 'Comprehensive Life Insurance & Mortgage Protection Review',
        slot_time: '2024-08-16 10:00 AM',
        consultation_mode: 'video',
        status: 'confirmed',
        notes: 'Review calculated ₹65 Lakhs protection gap and verify term insurance quotes.',
        created_at: new Date().toISOString(),
      },
    ];
  },

  sendChatMessage(message: string): { reply: string; suggested_followups: string[] } {
    const lower = message.toLowerCase();

    if (lower.includes('gap') || lower.includes('coverage') || lower.includes('need') || lower.includes('calculate')) {
      return {
        reply: 'LifeSure AI calculates your protection need using Capital Needs Analysis: Present Value of household living expenses + outstanding loans + future education goals + 6 months emergency reserve, minus your existing savings and current policies. This ensures your family is completely insulated without overpaying.',
        suggested_followups: [
          'Why not just use 10x my annual income?',
          'What happens to my mortgage if I pass away?',
          'How does inflation affect my coverage need?',
        ],
      };
    }

    if (lower.includes('term') || lower.includes('ulip') || lower.includes('compare') || lower.includes('endowment')) {
      return {
        reply: 'Pure Term Insurance provides the highest sum assured at the lowest price (e.g., ₹1.4 Cr for ~₹1,200/mo) but has no maturity refund. ULIPs and Endowment plans combine investments with insurance, but often yield lower net returns than combining pure term insurance with low-cost index mutual funds.',
        suggested_followups: [
          'Which product is best for home loan protection?',
          'Can I take a Critical Illness rider with Term Insurance?',
          'How do tax deductions under 80C and 10(10D) work?',
        ],
      };
    }

    if (lower.includes('advisor') || lower.includes('book') || lower.includes('consult') || lower.includes('call')) {
      return {
        reply: 'You can book a 1-on-1 video or phone consultation with a SEBI-registered / CFP® certified advisor directly on our platform. Our advisors operate under a strict fiduciary standard with zero commission incentives.',
        suggested_followups: [
          'What documents should I prepare for the consultation?',
          'Can I reschedule my appointment later?',
          'Is the consultation completely free?',
        ],
      };
    }

    return {
      reply: 'I am here to guide you through your financial protection planning. I can explain our calculation methodology, compare term vs whole life vs endowment plans, or help you book a session with a certified advisor.',
      suggested_followups: [
        'How does LifeSure calculate my coverage gap?',
        'Compare Pure Term vs ULIP vs Endowment',
        'Book a free consultation with Priya Sharma (CFP®)',
      ],
    };
  },
};
