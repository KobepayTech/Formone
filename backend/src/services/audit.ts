import { prisma } from '../config/database';

export const logAudit = async (
  userId: string | null, action: string, entityType: string, entityId: string,
  details?: any, ip?: string, ua?: string
) => {
  await prisma.auditLog.create({ data: { userId, action, entityType, entityId, details: details || {}, ipAddress: ip, userAgent: ua } });
};
