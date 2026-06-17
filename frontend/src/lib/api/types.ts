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

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}
