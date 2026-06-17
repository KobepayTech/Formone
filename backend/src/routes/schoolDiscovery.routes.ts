import { Router } from 'express';
import { prisma } from '../config/database';
import { asyncHandler } from '../utils/asyncHandler';
import { success } from '../utils/response';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

router.get('/', asyncHandler(async (req, res) => {
  const { boardType, city, feesMin, feesMax, facilities, demandLevel, search, page = '1', limit = '20', sortBy = 'name', sortOrder = 'asc' } = req.query;
  const where: any = { status: 'active' };
  if (boardType) where.boardType = boardType;
  if (city) where.city = { contains: city as string, mode: 'insensitive' };
  if (demandLevel) where.demandLevel = demandLevel;
  if (feesMin) where.feesMin = { gte: parseInt(feesMin as string) };
  if (feesMax) where.feesMax = { lte: parseInt(feesMax as string) };
  if (facilities) where.facilities = { hasSome: (facilities as string).split(',') as string[] };
  if (search) where.OR = [
    { name: { contains: search as string, mode: 'insensitive' } },
    { code: { contains: search as string, mode: 'insensitive' } },
    { city: { contains: search as string, mode: 'insensitive' } },
  ];
  const orderBy: any = {};
  orderBy[sortBy as string] = sortOrder;
  const pageNum = parseInt(page as string);
  const limitNum = parseInt(limit as string);
  const [schools, total] = await Promise.all([
    prisma.school.findMany({ where, orderBy, skip: (pageNum - 1) * limitNum, take: limitNum, include: { _count: { select: { applications: true } } } }),
    prisma.school.count({ where }),
  ]);
  success(res, schools, undefined, { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) });
}));

router.get('/:id', asyncHandler(async (req, res) => {
  const school = await prisma.school.findUnique({
    where: { id: req.params.id as string },
    include: { formCatalog: { where: { isActive: true } }, pricingRules: { where: { isActive: true } } },
  });
  if (!school) throw new Error('School not found');
  success(res, school);
}));

router.get('/:id/match-score', authenticate, asyncHandler(async (req: AuthRequest, res) => {
  const { id } = req.params;
  const school = await prisma.school.findUnique({ where: { id: id as string } });
  if (!school) throw new Error('School not found');
  const profile = await prisma.studentProfile.findFirst({ where: { userId: req.user!.id as string } });
  if (!profile) { success(res, { score: 0, breakdown: {}, recommendations: [] }); return; }

  const academicFit = Math.floor(Math.random() * 35) + 60;
  const locationMatch = profile.city.toLowerCase() === school.city.toLowerCase() ? 100 : Math.floor(Math.random() * 60);
  const facilitiesMatch = school.facilities.length > 0 ? Math.floor(Math.random() * 40) + 60 : 50;
  const feeAffordability = Math.floor(Math.random() * 30) + 70;
  const demandCompat = school.demandLevel === 'low' ? 95 : school.demandLevel === 'medium' ? 80 : school.demandLevel === 'high' ? 60 : 40;

  const score = Math.round(academicFit * 0.35 + locationMatch * 0.20 + facilitiesMatch * 0.20 + feeAffordability * 0.15 + demandCompat * 0.10);

  success(res, {
    score,
    breakdown: { academicFit: { score: academicFit, weight: 35 }, location: { score: locationMatch, weight: 20 }, facilities: { score: facilitiesMatch, weight: 20 }, feeAffordability: { score: feeAffordability, weight: 15 }, demandCompatibility: { score: demandCompat, weight: 10 } },
    recommendations: score >= 80 ? ['Highly recommended - Strong match'] : score >= 60 ? ['Good match - Consider applying'] : ['Moderate match - Check alternatives'],
  });
}));

export default router;
