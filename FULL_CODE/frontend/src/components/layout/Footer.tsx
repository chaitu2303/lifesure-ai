import React from 'react';
import { ArrowUpRight } from 'lucide-react';

interface FooterProps {
  onNavigate: (view: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="bg-[#F4F2EB] text-midnight-800 text-xs border-t border-[#E6E4DF] pt-16 pb-16 no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Masthead Row */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-12 border-b border-[#E6E4DF]">
          
          {/* Brand & Manifesto */}
          <div className="md:col-span-5 space-y-4">
            <div className="flex items-baseline space-x-2">
              <span className="font-serif text-2xl font-semibold tracking-tight text-midnight-950">
                LifeWise
              </span>
              <span className="font-mono text-[10px] tracking-wider uppercase text-cobalt-700 bg-cobalt-50 px-1.5 py-0.5 rounded border border-cobalt-100">
                Fiduciary Advisory
              </span>
            </div>
            <p className="text-midnight-600 text-[13px] leading-relaxed max-w-sm">
              Protect Today. Plan Tomorrow. Live Assured. An independent digital life insurance needs finder and digital advisory platform built for retail banking customers.
            </p>
            <div className="pt-1">
              <span className="text-[11px] font-mono uppercase tracking-wider text-midnight-500">
                Capital Needs Analysis &bull; Deterministic Saffron Engine
              </span>
            </div>
          </div>

          {/* Column 2: Architecture */}
          <div className="md:col-span-2 space-y-3">
            <h4 className="text-[11px] font-mono uppercase tracking-[0.15em] text-midnight-500 font-semibold">
              Advisory Architecture
            </h4>
            <ul className="space-y-2 text-[13px] text-midnight-800">
              <li>
                <button onClick={() => onNavigate('assessment')} className="hover:text-cobalt-700 transition-colors text-left">
                  Needs Assessment
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('simulator')} className="hover:text-cobalt-700 transition-colors text-left">
                  What-If Sandbox
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('dashboard')} className="hover:text-cobalt-700 transition-colors text-left">
                  Client Dashboard
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('admin')} className="hover:text-cobalt-700 transition-colors text-left">
                  Governance Portal
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Category Coverage */}
          <div className="md:col-span-2 space-y-3">
            <h4 className="text-[11px] font-mono uppercase tracking-[0.15em] text-midnight-500 font-semibold">
              Policy Structures
            </h4>
            <ul className="space-y-2 text-[13px] text-midnight-800">
              <li>Pure Term Protection</li>
              <li>Unit-Linked Wealth (ULIP)</li>
              <li>Guaranteed Endowment</li>
              <li>Whole Life Estate Legacy</li>
            </ul>
          </div>

          {/* Column 4: Fiduciary Commitments */}
          <div className="md:col-span-3 space-y-3">
            <h4 className="text-[11px] font-mono uppercase tracking-[0.15em] text-midnight-500 font-semibold">
              Fiduciary Charter
            </h4>
            <p className="text-midnight-600 text-[12px] leading-relaxed">
              We do not distribute policies for sales commissions. Calculations rely on transparent Fisher real interest rate discounting and honest zero-lower-bound constraints.
            </p>
            <div className="pt-2 text-[11px] font-mono text-cobalt-800 flex items-center space-x-1">
              <span>ZERO INTRUSIVE IDENTIFIERS</span>
              <span>•</span>
              <span>NO DATA BROKERING</span>
            </div>
          </div>

        </div>

        {/* Legal & Regulatory Bottom Row */}
        <div className="pt-8 flex flex-col md:flex-row items-start md:items-center justify-between text-midnight-500 text-[11px] gap-4">
          <p className="max-w-2xl leading-relaxed">
            &copy; {new Date().getFullYear()} LifeWise &bull; Protect Today. Plan Tomorrow. Live Assured. All estimations are generated for analytical and educational comparison using synthetic demonstration datasets for TalentAP Mega Hackathon 2026 (Problem B2). They do not constitute an official underwriting commitment or binding insurer quotation.
          </p>
          <div className="flex items-center space-x-5 text-midnight-600 font-medium shrink-0">
            <span>Methodology Manifesto</span>
            <span>•</span>
            <span>Privacy Standard</span>
            <span>•</span>
            <span>Actuarial Disclosures</span>
          </div>
        </div>

      </div>
    </footer>
  );
};
