import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

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
}

const DEFAULT_CUSTOMER: CustomerUser = {
  profile_id: 'CUS-DEFAULT',
  full_name: 'Chaitanya Verma',
  age: 32,
  gender: 'male',
  city: 'Bengaluru',
  occupation: 'Software Architect',
  annual_income_inr: 2400000,
  monthly_household_expenses_inr: 80000,
  marital_status: 'married',
  role: 'customer',
};

interface AuthContextType {
  currentUser: CustomerUser | null;
  isAdmin: boolean;
  availableProfiles: CustomerUser[];
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
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    const loadProfiles = async () => {
      try {
        const list = await api.getCustomers(20);
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

  const loginAsCustomer = async (profileId: string) => {
    setIsLoading(true);
    try {
      const fullProf = await api.getCustomerProfile(profileId);
      const user: CustomerUser = {
        profile_id: fullProf.profile_id || profileId,
        full_name: fullProf.full_name,
        age: fullProf.age,
        gender: fullProf.gender,
        city: fullProf.city,
        occupation: fullProf.occupation,
        annual_income_inr: fullProf.annual_income_inr,
        monthly_household_expenses_inr: fullProf.monthly_household_expenses_inr,
        marital_status: fullProf.marital_status,
        role: 'customer',
      };
      setCurrentUser(user);
      setIsAdmin(false);
      localStorage.setItem('lifewise_current_user', JSON.stringify(user));
      localStorage.removeItem('lifewise_is_admin');
    } catch {
      const match = availableProfiles.find(p => p.profile_id === profileId);
      if (match) {
        setCurrentUser(match);
        setIsAdmin(false);
        localStorage.setItem('lifewise_current_user', JSON.stringify(match));
        localStorage.removeItem('lifewise_is_admin');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const loginAsAdmin = (adminKey: string): boolean => {
    if (adminKey === 'lifewise-admin-key-2026' || adminKey === 'admin') {
      setIsAdmin(true);
      localStorage.setItem('lifewise_is_admin', 'true');
      return true;
    }
    return false;
  };

  const logout = () => {
    setCurrentUser(null);
    setIsAdmin(false);
    localStorage.removeItem('lifewise_current_user');
    localStorage.removeItem('lifewise_is_admin');
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAdmin,
        availableProfiles,
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
