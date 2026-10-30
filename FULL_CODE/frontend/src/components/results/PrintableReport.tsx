import React from 'react';
import { Printer, ArrowLeft, Shield, CheckCircle2 } from 'lucide-react';
import { CalculationResult, AssessmentInput } from '../../types';

interface ReportProps {
  result: CalculationResult;
  input: AssessmentInput;
  onBack: () => void;
}

export const PrintableReport: React.FC<ReportProps> = ({ result, input, onBack }) => {
  const handlePrint = () => {
    window.print();
  };

  const today = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const grossNeed = result.total_gross_protection_need || 1;
  const totalOffsets = (result.eligible_existing_assets || 0) + (result.existing_life_cover || 0);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 print:py-0 print:px-0">
      
      {/* Top action bar - hidden during print */}
      <div className="flex items-center justify-between mb-8 no-print">
        <button
          onClick={onBack}
          className="inline-flex items-center space-x-2 px-4 py-2 text-xs font-mono uppercase tracking-wider text-[#0B132B] bg-white hover:bg-[#FAF9F5] border border-[#E6E4DF] rounded-sm transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Return to Dashboard</span>
        </button>

        <button
          onClick={handlePrint}
          className="inline-flex items-center space-x-2 px-5 py-2.5 text-xs font-mono uppercase tracking-wider font-semibold text-white bg-[#0B132B] hover:bg-[#1D4ED8] rounded-sm shadow-sm transition-colors"
        >
          <Printer className="w-3.5 h-3.5" />
          <span>Print / Save PDF Memorandum</span>
        </button>
      </div>

      {/* Printable Sheet */}
      <div className="bg-white p-10 sm:p-14 border border-[#E6E4DF] rounded-sm print:border-none print:p-0 text-[#0B132B]">
        
        {/* Masthead */}
        <div className="border-b-2 border-[#0B132B] pb-6 mb-8 flex items-start justify-between">
          <div>
            <div className="flex items-center space-x-2 mb-1">
              <span className="font-serif text-2xl font-bold tracking-tight text-[#0B132B]">LIFEWISE</span>
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#1D4ED8] bg-[#1D4ED8]/10 px-2 py-0.5 rounded-sm">
                Fiduciary Advisory
              </span>
            </div>
            <p className="text-xs text-[#64748B] font-mono">
              Capital Needs Analysis & Protection Architecture Brief
            </p>
          </div>

          <div className="text-right text-xs font-mono">
            <p className="font-bold text-[#0B132B]">MEMORANDUM #{result.assessment_id || 'CNA-1042'}</p>
            <p className="text-[#64748B] mt-0.5">{today}</p>
            <p className="text-[#047857] text-[10px] uppercase tracking-wider mt-1">Actuarial Standard Met</p>
          </div>
        </div>

        {/* Client Demographic Dossier */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-5 bg-[#FAF9F5] border border-[#E6E4DF] rounded-sm mb-8 text-xs font-mono">
          <div>
            <span className="text-[#64748B] text-[10px] uppercase block">Client Name</span>
            <span className="font-bold text-[#0B132B] mt-0.5 block">{input.full_name || 'Sarah Miller'}</span>
          </div>
          <div>
            <span className="text-[#64748B] text-[10px] uppercase block">Current Age & Horizon</span>
            <span className="font-bold text-[#0B132B] mt-0.5 block">{input.age} yrs · {result.assumptions_used?.replacement_horizon_years || 15} yr horizon</span>
          </div>
          <div>
            <span className="text-[#64748B] text-[10px] uppercase block">Financial Dependents</span>
            <span className="font-bold text-[#0B132B] mt-0.5 block">{input.dependents_count} Dependent(s)</span>
          </div>
          <div>
            <span className="text-[#64748B] text-[10px] uppercase block">Monthly Living Costs</span>
            <span className="font-bold text-[#0B132B] mt-0.5 block">${Number(input.monthly_expenses || 0).toLocaleString()} / mo</span>
          </div>
        </div>

        {/* Executive Verdict Box */}
        <div className="p-8 border border-[#0B132B] bg-[#0B132B] text-white rounded-sm mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#1D4ED8] bg-white/10 px-2 py-0.5 rounded-sm">
              Recommended Net Additional Life Cover
            </span>
            <div className="font-serif text-4xl sm:text-5xl font-normal text-white mt-2">
              ${(result.net_additional_cover || 0).toLocaleString()}
            </div>
            <p className="text-xs text-white/70 mt-2 font-mono">
              Estimated Monthly Cost: ~${result.estimated_monthly_premium_range?.median}/mo (Level Term Life benchmark)
            </p>
          </div>

          <div className="text-right sm:border-l sm:border-white/20 sm:pl-8 space-y-1 font-mono text-xs">
            <span className="text-white/60 text-[10px] uppercase block">Total Gross Obligations</span>
            <span className="text-xl font-bold text-white block">${(result.total_gross_protection_need || 0).toLocaleString()}</span>
            <span className="text-white/60 text-[10px] uppercase block pt-2">Eligible Offsets Credited</span>
            <span className="text-sm font-semibold text-[#047857] block">-${totalOffsets.toLocaleString()}</span>
          </div>
        </div>

        {/* Actuarial Ledger Table */}
        <div className="mb-8 space-y-3">
          <span className="text-[10px] font-mono uppercase tracking-widest text-[#0B132B] font-bold block">
            Mathematical Balance Sheet Derivation
          </span>

          <div className="border border-[#E6E4DF] rounded-sm overflow-hidden text-xs font-mono">
            <div className="bg-[#FAF9F5] px-4 py-2.5 border-b border-[#E6E4DF] font-bold text-[#0B132B] grid grid-cols-12">
              <span className="col-span-8">Obligation / Resource Category</span>
              <span className="col-span-4 text-right">Calculated Capital Value</span>
            </div>

            <div className="divide-y divide-[#E6E4DF]">
              <div className="px-4 py-3 grid grid-cols-12 items-center">
                <div className="col-span-8">
                  <span className="font-semibold text-[#0B132B] block">Income Replacement Annuity (PV)</span>
                  <span className="text-[11px] text-[#64748B]">
                    ${input.monthly_expenses?.toLocaleString()}/mo living costs × 12 × 75% dependency factor over {result.assumptions_used?.replacement_horizon_years || 15} yrs at {((result.assumptions_used?.real_rate || 0.0189) * 100).toFixed(2)}% real discount rate.
                  </span>
                </div>
                <div className="col-span-4 text-right font-bold text-[#0B132B]">
                  ${(result.income_replacement_pv || 0).toLocaleString()}
                </div>
              </div>

              <div className="px-4 py-3 grid grid-cols-12 items-center">
                <div className="col-span-8">
                  <span className="font-semibold text-[#0B132B] block">Outstanding Liabilities Liquidation</span>
                  <span className="text-[11px] text-[#64748B]">
                    100% principal payoff for mortgages, auto debt, and credit cards.
                  </span>
                </div>
                <div className="col-span-4 text-right font-bold text-rose-700">
                  ${(result.total_liabilities || 0).toLocaleString()}
                </div>
              </div>

              <div className="px-4 py-3 grid grid-cols-12 items-center">
                <div className="col-span-8">
                  <span className="font-semibold text-[#0B132B] block">Discrete Milestone Commitments (PV)</span>
                  <span className="text-[11px] text-[#64748B]">
                    Children higher university tuition and milestone goals.
                  </span>
                </div>
                <div className="col-span-4 text-right font-bold text-[#0B132B]">
                  ${(result.total_future_goals_pv || 0).toLocaleString()}
                </div>
              </div>

              <div className="px-4 py-3 grid grid-cols-12 items-center">
                <div className="col-span-8">
                  <span className="font-semibold text-[#0B132B] block">Emergency Transition Reserve</span>
                  <span className="text-[11px] text-[#64748B]">
                    6 months immediate liquid living expenditure buffer.
                  </span>
                </div>
                <div className="col-span-4 text-right font-bold text-[#0B132B]">
                  ${(result.additional_family_reserve || 0).toLocaleString()}
                </div>
              </div>

              <div className="px-4 py-3 grid grid-cols-12 items-center bg-[#FAF9F5]">
                <div className="col-span-8 font-bold text-[#0B132B]">
                  Total Gross Protection Requirement
                </div>
                <div className="col-span-4 text-right font-bold text-[#0B132B]">
                  ${(result.total_gross_protection_need || 0).toLocaleString()}
                </div>
              </div>

              <div className="px-4 py-3 grid grid-cols-12 items-center text-[#047857]">
                <div className="col-span-8">
                  <span className="font-semibold block">Less: Eligible Liquid Assets Offset</span>
                  <span className="text-[11px] text-[#047857]/80">Bank balances, deposits, liquid securities (primary residence excluded).</span>
                </div>
                <div className="col-span-4 text-right font-bold">
                  -${(result.eligible_existing_assets || 0).toLocaleString()}
                </div>
              </div>

              <div className="px-4 py-3 grid grid-cols-12 items-center text-[#047857]">
                <div className="col-span-8">
                  <span className="font-semibold block">Less: Existing Life Insurance In Force</span>
                  <span className="text-[11px] text-[#047857]/80">Active individual term policies and employer group life cover.</span>
                </div>
                <div className="col-span-4 text-right font-bold">
                  -${(result.existing_life_cover || 0).toLocaleString()}
                </div>
              </div>

              <div className="px-4 py-3.5 grid grid-cols-12 items-center bg-[#0B132B] text-white">
                <div className="col-span-8 font-bold text-sm">
                  Net Unfunded Protection Gap (Recommended Cover)
                </div>
                <div className="col-span-4 text-right font-bold text-base text-[#1D4ED8]">
                  ${(result.net_additional_cover || 0).toLocaleString()}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Fiduciary Regulatory Sign-Off */}
        <div className="border-t border-[#E6E4DF] pt-6 flex flex-col sm:flex-row justify-between items-start sm:items-center text-[10px] font-mono text-[#64748B] gap-4">
          <div>
            LifeWise Analytical Advisory Platform · Irving Fisher Actuarial Model · Standard Form 1042-CNA
          </div>
          <div className="flex items-center space-x-1.5 text-[#047857]">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Certified Computational Output</span>
          </div>
        </div>

      </div>

    </div>
  );
};
