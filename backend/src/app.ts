import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import { env } from './config/env';
import { logger } from './config/logger';
import { errorHandler } from './middleware/errorHandler';
import { generalLimiter } from './middleware/rateLimiter';

const app = express();

app.use(helmet());
app.use(cors({ origin: env.FRONTEND_URL, credentials: true }));
app.use(compression());
app.use(morgan('combined', { stream: { write: (msg: string) => logger.info(msg.trim()) } }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use('/uploads', express.static(env.UPLOAD_PATH));

app.get('/health', (req, res) => {
  res.json({ success: true, message: 'EduResult Pro API v2.0', version: '2.0.0', timestamp: new Date().toISOString() });
});

import routes from './routes';
app.use('/api/v2', routes);

app.use(errorHandler);
app.use((req, res) => {
  res.status(404).json({ success: false, error: 'Route not found' });
});

export default app;
