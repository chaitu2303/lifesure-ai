import React from 'react';
import { Shield, PiggyBank, Landmark, TrendingUp, AlertCircle, CheckCircle2 } from 'lucide-react';
import { AssessmentInput, AssetsInput } from '../../types';

interface Step5Props {
  data: AssessmentInput;
  onChange: (updates: Partial<AssessmentInput>) => void;
}

export const Step5Assets: React.FC<Step5Props> = ({ data, onChange }) => {
  const assets = data.existing_assets || {
    savings_account: 0,
    fixed_deposits: 0,
    mutual_funds_stocks: 0,
    pf_ppf_available: 0,
    other_liquid_assets: 0,
  };

  const updateAsset = (field: keyof AssetsInput, value: number) => {
    onChange({
      existing_assets: {
        ...assets,
        [field]: Math.max(0, value),
      },
    });
  };

  const totalAssets =
    Number(assets.savings_account || 0) +
    Number(assets.fixed_deposits || 0) +
    Number(assets.mutual_funds_stocks || 0) +
    Number(assets.pf_ppf_available || 0) +
    Number(assets.other_liquid_assets || 0);

  const existingCover = Number(data.existing_life_cover || 0);
  const totalOffset = totalAssets + existingCover;

  return (
    <div className="space-y-8">
      
      {/* Step Header with Offset Pill */}
      <div className="border-b border-[#E6E4DF] pb-5 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-widest text-[#047857] font-bold">
            Stage 05 / 07 · Capital Offsets
          </span>
          <h2 className="text-2xl font-serif text-[#0B132B] font-medium mt-1">
            Existing Assets & Current Life Cover
          </h2>
          <p className="text-xs text-[#475569] mt-1 leading-relaxed">
            Liquid reserves and active insurance policies that directly reduce the gross protection gap.
          </p>
        </div>

        <div className="border border-[#E6E4DF] bg-[#FAF9F5] px-4 py-2 rounded-sm text-right">
          <div className="text-[10px] font-mono uppercase tracking-wider text-[#64748B]">Total Eligible Offsets</div>
          <div className="text-lg font-mono font-bold text-[#047857]">
            ${totalOffset.toLocaleString()}
          </div>
        </div>
      </div>

      {/* Primary Home Exclusion Notice */}
      <div className="p-4 bg-white border border-[#E6E4DF] rounded-sm text-xs text-[#475569] flex items-start space-x-3">
        <AlertCircle className="w-4 h-4 text-[#B45309] shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <strong className="text-[#0B132B]">Fiduciary Exclusion:</strong> Do <span className="underline">not</span> include the equity value of your primary family residence. Your surviving dependents need shelter; primary homes cannot be liquidated to pay for everyday grocery and utility bills.
        </div>
      </div>

      {/* Existing In-Force Life Insurance */}
      <div className="p-6 bg-[#FAF9F5] border border-[#E6E4DF] rounded-sm space-y-2">
        <div className="flex justify-between items-center">
          <label className="text-xs font-mono uppercase tracking-wider text-[#0B132B] font-semibold flex items-center space-x-2">
            <Shield className="w-4 h-4 text-[#1D4ED8]" />
            <span>Existing Life Insurance Coverage In Force</span>
          </label>
          <span className="text-xs font-mono font-bold text-[#1D4ED8]">
            ${existingCover.toLocaleString()}
          </span>
        </div>

        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#64748B] font-mono font-bold text-sm">
            $
          </div>
          <input
            type="number"
            min={0}
            step={10000}
            value={data.existing_life_cover || ''}
            onChange={(e) => onChange({ existing_life_cover: Math.max(0, Number(e.target.value)) })}
            placeholder="100,000"
            className="w-full pl-9 pr-4 py-3 text-sm font-mono bg-white border border-[#E6E4DF] rounded-sm focus:outline-none focus:border-[#1D4ED8] transition-all text-[#0B132B]"
          />
        </div>
        <span className="text-[11px] font-mono text-[#64748B] block">
          Death benefit from active individual term policies, group life insurance, or employer coverage.
        </span>
      </div>

      {/* Liquid Assets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Bank Savings & Checking */}
        <div className="space-y-2">
          <label className="block text-xs font-mono uppercase tracking-wider text-[#0B132B] font-semibold flex items-center space-x-1.5">
            <PiggyBank className="w-3.5 h-3.5 text-[#1D4ED8]" />
            <span>Cash & Checking Balances</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#64748B] font-mono font-bold text-sm">$</div>
            <input
              type="number"
              min={0}
              step={1000}
              value={assets.savings_account || ''}
              onChange={(e) => updateAsset('savings_account', Number(e.target.value))}
              placeholder="25,000"
              className="w-full pl-9 pr-4 py-3 text-sm font-mono bg-white border border-[#E6E4DF] rounded-sm focus:outline-none focus:border-[#1D4ED8] text-[#0B132B]"
            />
          </div>
          <span className="text-[11px] font-mono text-[#64748B] block">Immediate emergency reserves in bank accounts.</span>
        </div>

        {/* Fixed Deposits & Money Market */}
        <div className="space-y-2">
          <label className="block text-xs font-mono uppercase tracking-wider text-[#0B132B] font-semibold flex items-center space-x-1.5">
            <Landmark className="w-3.5 h-3.5 text-[#1D4ED8]" />
            <span>Fixed Deposits & CDs</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#64748B] font-mono font-bold text-sm">$</div>
            <input
              type="number"
              min={0}
              step={1000}
              value={assets.fixed_deposits || ''}
              onChange={(e) => updateAsset('fixed_deposits', Number(e.target.value))}
              placeholder="15,000"
              className="w-full pl-9 pr-4 py-3 text-sm font-mono bg-white border border-[#E6E4DF] rounded-sm focus:outline-none focus:border-[#1D4ED8] text-[#0B132B]"
            />
          </div>
          <span className="text-[11px] font-mono text-[#64748B] block">Term deposits and Treasury instruments.</span>
        </div>

        {/* Stocks, ETFs & Mutual Funds */}
        <div className="space-y-2">
          <label className="block text-xs font-mono uppercase tracking-wider text-[#0B132B] font-semibold flex items-center space-x-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-[#1D4ED8]" />
            <span>Liquid Stocks, ETFs & Mutual Funds</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#64748B] font-mono font-bold text-sm">$</div>
            <input
              type="number"
              min={0}
              step={5000}
              value={assets.mutual_funds_stocks || ''}
              onChange={(e) => updateAsset('mutual_funds_stocks', Number(e.target.value))}
              placeholder="45,000"
              className="w-full pl-9 pr-4 py-3 text-sm font-mono bg-white border border-[#E6E4DF] rounded-sm focus:outline-none focus:border-[#1D4ED8] text-[#0B132B]"
            />
          </div>
          <span className="text-[11px] font-mono text-[#64748B] block">Marketable securities that can be liquidated within days.</span>
        </div>

        {/* Retirement & Pension Reserves */}
        <div className="space-y-2">
          <label className="block text-xs font-mono uppercase tracking-wider text-[#0B132B] font-semibold flex items-center space-x-1.5">
            <Shield className="w-3.5 h-3.5 text-[#1D4ED8]" />
            <span>Eligible Pension / 401(k) / Superannuation</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#64748B] font-mono font-bold text-sm">$</div>
            <input
              type="number"
              min={0}
              step={5000}
              value={assets.pf_ppf_available || ''}
              onChange={(e) => updateAsset('pf_ppf_available', Number(e.target.value))}
              placeholder="20,000"
              className="w-full pl-9 pr-4 py-3 text-sm font-mono bg-white border border-[#E6E4DF] rounded-sm focus:outline-none focus:border-[#1D4ED8] text-[#0B132B]"
            />
          </div>
          <span className="text-[11px] font-mono text-[#64748B] block">Balances with death-benefit beneficiary transfer.</span>
        </div>

      </div>

    </div>
  );
};
