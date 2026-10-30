import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  ArrowRight, 
  CheckCircle2, 
  Plus, 
  Trash2, 
  ShieldCheck, 
  Sparkles, 
  Info, 
  RefreshCw,
  GraduationCap,
  Home,
  Sun,
  HeartHandshake,
  DollarSign,
  AlertCircle,
  UserCheck
} from 'lucide-react';
import { AssessmentInput, CalculationResult, GoalItem, CustomerProfileSummary } from '../../types';
import { api } from '../../services/api';
import { formatINR } from '../../utils/formatters';

interface AssessmentWizardProps {
  onCalculationComplete: (result: CalculationResult, rawInput: AssessmentInput) => void;
  initialInput?: AssessmentInput | null;
  onCancel?: () => void;
}

export const DEFAULT_ASSESSMENT_INPUT: AssessmentInput = {
  full_name: 'Chaitanya Verma',
  age: 28,
  annual_income: 1200000,
  monthly_expenses: 60000,
  dependents_count: 2,
  retirement_age: 60,
  replacement_horizon_years: 15,
  liabilities: {
    home_loan: 2500000,
    car_loan: 0,
    personal_loan: 0,
    education_loan: 0,
    credit_cards: 0,
    other_liabilities: 0,
  },
  future_goals: [
    {
      id: 'g-edu',
      name: "Child's education",
      target_amount: 2000000,
      years_until_goal: 15,
    },
    {
      id: 'g-home',
      name: "Dream home",
      target_amount: 5000000,
      years_until_goal: 10,
    },
    {
      id: 'g-ret',
      name: "Retirement planning",
      target_amount: 3000000,
      years_until_goal: 25,
    },
  ],
  existing_assets: {
    savings_account: 500000,
    fixed_deposits: 500000,
    mutual_funds_stocks: 500000,
    pf_ppf_available: 0,
    other_liquid_assets: 0,
  },
  existing_life_cover: 2000000,
  monthly_budget: 1500,
  risk_profile: 'moderate',
};

