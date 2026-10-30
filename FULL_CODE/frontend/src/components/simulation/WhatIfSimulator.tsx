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
  Sparkles,
  Check,
  CheckCircle2,
  DollarSign
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
import { 
  CalculationResult, 
  AssessmentInput, 
  SimulationRequest, 
  SimulationResponse,
  ProductCatalogueItem,
  RiderItem,
  PremiumQuoteResult
} from '../../types';
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
  // Products and Riders from Catalogue
  const [catalogue, setCatalogue] = useState<ProductCatalogueItem[]>([]);
  const [availableRiders, setAvailableRiders] = useState<RiderItem[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<string>('PRD-X4CBUF');

  // Simulator Controls
  const [coverageAmount, setCoverageAmount] = useState<number>(
    baseResult.total_gross_protection_need || 10000000
  );
  const [policyTenure, setPolicyTenure] = useState<number>(20);
  const [premiumPaymentTerm, setPremiumPaymentTerm] = useState<string>('regular');
  const [premiumMode, setPremiumMode] = useState<string>('monthly');
  const [selectedRiders, setSelectedRiders] = useState<string[]>(['RDR-ACC-01']);
  const [monthlyBudget, setMonthlyBudget] = useState<number>(baseInput.monthly_budget || 2000);
  const [inflationRate, setInflationRate] = useState<number>(5.5);

  // Live Real Quote State from premium engine
  const [quoteResult, setQuoteResult] = useState<PremiumQuoteResult | null>(null);
  const [quoteError, setQuoteError] = useState<string | null>(null);
  const [quoteLoading, setQuoteLoading] = useState<boolean>(false);

  // Load Catalogue & Riders on Mount
  useEffect(() => {
    api.getCatalogueProducts().then((prods) => {
      if (prods && prods.length > 0) setCatalogue(prods);
    }).catch(err => console.warn('Could not load catalogue:', err));

    api.getRiders().then((r) => {
      if (r && r.length > 0) setAvailableRiders(r);
    }).catch(err => console.warn('Could not load riders:', err));
  }, []);

  // Fetch real premium quote whenever parameters change
  useEffect(() => {
    let cancelled = false;

    async function fetchQuote() {
      try {
        setQuoteLoading(true);
        setQuoteError(null);

        const ridersPayload = selectedRiders.map((rid) => ({
          rider_id: rid,
          sum_assured: rid === 'RDR-ACC-01' ? Math.min(5000000, coverageAmount * 0.5) : 2500000,
        }));

        const quote = await api.getRealQuote({
          product_id: selectedProductId,
          age: baseInput.age || 30,
          gender: 'male',
          smoker_status: 'non_smoker',
          sum_assured: coverageAmount,
          policy_term: policyTenure,
          premium_payment_term: premiumPaymentTerm,
          premium_mode: premiumMode,
          riders: ridersPayload,
        });

        if (!cancelled) {
          if (quote.error) {
            setQuoteError(quote.error);
            setQuoteResult(null);
          } else {
            setQuoteResult(quote);
          }
        }
      } catch (err: any) {
        if (!cancelled) {
          setQuoteError(err?.message || 'Unsupported combination for this product tenure.');
          setQuoteResult(null);
        }
      } finally {
        if (!cancelled) setQuoteLoading(false);
      }
    }

    const t = setTimeout(fetchQuote, 150);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [
    selectedProductId,
    coverageAmount,
    policyTenure,
    premiumPaymentTerm,
    premiumMode,
    selectedRiders,
    baseInput.age,
  ]);

  const currentResources = (baseResult.existing_life_cover || 2000000) + (baseResult.eligible_existing_assets || 1500000);
  const projectedGap = Math.max(0, coverageAmount - currentResources);

  const calculatedInstalment = quoteResult ? quoteResult.total_instalment : Math.round((coverageAmount / 10000000) * 1200);
  const budgetVariance = monthlyBudget - calculatedInstalment;
  const isBudgetSufficient = budgetVariance >= 0;

  const chartData = [
    { name: 'Total Need', amount: coverageAmount, color: '#1D4ED8' },
    { name: 'Current Resources', amount: currentResources, color: '#0D9488' },
    { name: 'Coverage Gap', amount: projectedGap, color: '#EF4444' },
  ];

  const currentProduct = catalogue.find((p) => p.product_id === selectedProductId);

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      
      {/* Header matching Screen 7 in Reference Image */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#E6E4DF] gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono">
            <span className="font-bold text-[#1D4ED8]">What-If Simulator</span>
            <span className="text-slate-300">&bull;</span>
            <span className="text-slate-500">Live Rate Quotation Engine</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-semibold text-[#0B132B] mt-0.5">
            Customise Your Policy & Simulate Rates
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Test policy structures against 39,588 real synthetic premium rates from Saffron Life Insurance.
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
        
        {/* LEFT COLUMN (6 cols): Working Interactive Sliders & Product Config */}
        <div className="lg:col-span-6 bg-white p-6 sm:p-8 rounded-3xl border border-[#E6E4DF] shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
            <div>
              <h3 className="font-serif text-lg font-bold text-[#0B132B]">
                Policy Customisation
              </h3>
              <p className="text-[11px] text-slate-500">Choose plan, sum assured, tenure, and mode</p>
            </div>
            <button
              onClick={() => {
                setSelectedProductId('PRD-X4CBUF');
                setCoverageAmount(baseResult.total_gross_protection_need || 10000000);
                setPolicyTenure(20);
                setPremiumPaymentTerm('regular');
                setPremiumMode('monthly');
                setSelectedRiders(['RDR-ACC-01']);
                setMonthlyBudget(baseInput.monthly_budget || 2000);
                setInflationRate(5.5);
              }}
              className="text-xs text-slate-500 hover:text-[#1D4ED8] flex items-center space-x-1 font-mono"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          </div>

          <div className="space-y-5">
            
            {/* Control 0: Product Select */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">
                Select Insurance Product
              </label>
              <select
                value={selectedProductId}
                onChange={(e) => setSelectedProductId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-[#0B132B] focus:border-[#1D4ED8] outline-none"
              >
                {catalogue.length > 0 ? (
                  catalogue.map((p) => (
                    <option key={p.product_id} value={p.product_id}>
                      {p.name} ({p.product_category?.replace('_', ' ').toUpperCase()}) &bull; {p.product_id}
                    </option>
                  ))
                ) : (
                  <>
                    <option value="PRD-X4CBUF">Saffron Term Shield (PRD-X4CBUF)</option>
                    <option value="PRD-7W9ZKQ">Saffron Term Shield Plus (PRD-7W9ZKQ)</option>
                    <option value="PRD-B2M8N1">Saffron Wealth Builder ULIP (PRD-B2M8N1)</option>
                    <option value="PRD-C4D5E6">Saffron Guaranteed Future Endowment (PRD-C4D5E6)</option>
                    <option value="PRD-D7E8F9">Saffron LifeGuard Whole Life (PRD-D7E8F9)</option>
                  </>
                )}
              </select>
            </div>

            {/* Slider 1: Coverage Amount */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700">
                  Sum Assured (Life Cover)
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
                <span>₹ 2.5 Crores</span>
                <span>₹ 5 Crores</span>
              </div>
            </div>

            {/* Grid: Policy Tenure & PPT */}
            <div className="grid grid-cols-2 gap-3">
              {/* Policy Tenure */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 flex justify-between">
                  <span>Policy Term</span>
                  <span className="font-mono text-slate-500">{policyTenure} yrs</span>
                </label>
                <select
                  value={policyTenure}
                  onChange={(e) => setPolicyTenure(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono font-semibold text-[#0B132B] outline-none"
                >
                  {[10, 15, 20, 25, 30, 35, 40].map((t) => (
                    <option key={t} value={t}>{t} Years</option>
                  ))}
                </select>
              </div>

              {/* Premium Payment Term */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">
                  Payment Term (PPT)
                </label>
                <select
                  value={premiumPaymentTerm}
                  onChange={(e) => setPremiumPaymentTerm(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono font-semibold text-[#0B132B] outline-none"
                >
                  <option value="regular">Regular Pay</option>
                  <option value="limited_5">Limited 5 Years</option>
                  <option value="limited_10">Limited 10 Years</option>
                  <option value="limited_15">Limited 15 Years</option>
                </select>
              </div>
            </div>

            {/* Grid: Premium Mode & Monthly Budget */}
            <div className="grid grid-cols-2 gap-3">
              {/* Premium Mode */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">
                  Payment Frequency
                </label>
                <select
                  value={premiumMode}
                  onChange={(e) => setPremiumMode(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono font-semibold text-[#0B132B] outline-none"
                >
                  <option value="monthly">Monthly (Factor: 0.0875)</option>
                  <option value="quarterly">Quarterly (Factor: 0.26)</option>
                  <option value="half_yearly">Half-Yearly (Factor: 0.51)</option>
                  <option value="annual">Annual (Factor: 1.0)</option>
                </select>
              </div>

              {/* Monthly Budget */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 flex justify-between">
                  <span>My Budget</span>
                  <span className="font-mono text-emerald-600 font-bold">{formatINR(monthlyBudget)}</span>
                </label>
                <input
                  type="number"
                  step="250"
                  min="500"
                  value={monthlyBudget}
                  onChange={(e) => setMonthlyBudget(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono font-semibold text-[#0B132B] outline-none"
                />
              </div>
            </div>

            {/* Eligible Riders Multi-Toggle */}
            <div className="space-y-2 pt-1 border-t border-slate-100">
              <label className="text-xs font-bold text-slate-700 block">
                Attach Additional Protective Riders
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {[
                  { id: 'RDR-ACC-01', name: 'Accidental Death Rider', rate: '₹0.50 / 1k' },
                  { id: 'RDR-CI-01', name: 'Critical Illness Benefit', rate: '₹1.25 / 1k' },
                  { id: 'RDR-TPD-01', name: 'Permanent Disability Rider', rate: '₹0.35 / 1k' },
                  { id: 'RDR-WOP-01', name: 'Waiver of Premium Rider', rate: '4% of Base' },
                ].map((r) => {
                  const isChecked = selectedRiders.includes(r.id);
                  return (
                    <label
                      key={r.id}
                      className={`flex items-center space-x-2 p-2.5 rounded-xl border cursor-pointer transition-colors ${
                        isChecked ? 'bg-blue-50/70 border-blue-200 text-[#0B132B]' : 'bg-slate-50 border-slate-200 text-slate-600'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {
                          if (isChecked) {
                            setSelectedRiders(selectedRiders.filter((id) => id !== r.id));
                          } else {
                            setSelectedRiders([...selectedRiders, r.id]);
                          }
                        }}
                        className="accent-[#1D4ED8]"
                      />
                      <div className="truncate">
                        <div className="font-semibold text-[11px] leading-tight truncate">{r.name}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{r.rate}</div>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>

          </div>

          {/* Real Premium Output Card */}
          <div className="p-4 rounded-2xl bg-[#0B132B] text-white space-y-3 shadow-md">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300">
                  Actuarial Quote Breakdown
                </span>
              </div>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800">
                Live IRDAI Math
              </span>
            </div>

            {quoteLoading ? (
              <div className="text-xs text-slate-400 py-2 font-mono animate-pulse">
                Calculating exact rate from premium_rates.csv...
              </div>
            ) : quoteError ? (
              <div className="text-xs text-amber-300 bg-amber-950/40 p-2.5 rounded-xl border border-amber-800 flex items-start space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
                <span>{quoteError}</span>
              </div>
            ) : quoteResult ? (
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Base Instalment ({quoteResult.premium_mode}):</span>
                  <span className="font-mono font-bold text-white">{formatINR(quoteResult.base_instalment)}</span>
                </div>
                {quoteResult.riders && quoteResult.riders.length > 0 && (
                  <div className="space-y-1 pl-2 border-l border-slate-800 text-[11px] text-slate-400">
                    {quoteResult.riders.map((r) => (
                      <div key={r.rider_id} className="flex items-center justify-between">
                        <span>+ {r.rider_name}:</span>
                        <span className="font-mono text-slate-300">{formatINR(r.instalment)}</span>
                      </div>
                    ))}
                  </div>
                )}
                <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                  <span className="font-semibold text-slate-200">Total Instalment ({quoteResult.premium_mode}):</span>
                  <span className="font-mono text-base font-extrabold text-emerald-400">
                    {formatINR(quoteResult.total_instalment)}
                  </span>
                </div>
                <div className="text-[10px] text-slate-400 flex justify-between">
                  <span>Modal Factor Applied: {quoteResult.modal_factor}</span>
                  <span>Annual Equivalent: {formatINR(quoteResult.total_annual_payable || 0)}</span>
                </div>
              </div>
            ) : null}

            {/* Affordability Badge */}
            <div className={`p-2.5 rounded-xl border flex items-center justify-between ${
              isBudgetSufficient 
                ? 'bg-emerald-950/40 border-emerald-800 text-emerald-200' 
                : 'bg-amber-950/40 border-amber-800 text-amber-200'
            }`}>
              <div className="text-[11px]">
                <strong className="block">{isBudgetSufficient ? 'Within Selected Budget' : 'Exceeds Monthly Budget'}</strong>
                <span className="opacity-80">
                  Budget: {formatINR(monthlyBudget)} &bull; Premium: {formatINR(calculatedInstalment)}
                </span>
              </div>
              <span className={`px-2 py-0.5 rounded text-[11px] font-bold font-mono ${
                isBudgetSufficient ? 'bg-emerald-800 text-emerald-100' : 'bg-amber-800 text-amber-100'
              }`}>
                {isBudgetSufficient ? `+${formatINR(budgetVariance)} Surplus` : `${formatINR(budgetVariance)} Shortfall`}
              </span>
            </div>
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
