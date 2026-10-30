import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { CalculationResult } from '../../types';

interface ChartProps {
  result: CalculationResult;
}

export const BreakdownWaterfallChart: React.FC<ChartProps> = ({ result }) => {
  const data = [
    {
      name: 'Living PV',
      fullLabel: 'Income Replacement (PV)',
      amount: result.income_replacement_pv,
      type: 'Gross Obligation',
      color: '#0B132B',
    },
    {
      name: 'Debt Payoff',
      fullLabel: 'Debt & Liabilities Liquidation',
      amount: result.total_liabilities,
      type: 'Gross Obligation',
      color: '#1E293B',
    },
    {
      name: 'Milestones',
      fullLabel: 'Future Goals (College/Reserves)',
      amount: result.total_future_goals_pv,
      type: 'Gross Obligation',
      color: '#334155',
    },
    {
      name: 'Reserve Buffer',
      fullLabel: '6-Mo Emergency Living Buffer',
      amount: result.additional_family_reserve,
      type: 'Gross Obligation',
      color: '#64748B',
    },
    {
      name: 'Liquid Assets',
      fullLabel: 'Eligible Liquid Assets (Offset)',
      amount: -result.eligible_existing_assets,
      type: 'Capital Offset',
      color: '#047857',
    },
    {
      name: 'Existing Cover',
      fullLabel: 'In-Force Life Cover (Offset)',
      amount: -result.existing_life_cover,
      type: 'Capital Offset',
      color: '#059669',
    },
    {
      name: 'Net Gap',
      fullLabel: 'Recommended Additional Cover Need',
      amount: result.net_additional_cover,
      type: 'Net Capital Gap',
      color: '#1D4ED8',
    },
  ];

  const formatCurrency = (val: number) => {
    return `$${Math.abs(val).toLocaleString()}`;
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      return (
        <div className="bg-white text-[#0B132B] p-3 rounded-sm shadow-md text-xs border border-[#E6E4DF] font-mono">
          <p className="text-[10px] text-[#64748B] uppercase tracking-wider">{item.type}</p>
          <p className="font-bold text-[#0B132B] mt-0.5">{item.fullLabel}</p>
          <p className="text-sm font-bold text-[#1D4ED8] mt-1">
            {item.amount < 0 ? `-${formatCurrency(item.amount)}` : formatCurrency(item.amount)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-72">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 20, right: 10, left: 10, bottom: 20 }}>
          <CartesianGrid strokeDasharray="2 2" vertical={false} stroke="#E6E4DF" />
          <XAxis
            dataKey="name"
            tick={{ fill: '#475569', fontSize: 10, fontFamily: 'monospace' }}
            axisLine={{ stroke: '#E6E4DF' }}
            tickLine={false}
          />
          <YAxis
            tickFormatter={(v) => `$${Math.abs(v) >= 1000 ? `${(Math.abs(v) / 1000).toFixed(0)}k` : Math.abs(v)}`}
            tick={{ fill: '#64748B', fontSize: 10, fontFamily: 'monospace' }}
            axisLine={{ stroke: '#E6E4DF' }}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="amount" radius={[2, 2, 0, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
