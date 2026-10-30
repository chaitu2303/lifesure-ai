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
  loginAsCustomer: (profileId: string) => Promise<void>;
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

  const loginAsCustomer = async (profileId: string) => {
    setIsLoading(true);
    try {
      const data = await api.getCustomerProfile(profileId);
      const prof = data.profile || data;
      const user: CustomerUser = {
        profile_id: prof.profile_id || profileId,
        full_name: prof.full_name,
        age: prof.age,
        gender: prof.gender,
        city: prof.city,
        occupation: prof.occupation,
        annual_income_inr: prof.annual_income_inr,
        monthly_household_expenses_inr: prof.monthly_household_expenses_inr,
        marital_status: prof.marital_status,
        role: 'customer',
        city_tier: prof.city_tier,
        employment_type: prof.employment_type,
      };

      setCurrentUser(user);
      setIsAdmin(false);
      localStorage.setItem('lifewise_current_user', JSON.stringify(user));
      localStorage.removeItem('lifewise_is_admin');

      if (data.assessment_input && data.calculation_result) {
        setActiveAssessmentInput(data.assessment_input);
        setActiveCalculationResult(data.calculation_result);
      }

      setNotificationMessage(`Switched active profile to ${user.full_name}`);
      setTimeout(() => setNotificationMessage(null), 3500);
    } catch {
      const match = availableProfiles.find(p => p.profile_id === profileId);
      if (match) {
        setCurrentUser(match);
        setIsAdmin(false);
        localStorage.setItem('lifewise_current_user', JSON.stringify(match));
        localStorage.removeItem('lifewise_is_admin');
        setNotificationMessage(`Switched active profile to ${match.full_name}`);
        setTimeout(() => setNotificationMessage(null), 3500);
      }
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
