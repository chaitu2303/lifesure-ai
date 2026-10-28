import React, { useState } from 'react';
import { Users, Home, TrendingUp, ShieldCheck } from 'lucide-react';

interface Scenario {
  id: string;
  badge: string;
  title: string;
  stage: string;
  income: string;
  mortgage: string;
  goals: string;
  assets: string;
  coverageNeed: string;
  gapNote: string;
  primaryRisk: string;
  recommendedCategory: string;
}

const SCENARIOS: Scenario[] = [
  {
    id: 'young-family',
    badge: 'ARCHETYPE 01',
    title: 'The Young Growing Family',
    stage: 'Ages 28–34 · 1 Young Child (Age 2)',
    income: '₹ 12,00,000 / year',
    mortgage: '₹ 25,00,000 balance (18 yrs remain)',
    goals: '₹ 20,00,000 higher education corpus',
    assets: '₹ 15,00,000 EPF, mutual funds & savings',
    coverageNeed: '₹ 65,00,000 – ₹ 1,00,00,000',
    gapNote: 'Peak vulnerability window. High income replacement horizon (15 yrs) plus active home loan EMI leverage.',
    primaryRisk: 'Premature income loss halts home loan amortisation and wipes out child education compounding.',
    recommendedCategory: '20 to 25-Year Level Pure Term Life (High sum assured, lowest annual cash outlay ~₹1,200/mo)',
  },
  {
    id: 'mid-career',
    badge: 'ARCHETYPE 02',
    title: 'Peak Earning & College Bound',
    stage: 'Ages 42–48 · 2 Teenagers (Ages 14 & 17)',
    income: '₹ 28,00,000 / year',
    mortgage: '₹ 18,00,000 balance (6 yrs remain)',
    goals: '₹ 45,00,000 university fees due in 2–5 yrs',
    assets: '₹ 55,00,000 equity portfolio + PPF + home equity',
    coverageNeed: '₹ 80,00,000 – ₹ 1,20,00,000',
    gapNote: 'Moderate coverage requirement. Short remaining income horizon (12 yrs to retirement), substantial offset assets.',
    primaryRisk: 'Immediate college tuition cash crunch and loss of peak retirement compounding years.',
    recommendedCategory: '15-Year Pure Term or Hybrid Term-with-Endowment to lock in education milestone',
  },
  {
    id: 'pre-retiree',
    badge: 'ARCHETYPE 03',
    title: 'Empty Nester / Wealth Transition',
    stage: 'Ages 55–60 · Adult Children Independent',
    income: '₹ 22,00,000 / year',
    mortgage: '₹ 0 (Debt-free primary residence)',
    goals: 'Spousal healthcare & estate inheritance',
    assets: '₹ 1.8 Cr EPF, NPS, mutual funds, gold',
    coverageNeed: '₹ 25,00,000 – ₹ 40,00,000',
    gapNote: 'Low income replacement need. Existing asset base self-insures baseline living costs; focus shifts to critical illness and estate transfer.',
    primaryRisk: 'Healthcare/critical illness costs draining retirement corpus, or unliquid estate taxation.',
    recommendedCategory: 'Whole Life or Term with Critical Illness Rider for guaranteed permanent legacy protection',
  },
];

