import { Response } from 'express';

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  details?: string;
  meta?: { page?: number; limit?: number; total?: number; totalPages?: number };
}

export const success = <T>(res: Response, data: T, message?: string, meta?: ApiResponse<T>['meta']): Response => {
  return res.status(200).json({ success: true, data, message, meta });
};

export const created = <T>(res: Response, data: T, message?: string): Response => {
  return res.status(201).json({ success: true, data, message });
};

export const paginated = <T>(res: Response, data: T[], page: number, limit: number, total: number): Response => {
  const totalPages = Math.ceil(total / limit);
  return success(res, data, undefined, { page, limit, total, totalPages });
};
