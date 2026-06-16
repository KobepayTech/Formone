// ── Union Types ───────────────────────────────────────────────────────────────

export type UserRole = 'parent' | 'vendor' | 'school_admin' | 'platform_admin' | 'public';

export type UserZone = 'parent' | 'vendor' | 'school' | 'admin' | 'public';

export type ApplicationStatus =
  | 'submitted'
  | 'paid'
  | 'under_review'
  | 'interview_scheduled'
  | 'accepted'
  | 'rejected'
  | 'waitlisted'
  | 'pending_payment';

export type DemandLevel = 'low' | 'medium' | 'high' | 'critical';

export type DocumentType =
  | 'birth_certificate'
  | 'marksheet'
  | 'transfer_certificate'
  | 'medical_record'
  | 'aadhar_card'
  | 'passport_photo'
  | 'address_proof'
  | 'caste_certificate'
  | 'income_certificate'
  | 'migration_certificate';

export type BoardType = 'CBSE' | 'ICSE' | 'IB' | 'State' | 'CBSE+IB';

export type TicketStatus = 'generated' | 'printed' | 'downloaded' | 'used' | 'expired';

export type FormType = 'admission' | 'enquiry' | 'transfer' | 'scholarship';

export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded';

export type DocumentVerificationStatus =
  | 'pending'
  | 'verified'
  | 'rejected'
  | 'flagged'
  | 'blockchain_anchored';

export type VendorStatus = 'active' | 'inactive' | 'suspended' | 'pending';

export type TransactionType =
  | 'form_sale'
  | 'vendor_commission'
  | 'platform_fee'
  | 'refund'
  | 'token_topup';

export type NotificationType = 'info' | 'success' | 'warning' | 'error';

// ── Interfaces ────────────────────────────────────────────────────────────────

export interface StudentProfile {
  id: string;
  universalStudentId: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: 'male' | 'female' | 'other';
  bloodGroup: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  parentName: string;
  parentPhone: string;
  parentEmail: string;
  parentRelation: string;
  emergencyContact: string;
  previousSchool?: string;
  previousClass?: string;
  createdAt: string;
}

export interface School {
  id: string;
  name: string;
  code: string;
  boardType: BoardType;
  address: string;
  city: string;
  state: string;
  phone: string;
  email: string;
  website: string;
  feesRange: {
    min: number;
    max: number;
  };
  facilities: string[];
  capacity: number;
  availableSeats: number;
  description: string;
  logo?: string;
  rating: number;
  alumniCount: number;
  foundedYear: number;
  demandLevel: DemandLevel;
  image?: string;
}

export interface Vendor {
  id: string;
  vendorId: string;
  name: string;
  email: string;
  phone: string;
  status: VendorStatus;
  tokenBalance: number;
  totalCollections: number;
  totalTicketsPrinted: number;
  performanceScore: number;
  joinDate: string;
  location: string;
  avatar?: string;
}

export interface InterviewTicket {
  id: string;
  ticketNumber: string;
  submissionId: string;
  studentId: string;
  schoolId: string;
  studentName: string;
  schoolName: string;
  interviewDate: string;
  interviewTime: string;
  venue: string;
  instructions: string;
  ticketQrCode: string;
  status: TicketStatus;
  printedByVendor?: string;
  printedAt?: string;
  createdAt: string;
}

export interface Application {
  id: string;
  submissionId: string;
  studentId: string;
  schoolId: string;
  schoolName: string;
  studentName: string;
  formType: FormType;
  status: ApplicationStatus;
  totalAmount: number;
  paymentStatus: PaymentStatus;
  assignedVendorId?: string;
  vendorPaymentConfirmed: boolean;
  tickets: InterviewTicket[];
  documentsSubmitted: string[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface VaultDocument {
  id: string;
  studentId: string;
  documentType: DocumentType;
  fileUrl: string;
  fileName: string;
  uploadDate: string;
  verificationStatus: DocumentVerificationStatus;
  aiConfidenceScore?: number;
  blockchainHash?: string;
  blockchainAnchoredAt?: string;
  fileSize: number;
  mimeType: string;
}

export interface FormCatalogItem {
  id: string;
  schoolId: string;
  schoolName: string;
  formType: FormType;
  title: string;
  description: string;
  basePrice: number;
  demandAdjustedPrice: number;
  bulkDiscountThreshold: number;
  bulkDiscountPercent: number;
  requiredDocuments: DocumentType[];
  eligibilityCriteria: string[];
  saleStartDate: string;
  saleEndDate: string;
  maxQuantityPerStudent: number;
  isActive: boolean;
}

export interface Transaction {
  id: string;
  transactionId: string;
  type: TransactionType;
  applicationId?: string;
  schoolId?: string;
  vendorId?: string;
  parentId?: string;
  amount: number;
  platformFee: number;
  vendorCommission: number;
  schoolRevenue: number;
  tokenDeducted?: number;
  paymentMethod: 'cash' | 'online' | 'token';
  status: PaymentStatus;
  description: string;
  createdAt: string;
}

export interface UserAccount {
  id: string;
  userId: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  zone: UserZone;
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
  avatar?: string;
  preferences: {
    notifications: boolean;
    emailUpdates: boolean;
    language: string;
  };
}

export interface ParentGamification {
  id: string;
  parentId: string;
  totalXp: number;
  currentLevel: number;
  levelTitle: string;
  nextLevelXp: number;
  currentLevelXp: number;
  badges: Badge[];
  rank: 'gold' | 'silver' | 'bronze' | 'platinum' | 'none';
  streakDays: number;
  referralsCount: number;
  formsPurchased: number;
  schoolsApplied: number;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  earnedAt: string;
  category: 'early_bird' | 'bulk_buyer' | 'vip_parent' | 'networker' | 'trendsetter' | 'milestone';
}

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  actionUrl?: string;
  createdAt: string;
}

export interface AcademicYear {
  id: string;
  year: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  admissionOpenDate: string;
  admissionCloseDate: string;
  description: string;
}

export interface GradingScale {
  id: string;
  grade: string;
  minPercentage: number;
  maxPercentage: number;
  gradePoint: number;
  description: string;
}

export interface EmergencyProtocol {
  id: string;
  title: string;
  description: string;
  contactNumber: string;
  escalationLevel: number;
  isActive: boolean;
  createdAt: string;
}

export interface AuditEntry {
  id: string;
  userId: string;
  userRole: UserRole;
  action: string;
  entityType: string;
  entityId: string;
  details: string;
  ipAddress?: string;
  createdAt: string;
}

export interface DemandPricingRule {
  id: string;
  schoolId: string;
  demandLevel: DemandLevel;
  multiplier: number;
  effectiveDate: string;
}

export interface MatchFactors {
  distance: number;
  boardPreference: number;
  feeRange: number;
  facilities: number;
  academicFit: number;
}
