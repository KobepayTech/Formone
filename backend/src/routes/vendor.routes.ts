import { Router } from 'express';
import { prisma } from '../config/database';
import { asyncHandler } from '../utils/asyncHandler';
import { success, created } from '../utils/response';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';
import { paymentLimiter } from '../middleware/rateLimiter';
import { generateTicketQR } from '../services/qr';
import { emitToUser, emitToSchool } from '../services/socket';
import { logAudit } from '../services/audit';
import { sendPaymentConfirmationEmail } from '../services/email';
import { NotFoundError, BadRequestError } from '../utils/errors';
import { validate } from '../middleware/validate';
import { confirmPaymentSchema } from '../validators/schemas';

const router = Router();
router.use(authenticate, authorize('vendor'));

router.get('/dashboard', asyncHandler(async (req: AuthRequest, res) => {
  const vendor = await prisma.vendor.findUnique({ where: { userId: req.user!.id as string } });
  if (!vendor) throw new NotFoundError('Vendor not found');
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const [todayCollections, pendingCount, ticketsToday] = await Promise.all([
    prisma.transaction.aggregate({ where: { vendorId: vendor.id, createdAt: { gte: today } }, _sum: { totalAmount: true }, _count: true }),
    prisma.application.count({ where: { assignedVendorId: vendor.id, status: 'payment_pending' } }),
    prisma.interviewTicket.count({ where: { printedByVendor: true, printedAt: { gte: today } } }),
  ]);
  success(res, { todayCollections: todayCollections._sum.totalAmount || 0, todayCount: todayCollections._count, pendingCount, ticketsToday, tokenBalance: vendor.tokenBalance });
}));

router.get('/queue', asyncHandler(async (req: AuthRequest, res) => {
  const vendor = await prisma.vendor.findUnique({ where: { userId: req.user!.id as string } });
  if (!vendor) throw new NotFoundError('Vendor not found');
  const apps = await prisma.application.findMany({
    where: { assignedVendorId: vendor.id, status: 'payment_pending', paymentStatus: 'pending' },
    include: { studentProfile: { select: { firstName: true, lastName: true, universalStudentId: true, parentName: true, parentPhone: true } }, school: { select: { name: true, city: true } } },
    orderBy: { createdAt: 'desc' },
  });
  success(res, apps);
}));

router.post('/confirm-payment', paymentLimiter, validate(confirmPaymentSchema), asyncHandler(async (req: AuthRequest, res) => {
  const { applicationId, amountTendered, paymentMethod, notes } = req.body;
  const vendor = await prisma.vendor.findUnique({ where: { userId: req.user!.id as string } });
  if (!vendor) throw new NotFoundError('Vendor not found');

  const result = await prisma.$transaction(async (tx) => {
    const app = await tx.application.findFirst({ where: { id: applicationId, assignedVendorId: vendor.id } });
    if (!app) throw new NotFoundError('Application not found');
    if (app.paymentStatus === 'completed') throw new BadRequestError('Payment already confirmed');
    if (vendor.tokenBalance < 10) throw new BadRequestError('Insufficient tokens. Minimum 10 tokens required.');
    if (amountTendered < app.totalAmount) throw new BadRequestError('Amount tendered is less than the total due');

    const studentProfile = await tx.studentProfile.findUnique({ where: { id: app.studentProfileId }, select: { userId: true } });
    if (!studentProfile) throw new NotFoundError('Student profile not found');
    const parentUserId = studentProfile.userId;

    const updatedApp = await tx.application.update({
      where: { id: app.id },
      data: { status: 'paid', paymentStatus: 'completed', vendorPaymentConfirmed: true, vendorConfirmedAt: new Date(), paymentMethod, cashTendered: amountTendered, changeReturned: amountTendered - app.totalAmount, vendorNotes: notes },
    });

    await tx.vendor.update({ where: { id: vendor.id }, data: { tokenBalance: { decrement: 10 }, totalCollections: { increment: 1 } } });

    const platformCommission = Math.round(app.totalAmount * vendor.commissionRate);
    const schoolRevenue = app.totalAmount - platformCommission;

    await tx.transaction.create({
      data: { transactionId: `TXN-${Date.now()}`, applicationId: app.id, schoolId: app.schoolId, baseAmount: app.baseAmount, discountApplied: app.discountAmount, taxAmount: app.taxAmount, totalAmount: app.totalAmount, platformCommission, schoolRevenue, paymentMethod, paymentStatus: 'completed', vendorId: vendor.id, processedBy: req.user!.id },
    });

    const school = await tx.school.findUnique({ where: { id: app.schoolId } });
    const interviewDate = new Date(); interviewDate.setDate(interviewDate.getDate() + 7);
    const ticketNumber = `TKT-${school?.code || 'SCH'}-${Date.now()}`;
    const qrCode = await generateTicketQR(ticketNumber, school?.code || 'SCH');

    const ticket = await tx.interviewTicket.create({
      data: { ticketNumber, applicationId: app.id, studentProfileId: app.studentProfileId, schoolId: app.schoolId, interviewDate, interviewTime: '10:00', venue: school?.address || 'TBD', instructions: 'Please arrive 30 minutes before your scheduled time.', ticketQrCode: qrCode },
    });

    await tx.notification.create({ data: { userId: parentUserId, type: 'payment_confirmed', title: 'Payment Confirmed', message: `Payment of ${app.totalAmount} TZS confirmed. Interview ticket generated.`, data: { applicationId: app.id, amount: app.totalAmount } } });
    await tx.notification.create({ data: { userId: parentUserId, type: 'ticket_generated', title: 'Interview Ticket Ready', message: `Your interview at ${school?.name} is scheduled for ${interviewDate.toDateString()}.`, data: { ticketId: ticket.id, schoolName: school?.name } } });

    return { application: updatedApp, ticket, change: amountTendered - app.totalAmount, schoolName: school?.name, parentUserId };
  });

  emitToUser(result.parentUserId, 'payment_confirmed', { applicationId, amount: result.application.totalAmount });
  emitToSchool(result.application.schoolId, 'new_paid_application', { applicationId, studentProfileId: result.application.studentProfileId });
  logAudit(req.user!.id, 'PAYMENT_CONFIRMED', 'application', applicationId, { amount: result.application.totalAmount, change: result.change });

  success(res, { application: result.application, ticket: result.ticket, change: result.change, message: `Payment confirmed. Change: ${result.change} TZS` });
}));