export const AssessmentWizard: React.FC<AssessmentWizardProps> = ({ 
  onCalculationComplete, 
  initialInput,
  onCancel 
}) => {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [formData, setFormData] = useState<AssessmentInput>(initialInput || DEFAULT_ASSESSMENT_INPUT);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [demoProfiles, setDemoProfiles] = useState<CustomerProfileSummary[]>([]);
  const [selectedProfileId, setSelectedProfileId] = useState<string>('');

  useEffect(() => {
    api.getDemoProfiles().then((profs) => {
      if (profs && profs.length > 0) {
        setDemoProfiles(profs);
      }
    }).catch((err) => console.warn('Could not load demo profiles:', err));
  }, []);

  const handleSelectProfile = (profileId: string) => {
    setSelectedProfileId(profileId);
    if (!profileId) return;
    const p = demoProfiles.find((item) => item.profile_id === profileId);
    if (!p) return;

    const childrenCount = p.dependents?.children?.length || 0;
    const parentsCount = p.dependents?.parents?.length || 0;
    const hasSpouse = p.dependents?.spouse ? 1 : 0;
    const totalDeps = Math.max(1, childrenCount + parentsCount + hasSpouse);

    const homeLoan = p.liabilities?.find((l) => l.loan_type === 'home_loan')?.outstanding_principal_inr || 0;
    const carLoan = p.liabilities?.find((l) => l.loan_type === 'car_loan')?.outstanding_principal_inr || 0;
    const personalLoan = p.liabilities?.find((l) => l.loan_type === 'personal_loan')?.outstanding_principal_inr || 0;
    const eduLoan = p.liabilities?.find((l) => l.loan_type === 'education_loan')?.outstanding_principal_inr || 0;

    const goals: GoalItem[] = (p.goals || []).map((g, idx) => ({
      id: g.goal_id || `goal-${idx}`,
      name: g.goal_type?.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) || 'Family Milestone',
      target_amount: g.target_amount_today_inr || 2000000,
      years_until_goal: g.years_until_goal || (g.target_year ? Math.max(1, g.target_year - 2026) : 10),
    }));

    setFormData({
      full_name: p.full_name,
      age: p.age,
      annual_income: p.annual_income_inr,
      monthly_expenses: p.monthly_household_expenses_inr,
      monthly_budget: p.monthly_premium_budget_inr,
      dependents_count: totalDeps,
      retirement_age: 60,
      replacement_horizon_years: Math.max(10, Math.min(25, 60 - p.age)),
      liabilities: {
        home_loan: homeLoan,
        car_loan: carLoan,
        personal_loan: personalLoan,
        education_loan: eduLoan,
        credit_cards: 0,
        other_liabilities: 0,
      },
      future_goals: goals.length > 0 ? goals : [
        { id: 'g-default', name: "Child's Higher Education", target_amount: 2500000, years_until_goal: 12 },
      ],
      existing_assets: {
        savings_account: p.savings_and_investments?.liquid_savings_inr ? Math.round(p.savings_and_investments.liquid_savings_inr * 0.4) : 300000,
        fixed_deposits: p.savings_and_investments?.liquid_savings_inr ? Math.round(p.savings_and_investments.liquid_savings_inr * 0.6) : 300000,
        mutual_funds_stocks: p.savings_and_investments?.market_investments_inr || 500000,
        pf_ppf_available: p.savings_and_investments?.retirement_savings_inr || 0,
        other_liquid_assets: 0,
      },
      existing_life_cover: (p.existing_life_cover?.individual_inr || 0) + (p.existing_life_cover?.employer_group_inr || 0),
      risk_profile: p.risk_appetite || 'moderate',
    });
  };

  // New goal form state
  const [newGoalName, setNewGoalName] = useState('');
  const [newGoalAmount, setNewGoalAmount] = useState<number>(1000000);
  const [newGoalYears, setNewGoalYears] = useState<number>(10);
  const [isAddingGoal, setIsAddingGoal] = useState(false);

  const stepsMeta = [
    { id: 1, title: 'Personal Profile', label: '1. Assessment', subtitle: "Let's get to know you better" },
    { id: 2, title: 'Financial Goals', label: '2. Financial Goals', subtitle: "Your Dreams for the Future" },
    { id: 3, title: 'Current Protection', label: '3. Current Protection', subtitle: "Outstanding Loans & Existing Coverage" },
    { id: 4, title: 'Review & Calculate', label: '4. Review & Calculate', subtitle: "Verify & Derive Protection Need" },
  ];

  const handleUpdate = (updates: Partial<AssessmentInput>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
    setErrorMessage(null);
  };

  const handleLiabilityUpdate = (key: keyof typeof formData.liabilities, value: number) => {
    setFormData((prev) => ({
      ...prev,
      liabilities: {
        ...prev.liabilities,
        [key]: value,
      },
    }));
  };

  const handleAssetUpdate = (key: keyof typeof formData.existing_assets, value: number) => {
    setFormData((prev) => ({
      ...prev,
      existing_assets: {
        ...prev.existing_assets,
        [key]: value,
      },
    }));
  };

  const handleAddGoal = () => {
    if (!newGoalName.trim()) return;
    const newGoal: GoalItem = {
      id: `goal-${Date.now()}`,
      name: newGoalName.trim(),
      target_amount: newGoalAmount,
      years_until_goal: newGoalYears,
    };
    setFormData((prev) => ({
      ...prev,
      future_goals: [...prev.future_goals, newGoal],
    }));
    setNewGoalName('');
    setIsAddingGoal(false);
  };

  const handleRemoveGoal = (id?: string) => {
    setFormData((prev) => ({
      ...prev,
      future_goals: prev.future_goals.filter((g) => g.id !== id),
    }));
  };

  const validateStep = (step: number): boolean => {
    if (step === 1) {
      if (!formData.age || formData.age < 18 || formData.age > 80) {
        setErrorMessage('Please enter a valid age between 18 and 80.');
        return false;
      }
      if (formData.annual_income < 100000) {
        setErrorMessage('Please enter a valid annual income (minimum ₹1,00,000).');
        return false;
      }
      if (formData.monthly_expenses <= 0) {
        setErrorMessage('Please enter valid monthly household expenses.');
        return false;
      }
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setErrorMessage(null);
      setCurrentStep((prev) => Math.min(4, prev + 1));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleBack = () => {
    setErrorMessage(null);
    setCurrentStep((prev) => Math.max(1, prev - 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setErrorMessage(null);
      const result = await api.submitAssessment(formData);
      onCalculationComplete(result, formData);
    } catch (err: any) {
      console.warn('API submit encountered an issue, falling back to preview calculation:', err);
      try {
        const preview = await api.calculatePreview(formData);
        onCalculationComplete(preview, formData);
      } catch (innerErr: any) {
        setErrorMessage('Unable to calculate at this time. Please check your inputs.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Calculations for review step
  const totalLiabilities = Object.values(formData.liabilities || {}).reduce((a, b) => a + Number(b || 0), 0);
  const totalAssets = Object.values(formData.existing_assets || {}).reduce((a, b) => a + Number(b || 0), 0);
  const totalGoals = formData.future_goals.reduce((a, b) => a + Number(b.target_amount || 0), 0);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      
      {/* Step Progress Tracker */}
      <div className="flex items-center justify-between pb-4 border-b border-[#E6E4DF]">
        <div>
          <div className="flex items-center space-x-2">
            <span className="font-mono text-xs font-bold text-[#1D4ED8]">
              {stepsMeta[currentStep - 1].label}
            </span>
            <span className="text-slate-300">&bull;</span>
            <span className="text-xs text-slate-500 font-mono">
              Step {currentStep} of 4
            </span>
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-[#0B132B] mt-0.5">
            {stepsMeta[currentStep - 1].subtitle}
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Quick Load Synthetic Profile */}
          <div className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg border border-blue-200 bg-blue-50/70 text-xs">
            <UserCheck className="w-3.5 h-3.5 text-[#1D4ED8]" />
            <select
              value={selectedProfileId}
              onChange={(e) => handleSelectProfile(e.target.value)}
              className="bg-transparent text-xs font-semibold text-[#0B132B] outline-none cursor-pointer"
              title="Quick Load Synthetic Profile from B2 dataset"
            >
              <option value="">Quick Load Synthetic Profile...</option>
              {demoProfiles.map((p) => (
                <option key={p.profile_id} value={p.profile_id}>
                  {p.full_name} ({p.age}y, ₹{(p.annual_income_inr / 100000).toFixed(1)}L/yr, {p.city})
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => {
              setSelectedProfileId('');
              setFormData(DEFAULT_ASSESSMENT_INPUT);
            }}
            className="text-xs font-mono text-slate-600 hover:text-[#0B132B] flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 transition-colors shadow-xs"
            title="Populate benchmark sample figures"
          >
            <RefreshCw className="w-3.5 h-3.5 text-[#1D4ED8]" />
            <span className="hidden sm:inline">Reset Values</span>
          </button>
        </div>
      </div>

      {/* Progress Line */}
      <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
        <div 
          className="bg-[#1D4ED8] h-full transition-all duration-300 rounded-full"
          style={{ width: `${(currentStep / 4) * 100}%` }}
        />
      </div>

      {/* Error Message Banner */}
      {errorMessage && (
        <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* STEP 1: PERSONAL PROFILE */}
      {currentStep === 1 && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Form Inputs (7 cols) */}
          <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-3xl border border-[#E6E4DF] shadow-xs space-y-6">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="font-serif text-lg font-semibold text-[#0B132B]">
                Personal & Household Profile
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                This helps us calculate an accurate life insurance need for your family.
              </p>
            </div>

            <div className="space-y-4">
              {/* Full Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">
                  Full Name
                </label>
                <input
                  type="text"
                  value={formData.full_name}
                  onChange={(e) => handleUpdate({ full_name: e.target.value })}
                  placeholder="e.g. Chaitanya Verma"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:border-[#1D4ED8] focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                />
              </div>

              {/* Age */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 flex justify-between">
                  <span>Your Age</span>
                  <span className="font-mono text-slate-500">{formData.age} years</span>
                </label>
                <div className="flex items-center space-x-3">
                  <input
                    type="number"
                    min="18"
                    max="75"
                    value={formData.age}
                    onChange={(e) => handleUpdate({ age: Number(e.target.value) })}
                    className="w-32 px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-mono font-semibold focus:border-[#1D4ED8] outline-none"
                  />
                  <input
                    type="range"
                    min="18"
                    max="65"
                    value={formData.age}
                    onChange={(e) => handleUpdate({ age: Number(e.target.value) })}
                    className="flex-1 accent-[#1D4ED8]"
                  />
                </div>
              </div>

              {/* Annual Income */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 flex justify-between">
                  <span>Annual Income</span>
                  <span className="font-mono text-[#1D4ED8] font-bold">
                    {formatINR(formData.annual_income)} / year
                  </span>
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">
                    ₹
                  </span>
                  <input
                    type="number"
                    step="50000"
                    value={formData.annual_income}
                    onChange={(e) => handleUpdate({ annual_income: Number(e.target.value) })}
                    className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm font-mono font-semibold focus:border-[#1D4ED8] outline-none"
                    placeholder="1200000"
                  />
                </div>
                <span className="text-[10px] text-slate-400">
                  Total annual pre-tax income from all sources.
                </span>
              </div>

              {/* Monthly Household Expenses */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 flex justify-between">
                  <span>Monthly Household Expenses</span>
                  <span className="font-mono text-[#1D4ED8] font-bold">
                    {formatINR(formData.monthly_expenses)} / month
                  </span>
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">
                    ₹
                  </span>
                  <input
                    type="number"
                    step="5000"
                    value={formData.monthly_expenses}
                    onChange={(e) => handleUpdate({ monthly_expenses: Number(e.target.value) })}
                    className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm font-mono font-semibold focus:border-[#1D4ED8] outline-none"
                    placeholder="60000"
                  />
                </div>
                <span className="text-[10px] text-slate-400">
                  Groceries, utilities, rent, healthcare, school fees, and lifestyle expenses.
                </span>
              </div>

              {/* Dependents Count */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">
                  Number of Financial Dependents
                </label>
                <div className="flex items-center space-x-2">
                  {[0, 1, 2, 3, 4, '5+'].map((count, idx) => {
                    const val = idx;
                    const isSelected = formData.dependents_count === val;
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleUpdate({ dependents_count: val })}
                        className={`flex-1 py-2 rounded-xl text-xs font-semibold border transition-all ${
                          isSelected
                            ? 'bg-[#1D4ED8] text-white border-[#1D4ED8] shadow-sm'
                            : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        {count}
                      </button>
                    );
                  })}
                </div>
              </div>

            </div>

            {/* Bottom Actions */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-end">
              <button
                type="button"
                onClick={handleNext}
                className="inline-flex items-center space-x-2 px-6 py-2.5 rounded-full text-xs font-bold text-white bg-[#1D4ED8] hover:bg-[#1E40AF] transition-all shadow-md active:scale-95"
              >
                <span>Continue</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

          </div>

          {/* Right Visual Card Matching Reference Image (5 cols) */}
          <div className="lg:col-span-5 relative rounded-3xl overflow-hidden min-h-[420px] shadow-lg border border-slate-200 flex flex-col justify-end p-6 text-white group">
            <img 
              src="./images/family_sunset.jpg" 
              alt="Small Details Stronger Protection"
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0B132B] via-[#0B132B]/50 to-transparent" />
            
            <div className="relative space-y-3">
              <span className="px-2.5 py-1 rounded-full bg-blue-500/30 text-blue-200 text-[10px] font-mono uppercase tracking-wider backdrop-blur-md border border-blue-400/30 inline-block">
                Precision Discovery
              </span>
              <h3 className="font-serif text-2xl font-bold leading-tight">
                Small Details. <br />
                <span className="text-blue-300">Stronger Protection.</span>
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed font-normal">
                Every family’s cash flow footprint is unique. We avoid generic 10x rules to calculate exact income replacement so you never overpay or leave dependents vulnerable.
              </p>
            </div>
          </div>

        </div>
      )}

      {/* STEP 2: FINANCIAL GOALS */}
      {currentStep === 2 && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Goals List (7 cols) */}
          <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-3xl border border-[#E6E4DF] shadow-xs space-y-6">
            <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
              <div>
                <h3 className="font-serif text-lg font-semibold text-[#0B132B]">
                  Your Dreams for the Future
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Help us understand your key financial milestones and aspirations.
                </p>
              </div>
              <span className="font-mono text-xs font-bold text-[#1D4ED8] bg-blue-50 px-2.5 py-1 rounded-full border border-blue-100">
                Total: {formatINR(totalGoals)}
              </span>
            </div>

            {/* List of Existing Goals */}
            <div className="space-y-3">
              {formData.future_goals.map((goal, idx) => (
                <div 
                  key={goal.id || idx}
                  className="p-4 rounded-2xl bg-[#FAF9F5] border border-[#E6E4DF] flex items-center justify-between hover:border-slate-300 transition-all"
                >
                  <div className="flex items-center space-x-3.5">
                    <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-[#1D4ED8] shadow-xs">
                      {goal.name.toLowerCase().includes('child') || goal.name.toLowerCase().includes('education') ? (
                        <GraduationCap className="w-5 h-5" />
                      ) : goal.name.toLowerCase().includes('home') ? (
                        <Home className="w-5 h-5" />
                      ) : (
                        <Sun className="w-5 h-5" />
                      )}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-[#0B132B]">
                        {goal.name}
                      </h4>
                      <div className="flex items-center space-x-2 text-[11px] text-slate-500 mt-0.5">
                        <span className="font-mono font-semibold text-slate-700">
                          {formatINR(goal.target_amount)}
                        </span>
                        <span>&bull;</span>
                        <span>in {goal.years_until_goal} years</span>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRemoveGoal(goal.id)}
                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Remove goal"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}

              {/* Add Another Goal Box */}
              {!isAddingGoal ? (
                <button
                  type="button"
                  onClick={() => setIsAddingGoal(true)}
                  className="w-full py-3 rounded-2xl border-2 border-dashed border-slate-200 hover:border-[#1D4ED8] text-xs font-semibold text-[#1D4ED8] hover:bg-blue-50/50 flex items-center justify-center space-x-1.5 transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ Add Another Goal</span>
                </button>
              ) : (
                <div className="p-4 rounded-2xl bg-white border-2 border-blue-200 space-y-3 animate-in fade-in duration-150">
                  <h4 className="text-xs font-bold text-[#0B132B]">Add Custom Goal</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <input
                      type="text"
                      placeholder="Goal Name (e.g. Higher Education)"
                      value={newGoalName}
                      onChange={(e) => setNewGoalName(e.target.value)}
                      className="px-3 py-2 rounded-lg border border-slate-200 text-xs outline-none focus:border-[#1D4ED8]"
                    />
                    <input
                      type="number"
                      step="100000"
                      placeholder="Amount (₹)"
                      value={newGoalAmount}
                      onChange={(e) => setNewGoalAmount(Number(e.target.value))}
                      className="px-3 py-2 rounded-lg border border-slate-200 text-xs font-mono outline-none focus:border-[#1D4ED8]"
                    />
                    <input
                      type="number"
                      placeholder="Years (e.g. 10)"
                      value={newGoalYears}
                      onChange={(e) => setNewGoalYears(Number(e.target.value))}
                      className="px-3 py-2 rounded-lg border border-slate-200 text-xs font-mono outline-none focus:border-[#1D4ED8]"
                    />
                  </div>
                  <div className="flex items-center justify-end space-x-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setIsAddingGoal(false)}
                      className="px-3 py-1.5 rounded-lg text-xs text-slate-500 hover:bg-slate-100"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleAddGoal}
                      className="px-4 py-1.5 rounded-lg text-xs font-semibold text-white bg-[#1D4ED8] hover:bg-[#1E40AF]"
                    >
                      Save Goal
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Actions */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <button
                type="button"
                onClick={handleBack}
                className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-full text-xs font-semibold text-slate-600 hover:text-slate-900 border border-slate-200 bg-white"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>

              <button
                type="button"
                onClick={handleNext}
                className="inline-flex items-center space-x-2 px-6 py-2.5 rounded-full text-xs font-bold text-white bg-[#1D4ED8] hover:bg-[#1E40AF] transition-all shadow-md active:scale-95"
              >
                <span>Continue</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

          </div>

          {/* Right Visual Card Matching Reference Image (5 cols) */}
          <div className="lg:col-span-5 relative rounded-3xl overflow-hidden min-h-[420px] shadow-lg border border-slate-200 flex flex-col justify-end p-6 text-white group">
            <img 
              src="./images/child_education.jpg" 
              alt="Today's planning tomorrow's freedom"
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0B132B] via-[#0B132B]/50 to-transparent" />
            
            <div className="relative space-y-3">
              <span className="px-2.5 py-1 rounded-full bg-emerald-500/30 text-emerald-200 text-[10px] font-mono uppercase tracking-wider backdrop-blur-md border border-emerald-400/30 inline-block">
                Milestone Security
              </span>
              <h3 className="font-serif text-2xl font-bold leading-tight">
                Today’s Planning. <br />
                <span className="text-emerald-300">Tomorrow’s Freedom.</span>
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed font-normal">
                Discrete goals like university education and homeownership are indexed against long-term inflation so your family's future dreams are never compromised.
              </p>
            </div>
          </div>

        </div>
      )}

      {/* STEP 3: CURRENT PROTECTION & LIABILITIES */}
      {currentStep === 3 && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Inputs (7 cols) */}
          <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-3xl border border-[#E6E4DF] shadow-xs space-y-6">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="font-serif text-lg font-semibold text-[#0B132B]">
                Debts & Existing Assets
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Outstanding liabilities and resources that offset your total need.
              </p>
            </div>

            <div className="space-y-4">
              
              {/* Home Loan / Mortgages */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 flex justify-between">
                  <span>Home Loan / Mortgages Outstanding</span>
                  <span className="font-mono text-slate-900 font-bold">
                    {formatINR(formData.liabilities.home_loan)}
                  </span>
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">
                    ₹
                  </span>
                  <input
                    type="number"
                    step="100000"
                    value={formData.liabilities.home_loan}
                    onChange={(e) => handleLiabilityUpdate('home_loan', Number(e.target.value))}
                    className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm font-mono font-semibold focus:border-[#1D4ED8] outline-none"
                    placeholder="2500000"
                  />
                </div>
              </div>

              {/* Other Loans (Car, Personal) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">
                    Car / Auto Loan
                  </label>
                  <input
                    type="number"
                    value={formData.liabilities.car_loan}
                    onChange={(e) => handleLiabilityUpdate('car_loan', Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono font-semibold"
                    placeholder="0"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">
                    Personal & Other Debt
                  </label>
                  <input
                    type="number"
                    value={formData.liabilities.personal_loan}
                    onChange={(e) => handleLiabilityUpdate('personal_loan', Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono font-semibold"
                    placeholder="0"
                  />
                </div>
              </div>

              {/* Existing Life Cover */}
              <div className="space-y-1.5 pt-2 border-t border-slate-100">
                <label className="text-xs font-semibold text-slate-700 flex justify-between">
                  <span>Existing Life Insurance Cover (Sum Assured)</span>
                  <span className="font-mono text-emerald-600 font-bold">
                    {formatINR(formData.existing_life_cover)}
                  </span>
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">
                    ₹
                  </span>
                  <input
                    type="number"
                    step="100000"
                    value={formData.existing_life_cover}
                    onChange={(e) => handleUpdate({ existing_life_cover: Number(e.target.value) })}
                    className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm font-mono font-semibold focus:border-[#1D4ED8] outline-none"
                    placeholder="2000000"
                  />
                </div>
                <span className="text-[10px] text-slate-400">
                  Total sum assured under existing term or endowment policies.
                </span>
              </div>

              {/* Eligible Liquid Assets & Savings */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 flex justify-between">
                  <span>Liquid Savings & Investments</span>
                  <span className="font-mono text-emerald-600 font-bold">
                    {formatINR(totalAssets)}
                  </span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <span className="text-[11px] text-slate-500">Savings & FDs</span>
                    <input
                      type="number"
                      value={formData.existing_assets.savings_account + formData.existing_assets.fixed_deposits}
                      onChange={(e) => {
                        const half = Number(e.target.value) / 2;
                        handleAssetUpdate('savings_account', half);
                        handleAssetUpdate('fixed_deposits', half);
                      }}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono font-semibold"
                      placeholder="1000000"
                    />
                  </div>
                  <div className="space-y-1">
                    <span className="text-[11px] text-slate-500">Mutual Funds / Equity</span>
                    <input
                      type="number"
                      value={formData.existing_assets.mutual_funds_stocks}
                      onChange={(e) => handleAssetUpdate('mutual_funds_stocks', Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono font-semibold"
                      placeholder="500000"
                    />
                  </div>
                </div>
              </div>

            </div>

            {/* Bottom Actions */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <button
                type="button"
                onClick={handleBack}
                className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-full text-xs font-semibold text-slate-600 hover:text-slate-900 border border-slate-200 bg-white"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>

              <button
                type="button"
                onClick={handleNext}
                className="inline-flex items-center space-x-2 px-6 py-2.5 rounded-full text-xs font-bold text-white bg-[#1D4ED8] hover:bg-[#1E40AF] transition-all shadow-md active:scale-95"
              >
                <span>Continue</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

          </div>

          {/* Right Visual Card (5 cols) */}
          <div className="lg:col-span-5 relative rounded-3xl overflow-hidden min-h-[420px] shadow-lg border border-slate-200 flex flex-col justify-end p-6 text-white group">
            <img 
              src="./images/dream_home.jpg" 
              alt="Asset and debt protection"
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0B132B] via-[#0B132B]/50 to-transparent" />
            
            <div className="relative space-y-3">
              <span className="px-2.5 py-1 rounded-full bg-amber-500/30 text-amber-200 text-[10px] font-mono uppercase tracking-wider backdrop-blur-md border border-amber-400/30 inline-block">
                Liability Extinguishment
              </span>
              <h3 className="font-serif text-2xl font-bold leading-tight">
                Clear Debts. <br />
                <span className="text-amber-300">Preserve Generational Wealth.</span>
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed font-normal">
                By setting aside capital to settle loans immediately, your family retains their home and assets free and clear, without suffering foreclosure or forced asset liquidation.
              </p>
            </div>
          </div>

        </div>
      )}

      {/* STEP 4: REVIEW AND CALCULATE */}
      {currentStep === 4 && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#E6E4DF] shadow-sm space-y-6">
          
          <div className="border-b border-slate-100 pb-4">
            <h3 className="font-serif text-xl font-semibold text-[#0B132B]">
              Summary Verification & Valuation Trigger
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Review your entered financial parameters before the calculation engine computes your exact protection requirement.
            </p>
          </div>

          {/* 4 Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            <div className="p-4 rounded-2xl bg-[#FAF9F5] border border-[#E6E4DF] space-y-1">
              <span className="text-[10px] font-mono uppercase text-slate-400 tracking-wider">
                Profile
              </span>
              <div className="text-sm font-bold text-[#0B132B]">{formData.full_name}</div>
              <div className="text-xs text-slate-600">
                Age {formData.age} &bull; {formData.dependents_count} Dependents
              </div>
              <div className="text-xs font-mono text-[#1D4ED8] font-semibold pt-1">
                {formatINR(formData.annual_income)}/yr
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[#FAF9F5] border border-[#E6E4DF] space-y-1">
              <span className="text-[10px] font-mono uppercase text-slate-400 tracking-wider">
                Living Expenses
              </span>
              <div className="text-sm font-bold text-[#0B132B]">
                {formatINR(formData.monthly_expenses)}/mo
              </div>
              <div className="text-xs text-slate-600">
                Horizon: {formData.replacement_horizon_years || 15} Years
              </div>
              <div className="text-xs text-slate-400 pt-1">
                Fisher real-rate discounted
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[#FAF9F5] border border-[#E6E4DF] space-y-1">
              <span className="text-[10px] font-mono uppercase text-slate-400 tracking-wider">
                Liabilities & Goals
              </span>
              <div className="text-sm font-bold text-slate-800">
                Debt: {formatINR(totalLiabilities)}
              </div>
              <div className="text-xs text-slate-600">
                Goals: {formatINR(totalGoals)} ({formData.future_goals.length} goals)
              </div>
              <div className="text-xs text-slate-400 pt-1">
                Full principal extinguishment
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-100 space-y-1">
              <span className="text-[10px] font-mono uppercase text-emerald-700 tracking-wider">
                Available Offsets
              </span>
              <div className="text-sm font-bold text-emerald-900">
                Assets: {formatINR(totalAssets)}
              </div>
              <div className="text-xs text-emerald-700">
                Existing Cover: {formatINR(formData.existing_life_cover)}
              </div>
              <div className="text-xs text-emerald-600 font-semibold pt-1">
                Total Credit: {formatINR(totalAssets + formData.existing_life_cover)}
              </div>
            </div>

          </div>

          {/* Preferences (Budget & Risk) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-100">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-700">
                Monthly Insurance Premium Budget
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">₹</span>
                <input
                  type="number"
                  step="500"
                  value={formData.monthly_budget}
                  onChange={(e) => handleUpdate({ monthly_budget: Number(e.target.value) })}
                  className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm font-mono font-semibold"
                  placeholder="1500"
                />
              </div>
              <span className="text-[10px] text-slate-400">
                Target monthly allocation for insurance protection.
              </span>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-700">
                Risk & Investment Preference
              </label>
              <div className="flex items-center space-x-2">
                {(['conservative', 'moderate', 'aggressive'] as const).map((risk) => (
                  <button
                    key={risk}
                    type="button"
                    onClick={() => handleUpdate({ risk_profile: risk })}
                    className={`flex-1 py-2.5 rounded-xl text-xs font-semibold capitalize border transition-all ${
                      formData.risk_profile === risk
                        ? 'bg-[#0B132B] text-white border-[#0B132B]'
                        : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    {risk}
                  </button>
                ))}
              </div>
              <span className="text-[10px] text-slate-400">
                Influences whether Term, ULIP, or Endowment products are prioritized.
              </span>
            </div>
          </div>

          {/* Bottom Actions with Submit */}
          <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
            <button
              type="button"
              onClick={handleBack}
              className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-full text-xs font-semibold text-slate-600 hover:text-slate-900 border border-slate-200 bg-white"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>

            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className="inline-flex items-center space-x-2.5 px-8 py-3.5 rounded-full text-sm font-bold text-white bg-[#1D4ED8] hover:bg-[#1E40AF] transition-all shadow-lg shadow-blue-500/30 active:scale-95 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Computing True Capital Need...</span>
                </>
              ) : (
                <>
                  <span>Calculate My Protection Need</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>

        </div>
      )}

    </div>
  );
};
