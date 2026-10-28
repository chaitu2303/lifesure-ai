import React, { useState, useEffect } from 'react';
import {
  Sliders,
  RefreshCw,
  ArrowRight,
  ArrowLeft,
  Calendar,
  HelpCircle,
  TrendingUp,
  ShieldCheck,
  AlertCircle,
  Sparkles
} from 'lucide-react';
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
import { CalculationResult, AssessmentInput, SimulationRequest, SimulationResponse } from '../../types';
import { api } from '../../services/api';
import { formatINR, formatCrores, formatPercent } from '../../utils/formatters';

interface SimulatorProps {
  baseResult: CalculationResult;
  baseInput: AssessmentInput;
  onBackToDashboard: () => void;
  onOpenBooking: () => void;
}

export const WhatIfSimulator: React.FC<SimulatorProps> = ({
  baseResult,
  baseInput,
  onBackToDashboard,
  onOpenBooking,
}) => {
  // Simulator Controls matching Screen 7 in reference image
  const [coverageAmount, setCoverageAmount] = useState<number>(
    baseResult.total_gross_protection_need || 10000000
  );
  const [policyTenure, setPolicyTenure] = useState<number>(20);
  const [monthlyBudget, setMonthlyBudget] = useState<number>(1500);
  const [inflationRate, setInflationRate] = useState<number>(6);

  const [simResult, setSimResult] = useState<SimulationResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  // Current resources (Existing cover + Assets)
  const currentResources = (baseResult.existing_life_cover || 2000000) + (baseResult.eligible_existing_assets || 1500000);
  const projectedGap = Math.max(0, coverageAmount - currentResources);

  // Dynamic estimated premium for selected coverage and tenure
  const estimatedMonthlyPremium = Math.round(
    (coverageAmount / 10000000) * 1200 * (1 + (policyTenure - 20) * 0.02)
  );

  const budgetVariance = monthlyBudget - estimatedMonthlyPremium;
  const isBudgetSufficient = budgetVariance >= 0;

  // Real-time calculation update
  useEffect(() => {
    let cancelled = false;

    async function runSim() {
      try {
        setLoading(true);
        const req: SimulationRequest = {
          base_annual_income: baseInput.annual_income,
          base_monthly_expenses: baseInput.monthly_expenses,
          base_dependents_count: baseInput.dependents_count,
          base_liabilities: baseResult.total_liabilities,
          base_future_goals: baseResult.total_future_goals_pv,
          base_existing_assets: baseResult.eligible_existing_assets,
          base_existing_cover: baseResult.existing_life_cover,
          simulated_replacement_years: policyTenure,
          simulated_inflation_rate: inflationRate / 100,
          simulated_discount_rate: 0.08,
          simulated_monthly_budget: monthlyBudget,
          simulated_desired_cover_override: coverageAmount,
          simulated_goals_scaling: 1.0,
        };

        const res = await api.runSimulation(req);
        if (!cancelled) setSimResult(res);
      } catch (err) {
        console.warn('Simulation API call fallback:', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    const t = setTimeout(runSim, 100);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [coverageAmount, policyTenure, monthlyBudget, inflationRate]);

  const chartData = [
    { name: 'Total Need', amount: coverageAmount, color: '#1D4ED8' },
    { name: 'Current Resources', amount: currentResources, color: '#0D9488' },
    { name: 'Coverage Gap', amount: projectedGap, color: '#EF4444' },
  ];

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      
      {/* Header matching Screen 7 in Reference Image */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#E6E4DF] gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono">
            <span className="font-bold text-[#1D4ED8]">What-If Simulator</span>
            <span className="text-slate-300">&bull;</span>
            <span className="text-slate-500">Interactive Scenario Stress-Testing</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-semibold text-[#0B132B] mt-0.5">
            See How Different Choices Impact Your Coverage
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Adjust the parameters below to explore custom protection horizons, budgets, and inflation scenarios.
          </p>
        </div>

        <button
          onClick={onBackToDashboard}
          className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-full text-xs font-semibold text-slate-600 hover:text-slate-900 border border-slate-200 bg-white"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Plan</span>
        </button>
      </div>

      {/* Main Grid: Controls on Left, Projected Chart on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN (6 cols): Working Interactive Sliders */}
        <div className="lg:col-span-6 bg-white p-6 sm:p-8 rounded-3xl border border-[#E6E4DF] shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
            <h3 className="font-serif text-lg font-bold text-[#0B132B]">
              Simulation Parameters
            </h3>
            <button
              onClick={() => {
                setCoverageAmount(baseResult.total_gross_protection_need || 10000000);
                setPolicyTenure(20);
                setMonthlyBudget(1500);
                setInflationRate(6);
              }}
              className="text-xs text-slate-500 hover:text-[#1D4ED8] flex items-center space-x-1 font-mono"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          </div>

          <div className="space-y-6">
            
            {/* Slider 1: Coverage Amount */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700">
                  Coverage Amount (Target Protection)
                </label>
                <span className="font-mono text-sm font-bold text-[#1D4ED8]">
                  {formatINR(coverageAmount)}
                </span>
              </div>
              <input
                type="range"
                min="2500000"
                max="50000000"
                step="500000"
                value={coverageAmount}
                onChange={(e) => setCoverageAmount(Number(e.target.value))}
                className="w-full accent-[#1D4ED8] cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>₹ 25 Lakhs</span>
                <span>₹ 1 Crore</span>
                <span>₹ 5 Crores</span>
              </div>
            </div>

            {/* Slider 2: Policy Tenure */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700">
                  Policy Tenure
                </label>
                <span className="font-mono text-sm font-bold text-[#0B132B]">
                  {policyTenure} years
                </span>
              </div>
              <input
                type="range"
                min="10"
                max="40"
                step="5"
                value={policyTenure}
                onChange={(e) => setPolicyTenure(Number(e.target.value))}
                className="w-full accent-[#1D4ED8] cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>10 Yrs</span>
                <span>20 Yrs</span>
                <span>30 Yrs</span>
                <span>40 Yrs</span>
              </div>
            </div>

            {/* Slider 3: Monthly Insurance Budget */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700">
                  Monthly Premium Budget
                </label>
                <span className="font-mono text-sm font-bold text-emerald-600">
                  {formatINR(monthlyBudget)} / mo
                </span>
              </div>
              <input
                type="range"
                min="500"
                max="10000"
                step="250"
                value={monthlyBudget}
                onChange={(e) => setMonthlyBudget(Number(e.target.value))}
                className="w-full accent-emerald-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>₹ 500</span>
                <span>₹ 1,500</span>
                <span>₹ 5,000</span>
                <span>₹ 10,000</span>
              </div>
            </div>

            {/* Slider 4: Inflation Assumption */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700">
                  Inflation Assumption
                </label>
                <span className="font-mono text-sm font-bold text-amber-600">
                  {inflationRate}% p.a.
                </span>
              </div>
              <input
                type="range"
                min="3"
                max="12"
                step="0.5"
                value={inflationRate}
                onChange={(e) => setInflationRate(Number(e.target.value))}
                className="w-full accent-amber-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>3% (Low)</span>
                <span>6% (Standard)</span>
                <span>9% (High)</span>
                <span>12%</span>
              </div>
            </div>

          </div>

          {/* Affordability Badge */}
          <div className={`p-4 rounded-2xl border flex items-center justify-between ${
            isBudgetSufficient 
              ? 'bg-emerald-50/80 border-emerald-200 text-emerald-800' 
              : 'bg-amber-50/80 border-amber-200 text-amber-800'
          }`}>
            <div className="space-y-0.5">
              <div className="text-xs font-bold">
                {isBudgetSufficient ? 'Budget Sufficient' : 'Budget Warning'}
              </div>
              <div className="text-[11px] opacity-90">
                Est. Premium: <span className="font-mono font-bold">{formatINR(estimatedMonthlyPremium)}/mo</span> vs. Budget <span className="font-mono font-bold">{formatINR(monthlyBudget)}/mo</span>
              </div>
            </div>
            <span className={`px-2.5 py-1 rounded-full text-xs font-bold font-mono ${
              isBudgetSufficient ? 'bg-emerald-200 text-emerald-900' : 'bg-amber-200 text-amber-900'
            }`}>
              {isBudgetSufficient ? `+${formatINR(budgetVariance)} Surplus` : `${formatINR(budgetVariance)} Deficit`}
            </span>
          </div>

        </div>

        {/* RIGHT COLUMN (6 cols): Projected Coverage Gap Chart & Insight */}
        <div className="lg:col-span-6 bg-white p-6 sm:p-8 rounded-3xl border border-[#E6E4DF] shadow-xs space-y-6">
          
          <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
            <div>
              <h3 className="font-serif text-lg font-bold text-[#0B132B]">
                Projected Coverage Gap
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Dynamic balance comparison under current scenario parameters.
              </p>
            </div>
            <span className="text-[11px] font-mono font-bold text-slate-400">
              Live Projection
            </span>
          </div>

          {/* Bar Chart Matching Screen 7 in Reference Image */}
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 20, right: 20, left: 20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis 
                  dataKey="name" 
                  tick={{ fontSize: 11, fill: '#64748B' }} 
                  axisLine={{ stroke: '#E2E8F0' }} 
                />
                <YAxis 
                  tickFormatter={(val) => formatCrores(val)} 
                  tick={{ fontSize: 11, fill: '#64748B' }} 
                  axisLine={{ stroke: '#E2E8F0' }} 
                />
                <Tooltip 
                  formatter={(val: any) => [formatINR(val), 'Amount']}
                  contentStyle={{ 
                    borderRadius: '12px', 
                    backgroundColor: '#0B132B', 
                    color: '#FFF',
                    fontSize: '12px' 
                  }}
                />
                <Bar dataKey="amount" radius={[8, 8, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* 3 Metric Pills below chart */}
          <div className="grid grid-cols-3 gap-2 text-center pt-2">
            <div className="p-2.5 rounded-xl bg-blue-50/60 border border-blue-100">
              <span className="text-[10px] font-mono text-slate-500 block">Total Need</span>
              <span className="font-mono text-xs sm:text-sm font-bold text-[#1D4ED8]">
                {formatINR(coverageAmount)}
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-teal-50/60 border border-teal-100">
              <span className="text-[10px] font-mono text-slate-500 block">Resources</span>
              <span className="font-mono text-xs sm:text-sm font-bold text-teal-700">
                {formatINR(currentResources)}
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-red-50/60 border border-red-100">
              <span className="text-[10px] font-mono text-slate-500 block">Coverage Gap</span>
              <span className="font-mono text-xs sm:text-sm font-bold text-red-600">
                {formatINR(projectedGap)}
              </span>
            </div>
          </div>

          {/* Advisory guidance box matching reference image note */}
          <div className="p-4 rounded-2xl bg-[#FAF9F5] border border-[#E6E4DF] flex items-start space-x-3 text-xs text-slate-600 leading-relaxed">
            <Sparkles className="w-4 h-4 text-[#1D4ED8] shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-[#0B132B]">Advisory Note: </span>
              Increase your tenure or adjust your budget to reduce the coverage gap. Ensuring inflation is modelled accurately guarantees your child's education fund stays fully insulated.
            </div>
          </div>

          {/* Consultation CTA */}
          <div className="pt-2 flex items-center justify-between">
            <span className="text-xs text-slate-500">
              Need personalized guidance on these numbers?
            </span>
            <button
              onClick={onOpenBooking}
              className="px-5 py-2.5 rounded-full text-xs font-bold text-white bg-[#1D4ED8] hover:bg-[#1E40AF] transition-all shadow-sm active:scale-95"
            >
              Consult an Advisor
            </button>
          </div>

        </div>

      </div>

    </div>
  );
};
