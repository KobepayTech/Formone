"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const zod_1 = require("zod");
const errors_1 = require("../utils/errors");
const logger_1 = require("../config/logger");
const errorHandler = (err, _req, res, _next) => {
    if (err instanceof errors_1.AppError && err.isOperational) {
        res.status(err.statusCode).json({ success: false, error: err.message });
        return;
    }
    if (err instanceof zod_1.ZodError) {
        const issues = err.issues || err.errors || [];
        const messages = issues.map((e) => `${e.path?.join('.') || ''}: ${e.message}`).join(', ');
        res.status(422).json({ success: false, error: 'Validation failed', details: messages });
        return;
    }
    if (err.code === 'P2002') {
        res.status(409).json({ success: false, error: 'Duplicate entry' });
        return;
    }
    if (err.code === 'P2025') {
        res.status(404).json({ success: false, error: 'Record not found' });
        return;
    }
    logger_1.logger.error('Unhandled error:', { error: err.message, stack: err.stack });
    res.status(500).json({ success: false, error: 'Internal server error' });
};
exports.errorHandler = errorHandler;
//# sourceMappingURL=errorHandler.js.map