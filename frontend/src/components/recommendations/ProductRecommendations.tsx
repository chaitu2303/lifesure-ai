import React, { useState } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Sliders,
  DollarSign,
  Table,
  Calendar,
  Layers,
  Sparkles,
  Info,
  X,
  ExternalLink,
  Check
} from 'lucide-react';
import { CalculationResult, AssessmentInput } from '../../types';
import { formatINR } from '../../utils/formatters';

interface Props {
  result: CalculationResult;
  input: AssessmentInput;
  onOpenBooking: () => void;
  onOpenSimulator: () => void;
  onBackToDashboard: () => void;
}

interface ProductDetails {
  id: string;
  category: 'term' | 'whole_life' | 'endowment' | 'ulip';
  name: string;
  badge: string;
  badgeColor: string;
  tagline: string;
  monthlyPremium: number;
  coverRange: string;
  tenure: string;
  costRating: string;
  nature: string;
  bestFor: string;
  bullets: string[];
  tradeOffs: string[];
  suitabilityScore: number;
}

export const ProductRecommendations: React.FC<Props> = ({
  result,
  input,
  onOpenBooking,
  onOpenSimulator,
  onBackToDashboard,
}) => {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [selectedProduct, setSelectedProduct] = useState<ProductDetails | null>(null);

  const coverageGap = result.net_additional_cover || 6500000;

  const products: ProductDetails[] = [
    {
      id: 'term-life',
      category: 'term',
      name: 'Term Life Insurance',
      badge: 'Best for Protection',
      badgeColor: 'bg-blue-50 text-[#1D4ED8] border-blue-200',
      tagline: 'High cover at affordable premium, flexible tenure, ideal for pure protection.',
      monthlyPremium: 1200,
      coverRange: '₹ 25L – ₹ 5 Cr',
      tenure: '10–30 years',
      costRating: 'Low',
      nature: 'Pure protection',
      bestFor: 'Securing family income, paying off mortgages, insulating children’s education.',
      bullets: [
        'High cover at affordable premium',
        'Flexible tenure (10–30 years)',
        'Ideal for pure income protection',
        'Tax deduction under Section 80C'
      ],
      tradeOffs: [
        'No cash maturity value if you survive the policy term',
        'Requires renewal or extension after tenure ends'
      ],
      suitabilityScore: 98,
    },
    {
      id: 'whole-life',
      category: 'whole_life',
      name: 'Whole Life Insurance',
      badge: 'Lifetime Protection',
      badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      tagline: 'Coverage for your entire life up to age 99 or 100 with guaranteed death benefit.',
      monthlyPremium: 3500,
      coverRange: '₹ 25L – ₹ 2 Cr',
      tenure: 'Lifetime (to age 99/100)',
      costRating: 'High',
      nature: 'Long-term security',
      bestFor: 'Estate planning, leaving a guaranteed legacy to heirs, lifetime death benefit.',
      bullets: [
        'Coverage for your entire lifetime',
        'Wealth preservation & legacy creation',
        'Cash value accumulation options',
        'Permanent coverage that never expires'
      ],
      tradeOffs: [
        'Significantly higher monthly premium for identical sum assured',
        'Lacks flexibility if income changes unexpectedly'
      ],
      suitabilityScore: 82,
    },
    {
      id: 'endowment',
      category: 'endowment',
      name: 'Endowment Plan',
      badge: 'Protection + Savings',
      badgeColor: 'bg-amber-50 text-amber-700 border-amber-200',
      tagline: 'Combines risk coverage with guaranteed savings return payable on maturity.',
      monthlyPremium: 4800,
      coverRange: '₹ 5L – ₹ 50L',
      tenure: '10–25 years',
      costRating: 'Medium',
      nature: 'Goal-based savings',
      bestFor: 'Disciplined savers wanting guaranteed capital preservation for specific goals.',
      bullets: [
        'Guaranteed lump-sum payout on maturity or death',
        'Disciplined goal-based forced savings',
        'Low risk profile backed by insurer reserves',
        'Bonus additions over policy tenure'
      ],
      tradeOffs: [
        'Internal rate of return typically low (4% – 5.5% p.a.)',
        'Coverage amount per rupee of premium is low'
      ],
      suitabilityScore: 70,
    },
    {
      id: 'ulip',
      category: 'ulip',
      name: 'Unit-Linked Insurance (ULIP)',
      badge: 'Protection + Investment',
      badgeColor: 'bg-purple-50 text-purple-700 border-purple-200',
      tagline: 'Market-linked returns combined with life cover for long-term wealth creation.',
      monthlyPremium: 5000,
      coverRange: '₹ 10L – ₹ 1 Cr',
      tenure: '10–25 years',
      costRating: 'Medium-High',
      nature: 'Wealth creation',
      bestFor: 'Long-term investors wanting equity market participation with tax-exempt gains.',
      bullets: [
        'Market-linked equity and debt fund options',
        'Free fund switching between equity and debt',
        'Long-term capital gains tax exemptions (under limits)',
        'Transparency of NAV and portfolio allocation'
      ],
      tradeOffs: [
        'Market volatility risk is borne by policyholder',
        'Mandatory 5-year lock-in period'
      ],
      suitabilityScore: 76,
    },
  ];

  const filteredProducts = activeCategory === 'all' 
    ? products 
    : products.filter(p => p.category === activeCategory);

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      
      {/* Header matching Screen 4 & Screen 6 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#E6E4DF] gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono">
            <span className="font-bold text-[#1D4ED8]">4. Recommended Products</span>
            <span className="text-slate-300">&bull;</span>
            <span className="text-slate-500">Unbiased Category Mapping</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-semibold text-[#0B132B] mt-0.5">
            Compare Plans. Choose What Fits You.
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            See how different insurance products meet your family’s {formatINR(coverageGap)} protection need.
          </p>
        </div>

        {/* View Switcher: Cards vs Table */}
        <div className="flex items-center space-x-2 bg-slate-100 p-1 rounded-xl border border-slate-200">
          <button
            onClick={() => setViewMode('cards')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              viewMode === 'cards'
                ? 'bg-white text-[#0B132B] shadow-xs'
                : 'text-slate-600 hover:text-[#0B132B]'
            }`}
          >
            Product Cards
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              viewMode === 'table'
                ? 'bg-white text-[#0B132B] shadow-xs'
                : 'text-slate-600 hover:text-[#0B132B]'
            }`}
          >
            Comparison Matrix
          </button>
        </div>
      </div>

      {/* Category Filter Tabs Matching Reference Image */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-1">
        {[
          { id: 'all', label: 'All Plans' },
          { id: 'term', label: 'Term Life' },
          { id: 'whole_life', label: 'Whole Life' },
          { id: 'endowment', label: 'Endowment' },
          { id: 'ulip', label: 'ULIP' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveCategory(tab.id)}
            className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all border ${
              activeCategory === tab.id
                ? 'bg-[#1D4ED8] text-white border-[#1D4ED8] shadow-sm'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:border-slate-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* VIEW 1: PRODUCT CARDS (SCREEN 4) */}
      {viewMode === 'cards' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredProducts.map((prod) => (
            <div
              key={prod.id}
              className={`bg-white rounded-3xl border transition-all p-6 flex flex-col justify-between space-y-6 hover:shadow-lg ${
                prod.id === 'term-life'
                  ? 'border-blue-300 ring-2 ring-blue-500/10 shadow-md'
                  : 'border-[#E6E4DF] shadow-xs'
              }`}
            >
              <div className="space-y-4">
                
                {/* Badge */}
                <div className="flex items-center justify-between">
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${prod.badgeColor}`}>
                    {prod.badge}
                  </span>
                  <span className="font-mono text-xs font-bold text-slate-400">
                    {prod.suitabilityScore}% match
                  </span>
                </div>

                {/* Title & Tagline */}
                <div>
                  <h3 className="font-serif text-xl font-bold text-[#0B132B]">
                    {prod.name}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                    {prod.tagline}
                  </p>
                </div>

                {/* Bullet Points */}
                <ul className="space-y-2 text-xs text-slate-600 pt-2 border-t border-slate-100">
                  {prod.bullets.map((b, idx) => (
                    <li key={idx} className="flex items-start space-x-2">
                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>

              </div>

              {/* Price & Details CTA */}
              <div className="space-y-3 pt-4 border-t border-slate-100">
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-slate-400 block font-mono">
                    Estimated Premium
                  </span>
                  <div className="flex items-baseline space-x-1 font-mono">
                    <span className="text-xl font-bold text-[#0B132B]">
                      {formatINR(prod.monthlyPremium)}
                    </span>
                    <span className="text-xs text-slate-500 font-sans">/ month</span>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedProduct(prod)}
                  className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-[#1D4ED8] hover:bg-[#1E40AF] transition-all shadow-sm flex items-center justify-center space-x-1.5 active:scale-95"
                >
                  <span>View Details</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

            </div>
          ))}
        </div>
      )}

      {/* VIEW 2: PRODUCT COMPARISON MATRIX (SCREEN 6) */}
      {viewMode === 'table' && (
        <div className="bg-white rounded-3xl border border-[#E6E4DF] shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 bg-[#FAF9F5]">
            <h3 className="font-serif text-xl font-bold text-[#0B132B]">
              Detailed Comparison Matrix
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Side-by-side analysis of key attributes, costs, and suitability.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#E6E4DF] bg-slate-50/50">
                  <th className="p-4 font-semibold text-slate-500 w-44">Feature</th>
                  {products.map((p) => (
                    <th key={p.id} className="p-4 font-bold text-[#0B132B] min-w-[180px]">
                      <div>{p.name}</div>
                      <span className={`inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-normal border ${p.badgeColor}`}>
                        {p.badge}
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E6E4DF]">
                <tr>
                  <td className="p-4 font-semibold text-slate-700 bg-slate-50/30">Best For</td>
                  {products.map((p) => (
                    <td key={p.id} className="p-4 text-slate-600 leading-relaxed">{p.bestFor}</td>
                  ))}
                </tr>
                <tr>
                  <td className="p-4 font-semibold text-slate-700 bg-slate-50/30">Cover Range</td>
                  {products.map((p) => (
                    <td key={p.id} className="p-4 font-mono font-semibold text-[#0B132B]">{p.coverRange}</td>
                  ))}
                </tr>
                <tr>
                  <td className="p-4 font-semibold text-slate-700 bg-slate-50/30">Policy Tenure</td>
                  {products.map((p) => (
                    <td key={p.id} className="p-4 text-slate-700">{p.tenure}</td>
                  ))}
                </tr>
                <tr>
                  <td className="p-4 font-semibold text-slate-700 bg-slate-50/30">Relative Cost</td>
                  {products.map((p) => (
                    <td key={p.id} className="p-4 font-semibold text-slate-800">{p.costRating}</td>
                  ))}
                </tr>
                <tr>
                  <td className="p-4 font-semibold text-slate-700 bg-slate-50/30">Financial Nature</td>
                  {products.map((p) => (
                    <td key={p.id} className="p-4 text-slate-700">{p.nature}</td>
                  ))}
                </tr>
                <tr>
                  <td className="p-4 font-semibold text-slate-700 bg-slate-50/30">Est. Monthly Cost</td>
                  {products.map((p) => (
                    <td key={p.id} className="p-4 font-mono font-bold text-[#1D4ED8]">
                      {formatINR(p.monthlyPremium)}/mo
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="p-4 font-semibold text-slate-700 bg-slate-50/30">Action</td>
                  {products.map((p) => (
                    <td key={p.id} className="p-4">
                      <button
                        onClick={() => setSelectedProduct(p)}
                        className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-[#1D4ED8] hover:bg-[#1E40AF] transition-colors"
                      >
                        View Plan
                      </button>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Bottom Consultation Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-[#0B132B] to-[#1E3A8A] text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-md">
        <div className="space-y-1 text-center sm:text-left">
          <h4 className="font-serif text-lg font-semibold text-white">
            Unsure which plan fits your monthly cash flow?
          </h4>
          <p className="text-xs text-blue-200">
            Book a complimentary 15-minute consultation with a Certified Financial Advisor.
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={onOpenSimulator}
            className="px-4 py-2.5 rounded-full text-xs font-semibold text-white bg-white/10 hover:bg-white/20 border border-white/20 transition-colors"
          >
            Adjust in Simulator
          </button>
          <button
            onClick={onOpenBooking}
            className="px-5 py-2.5 rounded-full text-xs font-bold text-[#0B132B] bg-white hover:bg-slate-100 transition-colors shadow-sm"
          >
            Book Advisor Call
          </button>
        </div>
      </div>

      {/* Product Details Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-150">
            
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div>
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${selectedProduct.badgeColor}`}>
                  {selectedProduct.badge}
                </span>
                <h3 className="font-serif text-2xl font-bold text-[#0B132B] mt-2">
                  {selectedProduct.name}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {selectedProduct.tagline}
                </p>
              </div>
              <button
                onClick={() => setSelectedProduct(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] text-slate-400 uppercase font-mono">Cover Range</span>
                <div className="font-mono font-bold text-slate-800 mt-0.5">{selectedProduct.coverRange}</div>
              </div>
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] text-slate-400 uppercase font-mono">Estimated Premium</span>
                <div className="font-mono font-bold text-[#1D4ED8] mt-0.5">{formatINR(selectedProduct.monthlyPremium)}/mo</div>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-bold text-[#0B132B] uppercase tracking-wider font-mono">
                Key Strengths & Features
              </h4>
              <ul className="space-y-1.5 text-xs text-slate-600">
                {selectedProduct.bullets.map((b, i) => (
                  <li key={i} className="flex items-start space-x-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-bold text-amber-800 uppercase tracking-wider font-mono">
                Important Considerations & Trade-offs
              </h4>
              <ul className="space-y-1.5 text-xs text-slate-600">
                {selectedProduct.tradeOffs.map((t, i) => (
                  <li key={i} className="flex items-start space-x-2">
                    <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-end space-x-3">
              <button
                onClick={() => setSelectedProduct(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setSelectedProduct(null);
                  onOpenBooking();
                }}
                className="px-5 py-2.5 rounded-full text-xs font-bold text-white bg-[#1D4ED8] hover:bg-[#1E40AF]"
              >
                Discuss with Advisor
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
