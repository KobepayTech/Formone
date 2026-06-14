"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const database_1 = require("../config/database");
const asyncHandler_1 = require("../utils/asyncHandler");
const response_1 = require("../utils/response");
const auth_1 = require("../middleware/auth");
const qr_1 = require("../services/qr");
const socket_1 = require("../services/socket");
const audit_1 = require("../services/audit");
const errors_1 = require("../utils/errors");
const router = (0, express_1.Router)();
router.use(auth_1.authenticate, (0, auth_1.authorize)('school_admin'));
router.get('/applicants', (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const admin = await database_1.prisma.schoolAdmin.findUnique({ where: { userId: req.user.id } });
    if (!admin)
        throw new errors_1.NotFoundError('School admin not found');
    const { status, formType, paymentStatus, search, page = '1', limit = '20' } = req.query;
    const where = { schoolId: admin.schoolId };
    if (status)
        where.status = status;
    if (formType)
        where.formType = formType;
    if (paymentStatus)
        where.paymentStatus = paymentStatus;
    if (search)
        where.studentProfile = { OR: [{ firstName: { contains: search, mode: 'insensitive' } }, { lastName: { contains: search, mode: 'insensitive' } }, { universalStudentId: { contains: search } }] };
    const [applications, total] = await Promise.all([
        database_1.prisma.application.findMany({ where, include: { studentProfile: { select: { firstName: true, lastName: true, universalStudentId: true, parentPhone: true, parentEmail: true } }, vendor: { select: { name: true, vendorId: true } }, formCatalog: { select: { formName: true } }, _count: { select: { tickets: true } } }, orderBy: { createdAt: 'desc' }, skip: (parseInt(page) - 1) * parseInt(limit), take: parseInt(limit) }),
        database_1.prisma.application.count({ where }),
    ]);
    (0, response_1.success)(res, applications, undefined, { page: parseInt(page), limit: parseInt(limit), total, totalPages: Math.ceil(total / parseInt(limit)) });
}));
router.get('/applicants/:id', (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const admin = await database_1.prisma.schoolAdmin.findUnique({ where: { userId: req.user.id } });
    if (!admin)
        throw new errors_1.NotFoundError('School admin not found');
    const app = await database_1.prisma.application.findFirst({
        where: { id: req.params.id, schoolId: admin.schoolId },
        include: { studentProfile: true, transactions: true, tickets: true, vendor: { select: { name: true } }, formCatalog: true },
    });
    if (!app)
        throw new errors_1.NotFoundError('Application not found');
    (0, response_1.success)(res, app);
}));
router.post('/schedule-interview', (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const admin = await database_1.prisma.schoolAdmin.findUnique({ where: { userId: req.user.id }, include: { school: true } });
    if (!admin)
        throw new errors_1.NotFoundError('School admin not found');
    const { applicationId, interviewDate, interviewTime, venue, room, instructions } = req.body;
    const app = await database_1.prisma.application.findFirst({ where: { id: applicationId, schoolId: admin.schoolId } });
    if (!app)
        throw new errors_1.NotFoundError('Application not found');
    const ticketNumber = `TKT-${admin.school.code}-${Date.now()}`;
    const qrCode = await (0, qr_1.generateTicketQR)(ticketNumber, admin.school.code);
    const result = await database_1.prisma.$transaction(async (tx) => {
        const ticket = await tx.interviewTicket.create({
            data: { ticketNumber, applicationId: app.id, studentProfileId: app.studentProfileId, schoolId: admin.schoolId, interviewDate: new Date(interviewDate), interviewTime, venue, room, instructions, ticketQrCode: qrCode },
        });
        await tx.application.update({ where: { id: app.id }, data: { status: 'interview_scheduled' } });
        await tx.notification.create({ data: { userId: app.studentProfileId, type: 'interview_scheduled', title: 'Interview Scheduled', message: `Your interview at ${admin.school.name} is on ${new Date(interviewDate).toDateString()} at ${interviewTime}.`, data: { ticketId: ticket.id, venue } } });
        return ticket;
    });
    (0, socket_1.emitToUser)(app.studentProfileId, 'interview_scheduled', { ticketId: result.id, schoolName: admin.school.name, date: interviewDate, time: interviewTime });
    (0, audit_1.logAudit)(req.user.id, 'INTERVIEW_SCHEDULED', 'interview_ticket', result.id, { applicationId, interviewDate, interviewTime });
    (0, response_1.created)(res, result, 'Interview scheduled successfully');
}));
router.put('/interviews/:id/attendance', (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const admin = await database_1.prisma.schoolAdmin.findUnique({ where: { userId: req.user.id } });
    if (!admin)
        throw new errors_1.NotFoundError('School admin not found');
    const { status } = req.body;
    const ticket = await database_1.prisma.interviewTicket.updateMany({
        where: { id: req.params.id, schoolId: admin.schoolId },
        data: { status },
    });
    (0, audit_1.logAudit)(req.user.id, 'ATTENDANCE_UPDATED', 'interview_ticket', req.params.id, { status });
    (0, response_1.success)(res, ticket, 'Attendance updated');
}));
router.get('/interviews', (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const admin = await database_1.prisma.schoolAdmin.findUnique({ where: { userId: req.user.id } });
    if (!admin)
        throw new errors_1.NotFoundError('School admin not found');
    const { status, fromDate, toDate } = req.query;
    const where = { schoolId: admin.schoolId };
    if (status)
        where.status = status;
    if (fromDate || toDate)
        where.interviewDate = {};
    if (fromDate)
        where.interviewDate.gte = new Date(fromDate);
    if (toDate)
        where.interviewDate.lte = new Date(toDate);
    const tickets = await database_1.prisma.interviewTicket.findMany({
        where, include: { studentProfile: { select: { firstName: true, lastName: true } }, application: { select: { formType: true } } },
        orderBy: { interviewDate: 'desc' },
    });
    (0, response_1.success)(res, tickets);
}));
router.get('/revenue', (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const admin = await database_1.prisma.schoolAdmin.findUnique({ where: { userId: req.user.id } });
    if (!admin)
        throw new errors_1.NotFoundError('School admin not found');
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);
    const monthAgo = new Date(today);
    monthAgo.setMonth(monthAgo.getMonth() - 1);
    const [todayRevenue, weekRevenue, monthRevenue, todayForms, weekForms, monthForms] = await Promise.all([
        database_1.prisma.transaction.aggregate({ where: { schoolId: admin.schoolId, createdAt: { gte: today } }, _sum: { totalAmount: true } }),
        database_1.prisma.transaction.aggregate({ where: { schoolId: admin.schoolId, createdAt: { gte: weekAgo } }, _sum: { totalAmount: true } }),
        database_1.prisma.transaction.aggregate({ where: { schoolId: admin.schoolId, createdAt: { gte: monthAgo } }, _sum: { totalAmount: true } }),
        database_1.prisma.transaction.count({ where: { schoolId: admin.schoolId, createdAt: { gte: today } } }),
        database_1.prisma.transaction.count({ where: { schoolId: admin.schoolId, createdAt: { gte: weekAgo } } }),
        database_1.prisma.transaction.count({ where: { schoolId: admin.schoolId, createdAt: { gte: monthAgo } } }),
    ]);
    (0, response_1.success)(res, { today: { revenue: todayRevenue._sum.totalAmount || 0, forms: todayForms }, thisWeek: { revenue: weekRevenue._sum.totalAmount || 0, forms: weekForms }, thisMonth: { revenue: monthRevenue._sum.totalAmount || 0, forms: monthForms } });
}));
exports.default = router;
//# sourceMappingURL=school.routes.js.map