import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Calendar,
  Clock,
  ArrowRight,
  RefreshCw,
  Video,
  FileText,
  Sliders,
  CheckCircle2,
  AlertCircle,
  User,
  Settings,
  Layers,
  ChevronRight,
  Heart,
  TrendingUp,
  Award,
  Sparkles,
  Download
} from 'lucide-react';
import { CalculationResult, AssessmentInput, Appointment } from '../../types';
import { api } from '../../services/api';
import { formatINR, formatCrores } from '../../utils/formatters';

interface DashboardProps {
  currentResult: CalculationResult | null;
  currentInput: AssessmentInput | null;
  onStartNewAssessment: () => void;
  onOpenSimulator: () => void;
  onOpenBooking: () => void;
  onViewResults: () => void;
  onJoinVideoRoom: (code: string, advisorName: string, topic: string) => void;
}

export const CustomerDashboard: React.FC<DashboardProps> = ({
  currentResult,
  currentInput,
  onStartNewAssessment,
  onOpenSimulator,
  onOpenBooking,
  onViewResults,
  onJoinVideoRoom,
}) => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const totalNeed = currentResult?.total_gross_protection_need || 10000000;
  const coverageGap = currentResult?.net_additional_cover || 6500000;
  const existingCover = currentResult?.existing_life_cover || 2000000;
  const eligibleAssets = currentResult?.eligible_existing_assets || 1500000;
  const clientName = currentInput?.full_name || 'Chaitanya';

  useEffect(() => {
    async function loadAppointments() {
      try {
        setLoading(true);
        const data = await api.getAppointments();
        setAppointments(data);
      } catch (err) {
        console.warn('Failed to fetch appointments:', err);
      } finally {
        setLoading(false);
      }
    }
    loadAppointments();
  }, []);

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      
      {/* 1. WELCOME & STATUS HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-[#E6E4DF] gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono">
            <span className="font-bold text-[#1D4ED8]">Customer Dashboard</span>
            <span className="text-slate-300">&bull;</span>
            <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-bold border border-emerald-200">
              Active Assessment
            </span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-semibold text-[#0B132B] mt-1">
            Welcome back, {clientName}!
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Here is your clear, actionable financial protection roadmap.
          </p>
        </div>

        <button
          onClick={onStartNewAssessment}
          className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-full text-xs font-bold text-slate-700 hover:text-[#0B132B] bg-white hover:bg-slate-50 border border-slate-200 transition-all shadow-xs self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5 text-[#1D4ED8]" />
          <span>Update Assessment Data</span>
        </button>
      </div>

      {/* 2. ACTIONABLE STRATEGY BANNER (Clear Guidance for User) */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-[#0B132B] via-[#0F1E4A] to-[#1D4ED8] text-white shadow-xl flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/10 text-blue-200 text-xs font-mono border border-white/10">
            <Sparkles className="w-3.5 h-3.5 text-blue-300" />
            <span>Recommended Strategic Action</span>
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-white">
            Secure a {formatCrores(coverageGap)} Pure Term Cover at ~₹1,200/mo
          </h2>
          <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-normal">
            Your family has a calculated <span className="font-bold text-red-300">{formatINR(coverageGap)}</span> protection gap. A 20-year level term policy will fully eliminate outstanding loans and guarantee 15 years of uninterrupted household living expenses.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <button
            onClick={onViewResults}
            className="px-6 py-3 rounded-full text-xs font-bold text-[#0B132B] bg-white hover:bg-slate-100 transition-all shadow-md active:scale-95"
          >
            View Full Protection Plan
          </button>
          <button
            onClick={onOpenSimulator}
            className="px-5 py-3 rounded-full text-xs font-semibold text-white bg-white/10 hover:bg-white/20 border border-white/20 transition-all"
          >
            Adjust in Simulator
          </button>
        </div>
      </div>

      {/* 3. 3 CLEAR METRICS CARDS (Uncluttered, High Contrast) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Card 1: Total Family Protection Need */}
        <div className="bg-white p-6 rounded-3xl border border-[#E6E4DF] shadow-xs flex flex-col justify-between space-y-4 hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase font-mono tracking-wider">
              1. Total Capital Need
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#1D4ED8] flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>

          <div className="space-y-1">
            <div className="font-serif text-3xl sm:text-4xl font-bold text-[#0B132B]">
              {formatINR(totalNeed)}
            </div>
            <div className="text-xs text-slate-500">
              Living Expenses + Liabilities + Goals
            </div>
          </div>

          <button
            onClick={onViewResults}
            className="text-xs font-bold text-[#1D4ED8] hover:underline flex items-center space-x-1 pt-2 border-t border-slate-100"
          >
            <span>View Calculation Proof</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Card 2: Current Available Resources */}
        <div className="bg-white p-6 rounded-3xl border border-[#E6E4DF] shadow-xs flex flex-col justify-between space-y-4 hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase font-mono tracking-wider">
              2. Available Offsets
            </span>
            <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
          </div>

          <div className="space-y-1">
            <div className="font-serif text-3xl sm:text-4xl font-bold text-teal-800">
              {formatINR(existingCover + eligibleAssets)}
            </div>
            <div className="text-xs text-slate-500">
              Cover ({formatINR(existingCover)}) + Savings ({formatINR(eligibleAssets)})
            </div>
          </div>

          <div className="text-xs font-medium text-teal-700 pt-2 border-t border-slate-100 flex items-center space-x-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Self-Insured Assets Credited</span>
          </div>
        </div>

        {/* Card 3: Uncovered Coverage Gap */}
        <div className="bg-white p-6 rounded-3xl border-2 border-red-200 shadow-xs flex flex-col justify-between space-y-4 hover:shadow-md transition-all relative overflow-hidden bg-red-50/20">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-red-700 uppercase font-mono tracking-wider">
              3. Protection Gap
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-red-100 text-red-700 text-[10px] font-bold font-mono">
              Needs Attention
            </span>
          </div>

          <div className="space-y-1">
            <div className="font-serif text-3xl sm:text-4xl font-bold text-red-600">
              {formatINR(coverageGap)}
            </div>
            <div className="text-xs text-slate-500">
              Additional life cover required
            </div>
          </div>

          <button
            onClick={onOpenSimulator}
            className="text-xs font-bold text-red-600 hover:underline flex items-center space-x-1 pt-2 border-t border-red-100"
          >
            <span>Simulate Solutions</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>

      {/* 4. UPCOMING ADVISOR CONSULTATION CARD (Clear, Prominent, Direct Join) */}
      <div className="p-6 sm:p-7 rounded-3xl bg-white border border-[#E6E4DF] shadow-xs flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center space-x-4">
          <div className="w-14 h-14 rounded-2xl overflow-hidden border-2 border-blue-200 shrink-0">
            <img 
              src="./images/advisor_priya.jpg" 
              alt="Priya Sharma" 
              className="w-full h-full object-cover" 
            />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-mono uppercase text-blue-700 font-bold">Upcoming Consultation</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <h3 className="font-serif text-xl font-bold text-[#0B132B]">
              Consultation with Priya Sharma (CFP®)
            </h3>
            <p className="text-xs text-slate-500 flex items-center space-x-2 mt-0.5">
              <span>Thu, 16 Aug &bull; 10:00 AM</span>
              <span>&bull;</span>
              <span className="text-emerald-700 font-semibold">Confirmed Video Session</span>
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3 w-full md:w-auto">
          <button
            onClick={() => onJoinVideoRoom('LS-DEMO', 'Priya Sharma', 'Comprehensive Protection Review')}
            className="flex-1 md:flex-initial px-6 py-3 rounded-full text-xs font-bold text-white bg-[#1D4ED8] hover:bg-[#1E40AF] transition-all shadow-md flex items-center justify-center space-x-2 active:scale-95"
          >
            <Video className="w-4 h-4" />
            <span>Launch Video Consultation Room</span>
          </button>
          <button
            onClick={onOpenBooking}
            className="px-4 py-3 rounded-full text-xs font-semibold text-slate-600 hover:text-slate-900 border border-slate-200 bg-white hover:bg-slate-50 transition-colors"
          >
            Reschedule
          </button>
        </div>
      </div>

      {/* 5. YOUR PROGRESS TIMELINE */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#E6E4DF] shadow-xs space-y-4">
        <h3 className="font-serif text-lg font-bold text-[#0B132B]">
          Your Protection Journey Progress
        </h3>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
          
          <div className="flex items-center space-x-3 p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-100">
            <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-[#0B132B]">Needs Assessment</div>
              <div className="text-[10px] text-emerald-700 font-medium">Completed &bull; Verified</div>
            </div>
          </div>

          <div className="flex items-center space-x-3 p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-100">
            <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-[#0B132B]">Results & Analysis</div>
              <div className="text-[10px] text-emerald-700 font-medium">Calculated &bull; {formatCrores(totalNeed)}</div>
            </div>
          </div>

          <div className="flex items-center space-x-3 p-3.5 rounded-2xl bg-blue-50/70 border border-blue-100">
            <div className="w-8 h-8 rounded-full bg-[#1D4ED8] text-white flex items-center justify-center shrink-0">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-[#0B132B]">Product Mapping</div>
              <div className="text-[10px] text-[#1D4ED8] font-medium">Shortlisted &bull; Term Life</div>
            </div>
          </div>

          <div className="flex items-center space-x-3 p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200">
            <div className="w-8 h-8 rounded-full bg-amber-500 text-white flex items-center justify-center shrink-0">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-amber-950">Advisor Call</div>
              <div className="text-[10px] text-amber-700 font-medium">Ready for Thu 16 Aug</div>
            </div>
          </div>

        </div>
      </div>

      {/* 6. QUICK WORKSPACE ACTIONS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        
        <div 
          onClick={onViewResults}
          className="p-5 rounded-2xl bg-white border border-[#E6E4DF] hover:border-slate-300 hover:shadow-md transition-all cursor-pointer space-y-2 group"
        >
          <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#1D4ED8] flex items-center justify-center">
            <FileText className="w-4 h-4" />
          </div>
          <h4 className="text-sm font-bold text-[#0B132B] group-hover:text-[#1D4ED8] transition-colors">
            Protection Plan Memorandum
          </h4>
          <p className="text-xs text-slate-500 leading-relaxed">
            Full balance sheet breakdown of liabilities, replacement annuity, and milestone goals.
          </p>
        </div>

        <div 
          onClick={onOpenSimulator}
          className="p-5 rounded-2xl bg-white border border-[#E6E4DF] hover:border-slate-300 hover:shadow-md transition-all cursor-pointer space-y-2 group"
        >
          <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
            <Sliders className="w-4 h-4" />
          </div>
          <h4 className="text-sm font-bold text-[#0B132B] group-hover:text-teal-600 transition-colors">
            What-If Scenario Sandbox
          </h4>
          <p className="text-xs text-slate-500 leading-relaxed">
            Adjust inflation, duration, or budget sliders to evaluate financial sensitivity.
          </p>
        </div>

        <div 
          onClick={onOpenBooking}
          className="p-5 rounded-2xl bg-white border border-[#E6E4DF] hover:border-slate-300 hover:shadow-md transition-all cursor-pointer space-y-2 group"
        >
          <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Video className="w-4 h-4" />
          </div>
          <h4 className="text-sm font-bold text-[#0B132B] group-hover:text-amber-600 transition-colors">
            Certified Advisor Support
          </h4>
          <p className="text-xs text-slate-500 leading-relaxed">
            Schedule a 1-on-1 consultation or review policy comparisons with a fiduciary planner.
          </p>
        </div>

      </div>

    </div>
  );
};
