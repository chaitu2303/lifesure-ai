import React, { useState } from 'react';
import { Calculator, ArrowRight, Check, HelpCircle } from 'lucide-react';

interface CalculationPreviewProps {
  onStartAssessment?: () => void;
}

export const CalculationPreview: React.FC<CalculationPreviewProps> = ({ onStartAssessment }) => {
  const [expenseInput, setExpenseInput] = useState<number>(4500);
  const [yearsInput, setYearsInput] = useState<number>(15);
  const [debtInput, setDebtInput] = useState<number>(220000);
  const [assetsInput, setAssetsInput] = useState<number>(75000);

  // Exact real discount rate computation: (8% safe return - 6% inflation) / (1 + 0.06) = 1.8867% real return
  const inflation = 0.06;
  const discount = 0.08;
  const realRate = (discount - inflation) / (1 + inflation);
  
  // Annuity PV for 75% dependency factor
  const annualExpense = expenseInput * 12 * 0.75;
  const annuityFactor = (1 - Math.pow(1 + realRate, -yearsInput)) / realRate;
  const pvIncome = Math.round(annualExpense * annuityFactor);
  
  const goalsFund = 60000;
  const emergencyReserve = expenseInput * 6;
  const grossTotal = pvIncome + debtInput + goalsFund + emergencyReserve;
  const netRecommended = Math.max(0, grossTotal - assetsInput);

  return (
    <section id="how-it-works" className="py-20 bg-white border-b border-[#E6E4DF]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Editorial Section Header */}
        <div className="max-w-3xl mb-12">
          <span className="font-mono text-[11px] font-semibold tracking-[0.2em] uppercase text-midnight-500">
            TRANSPARENT ACTUARIAL LEDGER
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-medium text-midnight-950 mt-1 tracking-tight">
            An interactive preview of how coverage is calculated
          </h2>
          <p className="mt-3 text-midnight-700 text-sm sm:text-base leading-relaxed">
            Adjust the representative inputs below to witness how the Fisher real interest rate equation discounting and liability elimination interact in real time.
          </p>
        </div>

        {/* Dual Column Ledger Interface */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Controls Column */}
          <div className="lg:col-span-5 p-6 rounded-2xl bg-[#FAF9F5] border border-[#E6E4DF] space-y-5">
            <h4 className="font-mono text-xs uppercase tracking-wider text-midnight-600 font-bold border-b border-[#E6E4DF] pb-2">
              Representative Household Variables
            </h4>

            {/* Monthly Living Expense */}
            <div>
              <div className="flex justify-between items-center text-xs mb-1.5">
                <span className="font-medium text-midnight-800">Monthly Household Living Cost</span>
                <span className="font-mono font-bold text-midnight-950">${expenseInput.toLocaleString()} / mo</span>
              </div>
              <input
                type="range"
                min={2000}
                max={12000}
                step={250}
                value={expenseInput}
                onChange={(e) => setExpenseInput(Number(e.target.value))}
                className="w-full accent-cobalt-700 cursor-pointer"
              />
            </div>

            {/* Horizon */}
            <div>
              <div className="flex justify-between items-center text-xs mb-1.5">
                <span className="font-medium text-midnight-800">Replacement Horizon (Years)</span>
                <span className="font-mono font-bold text-midnight-950">{yearsInput} Years</span>
              </div>
              <input
                type="range"
                min={5}
                max={30}
                step={1}
                value={yearsInput}
                onChange={(e) => setYearsInput(Number(e.target.value))}
                className="w-full accent-cobalt-700 cursor-pointer"
              />
            </div>

            {/* Outstanding Debt */}
            <div>
              <div className="flex justify-between items-center text-xs mb-1.5">
                <span className="font-medium text-midnight-800">Outstanding Debt & Mortgages</span>
                <span className="font-mono font-bold text-midnight-950">${debtInput.toLocaleString()}</span>
              </div>
              <input
                type="range"
                min={0}
                max={600000}
                step={10000}
                value={debtInput}
                onChange={(e) => setDebtInput(Number(e.target.value))}
                className="w-full accent-cobalt-700 cursor-pointer"
              />
            </div>

            {/* Liquid Assets */}
            <div>
              <div className="flex justify-between items-center text-xs mb-1.5">
                <span className="font-medium text-midnight-800">Eligible Liquid Investments</span>
                <span className="font-mono font-bold text-emerald-700">${assetsInput.toLocaleString()}</span>
              </div>
              <input
                type="range"
                min={0}
                max={300000}
                step={5000}
                value={assetsInput}
                onChange={(e) => setAssetsInput(Number(e.target.value))}
                className="w-full accent-emerald-600 cursor-pointer"
              />
            </div>

            <div className="pt-2 text-[11px] font-mono text-midnight-500 leading-relaxed">
              *Model assumption: 6.0% long-term inflation, 8.0% conservative discount rate, 75% dependent consumption ratio.
            </div>
          </div>

          {/* Mathematical Proof Ledger Column */}
          <div className="lg:col-span-7 bg-white rounded-2xl border border-[#E6E4DF] shadow-editorial p-6 sm:p-8 space-y-6">
            <div className="border-b border-[#E6E4DF] pb-4 flex items-center justify-between">
              <div>
                <span className="font-mono text-[10px] tracking-wider uppercase text-midnight-500 font-semibold">
                  Step-by-Step Mathematical Derivation
                </span>
                <h3 className="font-serif text-xl font-medium text-midnight-950 mt-0.5">
                  Capital Needs Ledger
                </h3>
              </div>
              <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-cobalt-50 text-cobalt-800 border border-cobalt-100">
                CFP® FORMULA
              </span>
            </div>

            {/* Mathematical Rows */}
            <div className="divide-y divide-[#F4F2EB] text-xs">
              <div className="py-3 flex items-start justify-between">
                <div>
                  <p className="font-semibold text-midnight-950">Income Replacement Present Value (PV)</p>
                  <p className="text-midnight-500 text-[11px] mt-0.5">
                    ${(expenseInput * 12 * 0.75).toLocaleString()}/yr discounted at 1.89% real rate for {yearsInput} yrs
                  </p>
                </div>
                <span className="font-mono font-bold text-midnight-950 text-sm">
                  +${pvIncome.toLocaleString()}
                </span>
              </div>

              <div className="py-3 flex items-start justify-between">
                <div>
                  <p className="font-semibold text-midnight-950">Immediate Liabilities Payoff</p>
                  <p className="text-midnight-500 text-[11px] mt-0.5">
                    Complete mortgage and debt clearance to eliminate debt servicing stress
                  </p>
                </div>
                <span className="font-mono font-bold text-midnight-950 text-sm">
                  +${debtInput.toLocaleString()}
                </span>
              </div>

              <div className="py-3 flex items-start justify-between">
                <div>
                  <p className="font-semibold text-midnight-950">Future Educational Milestones (PV)</p>
                  <p className="text-midnight-500 text-[11px] mt-0.5">
                    Discounted college & milestone funding
                  </p>
                </div>
                <span className="font-mono font-bold text-midnight-950 text-sm">
                  +${goalsFund.toLocaleString()}
                </span>
              </div>

              <div className="py-3 flex items-start justify-between">
                <div>
                  <p className="font-semibold text-midnight-950">Family Emergency Transition Reserve</p>
                  <p className="text-midnight-500 text-[11px] mt-0.5">
                    6 months living buffer for immediate probate and bereavement transition
                  </p>
                </div>
                <span className="font-mono font-bold text-midnight-950 text-sm">
                  +${emergencyReserve.toLocaleString()}
                </span>
              </div>

              <div className="py-3 flex items-start justify-between text-emerald-800">
                <div>
                  <p className="font-semibold">Less: Eligible Existing Liquid Assets</p>
                  <p className="text-emerald-700/80 text-[11px] mt-0.5">
                    Offsetting bank deposits, stocks, mutual funds (primary home excluded)
                  </p>
                </div>
                <span className="font-mono font-bold text-sm">
                  -${assetsInput.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Total Highlight */}
            <div className="p-4 rounded-xl bg-[#FAF9F5] border border-[#E6E4DF] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-midnight-500 font-semibold">
                  Net Recommended Additional Cover
                </span>
                <p className="font-serif text-3xl font-bold text-midnight-950 mt-0.5">
                  ${netRecommended.toLocaleString()}
                </p>
              </div>
              <div className="text-right text-xs">
                <span className="text-midnight-500">Gross Protection Need:</span>
                <p className="font-mono font-semibold text-midnight-900">${grossTotal.toLocaleString()}</p>
              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
