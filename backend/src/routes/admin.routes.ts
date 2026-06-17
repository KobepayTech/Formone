import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../config/database';
import { env } from '../config/env';
import { asyncHandler } from '../utils/asyncHandler';
import { success, created } from '../utils/response';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';
import { logAudit } from '../services/audit';
import { BadRequestError, NotFoundError } from '../utils/errors';

const router = Router();
router.use(authenticate, authorize('platform_admin'));

router.get('/analytics', asyncHandler(async (req: AuthRequest, res) => {
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const [revenueToday, formsSold, activeSchools, activeVendors, parentUsers, paymentMethods, topSchools, revenueByBoard] = await Promise.all([
    prisma.transaction.aggregate({ where: { createdAt: { gte: today } }, _sum: { totalAmount: true }, _count: true }),
    prisma.application.count({ where: { createdAt: { gte: today } } }),
    prisma.school.count({ where: { status: 'active' } }),
    prisma.vendor.count({ where: { status: 'active' } }),
    prisma.user.count({ where: { role: 'parent', status: 'active' } }),
    prisma.transaction.groupBy({ by: ['paymentMethod'], where: { createdAt: { gte: today } }, _sum: { totalAmount: true }, _count: true }),
    prisma.transaction.groupBy({ by: ['schoolId'], where: { createdAt: { gte: today } }, _sum: { totalAmount: true }, _count: true, orderBy: { _sum: { totalAmount: 'desc' } }, take: 10 }),
    prisma.transaction.findMany({ where: { createdAt: { gte: today } }, include: { school: { select: { boardType: true } } }, orderBy: { createdAt: 'desc' }, take: 50 }),
  ]);

  const schoolIds = topSchools.map(s => s.schoolId);
  const schools = await prisma.school.findMany({ where: { id: { in: schoolIds } }, select: { id: true, name: true, boardType: true } });
  const schoolMap = new Map(schools.map(s => [s.id, s]));

  const boardRevenue: Record<string, number> = {};
  revenueByBoard.forEach(tx => {
    const board = tx.school?.boardType || 'Unknown';
    boardRevenue[board] = (boardRevenue[board] || 0) + tx.totalAmount;
  });

  success(res, {
    overview: { revenueToday: revenueToday._sum.totalAmount || 0, transactionsToday: revenueToday._count, formsSoldToday: formsSold, activeSchools, activeVendors, parentUsers },
    paymentMethods: paymentMethods.map(pm => ({ method: pm.paymentMethod, amount: pm._sum.totalAmount || 0, count: pm._count })),
    topSchools: topSchools.map(s => ({ school: schoolMap.get(s.schoolId), revenue: s._sum.totalAmount || 0, forms: s._count })),
    revenueByBoard: Object.entries(boardRevenue).map(([board, amount]) => ({ board, amount })),
  });
}));

router.get('/schools', asyncHandler(async (req: AuthRequest, res) => {
  const { boardType, city, status, search, page = '1', limit = '20' } = req.query as Record<string, string>;
  const where: any = {};
  if (boardType) where.boardType = boardType;
  if (city) where.city = { contains: city as string, mode: 'insensitive' };
  if (status) where.status = status;
  if (search) where.OR = [{ name: { contains: search as string, mode: 'insensitive' } }, { code: { contains: search as string } }];

  const [schools, total] = await Promise.all([
    prisma.school.findMany({ where, include: { _count: { select: { applications: true, admins: true } } }, skip: (parseInt(page as string) - 1) * parseInt(limit as string), take: parseInt(limit as string), orderBy: { createdAt: 'desc' } }),
    prisma.school.count({ where }),
  ]);
  success(res, schools, undefined, { page: parseInt(page as string), limit: parseInt(limit as string), total, totalPages: Math.ceil(total / parseInt(limit as string)) });
}));

router.post('/schools', asyncHandler(async (req: AuthRequest, res) => {
  const data = req.body;
  const school = await prisma.school.create({ data: { ...data, availableSeats: data.capacity, demandLevel: 'medium', status: 'active' } });
  logAudit(req.user!.id, 'SCHOOL_CREATED', 'school', school.id);
  created(res, school, 'School created');
}));

router.get('/schools/:id', asyncHandler(async (req: AuthRequest, res) => {
  const school = await prisma.school.findUnique({ where: { id: req.params.id as string }, include: {  pricingRules: { where: { isActive: true } }, admins: { include: { user: { select: { email: true } } } } } });
  if (!school) throw new NotFoundError('School not found');
  success(res, school);
}));

router.put('/schools/:id', asyncHandler(async (req: AuthRequest, res) => {
  const school = await prisma.school.update({ where: { id: req.params.id as string }, data: req.body });
  logAudit(req.user!.id, 'SCHOOL_UPDATED', 'school', school.id);
  success(res, school, 'School updated');
}));

