"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const database_1 = require("../config/database");
const asyncHandler_1 = require("../utils/asyncHandler");
const response_1 = require("../utils/response");
const auth_1 = require("../middleware/auth");
const rateLimiter_1 = require("../middleware/rateLimiter");
const qr_1 = require("../services/qr");
const socket_1 = require("../services/socket");
const audit_1 = require("../services/audit");
const errors_1 = require("../utils/errors");
const router = (0, express_1.Router)();
router.use(auth_1.authenticate, (0, auth_1.authorize)('vendor'));
router.get('/dashboard', (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const vendor = await database_1.prisma.vendor.findUnique({ where: { userId: req.user.id } });
    if (!vendor)
        throw new errors_1.NotFoundError('Vendor not found');
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const [todayCollections, pendingCount, ticketsToday] = await Promise.all([
        database_1.prisma.transaction.aggregate({ where: { vendorId: vendor.id, createdAt: { gte: today } }, _sum: { totalAmount: true }, _count: true }),
        database_1.prisma.application.count({ where: { assignedVendorId: vendor.id, status: 'payment_pending' } }),
        database_1.prisma.interviewTicket.count({ where: { printedByVendor: true, printedAt: { gte: today } } }),
    ]);
    (0, response_1.success)(res, { todayCollections: todayCollections._sum.totalAmount || 0, todayCount: todayCollections._count, pendingCount, ticketsToday, tokenBalance: vendor.tokenBalance });
}));
router.get('/queue', (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const vendor = await database_1.prisma.vendor.findUnique({ where: { userId: req.user.id } });
    if (!vendor)
        throw new errors_1.NotFoundError('Vendor not found');
    const apps = await database_1.prisma.application.findMany({
        where: { assignedVendorId: vendor.id, status: 'payment_pending', paymentStatus: 'pending' },
        include: { studentProfile: { select: { firstName: true, lastName: true, universalStudentId: true } }, school: { select: { name: true, city: true } } },
        orderBy: { createdAt: 'desc' },
    });
    (0, response_1.success)(res, apps);
}));
router.post('/confirm-payment', rateLimiter_1.paymentLimiter, (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { applicationId, amountTendered, paymentMethod, notes } = req.body;
    const vendor = await database_1.prisma.vendor.findUnique({ where: { userId: req.user.id } });
    if (!vendor)
        throw new errors_1.NotFoundError('Vendor not found');
    const result = await database_1.prisma.$transaction(async (tx) => {
        const app = await tx.application.findFirst({ where: { id: applicationId, assignedVendorId: vendor.id } });
        if (!app)
            throw new errors_1.NotFoundError('Application not found');
        if (app.paymentStatus === 'completed')
            throw new errors_1.BadRequestError('Payment already confirmed');
        if (vendor.tokenBalance < 10)
            throw new errors_1.BadRequestError('Insufficient tokens. Minimum 10 tokens required.');
        const updatedApp = await tx.application.update({
            where: { id: app.id },
            data: { status: 'paid', paymentStatus: 'completed', vendorPaymentConfirmed: true, vendorConfirmedAt: new Date(), paymentMethod, cashTendered: amountTendered, changeReturned: amountTendered - app.totalAmount, vendorNotes: notes },
        });
        await tx.vendor.update({ where: { id: vendor.id }, data: { tokenBalance: { decrement: 10 }, totalCollections: { increment: 1 } } });
        await tx.transaction.create({
            data: { transactionId: `TXN-${Date.now()}`, applicationId: app.id, schoolId: app.schoolId, baseAmount: app.baseAmount, discountApplied: app.discountAmount, taxAmount: app.taxAmount, totalAmount: app.totalAmount, platformCommission: app.totalAmount * 0.2, schoolRevenue: app.totalAmount * 0.8, paymentMethod, paymentStatus: 'completed', vendorId: vendor.id, processedBy: req.user.id },
        });
        const school = await tx.school.findUnique({ where: { id: app.schoolId } });
        const interviewDate = new Date();
        interviewDate.setDate(interviewDate.getDate() + 7);
        const ticketNumber = `TKT-${school?.code || 'SCH'}-${Date.now()}`;
        const qrCode = await (0, qr_1.generateTicketQR)(ticketNumber, school?.code || 'SCH');
        const ticket = await tx.interviewTicket.create({
            data: { ticketNumber, applicationId: app.id, studentProfileId: app.studentProfileId, schoolId: app.schoolId, interviewDate, interviewTime: '10:00', venue: school?.address || 'TBD', instructions: 'Please arrive 30 minutes before your scheduled time.', ticketQrCode: qrCode },
        });
        await tx.notification.create({ data: { userId: app.studentProfileId, type: 'payment_confirmed', title: 'Payment Confirmed', message: `Payment of ${app.totalAmount} TZS confirmed. Interview ticket generated.`, data: { applicationId: app.id, amount: app.totalAmount } } });
        await tx.notification.create({ data: { userId: app.studentProfileId, type: 'ticket_generated', title: 'Interview Ticket Ready', message: `Your interview at ${school?.name} is scheduled for ${interviewDate.toDateString()}.`, data: { ticketId: ticket.id, schoolName: school?.name } } });
        return { application: updatedApp, ticket, change: amountTendered - app.totalAmount, schoolName: school?.name };
    });
    (0, socket_1.emitToUser)(result.application.studentProfileId, 'payment_confirmed', { applicationId, amount: result.application.totalAmount });
    (0, socket_1.emitToSchool)(result.application.schoolId, 'new_paid_application', { applicationId, studentProfileId: result.application.studentProfileId });
    (0, audit_1.logAudit)(req.user.id, 'PAYMENT_CONFIRMED', 'application', applicationId, { amount: result.application.totalAmount, change: result.change });
    (0, response_1.success)(res, { application: result.application, ticket: result.ticket, change: result.change, message: `Payment confirmed. Change: ${result.change} TZS` });
}));
router.get('/tickets', (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const vendor = await database_1.prisma.vendor.findUnique({ where: { userId: req.user.id } });
    if (!vendor)
        throw new errors_1.NotFoundError('Vendor not found');
    const { status } = req.query;
    const apps = await database_1.prisma.application.findMany({ where: { assignedVendorId: vendor.id, paymentStatus: 'completed' }, select: { id: true } });
    const appIds = apps.map(a => a.id);
    const tickets = await database_1.prisma.interviewTicket.findMany({
        where: { applicationId: { in: appIds }, ...(status ? { status: status } : {}) },
        include: { school: { select: { name: true } }, studentProfile: { select: { firstName: true, lastName: true } } },
        orderBy: { interviewDate: 'desc' },
    });
    (0, response_1.success)(res, tickets);
}));
router.post('/tickets/:id/print', (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const ticket = await database_1.prisma.interviewTicket.update({
        where: { id: req.params.id },
        data: { printedByVendor: true, printedAt: new Date(), printCount: { increment: 1 } },
    });
    (0, audit_1.logAudit)(req.user.id, 'TICKET_PRINTED', 'interview_ticket', ticket.id);
    (0, response_1.success)(res, ticket, 'Ticket printed');
}));
router.get('/settlements', (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const vendor = await database_1.prisma.vendor.findUnique({ where: { userId: req.user.id } });
    if (!vendor)
        throw new errors_1.NotFoundError('Vendor not found');
    const settlements = await database_1.prisma.vendorSettlement.findMany({ where: { vendorId: vendor.id }, orderBy: { createdAt: 'desc' } });
    (0, response_1.success)(res, settlements);
}));
router.get('/history', (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const vendor = await database_1.prisma.vendor.findUnique({ where: { userId: req.user.id } });
    if (!vendor)
        throw new errors_1.NotFoundError('Vendor not found');
    const { page = '1', limit = '20' } = req.query;
    const [transactions, total] = await Promise.all([
        database_1.prisma.transaction.findMany({ where: { vendorId: vendor.id }, include: { school: { select: { name: true } } }, orderBy: { createdAt: 'desc' }, skip: (parseInt(page) - 1) * parseInt(limit), take: parseInt(limit) }),
        database_1.prisma.transaction.count({ where: { vendorId: vendor.id } }),
    ]);
    (0, response_1.success)(res, transactions, undefined, { page: parseInt(page), limit: parseInt(limit), total, totalPages: Math.ceil(total / parseInt(limit)) });
}));
exports.default = router;
//# sourceMappingURL=vendor.routes.js.map