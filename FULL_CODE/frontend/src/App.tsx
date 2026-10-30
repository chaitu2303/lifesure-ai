import React, { useState } from 'react';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { AppShell } from './components/layout/AppShell';
import { HeroSection } from './components/landing/HeroSection';
import { HowItWorks } from './components/landing/HowItWorks';
import { EducationSection } from './components/landing/EducationSection';
import { ScenarioComparison } from './components/landing/ScenarioComparison';
import { ProductTeaser } from './components/landing/ProductTeaser';
import { TrustSection } from './components/landing/TrustSection';
import { AssessmentWizard, DEFAULT_ASSESSMENT_INPUT } from './components/assessment/AssessmentWizard';
import { ResultsDashboard } from './components/results/ResultsDashboard';
import { PrintableReport } from './components/results/PrintableReport';
import { ProductRecommendations } from './components/recommendations/ProductRecommendations';
import { WhatIfSimulator } from './components/simulation/WhatIfSimulator';
import { CustomerDashboard } from './components/dashboard/CustomerDashboard';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { AdvisoryChatbot } from './components/advisory/AdvisoryChatbot';
import { ConsultationBookingModal } from './components/advisory/ConsultationBookingModal';
import { SimulatedVideoRoom } from './components/advisory/SimulatedVideoRoom';
import { CalculationResult, AssessmentInput } from './types';
import { MessageSquareText } from 'lucide-react';

const INITIAL_BENCHMARK_RESULT: CalculationResult = {
  income_replacement_pv: 4500000,
  total_liabilities: 2500000,
  total_future_goals_pv: 2000000,
  total_future_goals_fv: 3200000,
  future_goals_breakdown: [
    { name: "Child's education", target_amount_today: 2000000, years_until_goal: 15, future_value: 4793116, present_value: 1510900 },
    { name: "Dream home", target_amount_today: 5000000, years_until_goal: 10, future_value: 8954238, present_value: 4147779 },
    { name: "Retirement planning", target_amount_today: 3000000, years_until_goal: 25, future_value: 12875613, present_value: 1879893 },
  ],
  additional_family_reserve: 1000000,
  total_gross_protection_need: 10000000,
  eligible_existing_assets: 1500000,
  existing_life_cover: 2000000,
  total_existing_protection: 3500000,
  net_additional_cover: 6500000,
  protection_gap: 6500000,
  human_life_value_estimate: 12000000,
  affordability_status: 'Comfortably Affordable',
  monthly_budget: 1500,
  estimated_monthly_premium_range: {
    low: 1000,
    median: 1200,
    high: 1500,
  },
  assumptions_used: {
    inflation_rate: 0.055,
    discount_rate: 0.07,
    real_rate: 0.0142,
    emergency_reserve_months: 6,
    family_expense_factor: 0.75,
    replacement_horizon_years: 15,
  },
  formula_explanation: 'Capital Needs Analysis = max(0, Income PV + Liabilities + Goals PV + Reserve - Assets - Existing Cover)',
  assessment_id: 1042,
  created_at: new Date().toISOString(),
};

