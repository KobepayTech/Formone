"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const database_1 = require("../config/database");
const env_1 = require("../config/env");
const asyncHandler_1 = require("../utils/asyncHandler");
const response_1 = require("../utils/response");
const auth_1 = require("../middleware/auth");
const audit_1 = require("../services/audit");
const errors_1 = require("../utils/errors");
const router = (0, express_1.Router)();
router.use(auth_1.authenticate, (0, auth_1.authorize)('platform_admin'));
router.get('/analytics', (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const [revenueToday, formsSold, activeSchools, activeVendors, parentUsers, paymentMethods, topSchools, revenueByBoard] = await Promise.all([
        database_1.prisma.transaction.aggregate({ where: { createdAt: { gte: today } }, _sum: { totalAmount: true }, _count: true }),
        database_1.prisma.application.count({ where: { createdAt: { gte: today } } }),
        database_1.prisma.school.count({ where: { status: 'active' } }),
        database_1.prisma.vendor.count({ where: { status: 'active' } }),
        database_1.prisma.user.count({ where: { role: 'parent', status: 'active' } }),
        database_1.prisma.transaction.groupBy({ by: ['paymentMethod'], where: { createdAt: { gte: today } }, _sum: { totalAmount: true }, _count: true }),
        database_1.prisma.transaction.groupBy({ by: ['schoolId'], where: { createdAt: { gte: today } }, _sum: { totalAmount: true }, _count: true, orderBy: { _sum: { totalAmount: 'desc' } }, take: 10 }),
        database_1.prisma.transaction.findMany({ where: { createdAt: { gte: today } }, include: { school: { select: { boardType: true } } }, orderBy: { createdAt: 'desc' }, take: 50 }),
    ]);
    const schoolIds = topSchools.map(s => s.schoolId);
    const schools = await database_1.prisma.school.findMany({ where: { id: { in: schoolIds } }, select: { id: true, name: true, boardType: true } });
    const schoolMap = new Map(schools.map(s => [s.id, s]));
    const boardRevenue = {};
    revenueByBoard.forEach(tx => {
        const board = tx.school?.boardType || 'Unknown';
        boardRevenue[board] = (boardRevenue[board] || 0) + tx.totalAmount;
    });
    (0, response_1.success)(res, {
        overview: { revenueToday: revenueToday._sum.totalAmount || 0, transactionsToday: revenueToday._count, formsSoldToday: formsSold, activeSchools, activeVendors, parentUsers },
        paymentMethods: paymentMethods.map(pm => ({ method: pm.paymentMethod, amount: pm._sum.totalAmount || 0, count: pm._count })),
        topSchools: topSchools.map(s => ({ school: schoolMap.get(s.schoolId), revenue: s._sum.totalAmount || 0, forms: s._count })),
        revenueByBoard: Object.entries(boardRevenue).map(([board, amount]) => ({ board, amount })),
    });
}));
router.get('/schools', (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { boardType, city, status, search, page = '1', limit = '20' } = req.query;
    const where = {};
    if (boardType)
        where.boardType = boardType;
    if (city)
        where.city = { contains: city, mode: 'insensitive' };
    if (status)
        where.status = status;
    if (search)
        where.OR = [{ name: { contains: search, mode: 'insensitive' } }, { code: { contains: search } }];
    const [schools, total] = await Promise.all([
        database_1.prisma.school.findMany({ where, include: { _count: { select: { applications: true, admins: true } } }, skip: (parseInt(page) - 1) * parseInt(limit), take: parseInt(limit), orderBy: { createdAt: 'desc' } }),
        database_1.prisma.school.count({ where }),
    ]);
    (0, response_1.success)(res, schools, undefined, { page: parseInt(page), limit: parseInt(limit), total, totalPages: Math.ceil(total / parseInt(limit)) });
}));
router.post('/schools', (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const data = req.body;
    const school = await database_1.prisma.school.create({ data: { ...data, availableSeats: data.capacity, demandLevel: 'medium', status: 'active' } });
    (0, audit_1.logAudit)(req.user.id, 'SCHOOL_CREATED', 'school', school.id);
    (0, response_1.created)(res, school, 'School created');
}));
router.get('/schools/:id', (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const school = await database_1.prisma.school.findUnique({ where: { id: req.params.id }, include: { pricingRules: { where: { isActive: true } }, admins: { include: { user: { select: { email: true } } } } } });
    if (!school)
        throw new errors_1.NotFoundError('School not found');
    (0, response_1.success)(res, school);
}));
router.put('/schools/:id', (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const school = await database_1.prisma.school.update({ where: { id: req.params.id }, data: req.body });
    (0, audit_1.logAudit)(req.user.id, 'SCHOOL_UPDATED', 'school', school.id);
    (0, response_1.success)(res, school, 'School updated');
}));
router.get('/vendors', (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { status, city, search, page = '1', limit = '20' } = req.query;
    const where = {};
    if (status)
        where.status = status;
    if (city)
        where.city = { contains: city, mode: 'insensitive' };
    if (search)
        where.OR = [{ name: { contains: search, mode: 'insensitive' } }, { vendorId: { contains: search } }];
    const [vendors, total] = await Promise.all([
        database_1.prisma.vendor.findMany({ where, skip: (parseInt(page) - 1) * parseInt(limit), take: parseInt(limit), orderBy: { createdAt: 'desc' } }),
        database_1.prisma.vendor.count({ where }),
    ]);
    (0, response_1.success)(res, vendors, undefined, { page: parseInt(page), limit: parseInt(limit), total, totalPages: Math.ceil(total / parseInt(limit)) });
}));
router.post('/vendors', (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { vendorId, name, businessName, email, phone, address, city, initialTokens = 1000 } = req.body;
    const passwordHash = await bcryptjs_1.default.hash('123456', parseInt(env_1.env.BCRYPT_ROUNDS));
    const result = await database_1.prisma.$transaction(async (tx) => {
        const user = await tx.user.create({ data: { email, phone, passwordHash, role: 'vendor', status: 'active' } });
        const vendor = await tx.vendor.create({ data: { userId: user.id, vendorId, name, businessName, address, city, tokenBalance: initialTokens, maxTokenBalance: 5000, status: 'active' } });
        return vendor;
    });
    (0, audit_1.logAudit)(req.user.id, 'VENDOR_CREATED', 'vendor', result.id);
    (0, response_1.created)(res, result, 'Vendor created. Default PIN: 123456');
}));
router.get('/vendors/:id', (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const vendor = await database_1.prisma.vendor.findUnique({ where: { id: req.params.id }, include: { settlements: { orderBy: { createdAt: 'desc' }, take: 10 } } });
    if (!vendor)
        throw new errors_1.NotFoundError('Vendor not found');
    (0, response_1.success)(res, vendor);
}));
router.put('/vendors/:id', (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const vendor = await database_1.prisma.vendor.update({ where: { id: req.params.id }, data: req.body });
    (0, response_1.success)(res, vendor, 'Vendor updated');
}));
router.post('/vendors/:id/tokens', (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { amount, reason } = req.body;
    const vendor = await database_1.prisma.vendor.findUnique({ where: { id: req.params.id } });
    if (!vendor)
        throw new errors_1.NotFoundError('Vendor not found');
    const newBalance = vendor.tokenBalance + amount;
    if (newBalance < 0)
        throw new errors_1.BadRequestError('Token balance cannot go below 0');
    if (newBalance > vendor.maxTokenBalance)
        throw new errors_1.BadRequestError(`Token balance cannot exceed ${vendor.maxTokenBalance}`);
    const updated = await database_1.prisma.vendor.update({ where: { id: req.params.id }, data: { tokenBalance: newBalance } });
    (0, audit_1.logAudit)(req.user.id, 'TOKENS_ADJUSTED', 'vendor', vendor.id, { previousBalance: vendor.tokenBalance, newBalance, amount, reason });
    (0, response_1.success)(res, { vendorId: updated.id, tokenBalance: updated.tokenBalance, adjustedBy: amount }, `Tokens ${amount > 0 ? 'added' : 'deducted'}: ${amount}`);
}));
router.get('/vendors/:id/settlements', (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const settlements = await database_1.prisma.vendorSettlement.findMany({ where: { vendorId: req.params.id }, orderBy: { createdAt: 'desc' } });
    (0, response_1.success)(res, settlements);
}));
router.get('/transactions', (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { schoolId, vendorId, paymentStatus, page = '1', limit = '50' } = req.query;
    const where = {};
    if (schoolId)
        where.schoolId = schoolId;
    if (vendorId)
        where.vendorId = vendorId;
    if (paymentStatus)
        where.paymentStatus = paymentStatus;
    const [transactions, total] = await Promise.all([
        database_1.prisma.transaction.findMany({ where, include: { school: { select: { name: true } } }, orderBy: { createdAt: 'desc' }, skip: (parseInt(page) - 1) * parseInt(limit), take: parseInt(limit) }),
        database_1.prisma.transaction.count({ where }),
    ]);
    (0, response_1.success)(res, transactions, undefined, { page: parseInt(page), limit: parseInt(limit), total, totalPages: Math.ceil(total / parseInt(limit)) });
}));
router.get('/audit-logs', (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { userId, action, entityType, page = '1', limit = '50' } = req.query;
    const where = {};
    if (userId)
        where.userId = userId;
    if (action)
        where.action = { contains: action, mode: 'insensitive' };
    if (entityType)
        where.entityType = entityType;
    const [logs, total] = await Promise.all([
        database_1.prisma.auditLog.findMany({ where, include: { user: { select: { email: true } } }, orderBy: { timestamp: 'desc' }, skip: (parseInt(page) - 1) * parseInt(limit), take: parseInt(limit) }),
        database_1.prisma.auditLog.count({ where }),
    ]);
    (0, response_1.success)(res, logs, undefined, { page: parseInt(page), limit: parseInt(limit), total, totalPages: Math.ceil(total / parseInt(limit)) });
}));
exports.default = router;
//# sourceMappingURL=admin.routes.js.map