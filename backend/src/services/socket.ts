import { Server as SocketServer } from 'socket.io';
import { Server as HttpServer } from 'http';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { logger } from '../config/logger';

let io: SocketServer;

export const initializeSocket = (httpServer: HttpServer): SocketServer => {
  io = new SocketServer(httpServer, {
    cors: { origin: env.FRONTEND_URL, methods: ['GET', 'POST'], credentials: true },
  });
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) { next(new Error('Authentication required')); return; }
    try {
      const decoded = jwt.verify(token, env.JWT_SECRET) as { userId: string; role: string };
      socket.data.user = decoded;
      next();
    } catch { next(new Error('Invalid token')); }
  });
  io.on('connection', (socket) => {
    logger.info(`Socket connected: ${socket.id} user=${socket.data.user?.userId}`);
    if (socket.data.user?.role) socket.join(`role:${socket.data.user.role}`);
    if (socket.data.user?.userId) socket.join(`user:${socket.data.user.userId}`);
    socket.on('disconnect', () => logger.info(`Socket disconnected: ${socket.id}`));
  });
  return io;
};

export const getIO = (): SocketServer => { if (!io) throw new Error('Socket.IO not initialized'); return io; };
export const emitToVendor = (vendorId: string, event: string, data: unknown) => getIO().to(`vendor:${vendorId}`).emit(event, data);
export const emitToSchool = (schoolId: string, event: string, data: unknown) => getIO().to(`school:${schoolId}`).emit(event, data);
export const emitToUser = (userId: string, event: string, data: unknown) => getIO().to(`user:${userId}`).emit(event, data);
