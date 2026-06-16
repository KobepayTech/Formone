export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  constructor(message: string, statusCode: number, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class BadRequestError extends AppError { constructor(m: string) { super(m, 400); } }
export class UnauthorizedError extends AppError { constructor(m = 'Unauthorized') { super(m, 401); } }
export class ForbiddenError extends AppError { constructor(m = 'Forbidden') { super(m, 403); } }
export class NotFoundError extends AppError { constructor(m = 'Not found') { super(m, 404); } }
export class ConflictError extends AppError { constructor(m: string) { super(m, 409); } }
export class ValidationError extends AppError { constructor(m: string) { super(m, 422); } }
