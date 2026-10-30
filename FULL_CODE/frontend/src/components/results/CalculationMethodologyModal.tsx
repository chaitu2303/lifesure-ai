import React from 'react';
import { X, Calculator, ShieldCheck, Check } from 'lucide-react';
import { CalculationResult, FinancialAssumptions } from '../../types';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  result?: CalculationResult;
  assumptions?: FinancialAssumptions;
}

export const CalculationMethodologyModal: React.FC<ModalProps> = ({ isOpen, onClose, result, assumptions }) => {
  if (!isOpen) return null;

  const a: any = assumptions || result?.assumptions_used || {
    inflation_rate: 0.06,
    discount_rate: 0.08,
    real_rate: 0.0189,
    emergency_reserve_months: 6,
    family_expense_factor: 0.75,
    replacement_horizon_years: 15,
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#0B132B]/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-sm max-w-2xl w-full border border-[#E6E4DF] shadow-lg overflow-hidden animate-in fade-in duration-150">
        
        {/* Header */}
        <div className="px-6 py-5 bg-[#FAF9F5] border-b border-[#E6E4DF] flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-full bg-[#1D4ED8]/10 border border-[#1D4ED8]/20 text-[#1D4ED8] flex items-center justify-center">
              <Calculator className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#1D4ED8] font-bold block">
                Actuarial Standards & Mathematical Proofs
              </span>
              <h3 className="font-serif text-lg font-normal text-[#0B132B]">
                Capital Needs Analysis Derivations
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-[#64748B] hover:text-[#0B132B] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto text-xs text-[#475569] leading-relaxed">
          
          {/* Core Net Gap Equation */}
          <div className="p-5 bg-[#FAF9F5] border border-[#E6E4DF] rounded-sm">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#0B132B] font-semibold block mb-2">
              The Canonical Capital Needs Formula:
            </span>
            <div className="font-mono text-[11px] bg-white p-4 border border-[#E6E4DF] rounded-sm text-[#0B132B] leading-relaxed overflow-x-auto">
              Net Coverage Need = max(0, <br />
              &nbsp;&nbsp;+ PV(Income Replacement: {a.replacement_horizon_years || 15} yrs) <br />
              &nbsp;&nbsp;+ Debt Liquidation (Mortgage + Auto + Cards) <br />
              &nbsp;&nbsp;+ PV(Milestones & Children Higher Education) <br />
              &nbsp;&nbsp;+ Emergency Living Buffer ({a.emergency_reserve_months || 6} months) <br />
              &nbsp;&nbsp;- Eligible Liquid Savings & Securities <br />
              &nbsp;&nbsp;- In-Force Personal / Group Life Policies <br />
              )
            </div>
          </div>

          {/* Proof 1: Irving Fisher Relation */}
          <div className="space-y-1.5">
            <h4 className="font-serif text-sm font-medium text-[#0B132B]">
              1. Inflation-Adjusted Discounting (Irving Fisher Relation)
            </h4>
            <p>
              When a surviving family receives a lump sum payout, they invest it into safe, liquid fixed-income instruments while simultaneously withdrawing money monthly in an inflationary environment. We model the real yield via:
            </p>
            <div className="font-mono text-[11px] bg-[#FAF9F5] p-3 border border-[#E6E4DF] rounded-sm text-[#0B132B]">
              r = (1 + i) / (1 + π) - 1 <br />
              r = (1 + {(Number(a.discount_rate || 0.08)).toFixed(2)}) / (1 + {(Number(a.inflation_rate || 0.06)).toFixed(2)}) - 1 = {((Number(a.real_rate || 0.0189)) * 100).toFixed(3)}% real yield
            </div>
          </div>

          {/* Proof 2: Annuity Present Value */}
          <div className="space-y-1.5">
            <h4 className="font-serif text-sm font-medium text-[#0B132B]">
              2. Finite Annuity Present Value Factor
            </h4>
            <p>
              The capital lump sum required to provide an income stream of $E per year for $N years is:
            </p>
            <div className="font-mono text-[11px] bg-[#FAF9F5] p-3 border border-[#E6E4DF] rounded-sm text-[#0B132B]">
              PV = E × [ 1 - (1 + r)^(-N) ] / r
            </div>
            <p className="text-[11px] text-[#64748B]">
              Where E is the 75% dependency-adjusted annual household budget, r is the real discount rate, and N is {a.replacement_horizon_years || 15} years.
            </p>
          </div>

          {/* Proof 3: Zero Lower Bound */}
          <div className="space-y-1.5">
            <h4 className="font-serif text-sm font-medium text-[#0B132B]">
              3. Zero Lower Bound (Self-Insurance Threshold)
            </h4>
            <p>
              If existing assets plus current policies exceed gross capital obligations, net coverage recommendation is capped at strictly <strong>₹0</strong>. We never fabricate unnecessary coverage for households that already self-insure.
            </p>
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-[#FAF9F5] border-t border-[#E6E4DF] flex justify-between items-center text-xs font-mono">
          <span className="text-[#64748B]">Complies with CFP® standards</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#0B132B] hover:bg-[#1D4ED8] text-white rounded-sm font-mono uppercase tracking-wider text-[11px] transition-colors"
          >
            Close Proofs
          </button>
        </div>

      </div>
    </div>
  );
};
