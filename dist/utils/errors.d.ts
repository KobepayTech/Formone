export declare class AppError extends Error {
    readonly statusCode: number;
    readonly isOperational: boolean;
    constructor(message: string, statusCode: number, isOperational?: boolean);
}
export declare class BadRequestError extends AppError {
    constructor(m: string);
}
export declare class UnauthorizedError extends AppError {
    constructor(m?: string);
}
export declare class ForbiddenError extends AppError {
    constructor(m?: string);
}
export declare class NotFoundError extends AppError {
    constructor(m?: string);
}
export declare class ConflictError extends AppError {
    constructor(m: string);
}
export declare class ValidationError extends AppError {
    constructor(m: string);
}