router.get('/tickets', asyncHandler(async (req: AuthRequest, res) => {
  const vendor = await prisma.vendor.findUnique({ where: { userId: req.user!.id as string } });
  if (!vendor) throw new NotFoundError('Vendor not found');
  const { status } = req.query;
  const apps = await prisma.application.findMany({ where: { assignedVendorId: vendor.id, paymentStatus: 'completed' }, select: { id: true } });
  const appIds = apps.map(a => a.id);
  const tickets = await prisma.interviewTicket.findMany({
    where: { applicationId: { in: appIds }, ...(status ? { status: status as any } : {}) } as any,
    include: { school: { select: { name: true } }, studentProfile: { select: { firstName: true, lastName: true } } },
    orderBy: { interviewDate: 'desc' },
  });
  success(res, tickets);
}));

router.post('/tickets/:id/print', asyncHandler(async (req: AuthRequest, res) => {
  const ticket = await prisma.interviewTicket.update({
    where: { id: req.params.id as string },
    data: { printedByVendor: true, printedAt: new Date(), printCount: { increment: 1 } },
  });
  logAudit(req.user!.id, 'TICKET_PRINTED', 'interview_ticket', ticket.id);
  success(res, ticket, 'Ticket printed');
}));

router.get('/settlements', asyncHandler(async (req: AuthRequest, res) => {
  const vendor = await prisma.vendor.findUnique({ where: { userId: req.user!.id as string } });
  if (!vendor) throw new NotFoundError('Vendor not found');
  const settlements = await prisma.vendorSettlement.findMany({ where: { vendorId: vendor.id }, orderBy: { createdAt: 'desc' } });
  success(res, settlements);
}));

router.get('/history', asyncHandler(async (req: AuthRequest, res) => {
  const vendor = await prisma.vendor.findUnique({ where: { userId: req.user!.id as string } });
  if (!vendor) throw new NotFoundError('Vendor not found');
  const { page = '1', limit = '20' } = req.query;
  const [transactions, total] = await Promise.all([
    prisma.transaction.findMany({ where: { vendorId: vendor.id }, include: { school: { select: { name: true } } }, orderBy: { createdAt: 'desc' }, skip: (parseInt(page as string) - 1) * parseInt(limit as string), take: parseInt(limit as string) }),
    prisma.transaction.count({ where: { vendorId: vendor.id } }),
  ]);
  success(res, transactions, undefined, { page: parseInt(page as string), limit: parseInt(limit as string), total, totalPages: Math.ceil(total / parseInt(limit as string)) });
}));

export default router;
