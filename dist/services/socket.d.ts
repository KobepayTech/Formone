import { Server as SocketServer } from 'socket.io';
import { Server as HttpServer } from 'http';
export declare const initializeSocket: (httpServer: HttpServer) => SocketServer;
export declare const getIO: () => SocketServer;
export declare const emitToVendor: (vendorId: string, event: string, data: unknown) => boolean;
export declare const emitToSchool: (schoolId: string, event: string, data: unknown) => boolean;
export declare const emitToUser: (userId: string, event: string, data: unknown) => boolean;
