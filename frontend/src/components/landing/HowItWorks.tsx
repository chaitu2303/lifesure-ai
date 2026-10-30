import React from 'react';
import { 
  UserCheck, 
  Calculator, 
  Layers, 
  UserRound, 
  ChevronRight, 
  Target, 
  ShieldCheck, 
  Sliders, 
  Sparkles, 
  HelpCircle, 
  Lock,
  ArrowRight
} from 'lucide-react';

interface HowItWorksProps {
  onNavigate?: (view: string) => void;
  onOpenBooking?: () => void;
}

export const HowItWorks: React.FC<HowItWorksProps> = ({ 
  onNavigate = () => {}, 
  onOpenBooking = () => {} 
}) => {
  const steps = [
    {
      num: '01',
      title: 'Understand Your Needs',
      desc: 'Collect financial information, household responsibilities, liabilities, and future goals.',
      icon: UserCheck,
      action: () => onNavigate('assessment'),
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      num: '02',
      title: 'Discover Your Coverage',
      desc: 'Calculate an estimated protection requirement and explain every component.',
      icon: Calculator,
      action: () => onNavigate('results'),
      color: 'text-indigo-600',
      bg: 'bg-indigo-50',
    },
    {
      num: '03',
      title: 'Compare Suitable Options',
      desc: 'Evaluate eligible products, available premium rates, policy terms, and relevant benefits.',
      icon: Layers,
      action: () => onNavigate('products'),
      color: 'text-teal-600',
      bg: 'bg-teal-50',
    },
    {
      num: '04',
      title: 'Get Personalized Guidance',
      desc: 'Explore advisor availability, book a consultation in the application, and review your plan.',
      icon: UserRound,
      action: () => onOpenBooking(),
      color: 'text-amber-600',
      bg: 'bg-amber-50',
    },
  ];

  const features = [
    {
      title: 'Accurate Need Calculation',
      desc: 'CFP® Capital Needs Analysis instead of flawed rules-of-thumb.',
      icon: Target,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      title: 'Personalised Plan Recommendations',
      desc: 'Tailored across Term, Whole Life, Endowment, and ULIPs.',
      icon: Sparkles,
      color: 'text-indigo-600',
      bg: 'bg-indigo-50',
    },
    {
      title: 'Interactive What-If Scenarios',
      desc: 'Simulate inflation, tenure adjustments, and budget constraints live.',
      icon: Sliders,
      color: 'text-teal-600',
      bg: 'bg-teal-50',
    },
    {
      title: 'Expert Consultation',
      desc: 'Schedule simulated or direct video calls with Certified Advisors.',
      icon: UserRound,
      color: 'text-purple-600',
      bg: 'bg-purple-50',
    },
    {
      title: 'Simple & Clear Explanations',
      desc: 'No confusing jargon or hidden fees. Transparent formulas throughout.',
      icon: HelpCircle,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
    },
    {
      title: 'Your Data Stays Private',
      desc: 'No phone numbers sold, no broker spam, bank-grade encryption.',
      icon: Lock,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
    },
  ];

  return (
    <section id="how-it-works-section" className="py-16 sm:py-20 bg-white border-b border-[#E6E4DF]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Two-card composition matching reference image */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* LEFT CONTAINER (7 cols): How LifeWise Works */}
          <div className="lg:col-span-7 p-6 sm:p-8 rounded-3xl bg-[#FAF9F5] border border-[#E6E4DF] shadow-xs flex flex-col justify-between space-y-6">
            
            <div className="space-y-1.5">
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-[#1D4ED8]" />
                <h3 className="font-serif text-2xl sm:text-3xl font-semibold text-[#0B132B]">
                  Your Protection Journey, Made Simple.
                </h3>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 font-normal">
                Four connected, transparent steps from initial discovery to certified advisory.
              </p>
            </div>

            {/* 4 Connected Step Cards with Interconnecting Arrows */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 relative">
              {steps.map((step, idx) => {
                const Icon = step.icon;
                return (
                  <div key={step.num} className="relative flex-1 group">
                    <button
                      onClick={step.action}
                      className="w-full h-full text-left p-4 rounded-2xl bg-white border border-[#E6E4DF] hover:border-[#1D4ED8] hover:shadow-md transition-all flex flex-col justify-between space-y-3 cursor-pointer group-hover:-translate-y-0.5"
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className="font-mono text-xs font-bold text-[#1D4ED8]">
                          {step.num}
                        </span>
                        <div className={`w-7 h-7 rounded-lg ${step.bg} ${step.color} flex items-center justify-center`}>
                          <Icon className="w-3.5 h-3.5" />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <h4 className="text-xs font-bold text-[#0B132B] group-hover:text-[#1D4ED8] transition-colors leading-tight">
                          {step.title}
                        </h4>
                        <p className="text-[11px] text-slate-500 leading-snug line-clamp-2">
                          {step.desc}
                        </p>
                      </div>

                      <div className="flex items-center text-[10px] font-semibold text-[#1D4ED8] pt-1">
                        <span>Explore</span>
                        <ChevronRight className="w-3 h-3 ml-0.5 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </button>
                  </div>
                );
              })}
            </div>

            <div className="pt-2 flex items-center justify-between border-t border-[#E6E4DF] text-xs text-slate-500">
              <span>Deterministic algorithm &bull; 0% Commission conflict</span>
              <button
                onClick={() => onNavigate('assessment')}
                className="font-semibold text-[#1D4ED8] hover:underline flex items-center space-x-1"
              >
                <span>Start My Assessment</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

          </div>

          {/* RIGHT CONTAINER (5 cols): Why Choose LifeWise? */}
          <div className="lg:col-span-5 p-6 sm:p-8 rounded-3xl bg-[#FAF9F5] border border-[#E6E4DF] shadow-xs flex flex-col justify-between space-y-6">
            
            <div className="space-y-1.5">
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <h3 className="font-serif text-2xl sm:text-3xl font-semibold text-[#0B132B]">
                  Why Choose LifeWise?
                </h3>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 font-normal">
                Pure financial guidance built exclusively for families.
              </p>
            </div>

            {/* Grid of 6 feature tiles */}
            <div className="grid grid-cols-2 gap-3">
              {features.map((feat) => {
                const Icon = feat.icon;
                return (
                  <div
                    key={feat.title}
                    className="p-3 rounded-2xl bg-white border border-[#E6E4DF] hover:border-slate-300 hover:shadow-xs transition-all space-y-1.5"
                  >
                    <div className="flex items-center space-x-2">
                      <div className={`w-6 h-6 rounded-md ${feat.bg} ${feat.color} flex items-center justify-center shrink-0`}>
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <h4 className="text-xs font-bold text-[#0B132B] leading-tight truncate">
                        {feat.title}
                      </h4>
                    </div>
                    <p className="text-[10px] text-slate-500 leading-snug line-clamp-2">
                      {feat.desc}
                    </p>
                  </div>
                );
              })}
            </div>

            <div className="pt-2 flex items-center justify-between border-t border-[#E6E4DF] text-xs text-slate-500">
              <span className="text-[11px]">Certified Financial Planner (CFP®) standard</span>
              <span className="text-emerald-700 font-semibold text-[11px] bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                100% Unbiased
              </span>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