export function App() {
  const [currentView, setCurrentView] = useState<string>('landing');
  const [calculationResult, setCalculationResult] = useState<CalculationResult>(INITIAL_BENCHMARK_RESULT);
  const [assessmentInput, setAssessmentInput] = useState<AssessmentInput>(DEFAULT_ASSESSMENT_INPUT);

  // Modals & Chatbot state
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);
  const [isBookingOpen, setIsBookingOpen] = useState<boolean>(false);

  // Video Room state
  const [videoRoomState, setVideoRoomState] = useState<{
    isOpen: boolean;
    appointmentCode: string;
    advisorName: string;
    topic: string;
  }>({
    isOpen: false,
    appointmentCode: 'LW-APT-1042',
    advisorName: 'Farah Siddiqui',
    topic: 'Comprehensive Life Insurance Review',
  });

  const handleCalculationComplete = (result: CalculationResult, input: AssessmentInput) => {
    setCalculationResult(result);
    setAssessmentInput(input);
    setCurrentView('results');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenVideoRoom = (appointmentCode: string, advisorName: string, topic: string) => {
    setVideoRoomState({
      isOpen: true,
      appointmentCode: appointmentCode || 'LW-APT-1042',
      advisorName: advisorName || 'Farah Siddiqui',
      topic: topic || 'Life Insurance & Mortgage Protection Review',
    });
  };

  const handleCloseVideoRoom = () => {
    setVideoRoomState((prev) => ({ ...prev, isOpen: false }));
    setCurrentView('dashboard');
  };

  const navigateTo = (view: string) => {
    setCurrentView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Full-screen simulated video room takes precedence
  if (videoRoomState.isOpen) {
    return (
      <SimulatedVideoRoom
        appointmentCode={videoRoomState.appointmentCode}
        advisorName={videoRoomState.advisorName}
        topic={videoRoomState.topic}
        onLeaveRoom={handleCloseVideoRoom}
      />
    );
  }

  // Printable View
  if (currentView === 'printable') {
    return (
      <PrintableReport
        result={calculationResult}
        input={assessmentInput}
        onBack={() => setCurrentView('results')}
      />
    );
  }

  // View titles for AppShell breadcrumb
  const viewTitles: Record<string, { title: string; indicator?: string }> = {
    assessment: { title: 'Needs Assessment', indicator: '1/4' },
    results: { title: 'My Protection Plan', indicator: '3/4' },
    products: { title: 'Recommended Products & Comparison', indicator: '4/4' },
    simulator: { title: 'What-If Simulator', indicator: 'Interactive' },
    dashboard: { title: 'Customer Dashboard', indicator: 'Live' },
    admin: { title: 'Governance & Settings', indicator: 'Admin' },
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF9F5] text-[#0B132B] font-sans antialiased selection:bg-[#1D4ED8] selection:text-white">
      
      {/* 1. LANDING PAGE VIEW */}
      {currentView === 'landing' ? (
        <>
          <Navbar
            currentView={currentView}
            onNavigate={navigateTo}
            onOpenBooking={() => setIsBookingOpen(true)}
            hasResult={true}
          />
          
          <main className="flex-1">
            <HeroSection
              onStartAssessment={() => navigateTo('assessment')}
              onOpenBooking={() => setIsBookingOpen(true)}
            />
            
            <HowItWorks
              onNavigate={navigateTo}
              onOpenBooking={() => setIsBookingOpen(true)}
            />
            
            <EducationSection
              onStartAssessment={() => navigateTo('assessment')}
            />
            
            <ScenarioComparison />
            
            <ProductTeaser
              onStartAssessment={() => navigateTo('assessment')}
            />
            
            <TrustSection />
          </main>

          <Footer onNavigate={navigateTo} />
        </>
      ) : (
        /* 2. INNER APP VIEWS (WITH DARK MIDNIGHT SIDEBAR SHELL MATCHING REFERENCE IMAGE) */
        <AppShell
          currentView={currentView}
          onNavigate={navigateTo}
          onOpenBooking={() => setIsBookingOpen(true)}
          stepTitle={viewTitles[currentView]?.title}
          stepIndicator={viewTitles[currentView]?.indicator}
          hasResult={true}
        >
          {currentView === 'assessment' && (
            <AssessmentWizard
              initialInput={assessmentInput}
              onCalculationComplete={handleCalculationComplete}
              onCancel={() => navigateTo('landing')}
            />
          )}

          {currentView === 'results' && (
            <ResultsDashboard
              result={calculationResult}
              input={assessmentInput}
              onExploreRecommendations={() => navigateTo('products')}
              onOpenSimulator={() => navigateTo('simulator')}
              onPrintReport={() => navigateTo('printable')}
              onBookAdvisor={() => setIsBookingOpen(true)}
              onReviseAssessment={() => navigateTo('assessment')}
            />
          )}

          {currentView === 'products' && (
            <ProductRecommendations
              result={calculationResult}
              input={assessmentInput}
              onOpenBooking={() => setIsBookingOpen(true)}
              onOpenSimulator={() => navigateTo('simulator')}
              onBackToDashboard={() => navigateTo('results')}
            />
          )}

          {currentView === 'simulator' && (
            <WhatIfSimulator
              baseResult={calculationResult}
              baseInput={assessmentInput}
              onBackToDashboard={() => navigateTo('results')}
              onOpenBooking={() => setIsBookingOpen(true)}
            />
          )}

          {currentView === 'dashboard' && (
            <CustomerDashboard
              currentResult={calculationResult}
              currentInput={assessmentInput}
              onStartNewAssessment={() => navigateTo('assessment')}
              onOpenSimulator={() => navigateTo('simulator')}
              onOpenBooking={() => setIsBookingOpen(true)}
              onViewResults={() => navigateTo('results')}
              onJoinVideoRoom={handleOpenVideoRoom}
            />
          )}

          {currentView === 'admin' && (
            <AdminDashboard />
          )}
        </AppShell>
      )}

      {/* Floating Chatbot Button (Advisory AI) */}
      {!isChatOpen && (
        <button
          onClick={() => setIsChatOpen(true)}
          className="fixed bottom-6 right-6 z-40 py-2.5 px-4 rounded-full bg-[#0B132B] hover:bg-[#1D4ED8] text-white shadow-xl hover:shadow-2xl transition-all flex items-center space-x-2 group border border-slate-700 active:scale-95"
          title="Open LifeWise Advisory Assistant"
        >
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <MessageSquareText className="w-4 h-4 text-blue-400 group-hover:text-white transition-colors" />
          <span className="hidden sm:inline-block text-xs font-mono font-semibold tracking-wider uppercase">
            Advisory AI
          </span>
        </button>
      )}

      {/* Advisory Chatbot Popup */}
      <AdvisoryChatbot
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
      />

      {/* Consultation Booking Modal */}
      <ConsultationBookingModal
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
        onJoinVideoRoom={handleOpenVideoRoom}
      />

    </div>
  );
}

export default App;
