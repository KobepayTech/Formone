"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const database_1 = require("../config/database");
const env_1 = require("../config/env");
const asyncHandler_1 = require("../utils/asyncHandler");
const response_1 = require("../utils/response");
const errors_1 = require("../utils/errors");
const rateLimiter_1 = require("../middleware/rateLimiter");
const router = (0, express_1.Router)();
const generateTokens = (userId, email, role) => {
    const accessToken = jsonwebtoken_1.default.sign({ userId, email, role }, env_1.env.JWT_SECRET, { expiresIn: env_1.env.JWT_ACCESS_EXPIRY });
    const refreshToken = jsonwebtoken_1.default.sign({ userId }, env_1.env.JWT_REFRESH_SECRET, { expiresIn: env_1.env.JWT_REFRESH_EXPIRY });
    return { accessToken, refreshToken };
};
router.post('/register', rateLimiter_1.authLimiter, (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { email, phone, password, firstName, lastName, dateOfBirth, gender, bloodGroup, address, city, state, parentName, parentPhone, parentEmail } = req.body;
    const existing = await database_1.prisma.user.findFirst({ where: { OR: [{ email }, { phone }] } });
    if (existing)
        throw new errors_1.BadRequestError('Email or phone already registered');
    const passwordHash = await bcryptjs_1.default.hash(password, parseInt(env_1.env.BCRYPT_ROUNDS));
    const user = await database_1.prisma.user.create({ data: { email, phone, passwordHash, role: 'parent', status: 'active' } });
    const studentProfile = await database_1.prisma.studentProfile.create({
        data: { universalStudentId: `EDU-${Date.now()}`, userId: user.id, firstName, lastName, dateOfBirth: new Date(dateOfBirth), gender, bloodGroup, address, city, state, parentName, parentPhone, parentEmail },
    });
    await database_1.prisma.parentGamification.create({ data: { studentProfileId: studentProfile.id, totalXP: 0, currentRank: 1, badges: [], perksUnlocked: [], nextBadgeProgress: 0 } });
    const tokens = generateTokens(user.id, user.email, user.role);
    await database_1.prisma.refreshToken.create({ data: { token: tokens.refreshToken, userId: user.id, expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) } });
    (0, response_1.created)(res, { user: { id: user.id, email: user.email, role: user.role }, studentProfile, tokens }, 'Registration successful');
}));
router.post('/login', rateLimiter_1.authLimiter, (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { email, password, role } = req.body;
    const user = await database_1.prisma.user.findFirst({ where: { email, role } });
    if (!user)
        throw new errors_1.UnauthorizedError('Invalid credentials');
    const valid = await bcryptjs_1.default.compare(password, user.passwordHash);
    if (!valid)
        throw new errors_1.UnauthorizedError('Invalid credentials');
    await database_1.prisma.user.update({ where: { id: user.id }, data: { lastLogin: new Date() } });
    const tokens = generateTokens(user.id, user.email, user.role);
    await database_1.prisma.refreshToken.create({ data: { token: tokens.refreshToken, userId: user.id, expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) } });
    (0, response_1.success)(res, { user: { id: user.id, email: user.email, role: user.role }, tokens });
}));
router.post('/vendor/login', rateLimiter_1.authLimiter, (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { vendorId, pin } = req.body;
    const vendor = await database_1.prisma.vendor.findUnique({ where: { vendorId }, include: { user: true } });
    if (!vendor)
        throw new errors_1.UnauthorizedError('Invalid vendor ID');
    if (vendor.status !== 'active')
        throw new errors_1.UnauthorizedError('Vendor account inactive');
    const valid = await bcryptjs_1.default.compare(pin, vendor.user.passwordHash);
    if (!valid)
        throw new errors_1.UnauthorizedError('Invalid PIN');
    await database_1.prisma.user.update({ where: { id: vendor.userId }, data: { lastLogin: new Date() } });
    const tokens = generateTokens(vendor.user.id, vendor.user.email, vendor.user.role);
    await database_1.prisma.refreshToken.create({ data: { token: tokens.refreshToken, userId: vendor.user.id, expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) } });
    (0, response_1.success)(res, { vendor: { id: vendor.id, vendorId: vendor.vendorId, name: vendor.name, tokenBalance: vendor.tokenBalance }, tokens });
}));
router.post('/school/login', rateLimiter_1.authLimiter, (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { schoolCode, boardType, adminId, password } = req.body;
    const school = await database_1.prisma.school.findFirst({ where: { code: schoolCode, boardType } });
    if (!school)
        throw new errors_1.UnauthorizedError('Invalid school');
    const admin = await database_1.prisma.schoolAdmin.findFirst({ where: { id: adminId, schoolId: school.id }, include: { user: true } });
    if (!admin)
        throw new errors_1.UnauthorizedError('Invalid admin');
    const valid = await bcryptjs_1.default.compare(password, admin.user.passwordHash);
    if (!valid)
        throw new errors_1.UnauthorizedError('Invalid password');
    await database_1.prisma.user.update({ where: { id: admin.user.id }, data: { lastLogin: new Date() } });
    const tokens = generateTokens(admin.user.id, admin.user.email, admin.user.role);
    await database_1.prisma.refreshToken.create({ data: { token: tokens.refreshToken, userId: admin.user.id, expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) } });
    (0, response_1.success)(res, { school: { id: school.id, name: school.name, code: school.code, boardType: school.boardType }, admin: { id: admin.id, position: admin.position }, tokens });
}));
router.post('/refresh', (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { refreshToken } = req.body;
    if (!refreshToken)
        throw new errors_1.BadRequestError('Refresh token required');
    const decoded = jsonwebtoken_1.default.verify(refreshToken, env_1.env.JWT_REFRESH_SECRET);
    const tokenRecord = await database_1.prisma.refreshToken.findUnique({ where: { token: refreshToken } });
    if (!tokenRecord || tokenRecord.expiresAt < new Date())
        throw new errors_1.UnauthorizedError('Invalid or expired refresh token');
    const user = await database_1.prisma.user.findUnique({ where: { id: decoded.userId } });
    if (!user)
        throw new errors_1.UnauthorizedError('User not found');
    const accessToken = jsonwebtoken_1.default.sign({ userId: user.id, email: user.email, role: user.role }, env_1.env.JWT_SECRET, { expiresIn: env_1.env.JWT_ACCESS_EXPIRY });
    (0, response_1.success)(res, { accessToken });
}));
router.post('/logout', (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { refreshToken } = req.body;
    if (refreshToken)
        await database_1.prisma.refreshToken.deleteMany({ where: { token: refreshToken } });
    (0, response_1.success)(res, null, 'Logged out successfully');
}));
exports.default = router;
//# sourceMappingURL=auth.routes.js.map