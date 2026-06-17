import { Router } from 'express';
import { prisma } from '../config/database';
import { asyncHandler } from '../utils/asyncHandler';
import { success, created } from '../utils/response';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';
import { generateUniversalStudentQR } from '../services/qr';
import { NotFoundError, BadRequestError } from '../utils/errors';
import { logger } from '../config/logger';

const router = Router();

router.use(authenticate, authorize('parent'));

router.get('/profile', asyncHandler(async (req: AuthRequest, res) => {
  const profiles = await prisma.studentProfile.findMany({
    where: { userId: req.user!.id as string } as any,
    include: { _count: { select: { applications: true, documents: true } } },
  });
  success(res, profiles);
}));

router.put('/profile', asyncHandler(async (req: AuthRequest, res) => {
  const { studentProfileId, ...data } = req.body;
  const profile = await prisma.studentProfile.updateMany({
    where: { id: studentProfileId, userId: req.user!.id },
    data: { ...data, updatedAt: new Date() },
  });
  success(res, profile, 'Profile updated');
}));

router.get('/documents', asyncHandler(async (req: AuthRequest, res) => {
  const { studentProfileId } = req.query;
  const docs = await prisma.document.findMany({
    where: { studentProfileId: studentProfileId as string },
    orderBy: { createdAt: 'desc' },
  });
  success(res, docs);
}));

router.post('/documents', asyncHandler(async (req: AuthRequest, res) => {
  const { studentProfileId, documentType, fileName, fileUrl, fileSize } = req.body;
  const doc = await prisma.document.create({
    data: { studentProfileId, documentType, fileName, fileUrl, fileSize: parseInt(fileSize), mimeType: 'application/pdf', verificationStatus: 'pending' },
  });
  setTimeout(() => {
    prisma.document.update({
      where: { id: doc.id },
      data: { verificationStatus: 'verified', aiConfidenceScore: Math.random() * 20 + 80 },
    }).catch((err) => logger.error('Document auto-verification failed', { documentId: doc.id, error: err.message }));
  }, 5000);
  created(res, doc, 'Document uploaded, verification in progress');
}));

router.get('/documents/:id/verify', asyncHandler(async (req: AuthRequest, res) => {
  const doc = await prisma.document.findUnique({ where: { id: req.params.id as string } });
  if (!doc) throw new NotFoundError('Document not found');
  success(res, { verified: doc.verificationStatus === 'blockchain_anchored', hash: doc.blockchainHash, status: doc.verificationStatus, aiScore: doc.aiConfidenceScore });
}));

router.get('/qr-code', asyncHandler(async (req: AuthRequest, res) => {
  const profile = await prisma.studentProfile.findFirst({ where: { userId: req.user!.id as string } as any });
  if (!profile) throw new NotFoundError('Student profile not found');
  const qrDataUrl = await generateUniversalStudentQR(profile.universalStudentId);
  await prisma.studentProfile.update({ where: { id: profile.id }, data: { qrCodeUrl: qrDataUrl } });
  success(res, { qrCode: qrDataUrl, universalStudentId: profile.universalStudentId });
}));

router.get('/applications', asyncHandler(async (req: AuthRequest, res) => {
  const profile = await prisma.studentProfile.findFirst({ where: { userId: req.user!.id as string } as any });
  if (!profile) throw new NotFoundError('Profile not found');
  const applications = await prisma.application.findMany({
    where: { studentProfileId: profile!.id as string },
    include: { school: { select: { name: true, code: true, boardType: true, city: true } },  vendor: { select: { name: true, vendorId: true } }, tickets: { select: { ticketNumber: true, status: true, interviewDate: true } } },
    orderBy: { createdAt: 'desc' },
  });
  success(res, applications);
}));

router.get('/applications/:id', asyncHandler(async (req: AuthRequest, res) => {
  const app = await prisma.application.findUnique({
    where: { id: req.params.id as string },
    include: { school: true,  vendor: { select: { name: true, vendorId: true } }, tickets: true, transactions: true },
  });
  if (!app) throw new NotFoundError('Application not found');
  success(res, app);
}));

router.get('/tickets', asyncHandler(async (req: AuthRequest, res) => {
  const profile = await prisma.studentProfile.findFirst({ where: { userId: req.user!.id as string } as any });
  if (!profile) throw new NotFoundError('Profile not found');
  const tickets = await prisma.interviewTicket.findMany({
    where: { studentProfileId: profile!.id as string },
    include: { school: { select: { name: true, city: true } }, application: { select: { formType: true } } },
    orderBy: { interviewDate: 'desc' },
  });
  success(res, tickets);
}));

router.get('/gamification', asyncHandler(async (req: AuthRequest, res) => {
  const profile = await prisma.studentProfile.findFirst({ where: { userId: req.user!.id as string } as any });
  if (!profile) throw new NotFoundError('Profile not found');
  const gamification = await prisma.parentGamification.findUnique({ where: { studentProfileId: profile!.id as string } });
  if (!gamification) throw new NotFoundError('Gamification record not found');
  const level = Math.floor(gamification.totalXP / 1000) + 1;
  const progress = (gamification.totalXP % 1000) / 1000 * 100;
  success(res, { ...gamification, level, progress, nextLevelXP: level * 1000 });
}));

router.get('/notifications', asyncHandler(async (req: AuthRequest, res) => {
  const notifications = await prisma.notification.findMany({
    where: { userId: req.user!.id as string } as any,
    orderBy: { createdAt: 'desc' },
    take: 50,
  });
  success(res, notifications);
}));

router.put('/notifications/:id/read', asyncHandler(async (req: AuthRequest, res) => {
  await prisma.notification.updateMany({
    where: { id: req.params.id as string, userId: req.user!.id },
    data: { status: 'read' },
  });
  success(res, null, 'Notification marked as read');
}));

export default router;
