import { RequestHandler } from 'express';
export declare const asyncHandler: (fn: (...args: any[]) => Promise<any>) => RequestHandler;
