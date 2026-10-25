import rateLimit from 'express-rate-limit';
import { RequestHandler } from 'express';

export interface RateLimitOptions {
  limit: number;
  windowMs: number;
}

// Slows down password guessing: each IP gets `limit` login attempts per window.
export const createLoginRateLimiter = ({ limit, windowMs }: RateLimitOptions): RequestHandler =>
  rateLimit({
    windowMs,
    limit,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    handler: (_req, res) => {
      res.status(429).json({ error: { code: 'TOO_MANY_REQUESTS', message: 'Too many login attempts. Try again later.' } });
    },
  });
