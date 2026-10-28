import React from 'react';
import { User, DollarSign, Users, Calendar, Clock, HelpCircle } from 'lucide-react';
import { AssessmentInput } from '../../types';

interface Step1Props {
  data: AssessmentInput;
  onChange: (updates: Partial<AssessmentInput>) => void;
}

export const Step1Personal: React.FC<Step1Props> = ({ data, onChange }) => {
  return (
    <div className="space-y-8">
      
      {/* Step Header */}
      <div className="border-b border-[#E6E4DF] pb-5">
        <span className="text-[10px] font-mono uppercase tracking-widest text-[#1D4ED8] font-bold">
          Stage 01 / 07 · Baseline Demographics
        </span>
        <h2 className="text-2xl font-serif text-[#0B132B] font-medium mt-1">
          Household & Income Profile
        </h2>
        <p className="text-xs text-[#475569] mt-1 leading-relaxed">
          Your age, current gross earnings, and family commitments establish the foundation for the Capital Needs annuity timeline.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Full Name */}
        <div className="space-y-2">
          <label className="block text-xs font-mono uppercase tracking-wider text-[#0B132B] font-semibold">
            Primary Earner / Client Name
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#64748B]">
              <User className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={data.full_name}
              onChange={(e) => onChange({ full_name: e.target.value })}
              placeholder="e.g. Sarah Miller"
              className="w-full pl-10 pr-4 py-3 text-sm bg-white border border-[#E6E4DF] rounded-sm focus:outline-none focus:border-[#1D4ED8] font-sans transition-all text-[#0B132B]"
            />
          </div>
          <span className="text-[11px] font-mono text-[#64748B] block">
            Used to title your personalized advisory memorandum.
          </span>
        </div>

        {/* Current Age */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className="text-xs font-mono uppercase tracking-wider text-[#0B132B] font-semibold">
              Current Age
            </label>
            <span className="text-xs font-mono font-bold text-[#1D4ED8]">
              {data.age} Years Old
            </span>
          </div>
          <div className="flex items-center space-x-3">
            <input
              type="range"
              min={18}
              max={75}
              value={data.age || 35}
              onChange={(e) => onChange({ age: Number(e.target.value) })}
              className="flex-1 accent-[#1D4ED8] h-1.5 bg-[#E6E4DF] rounded-sm cursor-pointer"
            />
            <input
              type="number"
              min={18}
              max={75}
              value={data.age || ''}
              onChange={(e) => onChange({ age: Math.max(18, Math.min(75, Number(e.target.value))) })}
              className="w-20 px-3 py-2 text-center text-sm font-mono bg-white border border-[#E6E4DF] rounded-sm focus:outline-none focus:border-[#1D4ED8]"
            />
          </div>
          <span className="text-[11px] font-mono text-[#64748B] block">
            Establishes remaining career timeline and mortality risk band.
          </span>
        </div>

        {/* Gross Annual Income */}
        <div className="space-y-2">
          <label className="block text-xs font-mono uppercase tracking-wider text-[#0B132B] font-semibold">
            Gross Annual Income ($)
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#64748B] font-mono font-bold text-sm">
              $
            </div>
            <input
              type="number"
              min={0}
              step={1000}
              value={data.annual_income || ''}
              onChange={(e) => onChange({ annual_income: Math.max(0, Number(e.target.value)) })}
              placeholder="95,000"
              className="w-full pl-9 pr-4 py-3 text-sm font-mono bg-white border border-[#E6E4DF] rounded-sm focus:outline-none focus:border-[#1D4ED8] transition-all text-[#0B132B]"
            />
          </div>
          <span className="text-[11px] font-mono text-[#64748B] block">
            Pre-tax household earnings before deductions.
          </span>
        </div>

        {/* Financially Dependent Members */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className="text-xs font-mono uppercase tracking-wider text-[#0B132B] font-semibold">
              Financial Dependents
            </label>
            <span className="text-xs font-mono font-bold text-[#0B132B]">
              {data.dependents_count} {data.dependents_count === 1 ? 'Person' : 'People'}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            {[0, 1, 2, 3, 4, 5].map((count) => (
              <button
                key={count}
                type="button"
                onClick={() => onChange({ dependents_count: count })}
                className={`flex-1 py-2.5 text-xs font-mono rounded-sm border transition-all ${
                  data.dependents_count === count
                    ? 'border-[#1D4ED8] bg-[#1D4ED8] text-white font-bold'
                    : 'border-[#E6E4DF] bg-white text-[#475569] hover:bg-[#FAF9F5]'
                }`}
              >
                {count === 5 ? '5+' : count}
              </button>
            ))}
          </div>
          <span className="text-[11px] font-mono text-[#64748B] block">
            Spouse, minor children, or elderly parents relying on your income.
          </span>
        </div>

        {/* Planned Retirement Age */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className="text-xs font-mono uppercase tracking-wider text-[#0B132B] font-semibold">
              Planned Retirement Age
            </label>
            <span className="text-xs font-mono font-bold text-[#0B132B]">
              Age {data.retirement_age || 60}
            </span>
          </div>
          <div className="flex items-center space-x-3">
            <input
              type="range"
              min={45}
              max={75}
              value={data.retirement_age || 60}
              onChange={(e) => onChange({ retirement_age: Number(e.target.value) })}
              className="flex-1 accent-[#1D4ED8] h-1.5 bg-[#E6E4DF] rounded-sm cursor-pointer"
            />
            <input
              type="number"
              min={45}
              max={75}
              value={data.retirement_age || 60}
              onChange={(e) => onChange({ retirement_age: Math.max(45, Math.min(75, Number(e.target.value))) })}
              className="w-20 px-3 py-2 text-center text-sm font-mono bg-white border border-[#E6E4DF] rounded-sm focus:outline-none focus:border-[#1D4ED8]"
            />
          </div>
          <span className="text-[11px] font-mono text-[#64748B] block">
            Point at which personal life insurance protection typically sunsets.
          </span>
        </div>

        {/* Income Replacement Horizon */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className="text-xs font-mono uppercase tracking-wider text-[#0B132B] font-semibold">
              Support Horizon
            </label>
            <span className="text-xs font-mono font-bold text-[#1D4ED8]">
              {data.replacement_horizon_years || 15} Years
            </span>
          </div>
          <div className="flex items-center space-x-3">
            <input
              type="range"
              min={5}
              max={35}
              value={data.replacement_horizon_years || 15}
              onChange={(e) => onChange({ replacement_horizon_years: Number(e.target.value) })}
              className="flex-1 accent-[#1D4ED8] h-1.5 bg-[#E6E4DF] rounded-sm cursor-pointer"
            />
            <input
              type="number"
              min={1}
              max={40}
              value={data.replacement_horizon_years || 15}
              onChange={(e) => onChange({ replacement_horizon_years: Math.max(1, Math.min(40, Number(e.target.value))) })}
              className="w-20 px-3 py-2 text-center text-sm font-mono bg-white border border-[#E6E4DF] rounded-sm focus:outline-none focus:border-[#1D4ED8]"
            />
          </div>
          <span className="text-[11px] font-mono text-[#64748B] block">
            Years dependents require ongoing financial income continuity.
          </span>
        </div>

      </div>

    </div>
  );
};
