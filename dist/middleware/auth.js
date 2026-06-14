"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorize = exports.authenticate = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = require("../config/env");
const database_1 = require("../config/database");
const errors_1 = require("../utils/errors");
const authenticate = async (req, _res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader?.startsWith('Bearer '))
            throw new errors_1.UnauthorizedError('No token provided');
        const token = authHeader.substring(7);
        const decoded = jsonwebtoken_1.default.verify(token, env_1.env.JWT_SECRET);
        const user = await database_1.prisma.user.findUnique({ where: { id: decoded.userId }, select: { id: true, email: true, role: true, status: true } });
        if (!user || user.status !== 'active')
            throw new errors_1.UnauthorizedError('User not found or inactive');
        req.user = { id: user.id, email: user.email, role: user.role };
        next();
    }
    catch (error) {
        if (error instanceof jsonwebtoken_1.default.JsonWebTokenError) {
            next(new errors_1.UnauthorizedError('Invalid token'));
            return;
        }
        next(error);
    }
};
exports.authenticate = authenticate;
const authorize = (...roles) => {
    return (req, _res, next) => {
        if (!req.user) {
            next(new errors_1.UnauthorizedError());
            return;
        }
        if (!roles.includes(req.user.role)) {
            next(new errors_1.ForbiddenError('Insufficient permissions'));
            return;
        }
        next();
    };
};
exports.authorize = authorize;
//# sourceMappingURL=auth.js.map