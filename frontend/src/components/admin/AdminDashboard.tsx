import React, { useState, useEffect } from 'react';
import {
  Lock,
  Key,
  Shield,
  Sliders,
  Calendar,
  CheckCircle2,
  RefreshCw,
  AlertCircle,
  Package,
  Layers,
  TrendingUp,
} from 'lucide-react';
import { AdminMetrics, FinancialAssumptions, Appointment } from '../../types';
import { api } from '../../services/api';

export const AdminDashboard: React.FC = () => {
  const [adminKey, setAdminKey] = useState<string>('lifewise-admin-key-2026');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const [metrics, setMetrics] = useState<AdminMetrics | null>(null);
  const [assumptions, setAssumptions] = useState<FinancialAssumptions | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);

  // Assumptions form state
  const [inflationInput, setInflationInput] = useState<number>(0.06);
  const [discountInput, setDiscountInput] = useState<number>(0.08);
  const [reserveInput, setReserveInput] = useState<number>(6);
  const [factorInput, setFactorInput] = useState<number>(0.75);

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!adminKey.trim()) return;

    try {
      setLoading(true);
      setAuthError(null);
      const metricsData = await api.getAdminMetrics(adminKey.trim());
      setMetrics(metricsData);
      setIsAuthenticated(true);

      const [assumpData, aptData, prodData] = await Promise.all([
        api.getAssumptions(),
        api.getAdminAppointments(adminKey.trim()),
        api.getProducts(),
      ]);

      setAssumptions(assumpData);
      setInflationInput(assumpData.inflation_rate);
      setDiscountInput(assumpData.discount_rate);
      setReserveInput(assumpData.emergency_reserve_months);
      setFactorInput(assumpData.family_expense_factor);

      setAppointments(aptData);
      setProducts(prodData);
    } catch (err: any) {
      console.error('Admin authentication failed:', err);
      setAuthError('Unauthorized: Invalid Admin Secret Key.');
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAssumptions = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setSaveSuccess(null);
      await api.updateAssumptions(
        {
          inflation_rate: inflationInput,
          discount_rate: discountInput,
          emergency_reserve_months: reserveInput,
          family_expense_factor: factorInput,
        },
        adminKey
      );
      setSaveSuccess('Global actuarial assumptions updated successfully.');
      setTimeout(() => setSaveSuccess(null), 4000);
    } catch (err: any) {
      alert(`Failed to save assumptions: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateApptStatus = async (id: number, newStatus: string) => {
    try {
      await api.updateAppointmentStatus(id, newStatus);
      const updated = await api.getAdminAppointments(adminKey);
      setAppointments(updated);
    } catch (err: any) {
      alert(`Status update failed: ${err.message}`);
    }
  };

  // Login Gate
  if (!isAuthenticated) {
    return (
      <div className="py-20 bg-[#FAF9F5] min-h-[calc(100vh-80px)] flex items-center justify-center px-4">
        <div className="bg-white border border-[#E6E4DF] p-8 sm:p-10 rounded-sm max-w-md w-full shadow-sm space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-full bg-[#1D4ED8]/10 border border-[#1D4ED8]/20 text-[#1D4ED8] flex items-center justify-center mx-auto">
              <Lock className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#1D4ED8] font-bold block">
              Restricted Operations
            </span>
            <h2 className="font-serif text-2xl text-[#0B132B] font-medium">
              Administrative Access
            </h2>
            <p className="text-xs text-[#475569] leading-relaxed">
              Enter your designated cryptographic secret key to manage actuarial assumptions, audit logs, and CFP® appointment dockets.
            </p>
          </div>

          {authError && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs font-mono rounded-sm">
              {authError}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-mono uppercase tracking-wider text-[#64748B]">
                Admin Secret Key (X-Admin-Key)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#64748B]">
                  <Key className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  value={adminKey}
                  onChange={(e) => setAdminKey(e.target.value)}
                  placeholder="Enter admin secret key"
                  className="w-full pl-9 pr-3 py-2.5 text-xs font-mono bg-white border border-[#E6E4DF] rounded-sm focus:outline-none focus:border-[#1D4ED8] text-[#0B132B]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 text-xs font-mono uppercase tracking-wider font-semibold text-white bg-[#0B132B] hover:bg-[#1D4ED8] rounded-sm transition-colors disabled:opacity-50"
            >
              {loading ? 'Authenticating...' : 'Authenticate Portal'}
            </button>
          </form>

          <div className="pt-3 border-t border-[#E6E4DF] text-center">
            <button
              type="button"
              onClick={() => {
                setAdminKey('lifewise-admin-key-2026');
                setTimeout(() => handleLogin(), 50);
              }}
              className="text-[11px] font-mono text-[#1D4ED8] hover:underline"
            >
              Auto-fill default demo key & sign in →
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-12 bg-[#FAF9F5] min-h-[calc(100vh-80px)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        {/* Header */}
        <div className="border-b border-[#E6E4DF] pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-[11px] font-mono tracking-widest uppercase text-[#047857] mb-1">
              <span>Fiduciary Administration Portal</span>
              <span>·</span>
              <span>Authenticated Role: Master Actuary</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-serif font-normal text-[#0B132B] tracking-tight">
              Actuarial Controls & Docket Operations
            </h1>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => handleLogin()}
              className="inline-flex items-center space-x-1.5 px-3.5 py-2 text-xs font-mono uppercase tracking-wider text-[#0B132B] bg-white hover:bg-[#FAF9F5] border border-[#E6E4DF] rounded-sm transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5 text-[#1D4ED8]" />
              <span>Refresh Metrics</span>
            </button>
            <button
              onClick={() => setIsAuthenticated(false)}
              className="px-3.5 py-2 text-xs font-mono uppercase tracking-wider text-[#64748B] hover:text-[#0B132B]"
            >
              Sign Out
            </button>
          </div>
        </div>

        {/* System Valuation Metrics */}
        {metrics && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white border border-[#E6E4DF] p-6 rounded-sm">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#64748B] block mb-1">
                Completed Valuations
              </span>
              <span className="font-serif text-3xl font-normal text-[#0B132B]">
                {metrics.total_assessments}
              </span>
              <span className="text-[11px] font-mono text-[#64748B] block mt-1">Evaluated across all sessions</span>
            </div>

            <div className="bg-white border border-[#E6E4DF] p-6 rounded-sm">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#64748B] block mb-1">
                Total Gap Identified
              </span>
              <span className="font-serif text-3xl font-normal text-[#0B132B]">
                ${((metrics.total_gap_identified || 0) / 1000000).toFixed(2)}M
              </span>
              <span className="text-[11px] font-mono text-[#64748B] block mt-1">Cumulative protection gap</span>
            </div>

            <div className="bg-white border border-[#E6E4DF] p-6 rounded-sm">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#1D4ED8] font-semibold block mb-1">
                Average Coverage Need
              </span>
              <span className="font-serif text-3xl font-normal text-[#1D4ED8]">
                ${Math.round(metrics.average_cover_need || 0).toLocaleString()}
              </span>
              <span className="text-[11px] font-mono text-[#64748B] block mt-1">Per household profile</span>
            </div>

            <div className="bg-white border border-[#E6E4DF] p-6 rounded-sm">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#047857] font-semibold block mb-1">
                Advisory Appointments
              </span>
              <span className="font-serif text-3xl font-normal text-[#047857]">
                {metrics.total_appointments_booked || 0}
              </span>
              <span className="text-[11px] font-mono text-[#64748B] block mt-1">CFP® sessions reserved</span>
            </div>
          </div>
        )}

        {/* Global Actuarial Assumptions Editor */}
        <div className="bg-white border border-[#E6E4DF] p-8 rounded-sm space-y-6">
          <div className="border-b border-[#E6E4DF] pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#1D4ED8] font-bold">
                Platform Parameters
              </span>
              <h3 className="font-serif text-xl text-[#0B132B] font-medium mt-0.5">
                Global Financial & Discounting Assumptions
              </h3>
            </div>
            {saveSuccess && (
              <span className="text-xs font-mono text-[#047857] flex items-center space-x-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{saveSuccess}</span>
              </span>
            )}
          </div>

          <form onSubmit={handleSaveAssumptions} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono uppercase tracking-wider text-[#64748B]">
                  Inflation Rate (π)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.005"
                    min="0.01"
                    max="0.20"
                    value={inflationInput}
                    onChange={(e) => setInflationInput(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs font-mono bg-white border border-[#E6E4DF] rounded-sm focus:outline-none focus:border-[#1D4ED8] text-[#0B132B]"
                  />
                  <span className="absolute right-3 top-2 text-xs font-mono text-[#64748B]">{(inflationInput * 100).toFixed(1)}%</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-mono uppercase tracking-wider text-[#64748B]">
                  Safe Investment Yield (i)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.005"
                    min="0.02"
                    max="0.25"
                    value={discountInput}
                    onChange={(e) => setDiscountInput(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs font-mono bg-white border border-[#E6E4DF] rounded-sm focus:outline-none focus:border-[#1D4ED8] text-[#0B132B]"
                  />
                  <span className="absolute right-3 top-2 text-xs font-mono text-[#64748B]">{(discountInput * 100).toFixed(1)}%</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-mono uppercase tracking-wider text-[#64748B]">
                  Emergency Fund Buffer
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="1"
                    max="24"
                    value={reserveInput}
                    onChange={(e) => setReserveInput(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs font-mono bg-white border border-[#E6E4DF] rounded-sm focus:outline-none focus:border-[#1D4ED8] text-[#0B132B]"
                  />
                  <span className="absolute right-3 top-2 text-xs font-mono text-[#64748B]">months</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-mono uppercase tracking-wider text-[#64748B]">
                  Family Expense Proportion
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.05"
                    min="0.5"
                    max="1.0"
                    value={factorInput}
                    onChange={(e) => setFactorInput(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs font-mono bg-white border border-[#E6E4DF] rounded-sm focus:outline-none focus:border-[#1D4ED8] text-[#0B132B]"
                  />
                  <span className="absolute right-3 top-2 text-xs font-mono text-[#64748B]">{(factorInput * 100).toFixed(0)}%</span>
                </div>
              </div>

            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 text-xs font-mono uppercase tracking-wider font-semibold text-white bg-[#0B132B] hover:bg-[#1D4ED8] rounded-sm transition-colors disabled:opacity-50"
              >
                Save Global Assumptions
              </button>
            </div>
          </form>
        </div>

        {/* Appointments Docket Table */}
        <div className="bg-white border border-[#E6E4DF] p-8 rounded-sm space-y-4">
          <div className="border-b border-[#E6E4DF] pb-4">
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#1D4ED8] font-bold">
              Advisory Operations
            </span>
            <h3 className="font-serif text-xl text-[#0B132B] font-medium mt-0.5">
              Client Consultation Dockets
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-xs border border-[#E6E4DF]">
              <thead className="bg-[#FAF9F5] border-b border-[#E6E4DF] text-[#0B132B]">
                <tr>
                  <th className="p-3">Docket ID</th>
                  <th className="p-3">Client</th>
                  <th className="p-3">Advisor</th>
                  <th className="p-3">Slot Time</th>
                  <th className="p-3">Topic</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E6E4DF]">
                {appointments.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-6 text-center text-[#64748B]">
                      No consultation dockets on record.
                    </td>
                  </tr>
                ) : (
                  appointments.map((appt) => (
                    <tr key={appt.id} className="hover:bg-[#FAF9F5]">
                      <td className="p-3 font-bold text-[#0B132B]">{appt.appointment_code}</td>
                      <td className="p-3">
                        <span className="block font-bold">{appt.client_name}</span>
                        <span className="text-[10px] text-[#64748B]">{appt.client_email}</span>
                      </td>
                      <td className="p-3">{appt.advisor_name}</td>
                      <td className="p-3">{appt.slot_time}</td>
                      <td className="p-3 truncate max-w-[200px]">{appt.topic}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded-sm text-[10px] uppercase font-semibold ${
                          appt.status === 'confirmed'
                            ? 'bg-[#047857]/10 text-[#047857]'
                            : appt.status === 'completed'
                            ? 'bg-[#1D4ED8]/10 text-[#1D4ED8]'
                            : 'bg-rose-50 text-rose-700'
                        }`}>
                          {appt.status}
                        </span>
                      </td>
                      <td className="p-3 text-right space-x-1">
                        <button
                          onClick={() => handleUpdateApptStatus(appt.id, 'completed')}
                          className="text-[10px] font-bold text-[#047857] hover:underline"
                        >
                          Mark Completed
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
};
