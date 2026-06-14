import { Router } from 'express';
import { prisma } from '../config/database';
import { asyncHandler } from '../utils/asyncHandler';
import { success, created } from '../utils/response';
import { authenticate, AuthRequest } from '../middleware/auth';
import { calculatePrice } from '../services/pricing';
import { generateTicketQR } from '../services/qr';
import { emitToVendor, emitToUser } from '../services/socket';
import { logAudit } from '../services/audit';
import { BadRequestError, NotFoundError } from '../utils/errors';

const router = Router();
const carts: Map<string, any[]> = new Map();

router.use(authenticate);

router.post('/add', asyncHandler(async (req: AuthRequest, res) => {
  const { schoolId, formCatalogItemId, quantity = 1 } = req.body;
  const form = await prisma.formCatalogItem.findUnique({ where: { id: formCatalogItemId, isActive: true }, include: { school: true } });
  if (!form) throw new NotFoundError('Form not available');
  const pricing = await calculatePrice(formCatalogItemId, quantity);
  const key = req.user!.id;
  const items = carts.get(key) || [];
  items.push({ id: `${Date.now()}`, schoolId, formCatalogItemId, quantity, schoolName: form.school.name, formName: form.formName, pricing });
  carts.set(key, items);
  success(res, { items, itemCount: items.length });
}));

router.get('/', asyncHandler(async (req: AuthRequest, res) => {
  const items = carts.get(req.user!.id) || [];
  const total = items.reduce((sum: number, item: any) => sum + item.pricing.finalPrice, 0);
  success(res, { items, total, count: items.length });
}));

router.delete('/:itemId', asyncHandler(async (req: AuthRequest, res) => {
  const key = req.user!.id;
  let items = carts.get(key) || [];
  items = items.filter((item: any) => item.id !== req.params.itemId as string);
  carts.set(key, items);
  success(res, { items, count: items.length });
}));

router.post('/checkout', asyncHandler(async (req: AuthRequest, res) => {
  const key = req.user!.id;
  const items = carts.get(key) || [];
  if (items.length === 0) throw new BadRequestError('Cart is empty');

  const profile = await prisma.studentProfile.findFirst({ where: { userId: key } });
  if (!profile) throw new NotFoundError('Student profile required');

  const results = await prisma.$transaction(async (tx) => {
    const applications = [];
    let totalAmount = 0;
    for (const item of items) {
      const form = await tx.formCatalogItem.findUnique({ where: { id: item.formCatalogItemId }, include: { school: true } });
      if (!form) continue;
      const pricing = await calculatePrice(item.formCatalogItemId, item.quantity);
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
        emitToVendor(vendor.id, 'new_submission', { applicationId: app.id, studentName: `${profile.firstName} ${profile.lastName}`, amount: pricing.finalPrice });
      }
      applications.push(app);
    }
    return { applications, totalAmount };
  });

  carts.delete(key);
  logAudit(key, 'CHECKOUT', 'application', 'batch', { totalApplications: results.applications.length, totalAmount: results.totalAmount });
  created(res, { applications: results.applications, totalAmount: results.totalAmount }, 'Checkout successful. Proceed to vendor for payment.');
}));

export default router;
