import rateLimit from 'express-rate-limit';

const handler = (message: string) => (_req: unknown, res: any) =>
  res.status(429).json({ error: { code: 'RATE_LIMITED', message } });

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  handler: handler('Too many attempts. Try again in a few minutes.'),
});

/** Per-user cap on endpoints that call Gemini. Must run after requireAuth. */
export const aiLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 120,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.userId ?? 'anonymous',
  handler: handler('Hourly AI usage limit reached. Please try again later.'),
});
