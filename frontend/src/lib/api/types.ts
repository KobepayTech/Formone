/**
 * DTOs and enums that mirror the backend Prisma schema and API responses
 * exactly. These are the source of truth at the network boundary; the
 * view-model types in `src/types` remain for mock/presentation use.
 */

export type UserRole = 'parent' | 'vendor' | 'school_admin' | 'platform_admin';
export type UserStatus = 'active' | 'inactive' | 'suspended';
export type BoardType = 'CBSE' | 'ICSE' | 'IB' | 'State';
export type DemandLevel = 'low' | 'medium' | 'high' | 'critical';
export type FormType = 'admission' | 'transfer' | 'scholarship' | 'exam';

export type ApplicationStatus =
  | 'draft'
  | 'submitted'
  | 'payment_pending'
  | 'paid'
  | 'tickets_generated'
  | 'interview_scheduled'
  | 'accepted'
  | 'rejected';

export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded';
export type TicketStatus = 'valid' | 'used' | 'expired' | 'cancelled';

export type DocumentType =
  | 'birth_certificate'
  | 'previous_marksheet'
  | 'transfer_letter'
  | 'medical_record'
  | 'id_proof'
  | 'photo';

export type DocumentVerificationStatus =
  | 'pending'
  | 'verified'
  | 'blockchain_anchored'
  | 'rejected';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
}

export interface LoginResponse {
  user: AuthUser;
  tokens: AuthTokens;
}

export interface VendorLoginResponse {
  vendor: { id: string; vendorId: string; name: string; tokenBalance: number };
  tokens: AuthTokens;
}

export interface SchoolLoginResponse {
  school: { id: string; name: string; code: string; boardType: BoardType };
  admin: { id: string; position: string };
  tokens: AuthTokens;
}

export interface School {
  id: string;
  name: string;
  code: string;
  boardType: BoardType;
  city: string;
  state: string;
  feesMin: number;
  feesMax: number;
  capacity: number;
  availableSeats: number;
  facilities: string[];
  rating: number;
  demandLevel: DemandLevel;
  status: string;
}

export interface FormCatalogItem {
  id: string;
  schoolId: string;
  formType: FormType;
  formName: string;
  basePrice: number;
  currency: string;
  taxPercentage: number;
  isActive: boolean;
}

export interface Application {
  id: string;
  submissionId: string;
  schoolId: string;
  formType: FormType;
  status: ApplicationStatus;
  totalAmount: number;
  paymentStatus: PaymentStatus;
  createdAt: string;
}

export interface CartPricing {
  basePrice: number;
  surgeMultiplier: number;
  surgeAmount: number;
  bulkDiscountPercent: number;
  bulkDiscountAmount: number;
  taxPercent: number;
  taxAmount: number;
  finalPrice: number;
  totalSavings: number;
}

export interface CartItem {
  id: string;
  schoolId: string;
  formCatalogItemId: string;
  quantity: number;
  schoolName: string;
  formName: string;
  pricing: CartPricing;
}

export interface CartResponse {
  items: CartItem[];
  total: number;
  count: number;
}

export interface CheckoutResult {
  applications: Application[];
  totalAmount: number;
}

export interface ParentTicket {
  id: string;
  ticketNumber: string;
  interviewDate: string;
  interviewTime: string;
  venue: string;
  room?: string | null;
  instructions?: string | null;
  ticketQrCode?: string | null;
  status: TicketStatus;
  school: { name: string; city: string };
  application: { formType: FormType };
}

export interface VendorDashboard {
  todayCollections: number;
  todayCount: number;
  pendingCount: number;
  ticketsToday: number;
  tokenBalance: number;
}

export interface VendorQueueItem {
  id: string;
  submissionId: string;
  totalAmount: number;
  createdAt: string;
  studentProfile: {
    firstName: string;
    lastName: string;
    universalStudentId: string;
    parentName: string;
    parentPhone: string;
  };
  school: { name: string; city: string };
}

export interface SchoolApplicant {
  id: string;
  submissionId: string;
  formType: FormType;
  status: ApplicationStatus;
  paymentStatus: PaymentStatus;
  totalAmount: number;
  createdAt: string;
  studentProfile: {
    firstName: string;
    lastName: string;
    universalStudentId: string;
    parentPhone: string;
    parentEmail: string;
  };
  vendor?: { name: string; vendorId: string } | null;
  formCatalog?: { formName: string } | null;
  _count?: { tickets: number };
}

export interface SchoolInterview {
  id: string;
  ticketNumber: string;
  interviewDate: string;
  interviewTime: string;
  venue: string;
  room?: string | null;
  status: TicketStatus;
  studentProfile: { firstName: string; lastName: string };
  application: { formType: FormType };
}

export interface SchoolRevenue {
  today: { revenue: number; forms: number };
  thisWeek: { revenue: number; forms: number };
  thisMonth: { revenue: number; forms: number };
}

export interface VendorTicket {
  id: string;
  ticketNumber: string;
  interviewDate: string;
  interviewTime: string;
  venue: string;
  status: TicketStatus;
  printedByVendor: boolean;
  printedAt?: string | null;
  ticketQrCode?: string | null;
  school: { name: string };
  studentProfile: { firstName: string; lastName: string };
}

export interface VendorTransaction {
  id: string;
  transactionId: string;
  totalAmount: number;
  paymentMethod: string;
  createdAt: string;
  school?: { name: string } | null;
}

export interface ConfirmPaymentResult {
  application: { id: string; totalAmount: number; schoolId: string };
  ticket: { id: string; ticketNumber: string };
  change: number;
  message: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}
