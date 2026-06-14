import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().default('5000'),
  DATABASE_URL: z.string().min(1),
  JWT_SECRET: z.string().min(1),
  JWT_REFRESH_SECRET: z.string().min(1),
  JWT_ACCESS_EXPIRY: z.string().default('15m'),
  JWT_REFRESH_EXPIRY: z.string().default('7d'),
  BCRYPT_ROUNDS: z.string().default('12'),
  FRONTEND_URL: z.string().default('http://localhost:5173'),
  MAX_FILE_SIZE: z.string().default('10485760'),
  UPLOAD_PATH: z.string().default('./uploads'),
});

export const env = envSchema.parse(process.env);
