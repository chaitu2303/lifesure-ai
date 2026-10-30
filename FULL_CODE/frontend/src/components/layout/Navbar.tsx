import React, { useState } from 'react';
import { 
  ArrowRight, 
  Search, 
  User, 
  Menu, 
  X, 
  ShieldCheck, 
  Calculator, 
  Layers, 
  Sliders, 
  Video, 
  HelpCircle,
  Sparkles,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface NavbarProps {
  currentView: string;
  onNavigate: (view: string) => void;
  onOpenBooking: () => void;
  hasResult?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ 
  currentView, 
  onNavigate, 
  onOpenBooking, 
  hasResult = false 
}) => {
  const { currentUser, isAdmin } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const navLinks = [
    { id: 'landing', label: 'Home' },
    { id: 'how-it-works', label: 'How it Works' },
    { id: 'products', label: 'Compare Products' },
    { id: 'simulator', label: 'What-If Simulator' },
    { id: 'consultation', label: 'Advisor Consultation' },
  ];

  const handleNavClick = (id: string) => {
    if (id === 'how-it-works') {
      if (currentView !== 'landing') {
        onNavigate('landing');
        setTimeout(() => {
          const el = document.getElementById('how-it-works-section');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      } else {
        const el = document.getElementById('how-it-works-section');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }
    } else if (id === 'consultation') {
      onOpenBooking();
    } else {
      onNavigate(id);
    }
    setMobileMenuOpen(false);
  };

  return (
    <>
      {/* Top micro announcement bar */}
      <div className="bg-[#0B132B] text-slate-300 text-[11px] py-1.5 px-4 hidden md:block border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-slate-300 font-medium tracking-wide">
              Fiduciary Needs Calculation Engine &bull; Zero Commission Bias
            </span>
          </div>
          <div className="flex items-center space-x-4 text-slate-400 font-serif italic text-xs">
            <span>Protect Today. Plan Tomorrow. Live Assured.</span>
          </div>
        </div>
      </div>

      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#E6E4DF] transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            
            {/* Logo: Brand Shield + Identity */}
            <div 
              onClick={() => handleNavClick('landing')}
              className="flex items-center space-x-3 cursor-pointer group select-none"
            >
              <img 
                src="/logo.png" 
                alt="LifeWise Logo" 
                className="w-11 h-11 rounded-xl object-contain shadow-sm group-hover:scale-105 transition-transform" 
              />
              <div className="flex flex-col">
                <div className="flex items-baseline space-x-1">
                  <span className="font-serif text-2xl font-bold tracking-tight text-[#0B132B]">
                    LifeWise
                  </span>
                </div>
                <span className="text-[9px] font-sans font-medium uppercase tracking-[0.18em] text-slate-500 -mt-1">
                  Plan Today &bull; Protect Tomorrow
                </span>
              </div>
            </div>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center space-x-8 text-[13px] font-medium text-slate-700">
              <button
                onClick={() => handleNavClick('landing')}
                className={`py-1.5 transition-colors relative hover:text-[#1D4ED8] ${
                  currentView === 'landing' ? 'text-[#1D4ED8] font-bold' : 'text-slate-700'
                }`}
              >
                Home
              </button>

              <button
                onClick={() => handleNavClick('how-it-works')}
                className="py-1.5 transition-colors text-slate-700 hover:text-[#1D4ED8]"
              >
                How It Works
              </button>

              <button
                onClick={() => handleNavClick('products')}
                className={`py-1.5 transition-colors hover:text-[#1D4ED8] ${
                  currentView === 'products' ? 'text-[#1D4ED8] font-bold' : 'text-slate-700'
                }`}
              >
                Compare Products
              </button>

              <button
                onClick={() => handleNavClick('simulator')}
                className={`py-1.5 transition-colors hover:text-[#1D4ED8] ${
                  currentView === 'simulator' ? 'text-[#1D4ED8] font-bold' : 'text-slate-700'
                }`}
              >
                What-If Simulator
              </button>

              <button
                onClick={() => handleNavClick('consultation')}
                className="py-1.5 transition-colors text-slate-700 hover:text-[#1D4ED8]"
              >
                Advisor Consultation
              </button>
            </nav>

            {/* Right Controls: Search, My Dashboard, Start Assessment CTA */}
            <div className="flex items-center space-x-3">
              {/* Search Icon */}
              <button
                onClick={() => setSearchOpen(true)}
                className="p-2 text-slate-500 hover:text-[#0B132B] hover:bg-slate-100 rounded-full transition-colors"
                title="Search LifeWise"
                aria-label="Search"
              >
                <Search className="w-4 h-4" />
              </button>

              {/* My Dashboard Button */}
              <button
                onClick={() => onNavigate('dashboard')}
                className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-[#0B132B] hover:bg-slate-100 rounded-full border border-slate-200 transition-colors"
              >
                <div className="w-5 h-5 rounded-full bg-[#1D4ED8] text-white flex items-center justify-center text-[10px] font-bold">
                  {isAdmin ? 'A' : (currentUser?.full_name?.charAt(0) || 'C')}
                </div>
                <span>{isAdmin ? 'Admin' : (currentUser?.full_name?.split(' ')[0] || 'Dashboard')}</span>
              </button>

              {/* Primary Action Button */}
              <button
                onClick={() => onNavigate('assessment')}
                className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-full text-xs font-bold text-white bg-[#1D4ED8] hover:bg-[#1E40AF] transition-all shadow-md shadow-blue-500/25 active:scale-95"
              >
                <span>Start Assessment</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              {/* Mobile menu trigger */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 text-slate-700 hover:text-[#0B132B] rounded-lg"
                aria-label="Toggle Navigation Menu"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-white border-b border-[#E6E4DF] px-4 pt-2 pb-6 space-y-1 shadow-lg animate-in slide-in-from-top-4 duration-200">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => handleNavClick(link.id)}
                className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center justify-between ${
                  currentView === link.id
                    ? 'bg-blue-50 text-[#1D4ED8] font-semibold'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <span>{link.label}</span>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>
            ))}

            <div className="pt-3 border-t border-slate-100 flex flex-col space-y-2">
              <button
                onClick={() => {
                  onNavigate('dashboard');
                  setMobileMenuOpen(false);
                }}
                className="w-full py-2.5 px-3 rounded-xl text-xs font-semibold text-slate-800 bg-slate-100 hover:bg-slate-200 text-center"
              >
                Open My Dashboard
              </button>
              <button
                onClick={() => {
                  onOpenBooking();
                  setMobileMenuOpen(false);
                }}
                className="w-full py-2.5 px-3 rounded-xl text-xs font-bold text-white bg-[#1D4ED8] hover:bg-[#1E40AF] text-center"
              >
                Book Advisor Consultation
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Quick Search Modal */}
      {searchOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-start justify-center pt-24 px-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="p-4 border-b border-slate-100 flex items-center space-x-3">
              <Search className="w-5 h-5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search tools, products, calculators, or topics..."
                className="flex-1 text-sm outline-none text-slate-800 placeholder-slate-400"
                autoFocus
              />
              <button
                onClick={() => setSearchOpen(false)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 max-h-72 overflow-y-auto space-y-1">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 px-3 py-1 block">
                Quick Navigation
              </span>
              {[
                { label: 'Start Needs Assessment', action: () => onNavigate('assessment') },
                { label: 'View Customer Dashboard', action: () => onNavigate('dashboard') },
                { label: 'What-If Scenario Simulator', action: () => onNavigate('simulator') },
                { label: 'Compare Product Categories', action: () => onNavigate('products') },
                { label: 'Book Advisor Consultation', action: () => onOpenBooking() },
              ].map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    item.action();
                    setSearchOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl text-xs font-medium text-slate-700 hover:bg-blue-50 hover:text-[#1D4ED8] flex items-center justify-between group transition-colors"
                >
                  <span>{item.label}</span>
                  <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
