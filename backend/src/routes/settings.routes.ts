import { Router } from 'express';
import { prisma } from '../config/database';
import { asyncHandler } from '../utils/asyncHandler';
import { success } from '../utils/response';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';

const router = Router();
router.use(authenticate, authorize('platform_admin'));

router.get('/', asyncHandler(async (req: AuthRequest, res) => {
  const [academicYears, gradingScales, emergencyProtocols] = await Promise.all([
    prisma.academicYear.findMany({ orderBy: { createdAt: 'desc' } }),
    prisma.gradingScale.findMany({ where: { isActive: true }, orderBy: { order: 'asc' } }),
    prisma.emergencyProtocol.findMany({ orderBy: { createdAt: 'desc' } }),
  ]);
  success(res, { academicYears, gradingScales, emergencyProtocols });
}));

router.get('/academic-year', asyncHandler(async (req: AuthRequest, res) => {
  const year = await prisma.academicYear.findFirst({ where: { isActive: true } });
  success(res, year);
}));

router.put('/academic-year', asyncHandler(async (req: AuthRequest, res) => {
  const { id, year, startDate, endDate, isActive, terms } = req.body;
  const data = { year, startDate: new Date(startDate), endDate: new Date(endDate), isActive, terms };

  const result = await prisma.$transaction(async (tx) => {
    if (isActive) await tx.academicYear.updateMany({ where: { isActive: true }, data: { isActive: false } });
    if (id) return tx.academicYear.update({ where: { id }, data });
    return tx.academicYear.create({ data });
  });

  success(res, result, 'Academic year saved');
}));

router.get('/grading-scale', asyncHandler(async (req: AuthRequest, res) => {
  const scales = await prisma.gradingScale.findMany({ where: { isActive: true }, orderBy: { order: 'asc' } });
  success(res, scales);
}));

router.put('/grading-scale', asyncHandler(async (req: AuthRequest, res) => {
  const { scales } = req.body;
  await prisma.$transaction(
    scales.map((s: any) => prisma.gradingScale.upsert({
      where: { id: s.id || '' },
      update: { ...s },
      create: { grade: s.grade, minMarks: s.minMarks, maxMarks: s.maxMarks, description: s.description, color: s.color, points: s.points, isActive: true, order: s.order },
    }))
  );
  success(res, null, 'Grading scales updated');
}));

router.get('/roles', asyncHandler(async (req: AuthRequest, res) => {
  const matrix = {
    platform_admin: ['view_analytics', 'manage_schools', 'manage_vendors', 'manage_forms', 'view_applications', 'manage_interviews', 'manage_settings', 'view_revenue', 'process_settlements', 'manage_users', 'view_audit_logs', 'send_notifications', 'approve_documents', 'configure_pricing', 'activate_emergency'],
    school_admin: ['view_applications', 'manage_interviews', 'view_revenue', 'view_analytics'],
    vendor: ['process_payments', 'print_tickets', 'view_history'],
    parent: ['view_profile', 'manage_documents', 'submit_applications', 'view_tickets', 'view_notifications'],
  };
  success(res, matrix);
}));

router.put('/roles', asyncHandler(async (req: AuthRequest, res) => {
  const { role, permissions } = req.body;
  success(res, { role: role as string, permissions: permissions as string[] }, 'Role permissions updated (stored in memory for this session)');
}));

router.get('/emergency-protocols', asyncHandler(async (req: AuthRequest, res) => {
  const protocols = await prisma.emergencyProtocol.findMany({ orderBy: { createdAt: 'desc' } });
  success(res, protocols);
}));

router.put('/emergency-protocols/:id', asyncHandler(async (req: AuthRequest, res) => {
  const { isActive } = req.body;

  const result = await prisma.$transaction(async (tx) => {
    if (isActive) {
      const protocol = await tx.emergencyProtocol.findUnique({ where: { id: req.params.id as string } });
      if (protocol) await tx.emergencyProtocol.updateMany({ where: { type: protocol.type, isActive: true }, data: { isActive: false, deactivatedAt: new Date() } });
    }
    return tx.emergencyProtocol.update({
      where: { id: req.params.id as string },
      data: { isActive, activatedAt: isActive ? new Date() : null, deactivatedAt: isActive ? null : new Date() },
    });
  });

  success(res, result, `Emergency protocol ${isActive ? 'activated' : 'deactivated'}`);
}));

export default router;
