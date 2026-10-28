import React from 'react';
import { CalculationResult } from '../../types';

interface ChartProps {
  result: CalculationResult;
}

export const GoalsDistributionChart: React.FC<ChartProps> = ({ result }) => {
  const gross = result.total_gross_protection_need || 1;

  const items = [
    {
      label: 'Living Expense Replacement (PV)',
      sublabel: `${result.assumptions_used?.replacement_horizon_years || 15} Years @ ${((result.assumptions_used?.real_rate || 0.0189) * 100).toFixed(2)}% real rate`,
      amount: result.income_replacement_pv || 0,
      color: 'bg-[#0B132B]',
    },
    {
      label: 'Outstanding Debt Liquidation',
      sublabel: 'Immediate clearance of mortgage, auto, and consumer debt',
      amount: result.total_liabilities || 0,
      color: 'bg-rose-700',
    },
    {
      label: 'Discrete Future Milestones',
      sublabel: 'Children university education & milestone commitments',
      amount: result.total_future_goals_pv || 0,
      color: 'bg-[#1D4ED8]',
    },
    {
      label: 'Emergency Family Contingency Buffer',
      sublabel: '6 months immediate household living cash reserves',
      amount: result.additional_family_reserve || 0,
      color: 'bg-[#047857]',
    },
  ].filter((item) => item.amount > 0);

  return (
    <div className="space-y-6 py-2">
      <div className="space-y-4">
        {items.map((item, idx) => {
          const pct = Math.round((item.amount / gross) * 100);
          return (
            <div key={idx} className="space-y-1.5">
              <div className="flex justify-between items-baseline text-xs font-mono">
                <div>
                  <span className="font-semibold text-[#0B132B]">{item.label}</span>
                  <span className="text-[#64748B] text-[11px] block">{item.sublabel}</span>
                </div>
                <div className="text-right">
                  <span className="font-bold text-[#0B132B]">${item.amount.toLocaleString()}</span>
                  <span className="text-[#64748B] text-[11px] ml-2">({pct}%)</span>
                </div>
              </div>

              {/* Progress Line */}
              <div className="h-2 w-full bg-[#E6E4DF] rounded-sm overflow-hidden">
                <div
                  style={{ width: `${pct}%` }}
                  className={`h-full ${item.color} rounded-sm transition-all duration-500`}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="pt-4 border-t border-[#E6E4DF] flex justify-between items-center text-xs font-mono">
        <span className="text-[#64748B] uppercase tracking-wider text-[11px]">Gross Total Obligations</span>
        <span className="font-serif text-lg font-bold text-[#0B132B]">${gross.toLocaleString()}</span>
      </div>
    </div>
  );
};
