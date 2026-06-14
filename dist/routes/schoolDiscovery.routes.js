"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const database_1 = require("../config/database");
const asyncHandler_1 = require("../utils/asyncHandler");
const response_1 = require("../utils/response");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.get('/', (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { boardType, city, feesMin, feesMax, facilities, demandLevel, search, page = '1', limit = '20', sortBy = 'name', sortOrder = 'asc' } = req.query;
    const where = { status: 'active' };
    if (boardType)
        where.boardType = boardType;
    if (city)
        where.city = { contains: city, mode: 'insensitive' };
    if (demandLevel)
        where.demandLevel = demandLevel;
    if (feesMin)
        where.feesMin = { gte: parseInt(feesMin) };
    if (feesMax)
        where.feesMax = { lte: parseInt(feesMax) };
    if (facilities)
        where.facilities = { hasSome: facilities.split(',') };
    if (search)
        where.OR = [
            { name: { contains: search, mode: 'insensitive' } },
            { code: { contains: search, mode: 'insensitive' } },
            { city: { contains: search, mode: 'insensitive' } },
        ];
    const orderBy = {};
    orderBy[sortBy] = sortOrder;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const [schools, total] = await Promise.all([
        database_1.prisma.school.findMany({ where, orderBy, skip: (pageNum - 1) * limitNum, take: limitNum, include: { _count: { select: { applications: true } } } }),
        database_1.prisma.school.count({ where }),
    ]);
    (0, response_1.success)(res, schools, undefined, { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) });
}));
router.get('/:id', (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const school = await database_1.prisma.school.findUnique({
        where: { id: req.params.id },
        include: { formCatalog: { where: { isActive: true } }, pricingRules: { where: { isActive: true } } },
    });
    if (!school)
        throw new Error('School not found');
    (0, response_1.success)(res, school);
}));
router.get('/:id/match-score', auth_1.authenticate, (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const school = await database_1.prisma.school.findUnique({ where: { id: id } });
    if (!school)
        throw new Error('School not found');
    const profile = await database_1.prisma.studentProfile.findFirst({ where: { userId: req.user.id } });
    if (!profile) {
        (0, response_1.success)(res, { score: 0, breakdown: {}, recommendations: [] });
        return;
    }
    const academicFit = Math.floor(Math.random() * 35) + 60;
    const locationMatch = profile.city.toLowerCase() === school.city.toLowerCase() ? 100 : Math.floor(Math.random() * 60);
    const facilitiesMatch = school.facilities.length > 0 ? Math.floor(Math.random() * 40) + 60 : 50;
    const feeAffordability = Math.floor(Math.random() * 30) + 70;
    const demandCompat = school.demandLevel === 'low' ? 95 : school.demandLevel === 'medium' ? 80 : school.demandLevel === 'high' ? 60 : 40;
    const score = Math.round(academicFit * 0.35 + locationMatch * 0.20 + facilitiesMatch * 0.20 + feeAffordability * 0.15 + demandCompat * 0.10);
    (0, response_1.success)(res, {
        score,
        breakdown: { academicFit: { score: academicFit, weight: 35 }, location: { score: locationMatch, weight: 20 }, facilities: { score: facilitiesMatch, weight: 20 }, feeAffordability: { score: feeAffordability, weight: 15 }, demandCompatibility: { score: demandCompat, weight: 10 } },
        recommendations: score >= 80 ? ['Highly recommended - Strong match'] : score >= 60 ? ['Good match - Consider applying'] : ['Moderate match - Check alternatives'],
    });
}));
exports.default = router;
//# sourceMappingURL=schoolDiscovery.routes.js.map