import React from 'react';
import { ShoppingBag, HelpCircle, CheckCircle2 } from 'lucide-react';
import { AssessmentInput } from '../../types';

interface Step2Props {
  data: AssessmentInput;
  onChange: (updates: Partial<AssessmentInput>) => void;
}

export const Step2Expenses: React.FC<Step2Props> = ({ data, onChange }) => {
  const monthly = Number(data.monthly_expenses || 0);
  const annualized = monthly * 12;
  const adjusted75 = Math.round(annualized * 0.75);

  return (
    <div className="space-y-8">
      
      {/* Step Header */}
      <div className="border-b border-[#E6E4DF] pb-5">
        <span className="text-[10px] font-mono uppercase tracking-widest text-[#1D4ED8] font-bold">
          Stage 02 / 07 · Ongoing Living Costs
        </span>
        <h2 className="text-2xl font-serif text-[#0B132B] font-medium mt-1">
          Household Living Expenses
        </h2>
        <p className="text-xs text-[#475569] mt-1 leading-relaxed">
          What your family requires every month to sustain shelter, food, healthcare, utilities, and daily standard of living.
        </p>
      </div>

      <div className="space-y-6">
        
        {/* Large Prominent Expense Input */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <label className="text-xs font-mono uppercase tracking-wider text-[#0B132B] font-semibold">
              Monthly Household Spending
            </label>
            <span className="text-xs font-mono font-bold text-[#1D4ED8]">
              ${monthly.toLocaleString()} / month
            </span>
          </div>

          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#64748B] font-mono font-bold text-lg">
              $
            </div>
            <input
              type="number"
              min={100}
              step={100}
              value={data.monthly_expenses || ''}
              onChange={(e) => onChange({ monthly_expenses: Math.max(1, Number(e.target.value)) })}
              placeholder="4,200"
              className="w-full pl-10 pr-4 py-3.5 text-xl font-mono bg-white border border-[#E6E4DF] rounded-sm focus:outline-none focus:border-[#1D4ED8] transition-all text-[#0B132B]"
            />
          </div>

          <div className="flex items-center space-x-3 pt-1">
            <input
              type="range"
              min={1000}
              max={20000}
              step={250}
              value={data.monthly_expenses || 4200}
              onChange={(e) => onChange({ monthly_expenses: Number(e.target.value) })}
              className="flex-1 accent-[#1D4ED8] h-1.5 bg-[#E6E4DF] rounded-sm cursor-pointer"
            />
          </div>

          <div className="text-[11px] font-mono text-[#64748B]">
            Excludes loan EMIs (mortgages and car loans are entered as capital payoffs in Stage 03).
          </div>
        </div>

        {/* 2-Column Actuarial Benchmark Calculations */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          
          <div className="p-5 bg-[#FAF9F5] border border-[#E6E4DF] rounded-sm">
            <div className="text-[10px] font-mono uppercase tracking-wider text-[#64748B] mb-1">
              Gross Annualized Run-Rate
            </div>
            <div className="font-serif text-2xl text-[#0B132B] font-normal">
              ${annualized.toLocaleString()}
              <span className="text-xs font-mono text-[#64748B] ml-1.5">/ year</span>
            </div>
            <p className="text-[11px] text-[#475569] mt-2 leading-relaxed">
              12 months of uninterrupted household living expenses.
            </p>
          </div>

          <div className="p-5 bg-white border border-[#E6E4DF] rounded-sm">
            <div className="text-[10px] font-mono uppercase tracking-wider text-[#047857] font-semibold mb-1">
              Fiduciary Adjusted Need (75% Rule)
            </div>
            <div className="font-serif text-2xl text-[#047857] font-normal">
              ${adjusted75.toLocaleString()}
              <span className="text-xs font-mono text-[#64748B] ml-1.5">/ year</span>
            </div>
            <p className="text-[11px] text-[#475569] mt-2 leading-relaxed">
              Standard deduction accounts for the primary earner's personal consumption.
            </p>
          </div>

        </div>

        {/* Fiduciary Guideline Callout */}
        <div className="p-4 bg-white border border-[#E6E4DF] rounded-sm text-xs text-[#475569] flex items-start space-x-3">
          <HelpCircle className="w-4 h-4 text-[#1D4ED8] shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <strong className="text-[#0B132B]">Important distinction:</strong> Do not include monthly mortgage payments here. In Capital Needs Analysis, loans are fully paid off in Stage 03 so your family owns their home outright with zero ongoing debt service.
          </div>
        </div>

      </div>

    </div>
  );
};
