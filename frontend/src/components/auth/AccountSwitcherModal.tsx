import React, { useState } from 'react';
import { X, User, Shield, Check, LogOut, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface AccountSwitcherModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdminSelect: () => void;
}

export const AccountSwitcherModal: React.FC<AccountSwitcherModalProps> = ({
  isOpen,
  onClose,
  onAdminSelect,
}) => {
  const { currentUser, isAdmin, availableProfiles, loginAsCustomer, loginAsAdmin, logout } = useAuth();
  const [adminKey, setAdminKey] = useState('');
  const [adminError, setAdminError] = useState('');
  const [activeTab, setActiveTab] = useState<'customer' | 'admin'>('customer');

  if (!isOpen) return null;

  const handleSelectCustomer = async (profileId: string) => {
    await loginAsCustomer(profileId);
    onClose();
  };

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setAdminError('');
    const success = loginAsAdmin(adminKey);
    if (success) {
      setAdminKey('');
      onAdminSelect();
      onClose();
    } else {
      setAdminError('Invalid Admin Secret Key. Try: lifewise-admin-key-2026');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="bg-[#070C18] px-6 py-4 flex items-center justify-between border-b border-slate-800 text-white">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-xs">
              LW
            </div>
            <div>
              <h3 className="font-serif text-base font-semibold">Account & Role Switcher</h3>
              <p className="text-[11px] font-mono text-slate-400">Switch customers or access Governance Portal</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab selection */}
        <div className="flex border-b border-slate-200 bg-slate-50 text-xs font-medium">
          <button
            onClick={() => setActiveTab('customer')}
            className={`flex-1 py-3 px-4 text-center border-b-2 transition-colors flex items-center justify-center space-x-2 ${
              activeTab === 'customer'
                ? 'border-blue-600 text-blue-700 bg-white font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Customer Profiles ({availableProfiles.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('admin')}
            className={`flex-1 py-3 px-4 text-center border-b-2 transition-colors flex items-center justify-center space-x-2 ${
              activeTab === 'admin'
                ? 'border-blue-600 text-blue-700 bg-white font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Shield className="w-4 h-4" />
            <span>Administrator Access</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1">
          {activeTab === 'customer' ? (
            <div className="space-y-3">
              <p className="text-xs text-slate-600">
                Select an active customer profile loaded directly from synthetic dataset (<code className="text-blue-600 font-mono">customer_profiles.json</code>).
              </p>

              <div className="space-y-2 mt-3">
                {availableProfiles.map((p) => {
                  const isCurrent = currentUser?.profile_id === p.profile_id && !isAdmin;
                  return (
                    <div
                      key={p.profile_id}
                      onClick={() => handleSelectCustomer(p.profile_id)}
                      className={`p-3 rounded-lg border transition-all cursor-pointer flex items-center justify-between ${
                        isCurrent
                          ? 'border-blue-600 bg-blue-50/70 ring-1 ring-blue-600'
                          : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold ${
                          isCurrent ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-700'
                        }`}>
                          {p.full_name?.charAt(0) || 'U'}
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="text-xs font-semibold text-slate-900">{p.full_name}</span>
                            <span className="text-[10px] font-mono px-1.5 py-0.2 bg-slate-100 rounded text-slate-600">
                              Age {p.age}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500">
                            {p.occupation} • {p.city} • ₹{(p.annual_income_inr / 100000).toFixed(1)}L/yr
                          </p>
                        </div>
                      </div>

                      {isCurrent ? (
                        <span className="flex items-center text-xs font-medium text-blue-600 space-x-1">
                          <Check className="w-4 h-4" />
                          <span>Active</span>
                        </span>
                      ) : (
                        <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-slate-600" />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <form onSubmit={handleAdminLogin} className="space-y-4">
              <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800 space-y-1">
                <p className="font-semibold flex items-center space-x-1.5">
                  <Shield className="w-4 h-4 text-amber-600" />
                  <span>Platform Governance & Compliance Portal</span>
                </p>
                <p>
                  Access requires the secure administrator key configured in the environment (<code className="font-mono text-amber-900">lifewise-admin-key-2026</code>).
                </p>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Administrator Secret Key
                </label>
                <input
                  type="password"
                  value={adminKey}
                  onChange={(e) => setAdminKey(e.target.value)}
                  placeholder="Enter admin secret key..."
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                />
                {adminError && (
                  <p className="text-[11px] text-red-600 mt-1">{adminError}</p>
                )}
              </div>

              <div className="pt-2 flex items-center justify-between">
                <span className="text-[11px] text-slate-500 font-mono">
                  Default: lifewise-admin-key-2026
                </span>
                <button
                  type="submit"
                  className="px-4 py-2 bg-slate-900 hover:bg-blue-600 text-white rounded-lg text-xs font-semibold transition-colors flex items-center space-x-1.5"
                >
                  <Shield className="w-3.5 h-3.5" />
                  <span>Authenticate & Enter</span>
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Footer with Logout */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs">
          <div className="text-slate-500">
            {currentUser && !isAdmin && (
              <span>Logged in as: <strong className="text-slate-800">{currentUser.full_name}</strong></span>
            )}
            {isAdmin && (
              <span className="text-amber-700 font-semibold">Active: System Administrator</span>
            )}
          </div>
          <button
            onClick={() => {
              logout();
              onClose();
            }}
            className="flex items-center space-x-1.5 text-xs text-red-600 hover:text-red-700 font-medium px-2.5 py-1.5 rounded hover:bg-red-50 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out Session</span>
          </button>
        </div>
      </div>
    </div>
  );
};

