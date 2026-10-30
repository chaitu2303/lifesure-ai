import React, { useState } from 'react';
import { User, Bell, Shield, Sliders, Save, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface CustomerSettingsProps {
  onOpenAccountSwitcher: () => void;
}

export const CustomerSettings: React.FC<CustomerSettingsProps> = ({ onOpenAccountSwitcher }) => {
  const { currentUser } = useAuth();
  const [savedNotice, setSavedNotice] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [smsAlerts, setSmsAlerts] = useState(false);
  const [inflationHedging, setInflationHedging] = useState(true);
  const [currencyDisplay, setCurrencyDisplay] = useState<'INR' | 'USD'>('INR');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-200">
        <div>
          <h1 className="font-serif text-2xl font-bold text-slate-900">Account & Advisory Preferences</h1>
          <p className="text-xs text-slate-500 font-mono mt-0.5">
            Manage your personal profile, notification triggers, and calculation preferences.
          </p>
        </div>
        <button
          onClick={onOpenAccountSwitcher}
          className="px-3.5 py-2 bg-slate-900 hover:bg-blue-600 text-white rounded-lg text-xs font-semibold transition-colors flex items-center space-x-2"
        >
          <User className="w-3.5 h-3.5" />
          <span>Switch Customer Account</span>
        </button>
      </div>

      {savedNotice && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-xs flex items-center space-x-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Your customer preferences have been saved locally.</span>
        </div>
      )}

      {/* Profile Card */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
        <h2 className="text-sm font-semibold text-slate-900 mb-4 flex items-center space-x-2">
          <User className="w-4 h-4 text-blue-600" />
          <span>Customer Identity</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="text-slate-500 font-mono text-[11px] block mb-1">Full Legal Name</label>
            <input
              type="text"
              readOnly
              value={currentUser?.full_name || 'Chaitanya Verma'}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-medium"
            />
          </div>
          <div>
            <label className="text-slate-500 font-mono text-[11px] block mb-1">Customer Profile ID</label>
            <input
              type="text"
              readOnly
              value={currentUser?.profile_id || 'CUS-DEFAULT'}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-mono"
            />
          </div>
          <div>
            <label className="text-slate-500 font-mono text-[11px] block mb-1">Occupation</label>
            <input
              type="text"
              readOnly
              value={currentUser?.occupation || 'Software Architect'}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
            />
          </div>
          <div>
            <label className="text-slate-500 font-mono text-[11px] block mb-1">Location & City Tier</label>
            <input
              type="text"
              readOnly
              value={`${currentUser?.city || 'Bengaluru'} (Tier 1)`}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
            />
          </div>
        </div>
      </div>

      {/* Advisory & Calculation Preferences */}
      <form onSubmit={handleSave} className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-5">
        <h2 className="text-sm font-semibold text-slate-900 flex items-center space-x-2">
          <Sliders className="w-4 h-4 text-blue-600" />
          <span>Advisory Computation Defaults</span>
        </h2>

        <div className="space-y-3 text-xs">
          <label className="flex items-center justify-between p-3 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer">
            <div>
              <div className="font-semibold text-slate-800">Dynamic Inflation Escalation (Fisher Rate)</div>
              <div className="text-slate-500 text-[11px]">Compound future education and lifestyle costs by default 5.5% p.a.</div>
            </div>
            <input
              type="checkbox"
              checked={inflationHedging}
              onChange={(e) => setInflationHedging(e.target.checked)}
              className="rounded text-blue-600 focus:ring-blue-500 h-4 w-4"
            />
          </label>

          <label className="flex items-center justify-between p-3 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer">
            <div>
              <div className="font-semibold text-slate-800">Email Policy Review Reminders</div>
              <div className="text-slate-500 text-[11px]">Receive annual policy health check & life-event recalculation prompts</div>
            </div>
            <input
              type="checkbox"
              checked={emailNotifications}
              onChange={(e) => setEmailNotifications(e.target.checked)}
              className="rounded text-blue-600 focus:ring-blue-500 h-4 w-4"
            />
          </label>

          <label className="flex items-center justify-between p-3 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer">
            <div>
              <div className="font-semibold text-slate-800">SMS / WhatsApp Advisory Consultation Alerts</div>
              <div className="text-slate-500 text-[11px]">Instant slot confirmation and video meeting joining links</div>
            </div>
            <input
              type="checkbox"
              checked={smsAlerts}
              onChange={(e) => setSmsAlerts(e.target.checked)}
              className="rounded text-blue-600 focus:ring-blue-500 h-4 w-4"
            />
          </label>
        </div>

        <div className="pt-3 border-t border-slate-200 flex justify-end">
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold transition-colors flex items-center space-x-1.5"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Preferences</span>
          </button>
        </div>
      </form>
    </div>
  );
};
