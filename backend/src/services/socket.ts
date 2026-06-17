import { Server as SocketServer } from 'socket.io';
import { Server as HttpServer } from 'http';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { logger } from '../config/logger';
import { prisma } from '../config/database';

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
  io.on('connection', async (socket) => {
    const { userId, role } = socket.data.user ?? {};
    logger.info(`Socket connected: ${socket.id} user=${userId}`);
    if (role) socket.join(`role:${role}`);
    if (userId) socket.join(`user:${userId}`);

    // Join the entity-scoped rooms used by emitToVendor / emitToSchool.
    try {
      if (role === 'vendor') {
        const vendor = await prisma.vendor.findUnique({ where: { userId }, select: { id: true } });
        if (vendor) socket.join(`vendor:${vendor.id}`);
      } else if (role === 'school_admin') {
        const admin = await prisma.schoolAdmin.findUnique({ where: { userId }, select: { schoolId: true } });
        if (admin) socket.join(`school:${admin.schoolId}`);
      }
    } catch (err) {
      logger.error('Failed to join entity room', { error: (err as Error).message });
    }

    socket.on('disconnect', () => logger.info(`Socket disconnected: ${socket.id}`));
  });
  return io;
};

export const getIO = (): SocketServer => { if (!io) throw new Error('Socket.IO not initialized'); return io; };
export const emitToVendor = (vendorId: string, event: string, data: unknown) => getIO().to(`vendor:${vendorId}`).emit(event, data);
export const emitToSchool = (schoolId: string, event: string, data: unknown) => getIO().to(`school:${schoolId}`).emit(event, data);
export const emitToUser = (userId: string, event: string, data: unknown) => getIO().to(`user:${userId}`).emit(event, data);
