import React from 'react';
import { ShieldCheck, EyeOff, Scale, FileText, CheckCircle2 } from 'lucide-react';

export const TrustSection: React.FC = () => {
  const commitments = [
    {
      code: 'PRIVACY',
      title: 'Zero High-Risk Identifiers',
      desc: 'We never request national identity numbers (SSN/Aadhaar/FIN), bank account credentials, tax returns, or private medical records. Needs modeling requires only household cash-flow aggregates.',
      icon: EyeOff,
    },
    {
      code: 'ALIGNMENT',
      title: 'Fiduciary Mathematical Integrity',
      desc: 'Recommendation scoring is mathematically deterministic. Term life is never demoted to promote commission-rich whole life or endowment policies. Product fit scores depend solely on your gap and horizon.',
      icon: Scale,
    },
    {
      code: 'COMMUNICATION',
      title: 'Zero Unsolicited Sales Calls',
      desc: 'We do not sell lead contact lists to high-pressure broker call centers. Consultations happen strictly when booked voluntarily with licensed, credentialed financial advisors.',
      icon: ShieldCheck,
    },
    {
      code: 'GOVERNANCE',
      title: 'Transparent Actuarial Proofs',
      desc: 'Every calculated metric displays its underlying formulas, inflation assumptions, and discounting equations. No opaque proprietary black boxes or hidden margin loads.',
      icon: FileText,
    },
  ];

  return (
    <section className="py-24 bg-[#FAF9F5] border-b border-[#E6E4DF]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="max-w-3xl mb-16">
          <div className="inline-flex items-center space-x-2 text-[11px] font-mono tracking-widest uppercase text-[#047857] bg-[#047857]/5 px-2.5 py-1 rounded border border-[#047857]/15 mb-3">
            <span>Fiduciary Charter & Privacy Standard</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-serif font-normal text-[#0B132B] tracking-tight leading-tight">
            Built on fiduciary discipline, not lead-generation sales tactics
          </h2>
          <p className="mt-3 text-sm text-[#475569] leading-relaxed">
            The traditional insurance market is structured around sales volume and broker commissions. 
            LifeSure AI operates as a pure analytical advisory platform to safeguard your family’s interests.
          </p>
        </div>

        {/* 4-Pillar Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {commitments.map((c) => {
            const Icon = c.icon;
            return (
              <div 
                key={c.code}
                className="bg-white border border-[#E6E4DF] p-7 rounded-sm flex flex-col justify-between hover:border-[#0B132B] transition-colors"
              >
                <div>
                  <div className="flex items-center justify-between pb-4 mb-5 border-b border-[#E6E4DF]">
                    <span className="font-mono text-[10px] font-bold tracking-widest text-[#1D4ED8]">
                      {c.code}
                    </span>
                    <Icon className="w-4 h-4 text-[#0B132B]" />
                  </div>
                  <h3 className="font-serif text-lg text-[#0B132B] font-medium leading-snug mb-3">
                    {c.title}
                  </h3>
                  <p className="text-xs text-[#475569] leading-relaxed">
                    {c.desc}
                  </p>
                </div>

                <div className="pt-5 border-t border-[#E6E4DF]/60 mt-6 flex items-center space-x-1.5 text-[11px] font-mono text-[#047857]">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Enforced by platform policy</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Methodology Transparency Ledger */}
        <div className="bg-white border border-[#E6E4DF] p-8 rounded-sm">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-xs text-[#475569]">
            <div>
              <div className="font-mono text-[11px] uppercase tracking-wider text-[#0B132B] font-semibold mb-2">
                Discounting Standards
              </div>
              <p className="leading-relaxed">
                Applies the classical Irving Fisher equation to establish real discount rates, ensuring your family's multi-decade purchasing power remains insulated from inflationary erosion.
              </p>
            </div>
            <div>
              <div className="font-mono text-[11px] uppercase tracking-wider text-[#0B132B] font-semibold mb-2">
                Underwriting Disclosures
              </div>
              <p className="leading-relaxed">
                Premium figures displayed in the comparison matrices are actuarially benchmarked illustrative estimates. Final binding rates are subject to individual carrier underwriting and medical history.
              </p>
            </div>
            <div>
              <div className="font-mono text-[11px] uppercase tracking-wider text-[#0B132B] font-semibold mb-2">
                Certified Advisory Access
              </div>
              <p className="leading-relaxed">
                All consultations are conducted with independent CFP® (Certified Financial Planner) professionals bound by fiduciary obligations under standard regulatory frameworks.
              </p>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};
