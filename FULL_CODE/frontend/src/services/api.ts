import {
  AssessmentInput,
  CalculationResult,
  RecommendationsResponse,
  SimulationRequest,
  SimulationResponse,
  Advisor,
  AvailableSlot,
  Appointment,
  AdminMetrics,
  FinancialAssumptions,
  ProductCatalogueItem,
  RiderItem,
  PremiumQuoteRequest,
  PremiumQuoteResult,
  CustomerProfileSummary,
} from '../types';
import { offlineEngine } from './offlineEngine';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({ detail: res.statusText }));
    const errorMessage = typeof errorBody.detail === 'string' 
      ? errorBody.detail 
      : JSON.stringify(errorBody.detail || 'API request failed');
    throw new Error(errorMessage);
  }
  return res.json();
}

async function fetchWithFallback<T>(
  url: string,
  options: RequestInit | undefined,
  fallbackFn: () => T
): Promise<T> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2500);
    const res = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(timeoutId);
    if (!res.ok) {
      console.warn(`API returned ${res.status}, using offline fallback engine.`);
      return fallbackFn();
    }
    return res.json();
  } catch (err) {
    console.warn(`Backend unreachable at ${url}, using offline client calculation engine.`);
    return fallbackFn();
  }
}

export const api = {
  // Assessment
  calculatePreview: async (input: AssessmentInput): Promise<CalculationResult> => {
    return fetchWithFallback(
      `${API_BASE_URL}/assessment/calculate`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      },
      () => offlineEngine.calculateNeeds(input)
    );
  },

  submitAssessment: async (input: AssessmentInput): Promise<CalculationResult> => {
    return fetchWithFallback(
      `${API_BASE_URL}/assessment/submit`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      },
      () => offlineEngine.calculateNeeds(input)
    );
  },

  getAssessmentById: async (id: number): Promise<{ id: number; inputs: AssessmentInput; results: CalculationResult }> => {
    return fetchWithFallback(
      `${API_BASE_URL}/assessment/${id}`,
      undefined,
      () => {
        const defaultInput: AssessmentInput = {
          full_name: 'Chaitanya Verma',
          age: 28,
          annual_income: 1200000,
          monthly_expenses: 60000,
          dependents_count: 2,
          replacement_horizon_years: 15,
          liabilities: { home_loan: 2500000, car_loan: 0, personal_loan: 0, education_loan: 0, credit_cards: 0, other_liabilities: 0 },
          future_goals: [
            { id: 'g1', name: "Child's education", target_amount: 2000000, years_until_goal: 15 },
            { id: 'g2', name: 'Dream home', target_amount: 5000000, years_until_goal: 10 },
          ],
          existing_assets: { savings_account: 500000, fixed_deposits: 500000, mutual_funds_stocks: 500000, pf_ppf_available: 0, other_liquid_assets: 0 },
          existing_life_cover: 2000000,
          monthly_budget: 1500,
          retirement_age: 60,
          risk_profile: 'moderate',
        };
        return {
          id,
          inputs: defaultInput,
          results: offlineEngine.calculateNeeds(defaultInput),
        };
      }
    );
  },

  getRecentAssessments: async (): Promise<any[]> => {
    return fetchWithFallback(
      `${API_BASE_URL}/assessment/recent`,
      undefined,
      () => [
        {
          id: 1042,
          full_name: 'Chaitanya Verma',
          age: 28,
          total_gross_protection_need: 10000000,
          net_additional_cover: 6500000,
          created_at: new Date().toISOString(),
        },
      ]
    );
  },

  // Recommendations
  getRecommendations: async (input: AssessmentInput, assessmentId?: number): Promise<RecommendationsResponse> => {
    const url = assessmentId 
      ? `${API_BASE_URL}/recommendations?assessment_id=${assessmentId}`
      : `${API_BASE_URL}/recommendations`;
    return fetchWithFallback(
      url,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      },
      () => offlineEngine.getRecommendations(input, assessmentId || 1042)
    );
  },

  getProducts: async (): Promise<any[]> => {
    return fetchWithFallback(
      `${API_BASE_URL}/products`,
      undefined,
      () => offlineEngine.getRecommendations({} as any).all_recommendations
    );
  },

  getCatalogueProducts: async (): Promise<ProductCatalogueItem[]> => {
    return fetchWithFallback(
      `${API_BASE_URL}/products`,
      undefined,
      () => offlineEngine.getCatalogueProducts()
    );
  },

  getRealQuote: async (quoteRequest: PremiumQuoteRequest): Promise<PremiumQuoteResult> => {
    return fetchWithFallback(
      `${API_BASE_URL}/products/quote`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(quoteRequest),
      },
      () => offlineEngine.getRealQuote(quoteRequest)
    );
  },

  getRiders: async (): Promise<RiderItem[]> => {
    return fetchWithFallback(
      `${API_BASE_URL}/riders`,
      undefined,
      () => offlineEngine.getRiders()
    );
  },

  getDemoProfiles: async (): Promise<CustomerProfileSummary[]> => {
    return fetchWithFallback(
      `${API_BASE_URL}/profiles`,
      undefined,
      () => offlineEngine.getDemoProfiles()
    );
  },

  getDatasetsStatus: async (): Promise<any> => {
    return fetchWithFallback(
      `${API_BASE_URL}/datasets/status`,
      undefined,
      () => ({ status: 'ready', message: 'Client demo cache' })
    );
  },

  // What-If Simulation
  runSimulation: async (req: SimulationRequest): Promise<SimulationResponse> => {
    return fetchWithFallback(
      `${API_BASE_URL}/simulate`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(req),
      },
      () => offlineEngine.runSimulation(req)
    );
  },

  // Educational Chat
  sendChatMessage: async (message: string): Promise<{ reply: string; suggested_followups: string[] }> => {
    return fetchWithFallback(
      `${API_BASE_URL}/chat`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message }),
      },
      () => offlineEngine.sendChatMessage(message)
    );
  },

  // Advisors & Appointments
  getAdvisors: async (): Promise<Advisor[]> => {
    return fetchWithFallback(
      `${API_BASE_URL}/advisors`,
      undefined,
      () => offlineEngine.getAdvisors()
    );
  },

  getAdvisorSlots: async (advisorId: string): Promise<AvailableSlot[]> => {
    return fetchWithFallback(
      `${API_BASE_URL}/advisors/${advisorId}/slots`,
      undefined,
      () => offlineEngine.getAdvisorSlots(advisorId)
    );
  },

  bookAppointment: async (payload: {
    advisor_id: string;
    client_name: string;
    client_email: string;
    client_phone: string;
    topic: string;
    slot_time: string;
    consultation_mode: 'video' | 'phone';
    notes?: string;
  }): Promise<Appointment> => {
    return fetchWithFallback(
      `${API_BASE_URL}/appointments/book`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      },
      () => offlineEngine.bookAppointment(payload)
    );
  },

  getAppointments: async (email?: string): Promise<Appointment[]> => {
    const url = email 
      ? `${API_BASE_URL}/appointments?client_email=${encodeURIComponent(email)}`
      : `${API_BASE_URL}/appointments`;
    return fetchWithFallback(
      url,
      undefined,
      () => offlineEngine.getAppointments(email)
    );
  },

  getAppointmentByCode: async (code: string): Promise<Appointment> => {
    return fetchWithFallback(
      `${API_BASE_URL}/appointments/${code}`,
      undefined,
      () => offlineEngine.getAppointments()[0]
    );
  },

  updateAppointmentStatus: async (id: number, newStatus: string): Promise<Appointment> => {
    return fetchWithFallback(
      `${API_BASE_URL}/appointments/${id}/status?new_status=${newStatus}`,
      { method: 'PATCH' },
      () => {
        const appt = offlineEngine.getAppointments()[0];
        appt.status = newStatus as any;
        return appt;
      }
    );
  },

  // Admin APIs
  getAdminMetrics: async (adminKey: string): Promise<AdminMetrics> => {
    return fetchWithFallback(
      `${API_BASE_URL}/admin/metrics`,
      { headers: { 'X-Admin-Key': adminKey } },
      () => ({
        total_assessments: 142,
        average_cover_need: 10500000,
        average_protection_gap: 6800000,
        total_gap_identified: 965600000,
        total_appointments_booked: 28,
        active_products_count: 4,
        category_distribution: { term: 65, ulip: 18, endowment: 12, whole_life: 5 },
      })
    );
  },

  getAssumptions: async (): Promise<FinancialAssumptions> => {
    return fetchWithFallback(
      `${API_BASE_URL}/admin/assumptions`,
      undefined,
      () => ({
        inflation_rate: 0.06,
        discount_rate: 0.08,
        emergency_reserve_months: 6,
        family_expense_factor: 0.75,
      })
    );
  },

  updateAssumptions: async (payload: FinancialAssumptions, adminKey: string): Promise<any> => {
    return fetchWithFallback(
      `${API_BASE_URL}/admin/assumptions`,
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'X-Admin-Key': adminKey },
        body: JSON.stringify(payload),
      },
      () => ({ status: 'success', message: 'Assumptions updated', data: payload })
    );
  },

  getAdminAppointments: async (adminKey: string): Promise<Appointment[]> => {
    return fetchWithFallback(
      `${API_BASE_URL}/admin/appointments`,
      { headers: { 'X-Admin-Key': adminKey } },
      () => offlineEngine.getAppointments()
    );
  },

  toggleProduct: async (productId: string, adminKey: string): Promise<any> => {
    return fetchWithFallback(
      `${API_BASE_URL}/admin/products/${productId}/toggle`,
      { method: 'PATCH', headers: { 'X-Admin-Key': adminKey } },
      () => ({ status: 'success', productId })
    );
  },

  // LLM & Policy Intelligence
  getPolicyRiskAnalysis: async (productId: string, params: Record<string, any>): Promise<any> => {
    const qs = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE_URL}/products/${productId}/risk-analysis?${qs}`);
    if (!res.ok) {
      throw new Error(`Failed to fetch policy risk analysis: ${res.statusText}`);
    }
    return res.json();
  },

  // Reverse Budget Solver
  solveReverseBudget: async (params: { monthly_budget: number; age?: number; tenure?: number; gender?: string; smoker_status?: string; category?: string }): Promise<any> => {
    const cleanParams: Record<string, string> = {
      monthly_budget: String(params.monthly_budget),
      age: String(params.age || 30),
      tenure: String(params.tenure || 25),
      gender: params.gender || 'male',
      smoker_status: params.smoker_status || 'non_smoker',
    };
    if (params.category) cleanParams.category = params.category;
    const qs = new URLSearchParams(cleanParams).toString();
    const res = await fetch(`${API_BASE_URL}/reverse-budget-solve?${qs}`);
    if (!res.ok) {
      throw new Error(`Failed to solve reverse budget: ${res.statusText}`);
    }
    return res.json();
  },

  // Authoritative Insurance Glossary
  getGlossary: async (params?: { section?: string; search?: string; irdai_only?: boolean }): Promise<any> => {
    const q = new URLSearchParams();
    if (params?.section) q.append('section', params.section);
    if (params?.search) q.append('search', params.search);
    if (params?.irdai_only) q.append('irdai_only', 'true');
    const qs = q.toString() ? `?${q.toString()}` : '';
    const res = await fetch(`${API_BASE_URL}/glossary${qs}`);
    if (!res.ok) {
      throw new Error(`Failed to fetch glossary: ${res.statusText}`);
    }
    return res.json();
  },

  getGlossarySections: async (): Promise<{ sections: string[] }> => {
    const res = await fetch(`${API_BASE_URL}/glossary/sections`);
    if (!res.ok) {
      throw new Error(`Failed to fetch glossary sections: ${res.statusText}`);
    }
    return res.json();
  },

  // Customer Profiles
  getCustomers: async (limit: number = 20): Promise<any[]> => {
    try {
      const res = await fetch(`${API_BASE_URL}/customers?limit=${limit}`);
      if (!res.ok) return [];
      return res.json();
    } catch {
      return [];
    }
  },

  getCustomerProfile: async (profileId: string): Promise<any> => {
    const res = await fetch(`${API_BASE_URL}/customers/${profileId}`);
    if (!res.ok) {
      throw new Error(`Failed to fetch customer profile ${profileId}`);
    }
    return res.json();
  },

  // Auth & Admin Registered Users API
  login: async (credentials: { user_id: string; password: string }): Promise<any> => {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Authentication failed' }));
      throw new Error(err.detail || 'Authentication failed');
    }
    return res.json();
  },

  changePassword: async (payload: { user_id: string; old_password: string; new_password: string }): Promise<any> => {
    const res = await fetch(`${API_BASE_URL}/auth/change-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Failed to update password' }));
      throw new Error(err.detail || 'Failed to update password');
    }
    return res.json();
  },

  getRegisteredUsers: async (adminKeyOrToken: string, search?: string): Promise<any> => {
    const q = new URLSearchParams();
    if (search) q.append('search', search);
    const qs = q.toString() ? `?${q.toString()}` : '';
    const res = await fetch(`${API_BASE_URL}/admin/registered-users${qs}`, {
      headers: {
        'X-Admin-Key': adminKeyOrToken,
      },
    });
    if (!res.ok) {
      throw new Error('Failed to fetch registered users');
    }
    return res.json();
  },

  getUserDetailReadOnly: async (userId: string, adminKeyOrToken: string): Promise<any> => {
    const res = await fetch(`${API_BASE_URL}/admin/registered-users/${userId}`, {
      headers: {
        'X-Admin-Key': adminKeyOrToken,
      },
    });
    if (!res.ok) {
      throw new Error(`Failed to fetch user details for ${userId}`);
    }
    return res.json();
  },
};
