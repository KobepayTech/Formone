import { Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';
import { ZodError } from 'zod';
import { AppError } from '../utils/errors';
import { logger } from '../config/logger';

export const errorHandler = (err: Error, _req: Request, res: Response, _next: NextFunction): void => {
  if (err instanceof AppError && err.isOperational) {
    res.status(err.statusCode).json({ success: false, error: err.message });
    return;
  }
  if (err instanceof ZodError) {
    const issues = (err as any).issues || (err as any).errors || [];
    const messages = issues.map((e: any) => `${e.path?.join('.') || ''}: ${e.message}`).join(', ');
    res.status(422).json({ success: false, error: 'Validation failed', details: messages });
    return;
  }
  if ((err as any).code === 'P2002') { res.status(409).json({ success: false, error: 'Duplicate entry' }); return; }
  if ((err as any).code === 'P2025') { res.status(404).json({ success: false, error: 'Record not found' }); return; }
  logger.error('Unhandled error:', { error: err.message, stack: err.stack });
  res.status(500).json({ success: false, error: 'Internal server error' });
};
