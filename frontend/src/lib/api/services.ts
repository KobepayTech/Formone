/** Typed wrappers around the backend REST endpoints, grouped by domain. */
import { api, tokenStore } from './client';
import type {
  Application,
  CartResponse,
  CheckoutResult,
  FormCatalogItem,
  LoginResponse,
  ConfirmPaymentResult,
  ParentTicket,
  School,
  SchoolApplicant,
  SchoolInterview,
  SchoolLoginResponse,
  SchoolRevenue,
  UserRole,
  VendorDashboard,
  VendorLoginResponse,
  VendorQueueItem,
  VendorTicket,
  VendorTransaction,
} from './types';

export const authService = {
  login: (email: string, password: string, role: UserRole) =>
    api.post<LoginResponse>('/auth/login', { email, password, role }, { anonymous: true }),

  vendorLogin: (vendorId: string, pin: string) =>
    api.post<VendorLoginResponse>('/auth/vendor/login', { vendorId, pin }, { anonymous: true }),

  schoolLogin: (schoolCode: string, boardType: string, adminId: string, password: string) =>
    api.post<SchoolLoginResponse>(
      '/auth/school/login',
      { schoolCode, boardType, adminId, password },
      { anonymous: true },
    ),

  register: (payload: Record<string, unknown>) =>
    api.post<LoginResponse>('/auth/register', payload, { anonymous: true }),

  logout: async () => {
    const refreshToken = tokenStore.refresh;
    if (refreshToken) {
      try {
        await api.post('/auth/logout', { refreshToken });
      } catch {
        /* ignore network errors on logout */
      }
    }
    tokenStore.clear();
  },
};

export const schoolService = {
  discover: (params: Record<string, string | number | undefined> = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== '') query.set(k, String(v));
    });
    const qs = query.toString();
    return api.get<School[]>(`/schools${qs ? `?${qs}` : ''}`);
  },
  get: (id: string) => api.get<School & { formCatalog: FormCatalogItem[] }>(`/schools/${id}`),
};

export const parentService = {
  applications: () => api.get<Application[]>('/parent/applications'),
  tickets: () => api.get<ParentTicket[]>('/parent/tickets'),
  documents: (studentProfileId: string) =>
    api.get(`/parent/documents?studentProfileId=${encodeURIComponent(studentProfileId)}`),
};

export const cartService = {
  add: (schoolId: string, formCatalogItemId: string, quantity = 1) =>
    api.post<{ items: CartResponse['items']; itemCount: number }>('/cart/add', {
      schoolId,
      formCatalogItemId,
      quantity,
    }),
  get: () => api.get<CartResponse>('/cart'),
  remove: (itemId: string) => api.delete<CartResponse>(`/cart/${itemId}`),
  checkout: () => api.post<CheckoutResult>('/cart/checkout'),
};

export const schoolAdminService = {
  applicants: (params: Record<string, string | number | undefined> = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== '') query.set(k, String(v));
    });
    const qs = query.toString();
    return api.get<SchoolApplicant[]>(`/school/applicants${qs ? `?${qs}` : ''}`);
  },
  applicant: (id: string) => api.get<SchoolApplicant>(`/school/applicants/${id}`),
  interviews: (params: Record<string, string | undefined> = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== '') query.set(k, String(v));
    });
    const qs = query.toString();
    return api.get<SchoolInterview[]>(`/school/interviews${qs ? `?${qs}` : ''}`);
  },
  scheduleInterview: (payload: {
    applicationId: string;
    interviewDate: string;
    interviewTime: string;
    venue: string;
    room?: string;
    instructions?: string;
  }) => api.post<SchoolInterview>('/school/schedule-interview', payload),
  updateAttendance: (id: string, status: string) =>
    api.put(`/school/interviews/${id}/attendance`, { status }),
  revenue: () => api.get<SchoolRevenue>('/school/revenue'),
};

export const vendorService = {
  dashboard: () => api.get<VendorDashboard>('/vendor/dashboard'),
  queue: () => api.get<VendorQueueItem[]>('/vendor/queue'),
  confirmPayment: (payload: {
    applicationId: string;
    amountTendered: number;
    paymentMethod: string;
    notes?: string;
  }) => api.post<ConfirmPaymentResult>('/vendor/confirm-payment', payload),
  history: (page = 1, limit = 5) =>
    api.get<VendorTransaction[]>(`/vendor/history?page=${page}&limit=${limit}`),
  tickets: (status?: string) =>
    api.get<VendorTicket[]>(`/vendor/tickets${status ? `?status=${status}` : ''}`),
  printTicket: (id: string) => api.post<VendorTicket>(`/vendor/tickets/${id}/print`),
};
