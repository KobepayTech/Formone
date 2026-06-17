import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email(),
  phone: z.string().min(5).optional(),
  password: z.string().min(6),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  dateOfBirth: z.string().min(1),
  gender: z.enum(['male', 'female', 'other']),
  bloodGroup: z.string().optional(),
  address: z.string().min(1),
  city: z.string().min(1),
  state: z.string().min(1),
  parentName: z.string().min(1),
  parentPhone: z.string().min(1),
  parentEmail: z.string().email(),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
  role: z.enum(['parent', 'vendor', 'school_admin', 'platform_admin']),
});

export const vendorLoginSchema = z.object({
  vendorId: z.string().min(1),
  pin: z.string().min(1),
});

export const schoolLoginSchema = z.object({
  schoolCode: z.string().min(1),
  boardType: z.enum(['CBSE', 'ICSE', 'IB', 'State']),
  adminId: z.string().min(1),
  password: z.string().min(1),
});

export const refreshSchema = z.object({
  refreshToken: z.string().min(1),
});

export const confirmPaymentSchema = z.object({
  applicationId: z.string().min(1),
  amountTendered: z.number().int().nonnegative(),
  paymentMethod: z.string().min(1),
  notes: z.string().optional(),
});
