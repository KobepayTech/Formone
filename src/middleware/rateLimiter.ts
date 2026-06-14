import rateLimit from 'express-rate-limit';

export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, max: 100,
  message: { success: false, error: 'Too many requests, please try again later' },
  standardHeaders: true, legacyHeaders: false,
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, max: 10,
  message: { success: false, error: 'Too many login attempts, please try again later' },
  skipSuccessfulRequests: true,
});

export const paymentLimiter = rateLimit({
  windowMs: 60 * 1000, max: 5,
  message: { success: false, error: 'Too many payment attempts' },
});
