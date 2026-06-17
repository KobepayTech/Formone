import { Router } from 'express';
import { prisma } from '../config/database';
import { asyncHandler } from '../utils/asyncHandler';
import { success, created } from '../utils/response';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';
import { generateTicketQR } from '../services/qr';
import { emitToUser } from '../services/socket';
import { logAudit } from '../services/audit';
import { NotFoundError } from '../utils/errors';

const router = Router();
router.use(authenticate, authorize('school_admin'));

router.get('/applicants', asyncHandler(async (req: AuthRequest, res) => {
  const admin = await prisma.schoolAdmin.findUnique({ where: { userId: req.user!.id as string } });
  if (!admin) throw new NotFoundError('School admin not found');
  const { status, formType, paymentStatus, search, page = '1', limit = '20' } = req.query as Record<string, string>;
  const where: any = { schoolId: admin.schoolId };
  if (status) where.status = status as string;
  if (formType) where.formType = formType as any;
  if (paymentStatus) where.paymentStatus = paymentStatus as any;
  if (search) where.studentProfile = { OR: [{ firstName: { contains: search as string, mode: 'insensitive' } }, { lastName: { contains: search as string, mode: 'insensitive' } }, { universalStudentId: { contains: search as string } }] };

  const [applications, total] = await Promise.all([
    prisma.application.findMany({ where, include: { studentProfile: { select: { firstName: true, lastName: true, universalStudentId: true, parentPhone: true, parentEmail: true } }, vendor: { select: { name: true, vendorId: true } }, formCatalog: { select: { formName: true } }, _count: { select: { tickets: true } } }, orderBy: { createdAt: 'desc' }, skip: (parseInt(page as string) - 1) * parseInt(limit as string), take: parseInt(limit as string) }),
    prisma.application.count({ where }),
  ]);
  success(res, applications, undefined, { page: parseInt(page as string), limit: parseInt(limit as string), total, totalPages: Math.ceil(total / parseInt(limit as string)) });
}));

router.get('/applicants/:id', asyncHandler(async (req: AuthRequest, res) => {
  const admin = await prisma.schoolAdmin.findUnique({ where: { userId: req.user!.id as string } });
  if (!admin) throw new NotFoundError('School admin not found');
  const app = await prisma.application.findFirst({
    where: { id: req.params.id as string, schoolId: admin.schoolId },
    include: { studentProfile: true, transactions: true, tickets: true, vendor: { select: { name: true } }, formCatalog: true },
  });
  if (!app) throw new NotFoundError('Application not found');
  success(res, app);
}));

router.post('/schedule-interview', asyncHandler(async (req: AuthRequest, res) => {
  const admin = await prisma.schoolAdmin.findUnique({ where: { userId: req.user!.id as string }, include: { school: true } });
  if (!admin) throw new NotFoundError('School admin not found');
  const { applicationId, interviewDate, interviewTime, venue, room, instructions } = req.body;

  const app = await prisma.application.findFirst({ where: { id: applicationId, schoolId: admin.schoolId }, include: { studentProfile: { select: { userId: true } } } });
  if (!app) throw new NotFoundError('Application not found');
  const parentUserId = app.studentProfile.userId;

  const ticketNumber = `TKT-${admin.school.code}-${Date.now()}`;
  const qrCode = await generateTicketQR(ticketNumber, admin.school.code);

  const result = await prisma.$transaction(async (tx) => {
    const ticket = await tx.interviewTicket.create({
      data: { ticketNumber, applicationId: app.id, studentProfileId: app.studentProfileId, schoolId: admin.schoolId, interviewDate: new Date(interviewDate), interviewTime, venue, room, instructions, ticketQrCode: qrCode },
    });
    await tx.application.update({ where: { id: app.id }, data: { status: 'interview_scheduled' } });
    await tx.notification.create({ data: { userId: parentUserId, type: 'interview_scheduled', title: 'Interview Scheduled', message: `Your interview at ${admin.school.name} is on ${new Date(interviewDate).toDateString()} at ${interviewTime}.`, data: { ticketId: ticket.id, venue } } });
    return ticket;
  });

  emitToUser(parentUserId, 'interview_scheduled', { ticketId: result.id, schoolName: admin.school.name, date: interviewDate, time: interviewTime });
  logAudit(req.user!.id, 'INTERVIEW_SCHEDULED', 'interview_ticket', result.id, { applicationId, interviewDate, interviewTime });
  created(res, result, 'Interview scheduled successfully');
}));

router.put('/interviews/:id/attendance', asyncHandler(async (req: AuthRequest, res) => {
  const admin = await prisma.schoolAdmin.findUnique({ where: { userId: req.user!.id as string } });
  if (!admin) throw new NotFoundError('School admin not found');
  const { status } = req.body;
  const ticket = await prisma.interviewTicket.updateMany({
    where: { id: req.params.id as string, schoolId: admin.schoolId },
    data: { status },
  });
  logAudit(req.user!.id, 'ATTENDANCE_UPDATED', 'interview_ticket', req.params.id as string, { status });
  success(res, ticket, 'Attendance updated');
}));

router.get('/interviews', asyncHandler(async (req: AuthRequest, res) => {
  const admin = await prisma.schoolAdmin.findUnique({ where: { userId: req.user!.id as string } });
  if (!admin) throw new NotFoundError('School admin not found');
  const { status, fromDate, toDate } = req.query as Record<string, string>;
  const where: any = { schoolId: admin.schoolId };
  if (status) where.status = status as string;
  if (fromDate || toDate) where.interviewDate = {};
  if (fromDate) where.interviewDate.gte = new Date(fromDate as string);
  if (toDate) where.interviewDate.lte = new Date(toDate as string);

  const tickets = await prisma.interviewTicket.findMany({
    where, include: { studentProfile: { select: { firstName: true, lastName: true } }, application: { select: { formType: true } } },
    orderBy: { interviewDate: 'desc' },
  });
  success(res, tickets);
}));

router.get('/revenue', asyncHandler(async (req: AuthRequest, res) => {
  const admin = await prisma.schoolAdmin.findUnique({ where: { userId: req.user!.id as string } });
  if (!admin) throw new NotFoundError('School admin not found');
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const weekAgo = new Date(today); weekAgo.setDate(weekAgo.getDate() - 7);
  const monthAgo = new Date(today); monthAgo.setMonth(monthAgo.getMonth() - 1);

  const [todayRevenue, weekRevenue, monthRevenue, todayForms, weekForms, monthForms] = await Promise.all([
    prisma.transaction.aggregate({ where: { schoolId: admin.schoolId, createdAt: { gte: today } }, _sum: { totalAmount: true } }),
    prisma.transaction.aggregate({ where: { schoolId: admin.schoolId, createdAt: { gte: weekAgo } }, _sum: { totalAmount: true } }),
    prisma.transaction.aggregate({ where: { schoolId: admin.schoolId, createdAt: { gte: monthAgo } }, _sum: { totalAmount: true } }),
    prisma.transaction.count({ where: { schoolId: admin.schoolId, createdAt: { gte: today } } }),
    prisma.transaction.count({ where: { schoolId: admin.schoolId, createdAt: { gte: weekAgo } } }),
    prisma.transaction.count({ where: { schoolId: admin.schoolId, createdAt: { gte: monthAgo } } }),
  ]);

  success(res, { today: { revenue: todayRevenue._sum.totalAmount || 0, forms: todayForms }, thisWeek: { revenue: weekRevenue._sum.totalAmount || 0, forms: weekForms }, thisMonth: { revenue: monthRevenue._sum.totalAmount || 0, forms: monthForms } });
}));

export default router;
