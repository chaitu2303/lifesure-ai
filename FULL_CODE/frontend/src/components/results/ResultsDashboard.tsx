import React, { useState } from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  ArrowRight,
  ArrowLeft,
  Printer,
  Sliders,
  CheckCircle2,
  HelpCircle,
  FileText,
  TrendingUp,
  Scale,
  Calendar,
  Calculator,
  Download,
  Info
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { CalculationResult, AssessmentInput } from '../../types';
import { formatINR, formatCrores, formatLakhs } from '../../utils/formatters';
import { BreakdownWaterfallChart } from './BreakdownWaterfallChart';
import { GoalsDistributionChart } from './GoalsDistributionChart';
import { ExpenseTimelineChart } from './ExpenseTimelineChart';
import { CalculationMethodologyModal } from './CalculationMethodologyModal';

interface DashboardProps {
  result: CalculationResult;
  input: AssessmentInput;
  onExploreRecommendations: () => void;
  onOpenSimulator: () => void;
  onPrintReport: () => void;
  onBookAdvisor: () => void;
  onReviseAssessment: () => void;
}

export const ResultsDashboard: React.FC<DashboardProps> = ({
  result,
  input,
  onExploreRecommendations,
  onOpenSimulator,
  onPrintReport,
  onBookAdvisor,
  onReviseAssessment,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'breakdown' | 'timeline'>('overview');
  const [isMethodologyOpen, setIsMethodologyOpen] = useState<boolean>(false);

  const grossNeed = result.total_gross_protection_need || 10000000;
  const coverageGap = result.net_additional_cover || 6500000;
  const existingCover = result.existing_life_cover || 2000000;
  const eligibleAssets = result.eligible_existing_assets || 1500000;

  // Breakdown percentages
  const incomePv = result.income_replacement_pv || 4500000;
  const liabilities = result.total_liabilities || 2500000;
  const goalsPv = result.total_future_goals_pv || 2000000;
  const reserve = result.additional_family_reserve || 1000000;

  const incomePct = Math.round((incomePv / grossNeed) * 100);
  const liabilitiesPct = Math.round((liabilities / grossNeed) * 100);
  const goalsPct = Math.round((goalsPv / grossNeed) * 100);
  const reservePct = Math.max(0, 100 - incomePct - liabilitiesPct - goalsPct);

  const donutData = [
    { name: 'Income Replacement', value: incomePct || 45, color: '#0D9488', amount: incomePv },
    { name: 'Outstanding Liabilities', value: liabilitiesPct || 25, color: '#2563EB', amount: liabilities },
    { name: 'Future Goals', value: goalsPct || 20, color: '#06B6D4', amount: goalsPv },
    { name: 'Family Reserve', value: reservePct || 10, color: '#4F46E5', amount: reserve },
  ];

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      
      {/* Top Breadcrumb & Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#E6E4DF] gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono">
            <span className="font-bold text-[#1D4ED8]">3. Results</span>
            <span className="text-slate-300">&bull;</span>
            <span className="text-slate-500">Analysis 3/4</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-semibold text-[#0B132B] mt-0.5">
            Your Life Insurance Needs
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Based on your inputs, here is your personalised analysis.
          </p>
        </div>

        {/* Quick Toolbar */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsMethodologyOpen(true)}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg shadow-xs transition-colors"
          >
            <Calculator className="w-3.5 h-3.5 text-[#1D4ED8]" />
            <span className="hidden sm:inline">Calculation Logic</span>
          </button>

          <button
            onClick={onPrintReport}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg shadow-xs transition-colors"
          >
            <Printer className="w-3.5 h-3.5 text-slate-500" />
            <span className="hidden sm:inline">Download PDF</span>
          </button>

          <button
            onClick={onReviseAssessment}
            className="inline-flex items-center space-x-1 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 border border-slate-200 rounded-lg bg-white"
          >
            <span>Revise Inputs</span>
          </button>
        </div>
      </div>

      {/* MAIN HERO CARD MATCHING SCREEN 3 IN REFERENCE IMAGE */}
      <div className="bg-white rounded-3xl border border-[#E6E4DF] shadow-md p-6 sm:p-8 space-y-8">
        
        {/* Top Split: Total Need + Breakdown List + Donut Chart */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* LEFT COLUMN (7 cols): Hero Number + Breakdown Items */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Big bold total need & badge */}
            <div className="space-y-2">
              <div className="flex items-center space-x-3">
                <span className="font-mono text-xs uppercase tracking-wider text-slate-500 font-semibold">
                  Total Financial Protection Need
                </span>
                <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-blue-50 text-[#1D4ED8] text-xs font-semibold border border-blue-100">
                  <ShieldCheck className="w-3 h-3" />
                  <span className="capitalize">{input.risk_profile || 'Moderate'} Risk Profile</span>
                </span>
              </div>

              <div className="flex items-baseline space-x-3">
                <span className="font-serif text-4xl sm:text-5xl font-bold text-[#0B132B] tracking-tight">
                  {formatINR(grossNeed)}
                </span>
                <span className="text-sm font-semibold text-slate-500 font-sans">
                  Total Need
                </span>
              </div>
            </div>

            {/* Breakdown List with Colored Indicators & Percentages */}
            <div className="space-y-3 pt-2">
              {donutData.map((item) => (
                <div 
                  key={item.name}
                  className="flex items-center justify-between p-3 rounded-2xl bg-[#FAF9F5] border border-slate-100 hover:border-slate-200 transition-colors"
                >
                  <div className="flex items-center space-x-2.5">
                    <span 
                      className="w-3 h-3 rounded-full shrink-0 shadow-xs" 
                      style={{ backgroundColor: item.color }} 
                    />
                    <span className="text-xs sm:text-sm font-medium text-slate-700">
                      {item.name}
                    </span>
                  </div>

                  <div className="flex items-center space-x-3 font-mono">
                    <span className="text-xs sm:text-sm font-bold text-[#0B132B]">
                      {formatINR(item.amount)}
                    </span>
                    <span className="text-xs font-semibold text-slate-400 w-10 text-right">
                      ({item.value}%)
                    </span>
                  </div>
                </div>
              ))}
            </div>

          </div>

          {/* RIGHT COLUMN (5 cols): Donut Chart with Centered Total Need */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center p-4 relative">
            <div className="relative w-64 h-64 sm:w-72 sm:h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={donutData}
                    cx="50%"
                    cy="50%"
                    innerRadius={75}
                    outerRadius={105}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {donutData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(val: any, name: any) => [`${val}%`, name]}
                    contentStyle={{ 
                      borderRadius: '12px', 
                      backgroundColor: '#0B132B', 
                      color: '#FFF',
                      fontSize: '12px' 
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>

              {/* Center Donut Label */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
                <span className="font-serif text-2xl sm:text-3xl font-bold text-[#0B132B]">
                  {formatCrores(grossNeed)}
                </span>
                <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-semibold mt-0.5">
                  Total Need
                </span>
              </div>
            </div>
          </div>

        </div>

        {/* BOTTOM BAR SUMMARY MATCHING REFERENCE SCREEN 3 */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-[#E6E4DF]">
          
          {/* Card 1: Existing Life Cover */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between space-y-2">
            <div className="text-xs text-slate-500 font-medium">
              Existing Life Cover
            </div>
            <div className="font-mono text-lg sm:text-xl font-bold text-slate-800">
              {formatINR(existingCover)}
            </div>
            <div className="text-[10px] text-slate-400">
              Active policies sum assured
            </div>
          </div>

          {/* Card 2: Eligible Assets */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between space-y-2">
            <div className="text-xs text-slate-500 font-medium">
              Eligible Assets & Savings
            </div>
            <div className="font-mono text-lg sm:text-xl font-bold text-slate-800">
              {formatINR(eligibleAssets)}
            </div>
            <div className="text-[10px] text-slate-400">
              Self-insurance liquid reserve
            </div>
          </div>

          {/* Card 3: Coverage Gap (Highlighted in Red/Coral) */}
          <div className="p-4 rounded-2xl bg-red-50/80 border-2 border-red-200 flex flex-col justify-between space-y-2 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-xs text-red-700 font-bold uppercase tracking-wider font-mono">
                Coverage Gap
              </span>
              <ShieldAlert className="w-4 h-4 text-red-600" />
            </div>
            <div className="font-mono text-xl sm:text-2xl font-extrabold text-red-600">
              {formatINR(coverageGap)}
            </div>
            <div className="text-[10px] text-red-700 font-semibold">
              Additional cover recommended
            </div>
          </div>

        </div>

        {/* ACTION BUTTONS */}
        <div className="flex flex-col sm:flex-row items-center justify-between pt-4 border-t border-slate-100 gap-4">
          <button
            onClick={onReviseAssessment}
            className="inline-flex items-center space-x-1.5 px-5 py-2.5 rounded-full text-xs font-semibold text-slate-700 hover:text-slate-900 border border-slate-200 bg-white hover:bg-slate-50 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back</span>
          </button>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={onOpenSimulator}
              className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-full text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
            >
              <Sliders className="w-3.5 h-3.5 text-[#1D4ED8]" />
              <span>Simulate What-If Scenarios</span>
            </button>

            <button
              onClick={onExploreRecommendations}
              className="inline-flex items-center space-x-2.5 px-7 py-3 rounded-full text-xs sm:text-sm font-bold text-white bg-[#1D4ED8] hover:bg-[#1E40AF] transition-all shadow-md shadow-blue-500/25 active:scale-95"
            >
              <span>View Recommendations</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>

      {/* SECONDARY DEEP DIVE TABS */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2 border-b border-[#E6E4DF]">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 transition-all ${
              activeTab === 'overview'
                ? 'border-[#1D4ED8] text-[#1D4ED8]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Obligation Balance Sheet
          </button>
          <button
            onClick={() => setActiveTab('breakdown')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 transition-all ${
              activeTab === 'breakdown'
                ? 'border-[#1D4ED8] text-[#1D4ED8]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Waterfall Breakdown
          </button>
          <button
            onClick={() => setActiveTab('timeline')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 transition-all ${
              activeTab === 'timeline'
                ? 'border-[#1D4ED8] text-[#1D4ED8]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Future Goals Timeline
          </button>
        </div>

        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Actuarial Summary */}
            <div className="bg-white p-6 rounded-3xl border border-[#E6E4DF] shadow-xs space-y-4">
              <h4 className="font-serif text-lg font-semibold text-[#0B132B]">
                Actuarial Valuation Formula
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                LifeWise implements the standard Capital Needs Analysis (CNA) equation recognized by the Financial Planning Standards Board (FPSB):
              </p>
              <div className="p-3.5 rounded-xl bg-slate-900 text-slate-200 font-mono text-[11px] leading-relaxed overflow-x-auto">
                Net Cover Gap = max(0, Income PV + Debt Extinguishment + Goals PV + Reserve - Liquid Assets - Existing Cover)
              </div>
              <div className="text-[11px] text-slate-500 space-y-1">
                <div>&bull; Inflation Assumption: 6.0% p.a.</div>
                <div>&bull; Nominal Discount Rate: 8.0% p.a.</div>
                <div>&bull; Fisher Real Rate: 1.89% p.a.</div>
                <div>&bull; Family Expense Replacement Ratio: 75% of income</div>
              </div>
            </div>

            {/* Next Steps Card */}
            <div className="bg-white p-6 rounded-3xl border border-[#E6E4DF] shadow-xs space-y-4 flex flex-col justify-between">
              <div>
                <h4 className="font-serif text-lg font-semibold text-[#0B132B]">
                  Recommended Strategy
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed mt-1">
                  To eliminate your <span className="font-bold text-red-600">{formatINR(coverageGap)}</span> protection gap affordably, we recommend a high-cover pure term policy before considering investment-linked instruments.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-between">
                <div>
                  <div className="text-[11px] text-blue-800 font-semibold">Estimated Monthly Premium</div>
                  <div className="font-mono text-base font-bold text-[#1D4ED8]">
                    {formatINR(result.estimated_monthly_premium_range?.median || 1200)} / mo
                  </div>
                </div>
                <button
                  onClick={onExploreRecommendations}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#1D4ED8] hover:bg-[#1E40AF]"
                >
                  Explore Plans
                </button>
              </div>
            </div>

          </div>
        )}

        {activeTab === 'breakdown' && (
          <div className="bg-white p-6 rounded-3xl border border-[#E6E4DF] shadow-xs">
            <h4 className="font-serif text-base font-semibold text-[#0B132B] mb-4">
              Step-by-Step Capital Need Accumulation vs. Offsets
            </h4>
            <BreakdownWaterfallChart result={result} />
          </div>
        )}

        {activeTab === 'timeline' && (
          <div className="bg-white p-6 rounded-3xl border border-[#E6E4DF] shadow-xs">
            <h4 className="font-serif text-base font-semibold text-[#0B132B] mb-4">
              Future Milestone Inflation & Present Value Timeline
            </h4>
            <ExpenseTimelineChart result={result} />
          </div>
        )}
      </div>

      {/* Actuarial Methodology Modal */}
      <CalculationMethodologyModal
        isOpen={isMethodologyOpen}
        onClose={() => setIsMethodologyOpen(false)}
        assumptions={result.assumptions_used}
      />

    </div>
  );
};
