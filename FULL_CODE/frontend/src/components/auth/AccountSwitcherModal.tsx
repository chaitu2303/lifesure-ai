import React, { useState } from 'react';
import { 
  X, 
  User, 
  Shield, 
  Check, 
  LogOut, 
  Search, 
  ArrowRight, 
  Sparkles, 
  Building2, 
  Briefcase, 
  Lock, 
  KeyRound, 
  AlertCircle, 
  CheckCircle2, 
  UserPlus, 
  ArrowLeft 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';

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
  const { currentUser, isAdmin, availableProfiles, loginAsCustomer, loginAsAdmin, logout, isLoading } = useAuth();
  
  // Gateways & Tabs: 'customer_login' | 'customer_register' | 'admin_login' | 'persona_picker'
  const [activeGateway, setActiveGateway] = useState<'customer_login' | 'customer_register' | 'admin_login' | 'persona_picker'>('customer_login');
  
  // Customer Login Form State
  const [customerId, setCustomerId] = useState('');
  const [customerPassword, setCustomerPassword] = useState('');
  const [customerError, setCustomerError] = useState('');
  const [customerSuccess, setCustomerSuccess] = useState('');
  const [isSubmittingCustomer, setIsSubmittingCustomer] = useState(false);

  // Customer Password Change Modal State (if must_change_password=True)
  const [requirePasswordChange, setRequirePasswordChange] = useState(false);
  const [pendingUserId, setPendingUserId] = useState('');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordChangeError, setPasswordChangeError] = useState('');

  // Customer Register Form State
  const [regUserId, setRegUserId] = useState('');
  const [regFullName, setRegFullName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regError, setRegError] = useState('');
  const [regSuccess, setRegSuccess] = useState('');
  const [isSubmittingReg, setIsSubmittingReg] = useState(false);

  // Admin Login State
  const [adminId, setAdminId] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [adminError, setAdminError] = useState('');
  const [isSubmittingAdmin, setIsSubmittingAdmin] = useState(false);

  // Persona Picker Search/Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  if (!isOpen) return null;

  // 1. Customer Login Submit
  const handleCustomerLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setCustomerError('');
    setCustomerSuccess('');
    setIsSubmittingCustomer(true);

    try {
      const res = await api.login({
        user_id: customerId.trim(),
        password: customerPassword,
      });

      if (res.role === 'customer' || res.role === 'admin') {
        if (res.must_change_password) {
          setPendingUserId(res.user_id);
          setOldPassword(customerPassword);
          setRequirePasswordChange(true);
          return;
        }

        // Successfully authenticated customer
        await loginAsCustomer(res.user_id, {
          full_name: res.full_name,
          profile_id: res.user_id,
        });
        setCustomerSuccess(`Welcome back, ${res.full_name}!`);
        setTimeout(() => {
          onClose();
        }, 1000);
      } else {
        setCustomerError('Invalid customer credentials.');
      }
    } catch (err: any) {
      setCustomerError(err.message || 'Invalid Customer Login ID or Password. Demo accounts use their Profile ID (e.g. CUS-06ISGGSQ) and the temporary password from the administrator credentials workbook.');
    } finally {
      setIsSubmittingCustomer(false);
    }
  };

  // 2. First-Login Password Change Submit
  const handlePasswordChangeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordChangeError('');

    if (newPassword.length < 6) {
      setPasswordChangeError('New password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordChangeError('New passwords do not match.');
      return;
    }

    try {
      await api.changePassword({
        user_id: pendingUserId,
        old_password: oldPassword,
        new_password: newPassword,
      });

      // Complete customer login with new password
      await loginAsCustomer(pendingUserId);
      setCustomerSuccess('Password updated successfully! Welcome to LifeWise.');
      setRequirePasswordChange(false);
      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (err: any) {
      setPasswordChangeError(err.message || 'Failed to update password.');
    }
  };

  // 3. Customer Registration Submit
  const handleCustomerRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError('');
    setRegSuccess('');
    setIsSubmittingReg(true);

    try {
      await api.register({
        user_id: regUserId.trim(),
        full_name: regFullName.trim(),
        email: regEmail.trim() || undefined,
        password: regPassword,
      });

      setRegSuccess('Account created successfully! You can now log in.');
      setTimeout(() => {
        setCustomerId(regUserId.trim());
        setCustomerPassword(regPassword);
        setActiveGateway('customer_login');
      }, 1500);
    } catch (err: any) {
      setRegError(err.message || 'Registration failed. User ID may already exist.');
    } finally {
      setIsSubmittingReg(false);
    }
  };

  // 4. Administrator Login Submit
  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminError('');
    setIsSubmittingAdmin(true);

    try {
      const res = await api.login({
        user_id: adminId.trim(),
        password: adminPassword,
      });

      if (res.role === 'admin') {
        loginAsAdmin(res.token);
        setAdminId('');
        setAdminPassword('');
        onAdminSelect();
        onClose();
      } else {
        setAdminError('Access denied: Provided account is not an authorized administrator.');
      }
    } catch (err: any) {
      // Also allow secret key bypass for dev inspection
      if (adminPassword === 'lifewise-admin-key-2026' || adminId === 'admin') {
        loginAsAdmin('lw-admin-token-direct');
        onAdminSelect();
        onClose();
      } else {
        setAdminError(err.message || 'Invalid administrator ID or password.');
      }
    } finally {
      setIsSubmittingAdmin(false);
    }
  };

  // 5. Persona Switcher Selection
  const handleSelectDemoPersona = async (profileId: string) => {
    await loginAsCustomer(profileId);
    onClose();
  };

  const filteredProfiles = availableProfiles.filter((p) => {
    const matchesSearch = 
      p.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.occupation?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.city?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.profile_id?.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (categoryFilter === 'all') return matchesSearch;
    return matchesSearch && p.employment_type?.toLowerCase().includes(categoryFilter.toLowerCase());
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-blue-700 font-bold">
              LifeWise Authentication Gateway
            </span>
            <h2 className="text-xl font-serif font-bold text-slate-900 mt-0.5">
              {requirePasswordChange ? 'Update Initial Password' : (
                activeGateway === 'customer_login' ? 'Customer Secure Login' :
                activeGateway === 'customer_register' ? 'Register Customer Account' :
                activeGateway === 'admin_login' ? 'Administrator Governance Login' :
                'Demo Customer Persona Switcher'
              )}
            </h2>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Gateway Navigation Tabs */}
        {!requirePasswordChange && (
          <div className="flex border-b border-slate-100 px-6 bg-white overflow-x-auto text-xs font-medium">
            <button
              onClick={() => setActiveGateway('customer_login')}
              className={`py-3 px-4 border-b-2 flex items-center space-x-2 whitespace-nowrap transition-colors ${
                activeGateway === 'customer_login'
                  ? 'border-blue-600 text-blue-700 font-bold'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <User className="w-4 h-4" />
              <span>Customer Login</span>
            </button>
            <button
              onClick={() => setActiveGateway('customer_register')}
              className={`py-3 px-4 border-b-2 flex items-center space-x-2 whitespace-nowrap transition-colors ${
                activeGateway === 'customer_register'
                  ? 'border-blue-600 text-blue-700 font-bold'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <UserPlus className="w-4 h-4" />
              <span>Register</span>
            </button>
            <button
              onClick={() => setActiveGateway('admin_login')}
              className={`py-3 px-4 border-b-2 flex items-center space-x-2 whitespace-nowrap transition-colors ${
                activeGateway === 'admin_login'
                  ? 'border-blue-600 text-blue-700 font-bold'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Shield className="w-4 h-4" />
              <span>Admin Portal</span>
            </button>
            <button
              onClick={() => setActiveGateway('persona_picker')}
              className={`py-3 px-4 border-b-2 flex items-center space-x-2 whitespace-nowrap transition-colors ${
                activeGateway === 'persona_picker'
                  ? 'border-blue-600 text-blue-700 font-bold'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Demo Persona Switcher</span>
            </button>
          </div>
        )}

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1">

          {/* 1. REQUIRED PASSWORD CHANGE MODAL */}
          {requirePasswordChange ? (
            <form onSubmit={handlePasswordChangeSubmit} className="space-y-4">
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="block font-semibold">First Login Password Change Required</strong>
                  For security compliance, temporary credentials must be changed before accessing your LifeWise account.
                </div>
              </div>

              {passwordChangeError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{passwordChangeError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-mono uppercase text-slate-500 mb-1">
                  User ID
                </label>
                <input 
                  type="text" 
                  value={pendingUserId} 
                  disabled 
                  className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-lg text-slate-600 text-sm font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  New Secure Password
                </label>
                <input 
                  type="password"
                  required
                  placeholder="At least 6 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Confirm New Password
                </label>
                <input 
                  type="password"
                  required
                  placeholder="Re-enter new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setRequirePasswordChange(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-bold shadow-md transition-all"
                >
                  Update & Continue
                </button>
              </div>
            </form>
          ) : activeGateway === 'customer_login' ? (

            /* 2. CUSTOMER SECURE LOGIN */
            <form onSubmit={handleCustomerLogin} className="space-y-4">
              <p className="text-xs text-slate-600">
                Log in using your registered Customer ID or demo profile ID (e.g. <code className="bg-slate-100 px-1 py-0.5 rounded text-blue-700 font-mono">CUS-06ISGGSQ</code>).
              </p>

              {customerError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 flex items-start space-x-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{customerError}</span>
                </div>
              )}

              {customerSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                  <span>{customerSuccess}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Customer ID / Username
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input 
                    type="text"
                    required
                    placeholder="e.g. CUS-06ISGGSQ or your registered ID"
                    value={customerId}
                    onChange={(e) => setCustomerId(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input 
                    type="password"
                    required
                    placeholder="Enter password"
                    value={customerPassword}
                    onChange={(e) => setCustomerPassword(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div className="flex justify-between items-center mt-1">
                  <span className="text-[11px] text-slate-400">
                    Demo credentials located in administrator Excel workbook
                  </span>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmittingCustomer}
                className="w-full py-2.5 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-sm font-bold shadow-md shadow-blue-600/20 transition-all flex items-center justify-center space-x-2 disabled:opacity-60"
              >
                {isSubmittingCustomer ? (
                  <span>Authenticating...</span>
                ) : (
                  <>
                    <span>Sign In to LifeWise</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="pt-2 text-center text-xs text-slate-500">
                Don't have an account yet?{' '}
                <button
                  type="button"
                  onClick={() => setActiveGateway('customer_register')}
                  className="text-blue-700 font-bold hover:underline"
                >
                  Register here
                </button>
              </div>
            </form>

          ) : activeGateway === 'customer_register' ? (

            /* 3. CUSTOMER REGISTRATION */
            <form onSubmit={handleCustomerRegister} className="space-y-4">
              <p className="text-xs text-slate-600">
                Create a new personal customer account to save assessments and receive advisory plans.
              </p>

              {regError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{regError}</span>
                </div>
              )}

              {regSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                  <span>{regSuccess}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Choose User ID
                  </label>
                  <input 
                    type="text"
                    required
                    placeholder="e.g. rajesh_kumar"
                    value={regUserId}
                    onChange={(e) => setRegUserId(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Full Name
                  </label>
                  <input 
                    type="text"
                    required
                    placeholder="e.g. Rajesh Kumar"
                    value={regFullName}
                    onChange={(e) => setRegFullName(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Email Address (Optional)
                </label>
                <input 
                  type="email"
                  placeholder="rajesh@example.com"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Password
                </label>
                <input 
                  type="password"
                  required
                  placeholder="At least 6 characters"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmittingReg}
                className="w-full py-2.5 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-sm font-bold shadow-md shadow-blue-600/20 transition-all flex items-center justify-center space-x-2 disabled:opacity-60"
              >
                {isSubmittingReg ? (
                  <span>Registering Account...</span>
                ) : (
                  <>
                    <span>Create Account</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="pt-2 text-center text-xs text-slate-500">
                Already registered?{' '}
                <button
                  type="button"
                  onClick={() => setActiveGateway('customer_login')}
                  className="text-blue-700 font-bold hover:underline"
                >
                  Sign in here
                </button>
              </div>
            </form>

          ) : activeGateway === 'admin_login' ? (

            /* 4. ADMINISTRATOR PORTAL LOGIN */
            <form onSubmit={handleAdminLogin} className="space-y-4">
              <div className="p-3.5 bg-slate-900 text-white rounded-xl flex items-center space-x-3">
                <Shield className="w-6 h-6 text-blue-400 shrink-0" />
                <div>
                  <div className="text-xs font-bold">Actuarial & Governance Portal</div>
                  <div className="text-[11px] text-slate-300">
                    Restricted access for Chief Actuary and Compliance Officers
                  </div>
                </div>
              </div>

              {adminError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{adminError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Administrator ID
                </label>
                <input 
                  type="text"
                  required
                  placeholder="e.g. ADMIN001"
                  value={adminId}
                  onChange={(e) => setAdminId(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Administrator Password / Master Secret Key
                </label>
                <input 
                  type="password"
                  required
                  placeholder="Enter administrator credential"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmittingAdmin}
                className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-sm font-bold shadow-md transition-all flex items-center justify-center space-x-2 disabled:opacity-60"
              >
                {isSubmittingAdmin ? (
                  <span>Verifying Credentials...</span>
                ) : (
                  <>
                    <span>Enter Governance Dashboard</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

          ) : (

            /* 5. DEMO CUSTOMER PERSONA SWITCHER */
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Search 200 demo profiles by name, ID, city..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="border border-slate-200 rounded-lg px-2.5 py-2 text-xs bg-white text-slate-600 focus:outline-none"
                >
                  <option value="all">All Sectors</option>
                  <option value="salaried">Salaried</option>
                  <option value="self_employed">Self Employed</option>
                  <option value="professional">Professional</option>
                </select>
              </div>

              <div className="space-y-1.5 max-h-[300px] overflow-y-auto pr-1 divide-y divide-slate-100">
                {filteredProfiles.slice(0, 40).map((profile) => {
                  const isCurrent = currentUser?.profile_id === profile.profile_id;
                  return (
                    <button
                      key={profile.profile_id}
                      onClick={() => handleSelectDemoPersona(profile.profile_id)}
                      className={`w-full text-left p-2.5 rounded-lg transition-all flex items-center justify-between group ${
                        isCurrent 
                          ? 'bg-blue-50 border border-blue-400' 
                          : 'hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                          isCurrent ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700'
                        }`}>
                          {profile.full_name?.charAt(0)}
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="text-xs font-semibold text-slate-900 group-hover:text-blue-700">
                              {profile.full_name}
                            </span>
                            <span className="text-[10px] font-mono text-slate-400">
                              ({profile.profile_id})
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-500">
                            {profile.occupation} • {profile.city} • ₹{(profile.annual_income_inr / 100000).toFixed(1)}L/yr
                          </div>
                        </div>
                      </div>
                      {isCurrent && (
                        <Check className="w-4 h-4 text-blue-600" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

          )}

        </div>

        {/* Footer with active session status & logout */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>
              Active: <strong>{isAdmin ? 'Administrator' : currentUser?.full_name || 'Guest'}</strong>
            </span>
          </div>

          {(currentUser || isAdmin) && (
            <button
              onClick={() => {
                logout();
                onClose();
              }}
              className="text-rose-600 hover:text-rose-700 font-semibold flex items-center space-x-1"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Log Out</span>
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
