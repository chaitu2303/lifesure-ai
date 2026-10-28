import React from 'react';
import { Shield, TrendingUp, AlertTriangle, Check, DollarSign } from 'lucide-react';
import { AssessmentInput } from '../../types';

interface Step6Props {
  data: AssessmentInput;
  onChange: (updates: Partial<AssessmentInput>) => void;
}

export const Step6Preferences: React.FC<Step6Props> = ({ data, onChange }) => {
  const riskProfiles = [
    {
      id: 'conservative',
      title: 'Conservative & Guaranteed',
      desc: 'Capital preservation first. Prioritize fixed guaranteed maturity benefits with zero exposure to equity volatility.',
      badge: 'Guaranteed Structures',
      icon: Shield,
    },
    {
      id: 'moderate',
      title: 'Fiduciary Balanced',
      desc: 'Maximize pure protection efficiency with low-cost term life, directing premium savings toward diversified investments.',
      badge: 'Term + Liquid Reserve',
      icon: TrendingUp,
    },
    {
      id: 'aggressive',
      title: 'Growth / Market-Linked',
      desc: 'Comfortable with equity NAV fluctuations to capture higher long-term compounding over a 15–20 year time horizon.',
      badge: 'Market-Linked / ULIP',
      icon: AlertTriangle,
    },
  ];

  const budget = Number(data.monthly_budget || 0);

  return (
    <div className="space-y-8">
      
      {/* Step Header */}
      <div className="border-b border-[#E6E4DF] pb-5">
        <span className="text-[10px] font-mono uppercase tracking-widest text-[#1D4ED8] font-bold">
          Stage 06 / 07 · Allocation & Risk
        </span>
        <h2 className="text-2xl font-serif text-[#0B132B] font-medium mt-1">
          Budget Constraints & Risk Philosophy
        </h2>
        <p className="text-xs text-[#475569] mt-1 leading-relaxed">
          Your sustainable monthly cash flow determines whether high-leverage pure protection or savings-oriented policies are feasible.
        </p>
      </div>

      {/* Target Monthly Premium Budget */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <label className="text-xs font-mono uppercase tracking-wider text-[#0B132B] font-semibold">
            Target Monthly Premium Allocation
          </label>
          <span className="text-xs font-mono font-bold text-[#1D4ED8]">
            ${budget.toLocaleString()} / month
          </span>
        </div>

        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#64748B] font-mono font-bold text-lg">
            $
          </div>
          <input
            type="number"
            min={0}
            step={25}
            value={data.monthly_budget || ''}
            onChange={(e) => onChange({ monthly_budget: Math.max(0, Number(e.target.value)) })}
            placeholder="120"
            className="w-full pl-10 pr-4 py-3.5 text-xl font-mono bg-white border border-[#E6E4DF] rounded-sm focus:outline-none focus:border-[#1D4ED8] transition-all text-[#0B132B]"
          />
        </div>

        <div className="flex items-center space-x-3 pt-1">
          <input
            type="range"
            min={25}
            max={1000}
            step={25}
            value={data.monthly_budget || 120}
            onChange={(e) => onChange({ monthly_budget: Number(e.target.value) })}
            className="flex-1 accent-[#1D4ED8] h-1.5 bg-[#E6E4DF] rounded-sm cursor-pointer"
          />
        </div>

        <span className="text-[11px] font-mono text-[#64748B] block">
          Our recommendation matrix will verify whether your coverage requirement is fully achievable within this cash-flow cap.
        </span>
      </div>

      {/* Risk Tolerance Philosophy */}
      <div className="space-y-3 pt-4 border-t border-[#E6E4DF]">
        <label className="text-xs font-mono uppercase tracking-wider text-[#0B132B] font-semibold block">
          Investment & Risk Philosophy
        </label>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {riskProfiles.map((p) => {
            const isSelected = data.risk_profile === p.id;
            const Icon = p.icon;
            return (
              <div
                key={p.id}
                onClick={() => onChange({ risk_profile: p.id as any })}
                className={`p-5 rounded-sm border cursor-pointer transition-all flex flex-col justify-between ${
                  isSelected
                    ? 'bg-white border-[#1D4ED8] ring-1 ring-[#1D4ED8] shadow-sm'
                    : 'bg-[#FAF9F5] border-[#E6E4DF] hover:bg-white hover:border-[#0B132B]/40'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#E6E4DF]">
                    <span className={`text-[10px] font-mono uppercase tracking-wider ${
                      isSelected ? 'text-[#1D4ED8] font-bold' : 'text-[#64748B]'
                    }`}>
                      {p.badge}
                    </span>
                    {isSelected && (
                      <div className="w-4 h-4 rounded-full bg-[#1D4ED8] text-white flex items-center justify-center">
                        <Check className="w-2.5 h-2.5" />
                      </div>
                    )}
                  </div>
                  <h4 className="font-serif text-base text-[#0B132B] font-medium mb-1.5">
                    {p.title}
                  </h4>
                  <p className="text-xs text-[#475569] leading-relaxed">
                    {p.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
