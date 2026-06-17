import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/database';
import { env } from '../config/env';
import { asyncHandler } from '../utils/asyncHandler';
import { success, created } from '../utils/response';
import { UnauthorizedError, BadRequestError } from '../utils/errors';
import { authLimiter } from '../middleware/rateLimiter';
import { validate } from '../middleware/validate';
import { registerSchema, loginSchema, vendorLoginSchema, schoolLoginSchema, refreshSchema } from '../validators/schemas';

const router = Router();

const generateTokens = (userId: string, email: string, role: string) => {
  const accessToken = jwt.sign({ userId, email, role }, env.JWT_SECRET, { expiresIn: env.JWT_ACCESS_EXPIRY as any });
  const refreshToken = jwt.sign({ userId }, env.JWT_REFRESH_SECRET, { expiresIn: env.JWT_REFRESH_EXPIRY as any });
  return { accessToken, refreshToken };
};

router.post('/register', authLimiter, validate(registerSchema), asyncHandler(async (req, res) => {
  const { email, phone, password, firstName, lastName, dateOfBirth, gender, bloodGroup, address, city, state, parentName, parentPhone, parentEmail } = req.body;
  const existing = await prisma.user.findFirst({ where: { OR: [{ email }, { phone }] } });
  if (existing) throw new BadRequestError('Email or phone already registered');
  const passwordHash = await bcrypt.hash(password, parseInt(env.BCRYPT_ROUNDS));

  const user = await prisma.user.create({ data: { email, phone, passwordHash, role: 'parent', status: 'active' } });
  const studentProfile = await prisma.studentProfile.create({
    data: { universalStudentId: `EDU-${Date.now()}`, userId: user.id, firstName, lastName, dateOfBirth: new Date(dateOfBirth), gender, bloodGroup, address, city, state, parentName, parentPhone, parentEmail },
  });
  await prisma.parentGamification.create({ data: { studentProfileId: studentProfile.id, totalXP: 0, currentRank: 1, badges: [], perksUnlocked: [], nextBadgeProgress: 0 } });

  const tokens = generateTokens(user.id, user.email, user.role);
  await prisma.refreshToken.create({ data: { token: tokens.refreshToken, userId: user.id, expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) } });
  created(res, { user: { id: user.id, email: user.email, role: user.role }, studentProfile, tokens }, 'Registration successful');
}));

router.post('/login', authLimiter, validate(loginSchema), asyncHandler(async (req, res) => {
  const { email, password, role } = req.body;
  const user = await prisma.user.findFirst({ where: { email, role } });
  if (!user) throw new UnauthorizedError('Invalid credentials');
  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) throw new UnauthorizedError('Invalid credentials');
  await prisma.user.update({ where: { id: user.id }, data: { lastLogin: new Date() } });
  const tokens = generateTokens(user.id, user.email, user.role);
  await prisma.refreshToken.create({ data: { token: tokens.refreshToken, userId: user.id, expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) } });
  success(res, { user: { id: user.id, email: user.email, role: user.role }, tokens });
}));

router.post('/vendor/login', authLimiter, validate(vendorLoginSchema), asyncHandler(async (req, res) => {
  const { vendorId, pin } = req.body;
  const vendor = await prisma.vendor.findUnique({ where: { vendorId }, include: { user: true } });
  if (!vendor) throw new UnauthorizedError('Invalid vendor ID');
  if (vendor.status !== 'active') throw new UnauthorizedError('Vendor account inactive');
  const valid = await bcrypt.compare(pin, vendor.user.passwordHash);
  if (!valid) throw new UnauthorizedError('Invalid PIN');
  await prisma.user.update({ where: { id: vendor.userId }, data: { lastLogin: new Date() } });
  const tokens = generateTokens(vendor.user.id, vendor.user.email, vendor.user.role);
  await prisma.refreshToken.create({ data: { token: tokens.refreshToken, userId: vendor.user.id, expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) } });
  success(res, { vendor: { id: vendor.id, vendorId: vendor.vendorId, name: vendor.name, tokenBalance: vendor.tokenBalance }, tokens });
}));

router.post('/school/login', authLimiter, validate(schoolLoginSchema), asyncHandler(async (req, res) => {
  const { schoolCode, boardType, adminId, password } = req.body;
  const school = await prisma.school.findFirst({ where: { code: schoolCode, boardType } });
  if (!school) throw new UnauthorizedError('Invalid school');
  const admin = await prisma.schoolAdmin.findFirst({ where: { id: adminId, schoolId: school.id }, include: { user: true } });
  if (!admin) throw new UnauthorizedError('Invalid admin');
  const valid = await bcrypt.compare(password, admin.user.passwordHash);
  if (!valid) throw new UnauthorizedError('Invalid password');
  await prisma.user.update({ where: { id: admin.user.id }, data: { lastLogin: new Date() } });
  const tokens = generateTokens(admin.user.id, admin.user.email, admin.user.role);
  await prisma.refreshToken.create({ data: { token: tokens.refreshToken, userId: admin.user.id, expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) } });
  success(res, { school: { id: school.id, name: school.name, code: school.code, boardType: school.boardType }, admin: { id: admin.id, position: admin.position }, tokens });
}));

router.post('/refresh', validate(refreshSchema), asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;
  const decoded = jwt.verify(refreshToken, env.JWT_REFRESH_SECRET) as { userId: string };
  const tokenRecord = await prisma.refreshToken.findUnique({ where: { token: refreshToken } });
  if (!tokenRecord || tokenRecord.expiresAt < new Date()) throw new UnauthorizedError('Invalid or expired refresh token');
  const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
  if (!user) throw new UnauthorizedError('User not found');
  if (user.status !== 'active') throw new UnauthorizedError('User account is not active');
  const accessToken = jwt.sign({ userId: user.id, email: user.email, role: user.role }, env.JWT_SECRET, { expiresIn: env.JWT_ACCESS_EXPIRY as any });
  success(res, { accessToken });
}));

router.post('/logout', asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;
  if (refreshToken) await prisma.refreshToken.deleteMany({ where: { token: refreshToken } });
  success(res, null, 'Logged out successfully');
}));

export default router;
