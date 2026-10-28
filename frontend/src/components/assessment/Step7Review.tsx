import React from 'react';
import { User, DollarSign, Home, Target, Shield, Edit3, CheckCircle2, FileText } from 'lucide-react';
import { AssessmentInput } from '../../types';

interface Step7Props {
  data: AssessmentInput;
  onJumpToStep: (step: number) => void;
}

export const Step7Review: React.FC<Step7Props> = ({ data, onJumpToStep }) => {
  const totalLiabilities =
    Number(data.liabilities.home_loan || 0) +
    Number(data.liabilities.car_loan || 0) +
    Number(data.liabilities.personal_loan || 0) +
    Number(data.liabilities.education_loan || 0) +
    Number(data.liabilities.credit_cards || 0) +
    Number(data.liabilities.other_liabilities || 0);

  const totalGoals = (data.future_goals || []).reduce((sum, g) => sum + Number(g.target_amount || 0), 0);

  const totalAssets =
    Number(data.existing_assets.savings_account || 0) +
    Number(data.existing_assets.fixed_deposits || 0) +
    Number(data.existing_assets.mutual_funds_stocks || 0) +
    Number(data.existing_assets.pf_ppf_available || 0) +
    Number(data.existing_assets.other_liquid_assets || 0);

  const existingCover = Number(data.existing_life_cover || 0);
  const totalOffsets = totalAssets + existingCover;

  const sections = [
    {
      step: 1,
      title: 'Personal & Career Profile',
      icon: User,
      items: [
        { label: 'Client Name', value: data.full_name || 'Sarah Miller' },
        { label: 'Age & Retirement', value: `${data.age} yrs (Retiring at ${data.retirement_age || 60})` },
        { label: 'Gross Annual Income', value: `$${Number(data.annual_income || 0).toLocaleString()} / yr` },
        { label: 'Financial Dependents', value: `${data.dependents_count} dependent(s)` },
        { label: 'Support Horizon', value: `${data.replacement_horizon_years || 15} years` },
      ],
    },
    {
      step: 2,
      title: 'Living Expense Run-Rate',
      icon: DollarSign,
      items: [
        { label: 'Monthly Household Spend', value: `$${Number(data.monthly_expenses || 0).toLocaleString()} / mo` },
        { label: 'Annualized Living Cost', value: `$${(Number(data.monthly_expenses || 0) * 12).toLocaleString()} / yr` },
        { label: '75% Dependent Need', value: `$${Math.round(Number(data.monthly_expenses || 0) * 12 * 0.75).toLocaleString()} / yr` },
      ],
    },
    {
      step: 3,
      title: 'Outstanding Liabilities',
      icon: Home,
      items: [
        { label: 'Residential Mortgage', value: `$${Number(data.liabilities.home_loan || 0).toLocaleString()}` },
        { label: 'Auto & Consumer Debt', value: `$${(Number(data.liabilities.car_loan || 0) + Number(data.liabilities.credit_cards || 0)).toLocaleString()}` },
        { label: 'Total Debt Liquidation', value: `$${totalLiabilities.toLocaleString()}`, highlight: true },
      ],
    },
    {
      step: 4,
      title: 'Future Milestone Goals',
      icon: Target,
      items: [
        { label: 'Discrete Milestones Added', value: `${(data.future_goals || []).length} goal(s)` },
        { label: 'Cumulative Future Value', value: `$${totalGoals.toLocaleString()}` },
      ],
    },
    {
      step: 5,
      title: 'Eligible Asset Offsets',
      icon: Shield,
      items: [
        { label: 'Active Life Insurance', value: `$${existingCover.toLocaleString()}` },
        { label: 'Liquid Savings & Securities', value: `$${totalAssets.toLocaleString()}` },
        { label: 'Total Capital Offset', value: `$${totalOffsets.toLocaleString()}`, highlightPositive: true },
      ],
    },
    {
      step: 6,
      title: 'Budget & Risk Strategy',
      icon: FileText,
      items: [
        { label: 'Target Monthly Budget', value: `$${Number(data.monthly_budget || 0).toLocaleString()} / mo` },
        { label: 'Risk Preference', value: (data.risk_profile || 'moderate').toUpperCase() },
      ],
    },
  ];

  return (
    <div className="space-y-8">
      
      {/* Step Header */}
      <div className="border-b border-[#E6E4DF] pb-5">
        <span className="text-[10px] font-mono uppercase tracking-widest text-[#1D4ED8] font-bold">
          Stage 07 / 07 · Pre-Flight Audit
        </span>
        <h2 className="text-2xl font-serif text-[#0B132B] font-medium mt-1">
          Review Financial Blueprint
        </h2>
        <p className="text-xs text-[#475569] mt-1 leading-relaxed">
          Verify your parameters before the valuation engine computes the present value annuity and product recommendation matrix.
        </p>
      </div>

      {/* Grid of Section Dossiers */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {sections.map((sec) => {
          const Icon = sec.icon;
          return (
            <div
              key={sec.step}
              className="bg-[#FAF9F5] border border-[#E6E4DF] p-6 rounded-sm flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#E6E4DF]">
                  <div className="flex items-center space-x-2">
                    <Icon className="w-3.5 h-3.5 text-[#1D4ED8]" />
                    <span className="font-serif text-sm font-medium text-[#0B132B]">
                      {sec.title}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => onJumpToStep(sec.step)}
                    className="text-[11px] font-mono text-[#1D4ED8] hover:underline flex items-center space-x-1"
                  >
                    <Edit3 className="w-3 h-3" />
                    <span>Edit</span>
                  </button>
                </div>

                <div className="space-y-2 text-xs font-mono">
                  {sec.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center py-0.5">
                      <span className="text-[#64748B] text-[11px]">{item.label}:</span>
                      <span className={`font-semibold ${
                        item.highlight ? 'text-rose-700' : item.highlightPositive ? 'text-[#047857]' : 'text-[#0B132B]'
                      }`}>
                        {item.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Final Fiduciary Sign-Off Notice */}
      <div className="p-4 bg-white border border-[#E6E4DF] rounded-sm text-xs text-[#475569] flex items-start space-x-3">
        <CheckCircle2 className="w-4 h-4 text-[#047857] shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <strong className="text-[#0B132B]">Deterministic Actuarial Execution:</strong> Clicking "Generate Advisory Memorandum" executes the Capital Needs equations on the live financial engine. Your inputs are stored privately for this session and can be updated at any time.
        </div>
      </div>

    </div>
  );
};
