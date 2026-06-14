import { Response } from 'express';
export interface ApiResponse<T = unknown> {
    success: boolean;
    data?: T;
    message?: string;
    error?: string;
    details?: string;
    meta?: {
        page?: number;
        limit?: number;
        total?: number;
        totalPages?: number;
    };
}
export declare const success: <T>(res: Response, data: T, message?: string, meta?: ApiResponse<T>["meta"]) => Response;
export declare const created: <T>(res: Response, data: T, message?: string) => Response;
export declare const paginated: <T>(res: Response, data: T[], page: number, limit: number, total: number) => Response;
