import rateLimit from 'express-rate-limit';
import { Request, Response, NextFunction } from 'express';

const DISABLE_RATE_LIMIT = process.env.DISABLE_RATE_LIMIT === 'true';

const noopMiddleware = (req: Request, res: Response, next: NextFunction) => next();

export const generalRateLimit = DISABLE_RATE_LIMIT ? noopMiddleware : rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  message: { success: false, error: { code: 'RATE_LIMIT_EXCEEDED', message: 'Too many requests, please try again later.' } },
  standardHeaders: true,
  legacyHeaders: false,
});

export const uploadRateLimit = DISABLE_RATE_LIMIT ? noopMiddleware : rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: { success: false, error: { code: 'UPLOAD_RATE_LIMIT_EXCEEDED', message: 'Too many upload requests.' } },
  standardHeaders: true,
  legacyHeaders: false,
});

export const creationRateLimit = DISABLE_RATE_LIMIT ? noopMiddleware : rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  message: { success: false, error: { code: 'CREATION_RATE_LIMIT_EXCEEDED', message: 'Too many creation requests.' } },
  standardHeaders: true,
  legacyHeaders: false,
});

export const bulkOperationRateLimit = DISABLE_RATE_LIMIT ? noopMiddleware : rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 5,
  message: { success: false, error: { code: 'BULK_OPERATION_RATE_LIMIT_EXCEEDED', message: 'Too many bulk operations.' } },
  standardHeaders: true,
  legacyHeaders: false,
});

export const createUserRateLimit = (windowMs: number, max: number, keyGenerator?: (req: any) => string) =>
  DISABLE_RATE_LIMIT ? noopMiddleware : rateLimit({
    windowMs,
    max,
    keyGenerator: keyGenerator || ((req: any) => `user:${req.user?.id || 'anonymous'}`),
    message: { success: false, error: { code: 'USER_RATE_LIMIT_EXCEEDED', message: 'Too many requests.' } },
    standardHeaders: true,
    legacyHeaders: false,
  });