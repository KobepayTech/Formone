import { createServer } from 'http';
import app from './app';
import { env } from './config/env';
import { logger } from './config/logger';
import { initializeSocket } from './services/socket';

const httpServer = createServer(app);
initializeSocket(httpServer);

const PORT = parseInt(env.PORT);
httpServer.listen(PORT, () => {
  logger.info(`EduResult Pro API v2.0 running on port ${PORT}`);
  logger.info(`Environment: ${env.NODE_ENV}`);
  logger.info(`WebSocket server ready`);
});

process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down');
  httpServer.close(() => { logger.info('Server closed'); process.exit(0); });
});
