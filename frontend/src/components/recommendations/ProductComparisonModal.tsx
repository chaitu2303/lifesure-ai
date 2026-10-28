import React from 'react';
import { X, CheckCircle2, AlertCircle } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProductComparisonModal: React.FC<ModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#0B132B]/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-sm max-w-4xl w-full border border-[#E6E4DF] shadow-lg overflow-hidden animate-in fade-in duration-150">
        
        {/* Header */}
        <div className="px-6 py-5 bg-[#FAF9F5] border-b border-[#E6E4DF] flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#1D4ED8] font-bold block">
              Architectural Taxonomy
            </span>
            <h3 className="font-serif text-lg font-normal text-[#0B132B]">
              Life Insurance Product Category Comparison
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-[#64748B] hover:text-[#0B132B] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Table */}
        <div className="p-6 overflow-x-auto text-xs text-[#475569]">
          <table className="w-full text-left border border-[#E6E4DF] rounded-sm overflow-hidden font-mono text-[11px]">
            <thead className="bg-[#FAF9F5] text-[#0B132B] font-bold border-b border-[#E6E4DF]">
              <tr>
                <th className="py-3 px-3.5 border-r border-[#E6E4DF]">Dimension</th>
                <th className="py-3 px-3.5 text-[#1D4ED8] bg-[#1D4ED8]/5 border-r border-[#E6E4DF]">Term Life Insurance</th>
                <th className="py-3 px-3.5 border-r border-[#E6E4DF]">ULIP (Unit-Linked)</th>
                <th className="py-3 px-3.5 border-r border-[#E6E4DF]">Endowment Policy</th>
                <th className="py-3 px-3.5">Whole Life Insurance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E6E4DF]">
              <tr>
                <td className="py-3 px-3.5 font-bold text-[#0B132B] border-r border-[#E6E4DF]">Core Purpose</td>
                <td className="py-3 px-3.5 text-[#0B132B] font-semibold bg-[#1D4ED8]/5 border-r border-[#E6E4DF]">Pure Income Replacement & Debt Clearance</td>
                <td className="py-3 px-3.5 border-r border-[#E6E4DF]">Market-Linked Wealth Growth + Protection</td>
                <td className="py-3 px-3.5 border-r border-[#E6E4DF]">Guaranteed Milestone Savings Target</td>
                <td className="py-3 px-3.5">Lifelong Estate Transfer & Liquidity</td>
              </tr>
              <tr>
                <td className="py-3 px-3.5 font-bold text-[#0B132B] border-r border-[#E6E4DF]">Cost Efficiency ($ Cover / Premium)</td>
                <td className="py-3 px-3.5 font-bold text-[#047857] bg-[#1D4ED8]/5 border-r border-[#E6E4DF]">Highest (~10x more cover per $)</td>
                <td className="py-3 px-3.5 border-r border-[#E6E4DF]">Moderate</td>
                <td className="py-3 px-3.5 text-rose-700 border-r border-[#E6E4DF]">Low (Costly per unit cover)</td>
                <td className="py-3 px-3.5">Low (High lifelong cash outlay)</td>
              </tr>
              <tr>
                <td className="py-3 px-3.5 font-bold text-[#0B132B] border-r border-[#E6E4DF]">Survival Payout at Maturity</td>
                <td className="py-3 px-3.5 text-[#64748B] bg-[#1D4ED8]/5 border-r border-[#E6E4DF]">None (Pure indemnity)</td>
                <td className="py-3 px-3.5 border-r border-[#E6E4DF]">Fund NAV market value</td>
                <td className="py-3 px-3.5 border-r border-[#E6E4DF]">Guaranteed Sum Assured + Bonuses</td>
                <td className="py-3 px-3.5">Guaranteed Cash Value or Paid at Age 100</td>
              </tr>
              <tr>
                <td className="py-3 px-3.5 font-bold text-[#0B132B] border-r border-[#E6E4DF]">Investment / Market Risk</td>
                <td className="py-3 px-3.5 text-[#047857] font-semibold bg-[#1D4ED8]/5 border-r border-[#E6E4DF]">None (Guaranteed death benefit)</td>
                <td className="py-3 px-3.5 text-[#B45309] border-r border-[#E6E4DF]">Borne by policyholder</td>
                <td className="py-3 px-3.5 border-r border-[#E6E4DF]">Borne by insurer</td>
                <td className="py-3 px-3.5">Borne by insurer (Guaranteed crediting)</td>
              </tr>
              <tr>
                <td className="py-3 px-3.5 font-bold text-[#0B132B] border-r border-[#E6E4DF]">Historical Real Return (IRR)</td>
                <td className="py-3 px-3.5 text-[#64748B] bg-[#1D4ED8]/5 border-r border-[#E6E4DF]">N/A (Not a savings plan)</td>
                <td className="py-3 px-3.5 border-r border-[#E6E4DF]">8% – 12% (Equity dependent)</td>
                <td className="py-3 px-3.5 border-r border-[#E6E4DF]">4% – 5.5% (Often below inflation)</td>
                <td className="py-3 px-3.5">3.5% – 4.5% internal crediting</td>
              </tr>
              <tr>
                <td className="py-3 px-3.5 font-bold text-[#0B132B] border-r border-[#E6E4DF]">Primary Fiduciary Recommendation</td>
                <td className="py-3 px-3.5 font-medium text-[#1D4ED8] bg-[#1D4ED8]/5 border-r border-[#E6E4DF]">High priority when dependents and debt exist</td>
                <td className="py-3 px-3.5 border-r border-[#E6E4DF]">Suitable for disciplined long-term tax deferral</td>
                <td className="py-3 px-3.5 border-r border-[#E6E4DF]">Suitable only for ultra-conservative milestone targets</td>
                <td className="py-3 px-3.5">Reserved for estate liquidity & tax planning</td>
              </tr>
            </tbody>
          </table>

          <div className="mt-5 p-4 bg-[#FAF9F5] border border-[#E6E4DF] rounded-sm text-xs leading-relaxed">
            <strong className="text-[#0B132B]">Fiduciary Takeaway:</strong> When a household faces a substantial income replacement or mortgage protection gap, certified financial planners almost universally advise securing low-cost Level Term Life first. This ensures 100% of the catastrophic risk is eliminated without diverting tens of thousands into high-fee savings products.
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-[#FAF9F5] border-t border-[#E6E4DF] flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-mono uppercase tracking-wider font-semibold text-white bg-[#0B132B] hover:bg-[#1D4ED8] rounded-sm transition-colors"
          >
            Close Comparison Matrix
          </button>
        </div>

      </div>
    </div>
  );
};
