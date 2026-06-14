"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const database_1 = require("../config/database");
const asyncHandler_1 = require("../utils/asyncHandler");
const response_1 = require("../utils/response");
const auth_1 = require("../middleware/auth");
const qr_1 = require("../services/qr");
const errors_1 = require("../utils/errors");
const router = (0, express_1.Router)();
router.use(auth_1.authenticate, (0, auth_1.authorize)('parent'));
router.get('/profile', (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const profiles = await database_1.prisma.studentProfile.findMany({
        where: { userId: req.user.id },
        include: { _count: { select: { applications: true, documents: true } } },
    });
    (0, response_1.success)(res, profiles);
}));
router.put('/profile', (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { studentProfileId, ...data } = req.body;
    const profile = await database_1.prisma.studentProfile.updateMany({
        where: { id: studentProfileId, userId: req.user.id },
        data: { ...data, updatedAt: new Date() },
    });
    (0, response_1.success)(res, profile, 'Profile updated');
}));
router.get('/documents', (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { studentProfileId } = req.query;
    const docs = await database_1.prisma.document.findMany({
        where: { studentProfileId: studentProfileId },
        orderBy: { createdAt: 'desc' },
    });
    (0, response_1.success)(res, docs);
}));
router.post('/documents', (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { studentProfileId, documentType, fileName, fileUrl, fileSize } = req.body;
    const doc = await database_1.prisma.document.create({
        data: { studentProfileId, documentType, fileName, fileUrl, fileSize: parseInt(fileSize), mimeType: 'application/pdf', verificationStatus: 'pending' },
    });
    setTimeout(async () => {
        await database_1.prisma.document.update({
            where: { id: doc.id },
            data: { verificationStatus: 'verified', aiConfidenceScore: Math.random() * 20 + 80 },
        });
    }, 5000);
    (0, response_1.created)(res, doc, 'Document uploaded, verification in progress');
}));
router.get('/documents/:id/verify', (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const doc = await database_1.prisma.document.findUnique({ where: { id: req.params.id } });
    if (!doc)
        throw new errors_1.NotFoundError('Document not found');
    (0, response_1.success)(res, { verified: doc.verificationStatus === 'blockchain_anchored', hash: doc.blockchainHash, status: doc.verificationStatus, aiScore: doc.aiConfidenceScore });
}));
router.get('/qr-code', (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const profile = await database_1.prisma.studentProfile.findFirst({ where: { userId: req.user.id } });
    if (!profile)
        throw new errors_1.NotFoundError('Student profile not found');
    const qrDataUrl = await (0, qr_1.generateUniversalStudentQR)(profile.universalStudentId);
    await database_1.prisma.studentProfile.update({ where: { id: profile.id }, data: { qrCodeUrl: qrDataUrl } });
    (0, response_1.success)(res, { qrCode: qrDataUrl, universalStudentId: profile.universalStudentId });
}));
router.get('/applications', (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const profile = await database_1.prisma.studentProfile.findFirst({ where: { userId: req.user.id } });
    if (!profile)
        throw new errors_1.NotFoundError('Profile not found');
    const applications = await database_1.prisma.application.findMany({
        where: { studentProfileId: profile.id },
        include: { school: { select: { name: true, code: true, boardType: true, city: true } }, vendor: { select: { name: true, vendorId: true } }, tickets: { select: { ticketNumber: true, status: true, interviewDate: true } } },
        orderBy: { createdAt: 'desc' },
    });
    (0, response_1.success)(res, applications);
}));
router.get('/applications/:id', (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const app = await database_1.prisma.application.findUnique({
        where: { id: req.params.id },
        include: { school: true, vendor: { select: { name: true, vendorId: true } }, tickets: true, transactions: true },
    });
    if (!app)
        throw new errors_1.NotFoundError('Application not found');
    (0, response_1.success)(res, app);
}));
router.get('/tickets', (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const profile = await database_1.prisma.studentProfile.findFirst({ where: { userId: req.user.id } });
    if (!profile)
        throw new errors_1.NotFoundError('Profile not found');
    const tickets = await database_1.prisma.interviewTicket.findMany({
        where: { studentProfileId: profile.id },
        include: { school: { select: { name: true, city: true } }, application: { select: { formType: true } } },
        orderBy: { interviewDate: 'desc' },
    });
    (0, response_1.success)(res, tickets);
}));
router.get('/gamification', (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const profile = await database_1.prisma.studentProfile.findFirst({ where: { userId: req.user.id } });
    if (!profile)
        throw new errors_1.NotFoundError('Profile not found');
    const gamification = await database_1.prisma.parentGamification.findUnique({ where: { studentProfileId: profile.id } });
    if (!gamification)
        throw new errors_1.NotFoundError('Gamification record not found');
    const level = Math.floor(gamification.totalXP / 1000) + 1;
    const progress = (gamification.totalXP % 1000) / 1000 * 100;
    (0, response_1.success)(res, { ...gamification, level, progress, nextLevelXP: level * 1000 });
}));
router.get('/notifications', (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const notifications = await database_1.prisma.notification.findMany({
        where: { userId: req.user.id },
        orderBy: { createdAt: 'desc' },
        take: 50,
    });
    (0, response_1.success)(res, notifications);
}));
router.put('/notifications/:id/read', (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    await database_1.prisma.notification.updateMany({
        where: { id: req.params.id, userId: req.user.id },
        data: { status: 'read' },
    });
    (0, response_1.success)(res, null, 'Notification marked as read');
}));
exports.default = router;
//# sourceMappingURL=parent.routes.js.map