import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { prisma } from '../config/database';
import { UnauthorizedError, ForbiddenError } from '../utils/errors';

export interface AuthRequest extends Request {
  user?: { id: string; email: string; role: string };
}

export const authenticate = async (req: AuthRequest, _res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) throw new UnauthorizedError('No token provided');
    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, env.JWT_SECRET) as { userId: string; email: string; role: string };
    const user = await prisma.user.findUnique({ where: { id: decoded.userId }, select: { id: true, email: true, role: true, status: true } });
    if (!user || user.status !== 'active') throw new UnauthorizedError('User not found or inactive');
    req.user = { id: user.id, email: user.email, role: user.role };
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) { next(new UnauthorizedError('Invalid token')); return; }
    next(error);
  }
};

export const authorize = (...roles: string[]) => {
  return (req: AuthRequest, _res: Response, next: NextFunction): void => {
    if (!req.user) { next(new UnauthorizedError()); return; }
    if (!roles.includes(req.user.role)) { next(new ForbiddenError('Insufficient permissions')); return; }
    next();
  };
};
