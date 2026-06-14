"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = require("http");
const app_1 = __importDefault(require("./app"));
const env_1 = require("./config/env");
const logger_1 = require("./config/logger");
const socket_1 = require("./services/socket");
const httpServer = (0, http_1.createServer)(app_1.default);
(0, socket_1.initializeSocket)(httpServer);
const PORT = parseInt(env_1.env.PORT);
httpServer.listen(PORT, () => {
    logger_1.logger.info(`EduResult Pro API v2.0 running on port ${PORT}`);
    logger_1.logger.info(`Environment: ${env_1.env.NODE_ENV}`);
    logger_1.logger.info(`WebSocket server ready`);
});
process.on('SIGTERM', () => {
    logger_1.logger.info('SIGTERM received, shutting down');
    httpServer.close(() => { logger_1.logger.info('Server closed'); process.exit(0); });
});
//# sourceMappingURL=server.js.map