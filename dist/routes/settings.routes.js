"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const database_1 = require("../config/database");
const asyncHandler_1 = require("../utils/asyncHandler");
const response_1 = require("../utils/response");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.use(auth_1.authenticate, (0, auth_1.authorize)('platform_admin'));
router.get('/', (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const [academicYears, gradingScales, emergencyProtocols] = await Promise.all([
        database_1.prisma.academicYear.findMany({ orderBy: { createdAt: 'desc' } }),
        database_1.prisma.gradingScale.findMany({ where: { isActive: true }, orderBy: { order: 'asc' } }),
        database_1.prisma.emergencyProtocol.findMany({ orderBy: { createdAt: 'desc' } }),
    ]);
    (0, response_1.success)(res, { academicYears, gradingScales, emergencyProtocols });
}));
router.get('/academic-year', (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const year = await database_1.prisma.academicYear.findFirst({ where: { isActive: true } });
    (0, response_1.success)(res, year);
}));
router.put('/academic-year', (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { id, year, startDate, endDate, isActive, terms } = req.body;
    const data = { year, startDate: new Date(startDate), endDate: new Date(endDate), isActive, terms };
    const result = await database_1.prisma.$transaction(async (tx) => {
        if (isActive)
            await tx.academicYear.updateMany({ where: { isActive: true }, data: { isActive: false } });
        if (id)
            return tx.academicYear.update({ where: { id }, data });
        return tx.academicYear.create({ data });
    });
    (0, response_1.success)(res, result, 'Academic year saved');
}));
router.get('/grading-scale', (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const scales = await database_1.prisma.gradingScale.findMany({ where: { isActive: true }, orderBy: { order: 'asc' } });
    (0, response_1.success)(res, scales);
}));
router.put('/grading-scale', (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { scales } = req.body;
    await database_1.prisma.$transaction(scales.map((s) => database_1.prisma.gradingScale.upsert({
        where: { id: s.id || '' },
        update: { ...s },
        create: { grade: s.grade, minMarks: s.minMarks, maxMarks: s.maxMarks, description: s.description, color: s.color, points: s.points, isActive: true, order: s.order },
    })));
    (0, response_1.success)(res, null, 'Grading scales updated');
}));
router.get('/roles', (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const matrix = {
        platform_admin: ['view_analytics', 'manage_schools', 'manage_vendors', 'manage_forms', 'view_applications', 'manage_interviews', 'manage_settings', 'view_revenue', 'process_settlements', 'manage_users', 'view_audit_logs', 'send_notifications', 'approve_documents', 'configure_pricing', 'activate_emergency'],
        school_admin: ['view_applications', 'manage_interviews', 'view_revenue', 'view_analytics'],
        vendor: ['process_payments', 'print_tickets', 'view_history'],
        parent: ['view_profile', 'manage_documents', 'submit_applications', 'view_tickets', 'view_notifications'],
    };
    (0, response_1.success)(res, matrix);
}));
router.put('/roles', (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { role, permissions } = req.body;
    (0, response_1.success)(res, { role: role, permissions: permissions }, 'Role permissions updated (stored in memory for this session)');
}));
router.get('/emergency-protocols', (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const protocols = await database_1.prisma.emergencyProtocol.findMany({ orderBy: { createdAt: 'desc' } });
    (0, response_1.success)(res, protocols);
}));
router.put('/emergency-protocols/:id', (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { isActive } = req.body;
    const result = await database_1.prisma.$transaction(async (tx) => {
        if (isActive) {
            const protocol = await tx.emergencyProtocol.findUnique({ where: { id: req.params.id } });
            if (protocol)
                await tx.emergencyProtocol.updateMany({ where: { type: protocol.type, isActive: true }, data: { isActive: false, deactivatedAt: new Date() } });
        }
        return tx.emergencyProtocol.update({
            where: { id: req.params.id },
            data: { isActive, activatedAt: isActive ? new Date() : null, deactivatedAt: isActive ? null : new Date() },
        });
    });
    (0, response_1.success)(res, result, `Emergency protocol ${isActive ? 'activated' : 'deactivated'}`);
}));
exports.default = router;
//# sourceMappingURL=settings.routes.js.map