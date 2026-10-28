import React from 'react';
import { Home, Car, CreditCard, GraduationCap, Banknote, ShieldAlert } from 'lucide-react';
import { AssessmentInput, LiabilitiesInput } from '../../types';

interface Step3Props {
  data: AssessmentInput;
  onChange: (updates: Partial<AssessmentInput>) => void;
}

export const Step3Liabilities: React.FC<Step3Props> = ({ data, onChange }) => {
  const liabilities = data.liabilities || {
    home_loan: 0,
    car_loan: 0,
    personal_loan: 0,
    education_loan: 0,
    credit_cards: 0,
    other_liabilities: 0,
  };

  const updateField = (field: keyof LiabilitiesInput, value: number) => {
    onChange({
      liabilities: {
        ...liabilities,
        [field]: Math.max(0, value),
      },
    });
  };

  const totalLiabilities =
    Number(liabilities.home_loan || 0) +
    Number(liabilities.car_loan || 0) +
    Number(liabilities.personal_loan || 0) +
    Number(liabilities.education_loan || 0) +
    Number(liabilities.credit_cards || 0) +
    Number(liabilities.other_liabilities || 0);

  const debtFields: Array<{
    key: keyof LiabilitiesInput;
    label: string;
    sublabel: string;
    icon: React.ElementType;
    step: number;
    placeholder: string;
  }> = [
    {
      key: 'home_loan',
      label: 'Residential Mortgage Balance',
      sublabel: 'Primary residence & real estate debt',
      icon: Home,
      step: 5000,
      placeholder: '180,000',
    },
    {
      key: 'car_loan',
      label: 'Vehicle & Auto Financing',
      sublabel: 'Automobile leases and secured car loans',
      icon: Car,
      step: 1000,
      placeholder: '14,000',
    },
    {
      key: 'education_loan',
      label: 'Student & Education Loans',
      sublabel: 'Undergraduate and professional degree debt',
      icon: GraduationCap,
      step: 1000,
      placeholder: '0',
    },
    {
      key: 'personal_loan',
      label: 'Unsecured Personal Loans',
      sublabel: 'Bank lines of credit and personal debt',
      icon: Banknote,
      step: 1000,
      placeholder: '0',
    },
    {
      key: 'credit_cards',
      label: 'Revolving Credit Card Balances',
      sublabel: 'High-interest rolling consumer credit',
      icon: CreditCard,
      step: 500,
      placeholder: '3,500',
    },
    {
      key: 'other_liabilities',
      label: 'Other Private Obligations',
      sublabel: 'Promissory notes, family loans, or guarantees',
      icon: ShieldAlert,
      step: 1000,
      placeholder: '0',
    },
  ];

  return (
    <div className="space-y-8">
      
      {/* Step Header with Total Debt Pill */}
      <div className="border-b border-[#E6E4DF] pb-5 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-widest text-[#1D4ED8] font-bold">
            Stage 03 / 07 · Debt Amortization
          </span>
          <h2 className="text-2xl font-serif text-[#0B132B] font-medium mt-1">
            Outstanding Loans & Liabilities
          </h2>
          <p className="text-xs text-[#475569] mt-1 leading-relaxed">
            Debts that must be paid off immediately upon claim to protect surviving dependents from creditor pressure.
          </p>
        </div>

        <div className="border border-[#E6E4DF] bg-[#FAF9F5] px-4 py-2 rounded-sm text-right">
          <div className="text-[10px] font-mono uppercase tracking-wider text-[#64748B]">Total Debt Payoff</div>
          <div className="text-lg font-mono font-bold text-rose-700">
            ${totalLiabilities.toLocaleString()}
          </div>
        </div>
      </div>

      {/* Debt Fields Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {debtFields.map((field) => {
          const Icon = field.icon;
          const val = liabilities[field.key];
          return (
            <div key={field.key} className="space-y-2">
              <label className="block text-xs font-mono uppercase tracking-wider text-[#0B132B] font-semibold flex items-center justify-between">
                <span className="flex items-center space-x-1.5 truncate">
                  <Icon className="w-3.5 h-3.5 text-[#1D4ED8] shrink-0" />
                  <span className="truncate">{field.label}</span>
                </span>
              </label>

              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#64748B] font-mono font-bold text-sm">
                  $
                </div>
                <input
                  type="number"
                  min={0}
                  step={field.step}
                  value={val || ''}
                  onChange={(e) => updateField(field.key, Number(e.target.value))}
                  placeholder={field.placeholder}
                  className="w-full pl-9 pr-4 py-3 text-sm font-mono bg-white border border-[#E6E4DF] rounded-sm focus:outline-none focus:border-[#1D4ED8] transition-all text-[#0B132B]"
                />
              </div>
              <span className="text-[11px] font-mono text-[#64748B] block">
                {field.sublabel}
              </span>
            </div>
          );
        })}
      </div>

      <div className="p-4 bg-white border border-[#E6E4DF] rounded-sm text-xs text-[#475569] leading-relaxed">
        <span className="font-mono text-[10px] uppercase tracking-wider text-[#0B132B] font-semibold block mb-1">
          Fiduciary Elimination Principle:
        </span>
        We do not calculate gradual multi-year debt amortization in death scenarios. 100% of outstanding loan principals are reserved for immediate liquidation to secure outright ownership of family shelter and assets.
      </div>

    </div>
  );
};