router.get('/vendors', asyncHandler(async (req: AuthRequest, res) => {
  const { status, city, search, page = '1', limit = '20' } = req.query as Record<string, string>;
  const where: any = {};
  if (status) where.status = status;
  if (city) where.city = { contains: city as string, mode: 'insensitive' };
  if (search) where.OR = [{ name: { contains: search as string, mode: 'insensitive' } }, { vendorId: { contains: search as string } }];

  const [vendors, total] = await Promise.all([
    prisma.vendor.findMany({ where, skip: (parseInt(page as string) - 1) * parseInt(limit as string), take: parseInt(limit as string), orderBy: { createdAt: 'desc' } }),
    prisma.vendor.count({ where }),
  ]);
  success(res, vendors, undefined, { page: parseInt(page as string), limit: parseInt(limit as string), total, totalPages: Math.ceil(total / parseInt(limit as string)) });
}));

router.post('/vendors', asyncHandler(async (req: AuthRequest, res) => {
  const { vendorId, name, businessName, email, phone, address, city, initialTokens = 1000 } = req.body;
  const passwordHash = await bcrypt.hash('123456', parseInt(env.BCRYPT_ROUNDS));

  const result = await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({ data: { email, phone, passwordHash, role: 'vendor', status: 'active' } });
    const vendor = await tx.vendor.create({ data: { userId: user.id, vendorId, name, businessName, address, city, tokenBalance: initialTokens, maxTokenBalance: 5000, status: 'active' } });
    return vendor;
  });

  logAudit(req.user!.id, 'VENDOR_CREATED', 'vendor', result.id);
  created(res, result, 'Vendor created. Default PIN: 123456');
}));

router.get('/vendors/:id', asyncHandler(async (req: AuthRequest, res) => {
  const vendor = await prisma.vendor.findUnique({ where: { id: req.params.id as string }, include: { settlements: { orderBy: { createdAt: 'desc' }, take: 10 } } });
  if (!vendor) throw new NotFoundError('Vendor not found');
  success(res, vendor);
}));

router.put('/vendors/:id', asyncHandler(async (req: AuthRequest, res) => {
  const vendor = await prisma.vendor.update({ where: { id: req.params.id as string }, data: req.body });
  success(res, vendor, 'Vendor updated');
}));

router.post('/vendors/:id/tokens', asyncHandler(async (req: AuthRequest, res) => {
  const { amount, reason } = req.body;
  const vendor = await prisma.vendor.findUnique({ where: { id: req.params.id as string } });
  if (!vendor) throw new NotFoundError('Vendor not found');

  const newBalance = vendor.tokenBalance + amount;
  if (newBalance < 0) throw new BadRequestError('Token balance cannot go below 0');
  if (newBalance > vendor.maxTokenBalance) throw new BadRequestError(`Token balance cannot exceed ${vendor.maxTokenBalance}`);

  const updated = await prisma.vendor.update({ where: { id: req.params.id as string }, data: { tokenBalance: newBalance } });
  logAudit(req.user!.id, 'TOKENS_ADJUSTED', 'vendor', vendor.id, { previousBalance: vendor.tokenBalance, newBalance, amount, reason });
  success(res, { vendorId: updated.id, tokenBalance: updated.tokenBalance, adjustedBy: amount }, `Tokens ${amount > 0 ? 'added' : 'deducted'}: ${amount}`);
}));

router.get('/vendors/:id/settlements', asyncHandler(async (req: AuthRequest, res) => {
  const settlements = await prisma.vendorSettlement.findMany({ where: { vendorId: req.params.id as string }, orderBy: { createdAt: 'desc' } });
  success(res, settlements);
}));

router.get('/transactions', asyncHandler(async (req: AuthRequest, res) => {
  const { schoolId, vendorId, paymentStatus, page = '1', limit = '50' } = req.query as Record<string, string>;
  const where: any = {};
  if (schoolId) where.schoolId = schoolId;
  if (vendorId) where.vendorId = vendorId;
  if (paymentStatus) where.paymentStatus = paymentStatus;

  const [transactions, total] = await Promise.all([
    prisma.transaction.findMany({ where, include: { school: { select: { name: true } } }, orderBy: { createdAt: 'desc' }, skip: (parseInt(page as string) - 1) * parseInt(limit as string), take: parseInt(limit as string) }),
    prisma.transaction.count({ where }),
  ]);
  success(res, transactions, undefined, { page: parseInt(page as string), limit: parseInt(limit as string), total, totalPages: Math.ceil(total / parseInt(limit as string)) });
}));

router.get('/audit-logs', asyncHandler(async (req: AuthRequest, res) => {
  const { userId, action, entityType, page = '1', limit = '50' } = req.query as Record<string, string>;
  const where: any = {};
  if (userId) where.userId = userId as string;
  if (action) where.action = { contains: action as string, mode: 'insensitive' };
  if (entityType) where.entityType = entityType as string;

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({ where, include: { user: { select: { email: true } } }, orderBy: { timestamp: 'desc' }, skip: (parseInt(page as string) - 1) * parseInt(limit as string), take: parseInt(limit as string) }),
    prisma.auditLog.count({ where }),
  ]);
  success(res, logs, undefined, { page: parseInt(page as string), limit: parseInt(limit as string), total, totalPages: Math.ceil(total / parseInt(limit as string)) });
}));

export default router;