export const ScenarioComparison: React.FC = () => {
  const [activeScenarioId, setActiveScenarioId] = useState<string>('young-family');
  const active = SCENARIOS.find((s) => s.id === activeScenarioId) || SCENARIOS[0];

  return (
    <section className="py-24 bg-[#FAF9F5] border-b border-[#E6E4DF]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="max-w-3xl mb-12">
          <div className="inline-flex items-center space-x-2 text-[11px] font-mono tracking-widest uppercase text-[#1D4ED8] bg-[#1D4ED8]/5 px-2.5 py-1 rounded border border-[#1D4ED8]/15 mb-3">
            <span>Life Stage Benchmarking</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-serif font-normal text-[#0B132B] tracking-tight leading-tight">
            How protection priorities evolve across life stages
          </h2>
          <p className="mt-3 text-sm text-[#475569] leading-relaxed">
            Financial protection is not static. Explore how differing family obligations, remaining debt tenures, and accumulated asset balances alter the actuarial coverage requirement.
          </p>
        </div>

        {/* Archetype Tab Selector */}
        <div className="flex border-b border-[#E6E4DF] gap-2 mb-8 overflow-x-auto pb-px">
          {SCENARIOS.map((scenario) => {
            const isSelected = scenario.id === activeScenarioId;
            return (
              <button
                key={scenario.id}
                onClick={() => setActiveScenarioId(scenario.id)}
                className={`py-3 px-5 text-xs font-mono tracking-wider uppercase transition-all whitespace-nowrap border-b-2 -mb-px ${
                  isSelected
                    ? 'border-[#1D4ED8] text-[#1D4ED8] font-bold bg-white'
                    : 'border-transparent text-[#64748B] hover:text-[#0B132B] hover:bg-white/50'
                }`}
              >
                {scenario.badge}: {scenario.title}
              </button>
            );
          })}
        </div>

        {/* Active Scenario Dossier */}
        <div className="bg-white border border-[#E6E4DF] p-8 sm:p-10 rounded-sm">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left 7 cols: Household Balance Sheet */}
            <div className="lg:col-span-7 space-y-6">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#1D4ED8] font-bold">
                  {active.badge} · Profile Blueprint
                </span>
                <h3 className="font-serif text-2xl text-[#0B132B] font-medium mt-1">
                  {active.title}
                </h3>
                <p className="text-xs text-[#64748B] mt-0.5 font-mono">{active.stage}</p>
              </div>

              {/* Data Grid */}
              <div className="grid grid-cols-2 gap-4 border-y border-[#E6E4DF] py-5">
                <div>
                  <div className="text-[10px] font-mono uppercase tracking-wider text-[#64748B]">Household Income</div>
                  <div className="font-mono text-sm font-semibold text-[#0B132B] mt-1">{active.income}</div>
                </div>
                <div>
                  <div className="text-[10px] font-mono uppercase tracking-wider text-[#64748B]">Remaining Mortgage</div>
                  <div className="font-mono text-sm font-semibold text-[#0B132B] mt-1">{active.mortgage}</div>
                </div>
                <div>
                  <div className="text-[10px] font-mono uppercase tracking-wider text-[#64748B]">Key Future Commitments</div>
                  <div className="font-mono text-sm font-semibold text-[#0B132B] mt-1">{active.goals}</div>
                </div>
                <div>
                  <div className="text-[10px] font-mono uppercase tracking-wider text-[#64748B]">Eligible Offset Assets</div>
                  <div className="font-mono text-sm font-semibold text-[#0B132B] mt-1">{active.assets}</div>
                </div>
              </div>

              <div>
                <div className="text-[11px] font-mono uppercase tracking-wider text-[#0B132B] font-semibold mb-1">
                  Primary Catastrophic Risk
                </div>
                <p className="text-xs text-[#475569] leading-relaxed">
                  {active.primaryRisk}
                </p>
              </div>

              <div className="bg-[#FAF9F5] border border-[#E6E4DF] p-4 rounded-sm text-xs text-[#475569] leading-relaxed">
                <span className="font-mono text-[10px] uppercase tracking-wider text-[#1D4ED8] font-semibold block mb-1">
                  Actuarial Assessment Note
                </span>
                {active.gapNote}
              </div>
            </div>

            {/* Right 5 cols: Actuarial Requirement Display */}
            <div className="lg:col-span-5 bg-[#FAF9F5] border border-[#E6E4DF] p-7 rounded-sm flex flex-col justify-between space-y-6">
              <div>
                <div className="text-[10px] font-mono uppercase tracking-widest text-[#64748B] mb-2">
                  Calculated Capital Requirement
                </div>
                <div className="font-serif text-4xl sm:text-5xl text-[#0B132B] font-normal tracking-tight">
                  {active.coverageNeed}
                </div>
                <div className="text-[11px] font-mono text-[#047857] mt-2 flex items-center space-x-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#047857]"></span>
                  <span>Fully inflation-hedged net present value</span>
                </div>
              </div>

              <div className="pt-6 border-t border-[#E6E4DF] space-y-3">
                <div className="text-[10px] font-mono uppercase tracking-widest text-[#0B132B] font-semibold">
                  Recommended Architecture
                </div>
                <div className="text-xs text-[#475569] leading-relaxed bg-white border border-[#E6E4DF] p-3.5 rounded-sm">
                  {active.recommendedCategory}
                </div>
              </div>

              <div className="text-[11px] font-mono text-[#64748B] text-center">
                Individual balance sheets yield unique requirements.
              </div>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
};
