import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  ShieldCheck, 
  AlertCircle, 
  Eye, 
  Lock, 
  CheckCircle2, 
  Filter,
  UserCheck,
  Database,
  ArrowRight
} from 'lucide-react';
import { api } from '../../services/api';

interface AdminRegisteredUsersProps {
  adminKeyOrToken: string;
}

export const AdminRegisteredUsers: React.FC<AdminRegisteredUsersProps> = ({ adminKeyOrToken }) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'all' | 'registered' | 'imported'>('all');
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [loadingDetail, setLoadingDetail] = useState<boolean>(false);

  useEffect(() => {
    fetchUsers();
  }, [searchQuery]);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getRegisteredUsers(adminKeyOrToken, searchQuery);
      setData(res);
      // Select first user if none selected
      if (!selectedUser) {
        if (res.registered_accounts?.length > 0) {
          inspectUser(res.registered_accounts[0].user_id);
        } else if (res.imported_profiles?.length > 0) {
          inspectUser(res.imported_profiles[0].user_id);
        }
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load registered users');
    } finally {
      setLoading(false);
    }
  };

  const inspectUser = async (userId: string) => {
    setLoadingDetail(true);
    try {
      const res = await api.getUserDetailReadOnly(userId, adminKeyOrToken);
      setSelectedUser(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingDetail(false);
    }
  };

  const summary = data?.summary || {
    total_registered_accounts: 1,
    total_imported_profiles: 200,
    synthetic_demo_profiles_count: 200,
    registered_admins_count: 1,
    registered_customers_count: 0,
  };

  const registeredAccounts = data?.registered_accounts || [];
  const importedProfiles = data?.imported_profiles || [];

  let displayedList: any[] = [];
  if (activeTab === 'all') {
    displayedList = [...registeredAccounts, ...importedProfiles];
  } else if (activeTab === 'registered') {
    displayedList = registeredAccounts;
  } else {
    displayedList = importedProfiles;
  }

  return (
    <div className="space-y-6">
      
      {/* Top Banner - Strict Read-Only Notice */}
      <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between text-white gap-3">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-blue-600/20 border border-blue-500/30 text-blue-400">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-sm font-semibold tracking-tight">Registered Users & Dataset Profiles</h2>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                STRICT READ ONLY
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Inspect verified database records. Imported dataset records are strictly isolated from genuine authenticated accounts.
            </p>
          </div>
        </div>
      </div>

      {/* Accurate Count Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1 text-xs">
            <span>Registered Accounts</span>
            <UserCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold font-serif text-slate-900">
            {summary.total_registered_accounts}
          </div>
          <div className="text-[11px] text-slate-500 mt-1 font-mono">
            {summary.registered_admins_count} Admin(s) • {summary.registered_customers_count} Customer(s)
          </div>
        </div>

        <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1 text-xs">
            <span>Imported Profiles</span>
            <Database className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold font-serif text-slate-900">
            {summary.total_imported_profiles}
          </div>
          <div className="text-[11px] text-slate-500 mt-1 font-mono">
            Directly from customer_profiles.json
          </div>
        </div>

        <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1 text-xs">
            <span>Synthetic Demo Profiles</span>
            <ShieldCheck className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-bold font-serif text-slate-900">
            {summary.synthetic_demo_profiles_count}
          </div>
          <div className="text-[11px] text-slate-500 mt-1 font-mono">
            Available in Demo Profile Switcher
          </div>
        </div>
      </div>

      {/* Main Master-Detail View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left List (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs flex flex-col h-[700px]">
          {/* Search & Tabs */}
          <div className="p-3 border-b border-slate-200 bg-slate-50 space-y-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search user ID, name, email..."
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-blue-600"
              />
            </div>
            
            <div className="flex border border-slate-200 rounded-lg p-0.5 bg-slate-100 text-[11px]">
              <button
                onClick={() => setActiveTab('all')}
                className={`flex-1 py-1 rounded font-medium transition-colors ${
                  activeTab === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All ({displayedList.length})
              </button>
              <button
                onClick={() => setActiveTab('registered')}
                className={`flex-1 py-1 rounded font-medium transition-colors ${
                  activeTab === 'registered' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Accounts ({registeredAccounts.length})
              </button>
              <button
                onClick={() => setActiveTab('imported')}
                className={`flex-1 py-1 rounded font-medium transition-colors ${
                  activeTab === 'imported' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Imported ({importedProfiles.length})
              </button>
            </div>
          </div>

          {/* List Feed */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100 p-2 space-y-1">
            {displayedList.map((item) => {
              const isRegistered = item.record_type?.includes('Account') || item.role === 'customer' || item.role === 'admin';
              const isDemo = item.is_synthetic_demo || item.record_type === 'Authorized Demo Account';
              const isSelected = selectedUser?.record_id === item.user_id;

              return (
                <div
                  key={item.user_id}
                  onClick={() => inspectUser(item.user_id)}
                  className={`p-3 rounded-lg cursor-pointer transition-all flex items-center justify-between ${
                    isSelected
                      ? 'bg-blue-50/80 border border-blue-500 text-slate-900 shadow-xs'
                      : 'hover:bg-slate-50 border border-transparent text-slate-700'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                      item.role === 'admin' 
                        ? 'bg-slate-900 text-white' 
                        : isDemo 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-emerald-600 text-white'
                    }`}>
                      {item.full_name?.charAt(0) || 'U'}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-semibold">{item.full_name}</span>
                        <span className="text-[10px] font-mono text-slate-400">({item.user_id})</span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {item.role === 'admin' 
                          ? 'ADMINISTRATOR • Master Account'
                          : isDemo 
                          ? 'Authorized Demo Customer • Benchmark Account' 
                          : `${item.role?.toUpperCase()} • Real Registered Customer`}
                      </p>
                    </div>
                  </div>

                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-semibold ${
                    item.role === 'admin'
                      ? 'bg-slate-900 text-white'
                      : isDemo
                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                      : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  }`}>
                    {item.role === 'admin' ? 'Admin' : isDemo ? 'Demo Account' : 'Registered'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Detail Panel (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 p-6 shadow-xs min-h-[500px]">
          {loadingDetail ? (
            <div className="p-12 text-center text-slate-400 text-xs">
              Loading record details...
            </div>
          ) : selectedUser ? (
            <div className="space-y-6">
              
              <div className="flex items-start justify-between pb-4 border-b border-slate-100">
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="font-serif text-lg font-bold text-slate-900">
                      {selectedUser.account_info?.full_name || selectedUser.profile_info?.full_name}
                    </h3>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-100 text-slate-700">
                      {selectedUser.record_id}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {selectedUser.is_registered_account ? 'Verified Application User Account' : 'Imported Synthetic Customer Profile'}
                  </p>
                </div>
                <div className="flex items-center space-x-1 px-2.5 py-1 rounded bg-slate-100 text-slate-600 text-xs font-mono">
                  <Lock className="w-3 h-3 text-slate-400" />
                  <span>Strictly Read Only</span>
                </div>
              </div>

              {/* Account Details if genuine registered user */}
              {selectedUser.account_info && (
                <div className="p-4 bg-emerald-50/60 border border-emerald-200 rounded-xl space-y-2 text-xs">
                  <span className="text-[10px] font-mono uppercase text-emerald-800 font-bold block">
                    Account Security & Permissions
                  </span>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <span className="text-slate-500 block text-[10px] font-mono">Role:</span>
                      <strong className="text-slate-800 uppercase">{selectedUser.account_info.role}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px] font-mono">Account Status:</span>
                      <strong className="text-emerald-700">Active</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px] font-mono">Password State:</span>
                      <strong className={selectedUser.account_info.must_change_password ? 'text-amber-700' : 'text-slate-800'}>
                        {selectedUser.account_info.must_change_password ? 'Password Change Required' : 'Standard'}
                      </strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px] font-mono">Registered Email:</span>
                      <strong className="text-slate-800">{selectedUser.account_info.email || 'N/A'}</strong>
                    </div>
                  </div>
                </div>
              )}

              {/* Profile Details if dataset member */}
              {selectedUser.profile_info && (
                <div className="space-y-4">
                  {/* Benchmark Profile Metadata block (No Passwords) */}
                  <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-xl space-y-2 text-xs">
                    <span className="text-[10px] font-mono uppercase text-blue-800 font-bold block">
                      Synthetic Benchmark Customer Profile (Read-Only)
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <span className="text-slate-500 block text-[10px] font-mono">Profile ID:</span>
                        <code className="text-blue-900 font-mono font-bold">{selectedUser.profile_info.profile_id}</code>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[10px] font-mono">Demo Email:</span>
                        <span className="text-slate-700 truncate block font-mono">{selectedUser.profile_info.email}</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                    <div className="p-3 bg-slate-50 rounded-lg">
                      <span className="text-[10px] font-mono text-slate-400 block">Annual Income</span>
                      <strong className="text-slate-800 text-sm">
                        ₹{selectedUser.profile_info.annual_income_inr?.toLocaleString('en-IN')}
                      </strong>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-lg">
                      <span className="text-[10px] font-mono text-slate-400 block">Monthly Expenses</span>
                      <strong className="text-slate-800 text-sm">
                        ₹{selectedUser.profile_info.monthly_household_expenses_inr?.toLocaleString('en-IN')}
                      </strong>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-lg">
                      <span className="text-[10px] font-mono text-slate-400 block">Location</span>
                      <strong className="text-slate-800 text-sm">
                        {selectedUser.profile_info.city} (Tier {selectedUser.profile_info.city_tier})
                      </strong>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-lg text-xs font-mono text-slate-600 space-y-1">
                    <div className="flex justify-between">
                      <span>Record Source:</span>
                      <span className="text-blue-700 font-semibold">{selectedUser.profile_info.record_source}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Dataset Import Status:</span>
                      <span className="text-emerald-700 font-semibold">{selectedUser.profile_info.import_status}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Employment Sector:</span>
                      <span>{selectedUser.profile_info.employment_type}</span>
                    </div>
                  </div>
                </div>
              )}

            </div>
          ) : (
            <div className="p-12 text-center text-slate-400 text-xs">
              Select a user or imported profile from the left to inspect read-only details.
            </div>
          )}
        </div>

      </div>

    </div>
  );
};

