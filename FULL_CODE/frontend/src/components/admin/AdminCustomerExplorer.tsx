import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  Filter, 
  ShieldCheck, 
  AlertCircle, 
  Eye, 
  FileText, 
  DollarSign, 
  TrendingUp, 
  Briefcase, 
  MapPin, 
  Calendar,
  Lock,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { api } from '../../services/api';
import { CustomerUser } from '../../context/AuthContext';

export const AdminCustomerExplorer: React.FC = () => {
  const [customers, setCustomers] = useState<CustomerUser[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [customerDetails, setCustomerDetails] = useState<any | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [loadingList, setLoadingList] = useState(false);
  const [loadingDetails, setLoadingDetails] = useState(false);

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    setLoadingList(true);
    try {
      const data = await api.getCustomers(50);
      setCustomers(data);
      if (data.length > 0 && !selectedCustomerId) {
        selectCustomer(data[0].profile_id);
      }
    } catch (err) {
      console.error('Failed to load customers for admin explorer', err);
    } finally {
      setLoadingList(false);
    }
  };

  const selectCustomer = async (profileId: string) => {
    setSelectedCustomerId(profileId);
    setLoadingDetails(true);
    try {
      const fullData = await api.getCustomerProfile(profileId);
      setCustomerDetails(fullData);
    } catch (err) {
      console.error('Failed to fetch full customer details', err);
    } finally {
      setLoadingDetails(false);
    }
  };

  const filteredCustomers = customers.filter((c) => {
    const matchSearch =
      c.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.profile_id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.city?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.occupation?.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (categoryFilter === 'all') return matchSearch;
    return matchSearch && c.employment_type?.toLowerCase().includes(categoryFilter.toLowerCase());
  });

  const selectedProfile = customerDetails?.profile;
  const selectedAssessment = customerDetails?.assessment_input;
  const selectedResult = customerDetails?.calculation_result;

  return (
    <div className="space-y-6">
      {/* Top Banner - Strict Read-Only Notice */}
      <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-between text-white">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-blue-600/20 border border-blue-500/30 text-blue-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-sm font-semibold tracking-tight">Customer Members Directory</h2>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                STRICT READ ONLY
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Inspect dataset-grounded customer records, actuarial evaluations, and protection assessments without mutation permissions.
            </p>
          </div>
        </div>
        <div className="text-right font-mono text-xs text-slate-400">
          Total Members: <strong className="text-white">{customers.length}</strong>
        </div>
      </div>

      {/* Master-Detail Explorer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Side: Directory List (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs flex flex-col h-[750px]">
          {/* Search Header */}
          <div className="p-3 border-b border-slate-200 bg-slate-50 space-y-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search member name, ID, city..."
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-blue-600"
              />
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-500">
              <span>Showing {filteredCustomers.length} members</span>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-2 py-1 bg-white border border-slate-200 rounded text-xs text-slate-700"
              >
                <option value="all">All Sectors</option>
                <option value="salaried">Salaried</option>
                <option value="business">Business</option>
                <option value="founder">Founder</option>
              </select>
            </div>
          </div>

          {/* Members Scroll List */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100 p-2 space-y-1">
            {filteredCustomers.map((c) => {
              const isSelected = selectedCustomerId === c.profile_id;
              return (
                <div
                  key={c.profile_id}
                  onClick={() => selectCustomer(c.profile_id)}
                  className={`p-3 rounded-lg cursor-pointer transition-all flex items-center justify-between ${
                    isSelected
                      ? 'bg-blue-50/80 border border-blue-500 text-slate-900 shadow-xs'
                      : 'hover:bg-slate-50 border border-transparent text-slate-700'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                      isSelected ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 border border-slate-200'
                    }`}>
                      {c.full_name?.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-semibold">{c.full_name}</span>
                        <span className="text-[10px] font-mono text-slate-500">Age {c.age}</span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {c.occupation} • {c.city}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 block">
                      Assessed
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono mt-1 block">
                      ₹{(c.annual_income_inr / 100000).toFixed(1)}L/yr
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Side: Read-Only Detail View (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {loadingDetails ? (
            <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-500 text-xs flex items-center justify-center space-x-2">
              <span className="w-3 h-3 rounded-full bg-blue-600 animate-ping"></span>
              <span>Loading dataset records...</span>
            </div>
          ) : selectedProfile ? (
            <div className="space-y-4">
              
              {/* Member Summary Card */}
              <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
                <div className="flex items-start justify-between pb-4 border-b border-slate-100">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-slate-900 to-blue-900 text-white flex items-center justify-center font-bold text-lg shadow-md">
                      {selectedProfile.full_name?.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="font-serif text-lg font-bold text-slate-900">
                          {selectedProfile.full_name}
                        </h3>
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-blue-50 text-blue-700 border border-blue-200">
                          {selectedProfile.profile_id}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {selectedProfile.occupation} • {selectedProfile.city} (Tier {selectedProfile.city_tier})
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-600 text-[11px] font-mono">
                    <Lock className="w-3 h-3 text-slate-400" />
                    <span>Read Only</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 text-xs">
                  <div className="p-3 bg-slate-50 rounded-lg">
                    <span className="text-slate-400 font-mono text-[10px] block">Annual Income</span>
                    <strong className="text-slate-900 text-sm">
                      ₹{selectedProfile.annual_income_inr?.toLocaleString('en-IN')}
                    </strong>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg">
                    <span className="text-slate-400 font-mono text-[10px] block">Monthly Expenses</span>
                    <strong className="text-slate-900 text-sm">
                      ₹{selectedProfile.monthly_household_expenses_inr?.toLocaleString('en-IN')}
                    </strong>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg">
                    <span className="text-slate-400 font-mono text-[10px] block">Dependents</span>
                    <strong className="text-slate-900 text-sm">
                      {selectedAssessment?.dependents_count ?? 2} Members
                    </strong>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg">
                    <span className="text-slate-400 font-mono text-[10px] block">Risk Appetite</span>
                    <strong className="text-slate-900 text-sm capitalize">
                      {selectedProfile.preferences?.risk_appetite || 'Moderate'}
                    </strong>
                  </div>
                </div>
              </div>

              {/* Protection & Assessment Evaluation */}
              {selectedResult && (
                <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center space-x-2">
                    <TrendingUp className="w-4 h-4 text-blue-600" />
                    <span>Actuarial Protection Evaluation (Capital Needs Analysis)</span>
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="p-3.5 bg-blue-50/80 border border-blue-200 rounded-lg">
                      <span className="text-[10px] font-mono text-blue-700 uppercase block">Gross Protection Need</span>
                      <strong className="text-base font-bold text-blue-900">
                        ₹{(selectedResult.total_gross_protection_need / 10000000).toFixed(2)} Cr
                      </strong>
                      <p className="text-[10px] text-blue-600 mt-1 font-mono">Present Value discounted</p>
                    </div>

                    <div className="p-3.5 bg-emerald-50/80 border border-emerald-200 rounded-lg">
                      <span className="text-[10px] font-mono text-emerald-700 uppercase block">Existing Cover + Assets</span>
                      <strong className="text-base font-bold text-emerald-900">
                        ₹{(selectedResult.total_existing_protection / 100000).toFixed(1)} L
                      </strong>
                      <p className="text-[10px] text-emerald-600 mt-1 font-mono">Liquid savings offset</p>
                    </div>

                    <div className="p-3.5 bg-amber-50/80 border border-amber-200 rounded-lg">
                      <span className="text-[10px] font-mono text-amber-700 uppercase block">Net Recommended Cover</span>
                      <strong className="text-base font-bold text-amber-900">
                        ₹{(selectedResult.net_additional_cover / 10000000).toFixed(2)} Cr
                      </strong>
                      <p className="text-[10px] text-amber-700 mt-1 font-mono">Coverage Gap</p>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-lg text-xs font-mono text-slate-600 space-y-1">
                    <div className="flex justify-between">
                      <span>Income Replacement PV:</span>
                      <strong>₹{selectedResult.income_replacement_pv?.toLocaleString('en-IN')}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Liabilities:</span>
                      <strong>₹{selectedResult.total_liabilities?.toLocaleString('en-IN')}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Future Goals PV:</span>
                      <strong>₹{selectedResult.total_future_goals_pv?.toLocaleString('en-IN')}</strong>
                    </div>
                    <div className="flex justify-between text-blue-600">
                      <span>Monthly Premium Est:</span>
                      <strong>₹{selectedResult.estimated_monthly_premium_range?.median?.toLocaleString('en-IN')}/mo</strong>
                    </div>
                  </div>
                </div>
              )}

              {/* Financial Goals & Liabilities */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Liabilities */}
                <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
                  <h5 className="text-xs font-bold text-slate-800 mb-3 flex items-center space-x-1.5">
                    <DollarSign className="w-3.5 h-3.5 text-slate-500" />
                    <span>Reported Liabilities</span>
                  </h5>
                  {selectedProfile.liabilities && selectedProfile.liabilities.length > 0 ? (
                    <div className="space-y-2 text-xs">
                      {selectedProfile.liabilities.map((l: any, idx: number) => (
                        <div key={idx} className="p-2.5 bg-slate-50 rounded border border-slate-100 flex justify-between">
                          <div>
                            <span className="font-semibold text-slate-800 capitalize">{l.loan_type} Loan</span>
                            <p className="text-[10px] text-slate-400 font-mono">{l.remaining_tenure_months} months remaining</p>
                          </div>
                          <div className="text-right">
                            <span className="font-mono font-bold text-slate-800">₹{(l.outstanding_principal_inr / 100000).toFixed(1)}L</span>
                            <p className="text-[10px] text-slate-500">EMI ₹{l.emi_inr?.toLocaleString('en-IN')}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400">No debt reported.</p>
                  )}
                </div>

                {/* Goals */}
                <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
                  <h5 className="text-xs font-bold text-slate-800 mb-3 flex items-center space-x-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-blue-500" />
                    <span>Target Financial Goals</span>
                  </h5>
                  {selectedProfile.goals && selectedProfile.goals.length > 0 ? (
                    <div className="space-y-2 text-xs">
                      {selectedProfile.goals.map((g: any, idx: number) => (
                        <div key={idx} className="p-2.5 bg-slate-50 rounded border border-slate-100 flex justify-between">
                          <div>
                            <span className="font-semibold text-slate-800">{g.name || 'Goal'}</span>
                            <p className="text-[10px] text-slate-400 font-mono">Target Year: {g.target_year || 2040}</p>
                          </div>
                          <span className="font-mono font-bold text-slate-800">
                            ₹{(g.target_amount_today_inr / 100000).toFixed(1)}L
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400">No specific goals declared.</p>
                  )}
                </div>

              </div>

            </div>
          ) : (
            <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-400 text-xs">
              Select a customer from the left directory to inspect read-only details.
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
