import { NextFunction, Request, Response } from 'express';

const requestCounter = new Map<string, { count: number; windowStart: number }>();

export function securityHeaders(_req: Request, res: Response, next: NextFunction) {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  res.setHeader('Content-Security-Policy', "default-src 'self'; img-src 'self' https: data:; style-src 'self' 'unsafe-inline' https:; script-src 'self';");
  next();
}

export function simpleRateLimit(limit = 120, windowMs = 60_000) {
  return (req: Request, res: Response, next: NextFunction) => {
    const key = req.ip ?? 'unknown';
    const now = Date.now();

    const existing = requestCounter.get(key);
    if (!existing || now - existing.windowStart > windowMs) {
      requestCounter.set(key, { count: 1, windowStart: now });
      return next();
    }

    if (existing.count >= limit) {
      return res.status(429).json({
        success: false,
        message: 'Too many requests. Please try again later.',
      });
    }

    existing.count += 1;
    return next();
  };
}
