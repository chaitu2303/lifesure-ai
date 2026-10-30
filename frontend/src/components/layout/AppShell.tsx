import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  FileText, 
  CheckSquare, 
  Layers, 
  Sliders, 
  Video, 
  Settings, 
  Home, 
  Bell, 
  Menu, 
  X, 
  ChevronRight, 
  Sparkles,
  Search,
  UserCheck,
  Shield,
  LogOut,
  User
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { AccountSwitcherModal } from '../auth/AccountSwitcherModal';

interface AppShellProps {
  currentView: string;
  onNavigate: (view: string) => void;
  onOpenBooking: () => void;
  stepTitle?: string;
  stepIndicator?: string;
  hasResult?: boolean;
  children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({
  currentView,
  onNavigate,
  onOpenBooking,
  stepTitle,
  stepIndicator,
  hasResult = false,
  children,
}) => {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [isSwitcherOpen, setIsSwitcherOpen] = useState(false);
  const { currentUser, isAdmin, logout } = useAuth();

  const sidebarItems = [
    { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
    { id: 'results', label: 'My Plan', icon: FileText, disabled: !hasResult },
    { id: 'assessment', label: 'Assessment', icon: CheckSquare, badge: '1/4' },
    { id: 'products', label: 'Products', icon: Layers },
    { id: 'simulator', label: 'Simulator', icon: Sliders },
    { id: 'consultation', label: 'Consultation', icon: Video },
    { id: 'settings', label: 'Settings', icon: Settings },
    ...(isAdmin ? [{ id: 'admin', label: 'Governance (Admin)', icon: Shield, badge: 'Admin' }] : []),
  ];

  const handleSidebarClick = (id: string) => {
    if (id === 'consultation') {
      onOpenBooking();
    } else {
      onNavigate(id);
    }
    setMobileSidebarOpen(false);
  };

  return (
    <div className="min-h-screen flex bg-[#FAF9F5] text-[#0B132B]">
      
      {/* DESKTOP DARK SIDEBAR MATCHING REFERENCE IMAGE */}
      <aside className="hidden lg:flex flex-col w-64 bg-[#070C18] border-r border-slate-800 shrink-0 select-none">
        
        {/* Brand Header */}
        <div 
          onClick={() => onNavigate('landing')}
          className="p-5 flex items-center space-x-3 cursor-pointer border-b border-slate-800/80 group"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#1D4ED8] to-[#3B82F6] flex items-center justify-center text-white shadow-md shadow-blue-500/30 group-hover:scale-105 transition-transform">
            <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.4z" opacity="0.3"/>
              <path d="M12 3C7.03 3 3 7.03 3 12c0 2.48 1.01 4.73 2.65 6.35L12 12V3z" fill="white" opacity="0.9"/>
              <path d="M12 12l6.35 6.35C19.99 16.73 21 14.48 21 12c0-4.97-4.03-9-9-9v9z" fill="#93C5FD"/>
            </svg>
          </div>
          <div>
            <div className="flex items-baseline space-x-1">
              <span className="font-serif text-xl font-bold tracking-tight text-white">
                LifeWise
              </span>
            </div>
            <span className="text-[9px] font-mono tracking-wider uppercase text-slate-400">
              Protection Suite
            </span>
          </div>
        </div>

        {/* Sidebar Navigation Links */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleSidebarClick(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-[#1D4ED8] text-white shadow-md shadow-blue-600/30 font-semibold'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className={`px-1.5 py-0.5 rounded text-[9px] font-mono ${
                    isActive ? 'bg-blue-900 text-white' : 'bg-slate-800 text-slate-300'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Bottom User Profile Card & Back to Website */}
        <div className="p-3 border-t border-slate-800 space-y-2">
          
          <div 
            onClick={() => setIsSwitcherOpen(true)}
            className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 flex items-center justify-between cursor-pointer group transition-all"
            title="Click to switch customer account or admin"
          >
            <div className="flex items-center space-x-2.5">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs text-white ${
                isAdmin ? 'bg-amber-600' : 'bg-gradient-to-tr from-blue-600 to-indigo-600'
              }`}>
                {isAdmin ? 'A' : (currentUser?.full_name?.charAt(0) || 'C')}
              </div>
              <div className="text-left">
                <div className="text-xs font-semibold text-white leading-none group-hover:text-blue-400 transition-colors">
                  {isAdmin ? 'System Admin' : (currentUser?.full_name || 'Chaitanya Verma')}
                </div>
                <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                  {isAdmin ? 'Governance Mode' : `${currentUser?.city || 'Bengaluru'} • Switch`}
                </div>
              </div>
            </div>
            <span className={`w-2 h-2 rounded-full ${isAdmin ? 'bg-amber-400 animate-pulse' : 'bg-emerald-400'}`} />
          </div>

          <div className="flex items-center space-x-1">
            <button
              onClick={() => onNavigate('landing')}
              className="flex-1 flex items-center justify-center space-x-1.5 py-1.5 px-2 rounded-lg text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <Home className="w-3.5 h-3.5" />
              <span>Home</span>
            </button>
            <button
              onClick={() => {
                logout();
                onNavigate('landing');
              }}
              className="flex items-center justify-center p-1.5 rounded-lg text-xs font-medium text-red-400 hover:text-red-300 hover:bg-red-950/40 transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </aside>

      {/* MOBILE DRAWER */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div 
            onClick={() => setMobileSidebarOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
          />
          <div className="relative w-72 bg-[#070C18] border-r border-slate-800 p-4 flex flex-col justify-between z-10 animate-in slide-in-from-left duration-200">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center space-x-2">
                  <span className="font-serif text-lg font-bold text-white">LifeWise</span>
                </div>
                <button
                  onClick={() => setMobileSidebarOpen(false)}
                  className="p-1 rounded text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <nav className="space-y-1">
                {sidebarItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentView === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleSidebarClick(item.id)}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium ${
                        isActive
                          ? 'bg-[#1D4ED8] text-white font-semibold'
                          : 'text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <Icon className="w-4 h-4" />
                        <span>{item.label}</span>
                      </div>
                      {item.badge && (
                        <span className="px-1.5 py-0.5 rounded text-[9px] bg-slate-800 text-slate-300">
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </nav>
            </div>

            <button
              onClick={() => {
                onNavigate('landing');
                setMobileSidebarOpen(false);
              }}
              className="w-full flex items-center justify-center space-x-2 py-2.5 rounded-xl text-xs font-semibold text-white bg-slate-800 hover:bg-slate-700"
            >
              <Home className="w-4 h-4" />
              <span>Back to Landing Page</span>
            </button>
          </div>
        </div>
      )}

      {/* MAIN CONTENT AREA WITH TOP BAR */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        
        {/* Top App Header Bar */}
        <header className="h-16 bg-white border-b border-[#E6E4DF] px-4 sm:px-6 flex items-center justify-between shrink-0 sticky top-0 z-30">
          
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="lg:hidden p-2 text-slate-600 hover:text-[#0B132B] rounded-lg"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Breadcrumb / Step Title */}
            <div className="flex items-center space-x-2 text-xs">
              <span className="text-slate-400 font-medium hidden sm:inline">LifeWise</span>
              <span className="text-slate-300 hidden sm:inline">/</span>
              <span className="font-semibold text-[#0B132B]">
                {stepTitle || currentView.toUpperCase()}
              </span>
              {stepIndicator && (
                <span className="px-2 py-0.5 rounded-full bg-blue-50 text-[#1D4ED8] font-mono text-[10px] font-bold border border-blue-100">
                  {stepIndicator}
                </span>
              )}
            </div>
          </div>

          {/* Right Header Controls */}
          <div className="flex items-center space-x-3">
            <button
              onClick={onOpenBooking}
              className="hidden sm:inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
            >
              <Video className="w-3.5 h-3.5 text-[#1D4ED8]" />
              <span>Advisor Consultation</span>
            </button>

            <button
              onClick={() => onNavigate('landing')}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-slate-600 hover:text-[#0B132B] hover:bg-slate-100 border border-slate-200 transition-colors"
            >
              <Home className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Home</span>
            </button>

            <div 
              onClick={() => setIsSwitcherOpen(true)}
              className="flex items-center space-x-2 pl-2 border-l border-slate-200 cursor-pointer hover:opacity-80 transition-opacity"
              title="Switch user account"
            >
              <div className="w-7 h-7 rounded-full bg-blue-100 border border-blue-300 flex items-center justify-center text-xs font-bold text-blue-700">
                {isAdmin ? 'A' : (currentUser?.full_name?.charAt(0) || 'C')}
              </div>
              <span className="text-xs font-semibold text-[#0B132B] hidden md:inline">
                {isAdmin ? 'Admin' : (currentUser?.full_name || 'Chaitanya')}
              </span>
            </div>
          </div>

        </header>

        {/* Page Content Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>

        {/* Account Switcher & Admin Auth Modal */}
        <AccountSwitcherModal
          isOpen={isSwitcherOpen}
          onClose={() => setIsSwitcherOpen(false)}
          onAdminSelect={() => onNavigate('admin')}
        />

      </div>

    </div>
  );
};
