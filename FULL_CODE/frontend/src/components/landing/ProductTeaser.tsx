import React from 'react';
import { Shield, Coins, PiggyBank, BarChart2, Check, AlertCircle } from 'lucide-react';

interface ProductTeaserProps {
  onStartAssessment?: () => void;
}

export const ProductTeaser: React.FC<ProductTeaserProps> = ({ onStartAssessment }) => {
  const categories = [
    {
      code: 'TERM',
      name: 'Term Life Insurance',
      subtitle: 'Pure Risk Protection',
      badge: 'Maximum Capital Efficiency',
      badgeColor: 'text-[#1D4ED8] bg-[#1D4ED8]/10 border-[#1D4ED8]/20',
      icon: Shield,
      summary: 'Provides substantial financial compensation strictly if death occurs within the contracted tenure. Zero cash value accumulation upon survival.',
      metrics: {
        efficiency: 'Very High (100% of premium pays risk cover)',
        cashValue: 'None (Pure indemnity)',
        liquidity: 'Zero surrender value',
        tenure: '10 to 40 years fixed',
      },
      bestFor: 'Families needing high coverage (₹50 Lakhs to ₹2+ Crores) during income-earning or debt repayment years at minimal cost.',
      caution: 'Coverage terminates at end of policy term; no payout if you outlive the policy.',
    },
    {
      code: 'WHOLE',
      name: 'Whole Life Insurance',
      subtitle: 'Permanent Protection + Guaranteed Cash Value',
      badge: 'Lifelong Estate Guarantee',
      badgeColor: 'text-[#0B132B] bg-[#0B132B]/5 border-[#0B132B]/15',
      icon: Coins,
      summary: 'Provides guaranteed death benefit protection for your entire lifetime (typically to age 100) alongside contractual cash value accumulation.',
      metrics: {
        efficiency: 'Moderate (Premium split between cover & reserves)',
        cashValue: 'Contractually guaranteed cash value growth',
        liquidity: 'Policy loans permitted against cash value',
        tenure: 'Lifetime / To Age 100',
      },
      bestFor: 'High-net-worth estate liquidity, business succession agreements, and permanent legacy planning.',
      caution: 'Annual premiums are 6x to 10x higher than term life for identical death benefit protection.',
    },
    {
      code: 'ENDOW',
      name: 'Endowment Policies',
      subtitle: 'Disciplined Savings with Embedded Cover',
      badge: 'Maturity Target Funding',
      badgeColor: 'text-[#047857] bg-[#047857]/10 border-[#047857]/20',
      icon: PiggyBank,
      summary: 'Pays out a guaranteed lump sum with bonuses either upon death during policy tenure, or upon maturity date if the insured survives.',
      metrics: {
        efficiency: 'Low protection leverage',
        cashValue: 'High guaranteed lump sum at maturity',
        liquidity: 'Restricted; early surrender incurs severe penalties',
        tenure: '10, 15, or 20 year milestones',
      },
      bestFor: 'Conservative savers targeting fixed non-negotiable milestones like a child’s college matriculation.',
      caution: 'Net returns historically lag broad index funds after policy maintenance fees are deducted.',
    },
    {
      code: 'ULIP',
      name: 'Unit-Linked Insurance (ULIP)',
      subtitle: 'Protection Combined with Market Investment',
      badge: 'Market-Linked Growth',
      badgeColor: 'text-[#64748B] bg-[#64748B]/10 border-[#64748B]/20',
      icon: BarChart2,
      summary: 'A portion of your premium covers mortality risk while the remainder is invested into equity and debt mutual funds chosen by you.',
      metrics: {
        efficiency: 'Variable (Depends on market returns & fees)',
        cashValue: 'Fluctuates daily with NAV market performance',
        liquidity: '5-year statutory lock-in, partial withdrawals after',
        tenure: '10 to 30 years',
      },
      bestFor: 'Disciplined investors comfortable with market volatility seeking integrated tax benefits and asset growth.',
      caution: 'Investment risks are borne entirely by the policyholder; market downturns can reduce fund value.',
    },
  ];

  return (
    <section className="py-24 bg-white border-b border-[#E6E4DF]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="max-w-3xl mb-16">
          <div className="inline-flex items-center space-x-2 text-[11px] font-mono tracking-widest uppercase text-[#1D4ED8] bg-[#1D4ED8]/5 px-2.5 py-1 rounded border border-[#1D4ED8]/15 mb-3">
            <span>Product Taxonomy & Structural Trade-offs</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-serif font-normal text-[#0B132B] tracking-tight leading-tight">
            Understanding insurance structures before you commit
          </h2>
          <p className="mt-3 text-sm text-[#475569] leading-relaxed">
            Every policy structure balances risk protection, cash value accumulation, and capital cost differently. We believe clients make optimal decisions when these mechanics are transparent.
          </p>
        </div>

        {/* 4 Category Editorial Comparison Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((cat) => {
            const Icon = cat.icon;
            return (
              <div 
                key={cat.code}
                className="bg-[#FAF9F5] border border-[#E6E4DF] p-7 rounded-sm flex flex-col justify-between hover:border-[#0B132B] transition-colors"
              >
                <div>
                  <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#E6E4DF]">
                    <span className="font-mono text-xs font-bold text-[#0B132B] tracking-wider">
                      {cat.code}
                    </span>
                    <span className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded border ${cat.badgeColor}`}>
                      {cat.badge}
                    </span>
                  </div>

                  <h3 className="font-serif text-lg text-[#0B132B] font-medium leading-snug">
                    {cat.name}
                  </h3>
                  <div className="text-[11px] text-[#64748B] font-mono mb-3">
                    {cat.subtitle}
                  </div>

                  <p className="text-xs text-[#475569] leading-relaxed mb-6">
                    {cat.summary}
                  </p>

                  {/* Structural Metrics */}
                  <div className="space-y-2 border-t border-[#E6E4DF] pt-4 mb-6 text-[11px]">
                    <div>
                      <span className="font-mono text-[#64748B] block text-[10px] uppercase">Protection Efficiency</span>
                      <span className="font-semibold text-[#0B132B]">{cat.metrics.efficiency}</span>
                    </div>
                    <div>
                      <span className="font-mono text-[#64748B] block text-[10px] uppercase">Cash Value</span>
                      <span className="text-[#0B132B]">{cat.metrics.cashValue}</span>
                    </div>
                    <div>
                      <span className="font-mono text-[#64748B] block text-[10px] uppercase">Tenure</span>
                      <span className="text-[#0B132B]">{cat.metrics.tenure}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 pt-4 border-t border-[#E6E4DF] text-xs">
                  <div className="text-[#047857] flex items-start space-x-1.5">
                    <Check className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 text-[#047857]" />
                    <span className="leading-snug">{cat.bestFor}</span>
                  </div>
                  <div className="text-[#475569] flex items-start space-x-1.5 pt-2 border-t border-[#E6E4DF]/60 text-[11px]">
                    <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 text-[#94A3B8]" />
                    <span className="leading-snug">{cat.caution}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Note on Illustrative Pricing */}
        <div className="mt-8 pt-6 border-t border-[#E6E4DF] flex flex-col sm:flex-row items-center justify-between text-[11px] font-mono text-[#64748B] gap-4">
          <div>
            Note: Premium costs vary by age, health underwriting, and policy term. LifeWise displays actuarially sound illustrative benchmarks from the Saffron Life catalogue without inflated marketing promises.
          </div>
          {onStartAssessment && (
            <button
              onClick={onStartAssessment}
              className="text-[#1D4ED8] hover:underline font-bold whitespace-nowrap"
            >
              See matching categories for your profile →
            </button>
          )}
        </div>

      </div>
    </section>
  );
};
