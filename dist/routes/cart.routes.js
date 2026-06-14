"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const database_1 = require("../config/database");
const asyncHandler_1 = require("../utils/asyncHandler");
const response_1 = require("../utils/response");
const auth_1 = require("../middleware/auth");
const pricing_1 = require("../services/pricing");
const socket_1 = require("../services/socket");
const audit_1 = require("../services/audit");
const errors_1 = require("../utils/errors");
const router = (0, express_1.Router)();
const carts = new Map();
router.use(auth_1.authenticate);
router.post('/add', (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { schoolId, formCatalogItemId, quantity = 1 } = req.body;
    const form = await database_1.prisma.formCatalogItem.findUnique({ where: { id: formCatalogItemId, isActive: true }, include: { school: true } });
    if (!form)
        throw new errors_1.NotFoundError('Form not available');
    const pricing = await (0, pricing_1.calculatePrice)(formCatalogItemId, quantity);
    const key = req.user.id;
    const items = carts.get(key) || [];
    items.push({ id: `${Date.now()}`, schoolId, formCatalogItemId, quantity, schoolName: form.school.name, formName: form.formName, pricing });
    carts.set(key, items);
    (0, response_1.success)(res, { items, itemCount: items.length });
}));
router.get('/', (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const items = carts.get(req.user.id) || [];
    const total = items.reduce((sum, item) => sum + item.pricing.finalPrice, 0);
    (0, response_1.success)(res, { items, total, count: items.length });
}));
router.delete('/:itemId', (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const key = req.user.id;
    let items = carts.get(key) || [];
    items = items.filter((item) => item.id !== req.params.itemId);
    carts.set(key, items);
    (0, response_1.success)(res, { items, count: items.length });
}));
router.post('/checkout', (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const key = req.user.id;
    const items = carts.get(key) || [];
    if (items.length === 0)
        throw new errors_1.BadRequestError('Cart is empty');
    const profile = await database_1.prisma.studentProfile.findFirst({ where: { userId: key } });
    if (!profile)
        throw new errors_1.NotFoundError('Student profile required');
    const results = await database_1.prisma.$transaction(async (tx) => {
        const applications = [];
        let totalAmount = 0;
        for (const item of items) {
            const form = await tx.formCatalogItem.findUnique({ where: { id: item.formCatalogItemId }, include: { school: true } });
            if (!form)
                continue;
            const pricing = await (0, pricing_1.calculatePrice)(item.formCatalogItemId, item.quantity);
            totalAmount += pricing.finalPrice;
            const vendor = await tx.vendor.findFirst({ where: { city: { contains: form.school.city, mode: 'insensitive' }, status: 'active' }, orderBy: { tokenBalance: 'desc' } });
            const app = await tx.application.create({
                data: {
                    submissionId: `SUB-${Date.now()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
                    studentProfileId: profile.id,
                    schoolId: item.schoolId,
                    formCatalogItemId: item.formCatalogItemId,
                    formType: form.formType,
                    status: 'payment_pending',
                    totalAmount: pricing.finalPrice,
                    baseAmount: pricing.basePrice,
                    surgeAmount: pricing.surgeAmount,
                    discountAmount: pricing.bulkDiscountAmount,
                    taxAmount: pricing.taxAmount,
                    paymentStatus: 'pending',
                    assignedVendorId: vendor?.id || null,
                },
            });
            await tx.notification.create({ data: { userId: key, type: 'application_submitted', title: 'Application Submitted', message: `Your application to ${form.school.name} has been submitted.`, data: { applicationId: app.id, schoolName: form.school.name } } });
            if (vendor) {
                await tx.notification.create({ data: { userId: vendor.userId, type: 'vendor_assigned', title: 'New Application', message: `New payment to collect for ${form.school.name}`, data: { applicationId: app.id } } });
                (0, socket_1.emitToVendor)(vendor.id, 'new_submission', { applicationId: app.id, studentName: `${profile.firstName} ${profile.lastName}`, amount: pricing.finalPrice });
            }
            applications.push(app);
        }
        return { applications, totalAmount };
    });
    carts.delete(key);
    (0, audit_1.logAudit)(key, 'CHECKOUT', 'application', 'batch', { totalApplications: results.applications.length, totalAmount: results.totalAmount });
    (0, response_1.created)(res, { applications: results.applications, totalAmount: results.totalAmount }, 'Checkout successful. Proceed to vendor for payment.');
}));
exports.default = router;
//# sourceMappingURL=cart.routes.js.map