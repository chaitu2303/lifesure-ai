import React, { useState } from 'react';
import { 
  ArrowRight, 
  Play, 
  ShieldCheck, 
  CheckCircle2, 
  Lock, 
  Award, 
  Users, 
  TrendingUp, 
  Sparkles,
  Info,
  X,
  ChevronRight
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface HeroSectionProps {
  onStartAssessment: () => void;
  onOpenBooking: () => void;
}

const DONUT_DATA = [
  { name: 'Income Replacement', value: 42, color: '#0D9488', amount: '₹ 50,40,000' },
  { name: 'Future Goals', value: 24, color: '#06B6D4', amount: '₹ 28,80,000' },
  { name: 'Liabilities', value: 18, color: '#2563EB', amount: '₹ 21,60,000' },
  { name: 'Family Reserve', value: 10, color: '#4F46E5', amount: '₹ 12,00,000' },
  { name: 'Existing Coverage', value: 6, color: '#38BDF8', amount: '₹ 7,20,000' },
];

export const HeroSection: React.FC<HeroSectionProps> = ({ 
  onStartAssessment, 
  onOpenBooking 
}) => {
  const [activeSegment, setActiveSegment] = useState<number | null>(null);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[#FCFBF9] via-[#FAF9F5] to-white pt-10 pb-16 lg:pb-20 border-b border-[#E6E4DF]">
      
      {/* Ambient background glow */}
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-blue-100/30 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute top-1/3 left-10 w-[400px] h-[400px] bg-amber-100/20 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        
        {/* ROW 1: TWO-COLUMN EXPANSIVE HERO (Spacious, Uncluttered, Authoritative) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          
          {/* LEFT COLUMN (7 cols): Clear Editorial Headline & User Journey */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Eyebrow */}
            <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-blue-50 border border-blue-100 text-[#1D4ED8]">
              <span className="w-2 h-2 rounded-full bg-[#1D4ED8] animate-pulse" />
              <span className="text-[11px] font-mono font-bold tracking-[0.16em] uppercase">
                FINANCIAL PROTECTION, MADE PERSONAL.
              </span>
            </div>

            {/* Headline */}
            <h1 className="font-serif text-4xl sm:text-5xl xl:text-[56px] font-semibold text-[#0B132B] leading-[1.12] tracking-tight">
              Your Family’s Future <br className="hidden sm:inline" />
              Deserves a <span className="text-[#1D4ED8] italic font-normal">Clearer Plan.</span>
            </h1>

            {/* Value Proposition */}
            <p className="text-base sm:text-lg text-slate-600 leading-relaxed font-normal max-w-xl">
              Traditional rules of thumb like "10x annual income" leave families dangerously underinsured. LifeSure AI calculates your true protection gap in 3 minutes using transparent, inflation-adjusted analysis — with zero commission bias.
            </p>

            {/* CTAs */}
            <div className="pt-2 flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
              <button
                onClick={onStartAssessment}
                className="inline-flex items-center justify-center space-x-2.5 px-8 py-4 rounded-full text-sm font-bold text-white bg-[#1D4ED8] hover:bg-[#1E40AF] transition-all shadow-lg shadow-blue-500/25 active:scale-95 group"
              >
                <span>Discover Your Coverage</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={() => setIsVideoModalOpen(true)}
                className="inline-flex items-center justify-center space-x-2.5 px-6 py-4 rounded-full text-xs font-semibold text-slate-700 hover:text-[#0B132B] bg-white hover:bg-slate-50 border border-slate-200 transition-all shadow-xs active:scale-95"
              >
                <div className="w-5 h-5 rounded-full bg-[#1D4ED8] flex items-center justify-center text-white">
                  <Play className="w-2.5 h-2.5 fill-current ml-0.5" />
                </div>
                <span>See How It Works</span>
              </button>
            </div>

            {/* Trust Badges */}
            <div className="pt-2 flex flex-wrap items-center gap-2 text-slate-600">
              <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-slate-100/90 text-[11px] font-medium border border-slate-200/80">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#1D4ED8]" />
                <span>Personalised Analysis</span>
              </div>
              <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-slate-100/90 text-[11px] font-medium border border-slate-200/80">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Transparent Methodology</span>
              </div>
              <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-slate-100/90 text-[11px] font-medium border border-slate-200/80">
                <Lock className="w-3.5 h-3.5 text-amber-600" />
                <span>No Hidden Charges</span>
              </div>
              <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-slate-100/90 text-[11px] font-medium border border-slate-200/80">
                <Award className="w-3.5 h-3.5 text-indigo-600" />
                <span>Expert Guidance</span>
              </div>
            </div>

            {/* 4 Bottom Metric Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-[#E6E4DF]">
              <div className="p-3 rounded-2xl bg-white border border-[#E6E4DF] shadow-xs">
                <div className="flex items-center space-x-1.5 text-[#1D4ED8] mb-0.5">
                  <ShieldCheck className="w-4 h-4" />
                  <span className="font-bold text-sm text-[#0B132B]">1M+</span>
                </div>
                <div className="text-[11px] text-slate-500 font-medium">Families Secured</div>
              </div>

              <div className="p-3 rounded-2xl bg-white border border-[#E6E4DF] shadow-xs">
                <div className="flex items-center space-x-1.5 text-emerald-600 mb-0.5">
                  <Users className="w-4 h-4" />
                  <span className="font-bold text-sm text-[#0B132B]">95%</span>
                </div>
                <div className="text-[11px] text-slate-500 font-medium">User Satisfaction</div>
              </div>

              <div className="p-3 rounded-2xl bg-white border border-[#E6E4DF] shadow-xs">
                <div className="flex items-center space-x-1.5 text-amber-600 mb-0.5">
                  <Award className="w-4 h-4" />
                  <span className="font-bold text-sm text-[#0B132B]">Trusted</span>
                </div>
                <div className="text-[11px] text-slate-500 font-medium">Financial Advisory</div>
              </div>

              <div className="p-3 rounded-2xl bg-white border border-[#E6E4DF] shadow-xs">
                <div className="flex items-center space-x-1.5 text-blue-600 mb-0.5">
                  <Lock className="w-4 h-4" />
                  <span className="font-bold text-sm text-[#0B132B]">100%</span>
                </div>
                <div className="text-[11px] text-slate-500 font-medium">Data Privacy</div>
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN (5 cols): Interactive Protection Showcase Card */}
          <div className="lg:col-span-5 bg-white rounded-3xl border border-[#E6E4DF] shadow-xl overflow-hidden flex flex-col justify-between">
            
            {/* Top Scenic Family Image Banner */}
            <div className="relative h-48 overflow-hidden group">
              <img 
                src="./images/family_sunset.jpg" 
                alt="Family at sunset overlooking peaceful future"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0B132B]/85 via-black/20 to-transparent" />
              <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-white">
                <span className="font-serif italic text-sm text-slate-100 drop-shadow">
                  “A more secure tomorrow for the people who matter most.”
                </span>
                <span className="px-2 py-0.5 rounded-full bg-blue-500/30 text-blue-200 text-[10px] font-mono border border-blue-400/30">
                  Illustrative
                </span>
              </div>
            </div>

            {/* Bottom Interactive Protection Details */}
            <div className="p-6 space-y-5 bg-[#FAF9F5]">
              
              <div className="flex items-center justify-between border-b border-slate-200/80 pb-3">
                <div>
                  <h3 className="text-sm font-bold text-[#0B132B] font-mono uppercase tracking-wider">
                    Your Financial Protection at a Glance
                  </h3>
                  <p className="text-[11px] text-slate-500">Capital Needs Analysis Model</p>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">
                  Fiduciary Model
                </span>
              </div>

              {/* Donut Chart & Legend */}
              <div className="grid grid-cols-12 gap-4 items-center">
                
                {/* Donut Chart (5 cols) */}
                <div className="col-span-5 relative h-32 flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={DONUT_DATA}
                        cx="50%"
                        cy="50%"
                        innerRadius={36}
                        outerRadius={54}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {DONUT_DATA.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={entry.color}
                            stroke={activeSegment === index ? '#FFFFFF' : 'none'}
                            strokeWidth={2}
                          />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(val: any, name: any) => [`${val}%`, name]}
                        contentStyle={{ 
                          fontSize: '11px', 
                          borderRadius: '8px',
                          backgroundColor: '#0B132B',
                          color: '#FFFFFF',
                          border: 'none',
                          padding: '4px 8px'
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>

                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
                    <span className="text-sm font-bold text-[#0B132B] leading-none">
                      ₹ 1.2 Cr
                    </span>
                    <span className="text-[8px] uppercase tracking-wider text-slate-400 font-mono mt-0.5">
                      Estimated Need
                    </span>
                  </div>
                </div>

                {/* Legend List (7 cols) */}
                <div className="col-span-7 space-y-1.5 text-xs">
                  {DONUT_DATA.map((item, idx) => (
                    <div 
                      key={item.name}
                      onMouseEnter={() => setActiveSegment(idx)}
                      onMouseLeave={() => setActiveSegment(null)}
                      className={`flex items-center justify-between px-2 py-1 rounded-lg transition-colors cursor-pointer ${
                        activeSegment === idx ? 'bg-white font-semibold shadow-xs' : 'text-slate-600'
                      }`}
                    >
                      <div className="flex items-center space-x-2 truncate">
                        <span 
                          className="w-2 h-2 rounded-full shrink-0" 
                          style={{ backgroundColor: item.color }} 
                        />
                        <span className="truncate text-[11px]">{item.name}</span>
                      </div>
                      <span className="font-mono text-[11px] text-slate-800 font-bold ml-1">
                        {item.value}%
                      </span>
                    </div>
                  ))}
                </div>

              </div>

              {/* Coverage Gap Callout Card */}
              <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="flex items-center space-x-1.5 text-xs font-bold text-slate-700">
                    <ShieldCheck className="w-4 h-4 text-[#1D4ED8]" />
                    <span>Coverage Gap</span>
                  </div>
                  <div className="font-mono text-xl font-extrabold text-[#0B132B]">
                    ₹ 65,00,000
                  </div>
                  <div className="text-[10px] text-slate-500">
                    Additional cover recommended
                  </div>
                </div>

                {/* Mini graphical trend bar */}
                <div className="flex items-end space-x-1.5 h-10 pl-4 border-l border-slate-100">
                  <div className="w-2.5 bg-slate-200 h-4 rounded-t-sm" />
                  <div className="w-2.5 bg-slate-300 h-6 rounded-t-sm" />
                  <div className="w-2.5 bg-blue-500 h-8 rounded-t-sm" />
                  <div className="w-2.5 bg-emerald-500 h-10 rounded-t-sm flex items-center justify-center">
                    <TrendingUp className="w-2 h-2 text-white" />
                  </div>
                </div>
              </div>

              {/* Quick Assessment Action */}
              <button
                onClick={onStartAssessment}
                className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-[#1D4ED8] hover:bg-[#1E40AF] transition-all flex items-center justify-center space-x-1.5 shadow-sm active:scale-98"
              >
                <span>Calculate Your Personalized Numbers</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

            </div>

          </div>

        </div>

        {/* ROW 2: LIFE MILESTONES (Spacious Dedicated Row with 4 Rich Cards & Wave Banner) */}
        <div className="space-y-6 pt-6 border-t border-[#E6E4DF]">
          
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
            <div>
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#1D4ED8]">
                Holistic Life Goals
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-[#0B132B] mt-0.5">
                Life is full of possibilities. <span className="text-[#1D4ED8] italic font-normal">Let’s protect them together.</span>
              </h2>
            </div>
            <p className="text-xs text-slate-500 max-w-sm">
              We align insurance to specific future milestones rather than arbitrary salary rules.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* Milestone Card 1: Child's Education */}
            <div className="relative rounded-3xl overflow-hidden shadow-sm border border-slate-200 group h-52 flex flex-col justify-end p-4 text-white">
              <img 
                src="./images/child_education.jpg" 
                alt="Child's Education" 
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0B132B]/90 via-[#0B132B]/30 to-transparent" />
              <div className="relative space-y-1">
                <span className="text-[10px] font-mono uppercase tracking-wider text-blue-300 font-semibold">
                  Goal 01
                </span>
                <h4 className="text-sm font-bold text-white leading-tight">
                  Child's Education
                </h4>
                <div className="flex items-center justify-between text-xs text-slate-300 font-mono pt-1 border-t border-white/20">
                  <span>Target: ₹ 20 Lakhs</span>
                  <span className="text-blue-300 font-sans">In 15 Yrs</span>
                </div>
              </div>
            </div>

            {/* Milestone Card 2: Dream Home */}
            <div className="relative rounded-3xl overflow-hidden shadow-sm border border-slate-200 group h-52 flex flex-col justify-end p-4 text-white">
              <img 
                src="./images/dream_home.jpg" 
                alt="Dream Home" 
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0B132B]/90 via-[#0B132B]/30 to-transparent" />
              <div className="relative space-y-1">
                <span className="text-[10px] font-mono uppercase tracking-wider text-amber-300 font-semibold">
                  Goal 02
                </span>
                <h4 className="text-sm font-bold text-white leading-tight">
                  Dream Home
                </h4>
                <div className="flex items-center justify-between text-xs text-slate-300 font-mono pt-1 border-t border-white/20">
                  <span>Mortgage: ₹ 50 Lakhs</span>
                  <span className="text-amber-300 font-sans">Insulated</span>
                </div>
              </div>
            </div>

            {/* Milestone Card 3: Peaceful Retirement */}
            <div className="relative rounded-3xl overflow-hidden shadow-sm border border-slate-200 group h-52 flex flex-col justify-end p-4 text-white">
              <img 
                src="./images/peaceful_retirement.jpg" 
                alt="Peaceful Retirement" 
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0B132B]/90 via-[#0B132B]/30 to-transparent" />
              <div className="relative space-y-1">
                <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-300 font-semibold">
                  Goal 03
                </span>
                <h4 className="text-sm font-bold text-white leading-tight">
                  Peaceful Retirement
                </h4>
                <div className="flex items-center justify-between text-xs text-slate-300 font-mono pt-1 border-t border-white/20">
                  <span>Target: ₹ 30 Lakhs</span>
                  <span className="text-emerald-300 font-sans">Lifelong</span>
                </div>
              </div>
            </div>

            {/* Milestone Card 4: Life's Uncertainties */}
            <div className="relative rounded-3xl overflow-hidden shadow-sm border border-slate-200 group h-52 flex flex-col justify-end p-4 text-white">
              <img 
                src="./images/life_uncertainties.jpg" 
                alt="Life's Uncertainties" 
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0B132B]/90 via-[#0B132B]/30 to-transparent" />
              <div className="relative space-y-1">
                <span className="text-[10px] font-mono uppercase tracking-wider text-teal-300 font-semibold">
                  Goal 04
                </span>
                <h4 className="text-sm font-bold text-white leading-tight">
                  Life's Uncertainties
                </h4>
                <div className="flex items-center justify-between text-xs text-slate-300 font-mono pt-1 border-t border-white/20">
                  <span>Full Capital Security</span>
                  <span className="text-teal-300 font-sans">Zero Gap</span>
                </div>
              </div>
            </div>

          </div>

          {/* Dark Blue Wave Ribbon Banner */}
          <div className="p-6 rounded-3xl bg-gradient-to-r from-[#070C18] via-[#0B132B] to-[#1E3A8A] text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-md">
            <div className="space-y-1 text-center md:text-left">
              <span className="text-xs font-mono uppercase tracking-wider text-blue-300 font-semibold">
                Holistic Fiduciary Planning
              </span>
              <h3 className="font-serif text-xl sm:text-2xl font-bold text-white">
                Not just insurance. A stronger tomorrow.
              </h3>
              <p className="text-xs text-slate-300 max-w-lg">
                Deterministic calculations that calculate exact capital lump-sums rather than selling commission-heavy financial products.
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3">
              <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-white/10 text-xs text-slate-200 border border-white/10">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                <span>4 Simple Steps</span>
              </div>
              <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-white/10 text-xs text-slate-200 border border-white/10">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span>100% Transparent</span>
              </div>
              <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-white/10 text-xs text-slate-200 border border-white/10">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                <span>Built for Families</span>
              </div>

              <button
                onClick={onStartAssessment}
                className="px-6 py-2.5 rounded-full text-xs font-bold text-[#0B132B] bg-white hover:bg-slate-100 transition-all shadow-md active:scale-95"
              >
                Build Your Protection Plan
              </button>
            </div>
          </div>

        </div>

      </div>

      {/* Video Modal / Walkthrough Simulation */}
      {isVideoModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0B132B] border border-slate-700 rounded-3xl max-w-2xl w-full p-6 text-white space-y-4 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <Play className="w-4 h-4 text-[#1D4ED8]" />
                <h3 className="text-base font-semibold text-white">
                  How LifeSure AI Protects Your Family
                </h3>
              </div>
              <button
                onClick={() => setIsVideoModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="aspect-video rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden relative flex flex-col items-center justify-center p-6 text-center">
              <img 
                src="./images/family_sunset.jpg" 
                alt="Walkthrough preview" 
                className="absolute inset-0 w-full h-full object-cover opacity-20"
              />
              <div className="relative z-10 space-y-3 max-w-md">
                <div className="w-12 h-12 rounded-full bg-[#1D4ED8] text-white flex items-center justify-center mx-auto shadow-lg shadow-blue-500/50">
                  <Play className="w-5 h-5 fill-current ml-0.5" />
                </div>
                <h4 className="font-serif text-lg font-medium text-white">
                  Transparent Needs Analysis in Action
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Learn how LifeSure AI uses CFP-accredited capital needs analysis to compute true income replacement, account for loans and child education, and avoid high-commission mis-selling.
                </p>
                <button
                  onClick={() => {
                    setIsVideoModalOpen(false);
                    onStartAssessment();
                  }}
                  className="px-6 py-3 rounded-full text-xs font-bold text-white bg-[#1D4ED8] hover:bg-[#1E40AF] transition-all shadow-md"
                >
                  Start Assessment Now
                </button>
              </div>
            </div>

            <div className="text-[11px] text-slate-400 text-center">
              LifeSure AI does not distribute spam or issue actual policies. We provide pure fiduciary financial analytics.
            </div>
          </div>
        </div>
      )}

    </section>
  );
};
