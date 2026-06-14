"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.emitToUser = exports.emitToSchool = exports.emitToVendor = exports.getIO = exports.initializeSocket = void 0;
const socket_io_1 = require("socket.io");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = require("../config/env");
const logger_1 = require("../config/logger");
let io;
const initializeSocket = (httpServer) => {
    io = new socket_io_1.Server(httpServer, {
        cors: { origin: env_1.env.FRONTEND_URL, methods: ['GET', 'POST'], credentials: true },
    });
    io.use((socket, next) => {
        const token = socket.handshake.auth.token;
        if (!token) {
            next(new Error('Authentication required'));
            return;
        }
        try {
            const decoded = jsonwebtoken_1.default.verify(token, env_1.env.JWT_SECRET);
            socket.data.user = decoded;
            next();
        }
        catch {
            next(new Error('Invalid token'));
        }
    });
    io.on('connection', (socket) => {
        logger_1.logger.info(`Socket connected: ${socket.id} user=${socket.data.user?.userId}`);
        if (socket.data.user?.role)
            socket.join(`role:${socket.data.user.role}`);
        if (socket.data.user?.userId)
            socket.join(`user:${socket.data.user.userId}`);
        socket.on('disconnect', () => logger_1.logger.info(`Socket disconnected: ${socket.id}`));
    });
    return io;
};
exports.initializeSocket = initializeSocket;
const getIO = () => { if (!io)
    throw new Error('Socket.IO not initialized'); return io; };
exports.getIO = getIO;
const emitToVendor = (vendorId, event, data) => (0, exports.getIO)().to(`vendor:${vendorId}`).emit(event, data);
exports.emitToVendor = emitToVendor;
const emitToSchool = (schoolId, event, data) => (0, exports.getIO)().to(`school:${schoolId}`).emit(event, data);
exports.emitToSchool = emitToSchool;
const emitToUser = (userId, event, data) => (0, exports.getIO)().to(`user:${userId}`).emit(event, data);
exports.emitToUser = emitToUser;
//# sourceMappingURL=socket.js.map