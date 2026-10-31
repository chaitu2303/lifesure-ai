import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';
import { AssessmentInput, CalculationResult } from '../types';

export interface CustomerUser {
  profile_id: string;
  full_name: string;
  age: number;
  gender: string;
  city: string;
  occupation: string;
  annual_income_inr: number;
  monthly_household_expenses_inr: number;
  marital_status: string;
  role: 'customer' | 'admin';
  city_tier?: number;
  employment_type?: string;
  profile_date?: string;
}

const DEFAULT_CUSTOMER: CustomerUser = {
  profile_id: 'CUS-06ISGGSQ',
  full_name: 'Abhishek Saxena',
  age: 32,
  gender: 'male',
  city: 'Chandigarh',
  occupation: 'Marketing manager',
  annual_income_inr: 1190000,
  monthly_household_expenses_inr: 48500,
  marital_status: 'married',
  role: 'customer',
  city_tier: 2,
  employment_type: 'salaried_private',
};

interface AuthContextType {
  currentUser: CustomerUser | null;
  isAdmin: boolean;
  availableProfiles: CustomerUser[];
  activeAssessmentInput: AssessmentInput | null;
  activeCalculationResult: CalculationResult | null;
  notificationMessage: string | null;
  loginAsCustomer: (profileId: string, directUserData?: Partial<CustomerUser>) => Promise<void>;
  loginAsAdmin: (adminKey: string) => boolean;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<CustomerUser | null>(() => {
    const saved = localStorage.getItem('lifewise_current_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return DEFAULT_CUSTOMER;
      }
    }
    return DEFAULT_CUSTOMER;
  });

  const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    return localStorage.getItem('lifewise_is_admin') === 'true';
  });

  const [availableProfiles, setAvailableProfiles] = useState<CustomerUser[]>([]);
  const [activeAssessmentInput, setActiveAssessmentInput] = useState<AssessmentInput | null>(null);
  const [activeCalculationResult, setActiveCalculationResult] = useState<CalculationResult | null>(null);
  const [notificationMessage, setNotificationMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Load profiles on mount
  useEffect(() => {
    const loadProfiles = async () => {
      try {
        const list = await api.getCustomers(50);
        if (list && list.length > 0) {
          setAvailableProfiles(list.map(p => ({ ...p, role: 'customer' })));
        } else {
          setAvailableProfiles([DEFAULT_CUSTOMER]);
        }
      } catch {
        setAvailableProfiles([DEFAULT_CUSTOMER]);
      }
    };
    loadProfiles();
  }, []);

  // Fetch full details and calculation results for the current profile
  const fetchCustomerDetails = async (profileId: string) => {
    try {
      const data = await api.getCustomerProfile(profileId);
      if (data && data.assessment_input && data.calculation_result) {
        setActiveAssessmentInput(data.assessment_input);
        setActiveCalculationResult(data.calculation_result);
      }
    } catch (err) {
      console.warn(`Could not fetch details for ${profileId}`, err);
    }
  };

  useEffect(() => {
    if (currentUser?.profile_id) {
      fetchCustomerDetails(currentUser.profile_id);
    }
  }, [currentUser?.profile_id]);

  const loginAsCustomer = async (profileId: string, directUserData?: Partial<CustomerUser>) => {
    setIsLoading(true);
    try {
      const data = await api.getCustomerProfile(profileId);
      const prof = data.profile || data;
      const user: CustomerUser = {
        profile_id: prof.profile_id || profileId,
        full_name: directUserData?.full_name || prof.full_name,
        age: directUserData?.age || prof.age || 30,
        gender: directUserData?.gender || prof.gender || 'male',
        city: directUserData?.city || prof.city || 'Mumbai',
        occupation: directUserData?.occupation || prof.occupation || 'Professional',
        annual_income_inr: directUserData?.annual_income_inr ?? prof.annual_income_inr ?? 1200000,
        monthly_household_expenses_inr: directUserData?.monthly_household_expenses_inr ?? prof.monthly_household_expenses_inr ?? 50000,
        marital_status: directUserData?.marital_status || prof.marital_status || 'married',
        role: 'customer',
        city_tier: prof.city_tier || 1,
        employment_type: prof.employment_type || 'salaried_private',
      };

      setCurrentUser(user);
      localStorage.setItem('lifewise_current_user', JSON.stringify(user));

      if (data.assessment_input && data.calculation_result) {
        // If direct user provided, ensure the name in assessment input matches
        const input = { ...data.assessment_input };
        if (directUserData?.full_name) {
          input.full_name = directUserData.full_name;
        }
        setActiveAssessmentInput(input);
        setActiveCalculationResult(data.calculation_result);
      } else {
        // Build fresh default assessment input for newly registered user
        const freshInput: AssessmentInput = {
          full_name: user.full_name,
          age: user.age,
          annual_income: user.annual_income_inr,
          monthly_expenses: user.monthly_household_expenses_inr,
          dependents_count: 2,
          retirement_age: 60,
          replacement_horizon_years: Math.max(10, Math.min(25, 60 - user.age)),
          liabilities: {
            home_loan: 0,
            car_loan: 0,
            personal_loan: 0,
            education_loan: 0,
            credit_cards: 0,
            other_liabilities: 0,
          },
          future_goals: [
            { id: 'g-default', name: "Child's Higher Education", target_amount: 2500000, years_until_goal: 12 },
          ],
          existing_assets: {
            savings_account: 300000,
            fixed_deposits: 200000,
            mutual_funds_stocks: 250000,
            pf_ppf_available: 0,
            other_liquid_assets: 0,
          },
          existing_life_cover: 0,
          monthly_budget: 2000,
          risk_profile: 'moderate',
        };
        setActiveAssessmentInput(freshInput);
      }

      setNotificationMessage(`Logged in as ${user.full_name}`);
      setTimeout(() => setNotificationMessage(null), 3500);
    } catch {
      const match = availableProfiles.find(p => p.profile_id === profileId);
      const user: CustomerUser = match ? { ...match } : {
        profile_id: profileId,
        full_name: directUserData?.full_name || profileId,
        age: 30,
        gender: 'male',
        city: 'Mumbai',
        occupation: 'Professional',
        annual_income_inr: 1200000,
        monthly_household_expenses_inr: 50000,
        marital_status: 'married',
        role: 'customer',
      };
      if (directUserData?.full_name) {
        user.full_name = directUserData.full_name;
      }
      setCurrentUser(user);
      localStorage.setItem('lifewise_current_user', JSON.stringify(user));
      
      const freshInput: AssessmentInput = {
        full_name: user.full_name,
        age: user.age,
        annual_income: user.annual_income_inr,
        monthly_expenses: user.monthly_household_expenses_inr,
        dependents_count: 2,
        retirement_age: 60,
        replacement_horizon_years: 15,
        liabilities: { home_loan: 0, car_loan: 0, personal_loan: 0, education_loan: 0, credit_cards: 0, other_liabilities: 0 },
        future_goals: [{ id: 'g-default', name: "Child's Higher Education", target_amount: 2500000, years_until_goal: 12 }],
        existing_assets: { savings_account: 300000, fixed_deposits: 200000, mutual_funds_stocks: 250000, pf_ppf_available: 0, other_liquid_assets: 0 },
        existing_life_cover: 0,
        monthly_budget: 2000,
        risk_profile: 'moderate',
      };
      setActiveAssessmentInput(freshInput);
      setNotificationMessage(`Logged in as ${user.full_name}`);
      setTimeout(() => setNotificationMessage(null), 3500);
    } finally {
      setIsLoading(false);
    }
  };

  const loginAsAdmin = (adminKey: string): boolean => {
    if (adminKey === 'lifewise-admin-key-2026' || adminKey === 'admin') {
      setIsAdmin(true);
      localStorage.setItem('lifewise_is_admin', 'true');
      setNotificationMessage('Authenticated as System Administrator (Governance Mode)');
      setTimeout(() => setNotificationMessage(null), 3500);
      return true;
    }
    return false;
  };

  const logout = () => {
    setCurrentUser(null);
    setIsAdmin(false);
    setActiveAssessmentInput(null);
    setActiveCalculationResult(null);
    localStorage.removeItem('lifewise_current_user');
    localStorage.removeItem('lifewise_is_admin');
    setNotificationMessage('Signed out successfully.');
    setTimeout(() => setNotificationMessage(null), 3000);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAdmin,
        availableProfiles,
        activeAssessmentInput,
        activeCalculationResult,
        notificationMessage,
        loginAsCustomer,
        loginAsAdmin,
        logout,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
