import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { CalculationResult } from '../../types';

interface ChartProps {
  result: CalculationResult;
}

export const ExpenseTimelineChart: React.FC<ChartProps> = ({ result }) => {
  const horizon = result.assumptions_used?.replacement_horizon_years || 15;
  const inflation = result.assumptions_used?.inflation_rate || 0.06;
  const discount = result.assumptions_used?.discount_rate || 0.08;
  const pvIncome = result.income_replacement_pv || 500000;
  const realRate = result.assumptions_used?.real_rate || 0.0189;

  // Approximate annual expense drawn from annuity PV
  const annualExpenseDrawn = (pvIncome * realRate) / (1 - Math.pow(1 + realRate, -horizon));

  // Generate year-by-year timeline
  const data = [];
  let fundBalance = pvIncome;

  for (let year = 1; year <= horizon; year++) {
    const annualLivingCost = Math.round(annualExpenseDrawn * Math.pow(1 + inflation, year - 1));
    fundBalance = Math.max(0, Math.round(fundBalance * (1 + discount) - annualLivingCost));

    data.push({
      year: `Yr ${year}`,
      annualLivingCost,
      fundBalance,
    });
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white text-[#0B132B] p-3 rounded-sm shadow-md text-xs border border-[#E6E4DF] font-mono">
          <p className="font-bold text-[#0B132B]">{label}</p>
          <p className="text-xs text-[#1D4ED8] mt-1">
            Annual Living Draw: ${payload[0]?.value?.toLocaleString()}
          </p>
          <p className="text-xs text-[#047857] mt-0.5">
            Remaining Capital Pool: ${payload[1]?.value?.toLocaleString()}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-72">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 20, right: 10, left: 10, bottom: 20 }}>
          <defs>
            <linearGradient id="colorCost" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#1D4ED8" stopOpacity={0.2} />
              <stop offset="95%" stopColor="#1D4ED8" stopOpacity={0.0} />
            </linearGradient>
            <linearGradient id="colorPool" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#047857" stopOpacity={0.2} />
              <stop offset="95%" stopColor="#047857" stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="2 2" vertical={false} stroke="#E6E4DF" />
          <XAxis
            dataKey="year"
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
          <Legend
            verticalAlign="top"
            height={36}
            formatter={(value) => (
              <span className="text-xs font-mono text-[#0B132B] mx-2">
                {value === 'annualLivingCost' ? 'Annual Inflation-Adjusted Need' : 'Self-Liquidating Capital Pool'}
              </span>
            )}
          />
          <Area
            type="monotone"
            dataKey="annualLivingCost"
            stroke="#1D4ED8"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorCost)"
          />
          <Area
            type="monotone"
            dataKey="fundBalance"
            stroke="#047857"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorPool)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
