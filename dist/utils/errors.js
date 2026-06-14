"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ValidationError = exports.ConflictError = exports.NotFoundError = exports.ForbiddenError = exports.UnauthorizedError = exports.BadRequestError = exports.AppError = void 0;
class AppError extends Error {
    statusCode;
    isOperational;
    constructor(message, statusCode, isOperational = true) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = isOperational;
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.AppError = AppError;
class BadRequestError extends AppError {
    constructor(m) { super(m, 400); }
}
exports.BadRequestError = BadRequestError;
class UnauthorizedError extends AppError {
    constructor(m = 'Unauthorized') { super(m, 401); }
}
exports.UnauthorizedError = UnauthorizedError;
class ForbiddenError extends AppError {
    constructor(m = 'Forbidden') { super(m, 403); }
}
exports.ForbiddenError = ForbiddenError;
class NotFoundError extends AppError {
    constructor(m = 'Not found') { super(m, 404); }
}
exports.NotFoundError = NotFoundError;
class ConflictError extends AppError {
    constructor(m) { super(m, 409); }
}
exports.ConflictError = ConflictError;
class ValidationError extends AppError {
    constructor(m) { super(m, 422); }
}
exports.ValidationError = ValidationError;
//# sourceMappingURL=errors.js.map