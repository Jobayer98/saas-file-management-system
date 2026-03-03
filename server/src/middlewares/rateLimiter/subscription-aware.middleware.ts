import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import redis from '@/lib/redis';
import { AuthRequest } from '@/types';

// Simple subscription-aware rate limiters (using static limits)
export const subscriptionAwareUploadLimit = rateLimit({
  store: new RedisStore({
    sendCommand: (...args: string[]) => redis.call(args[0], ...args.slice(1)) as any,
  }),
  windowMs: 60 * 1000, // 1 minute
  max: 15, // Middle ground between free (5) and premium (20)
  keyGenerator: (req: AuthRequest) => req.user?.id || req.ip || 'anonymous',
  message: {
    success: false,
    error: {
      code: 'UPLOAD_RATE_LIMIT_EXCEEDED',
      message: 'Upload rate limit exceeded. Consider upgrading for higher limits.',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const subscriptionAwareCreationLimit = rateLimit({
  store: new RedisStore({
    sendCommand: (...args: string[]) => redis.call(args[0], ...args.slice(1)) as any,
  }),
  windowMs: 60 * 1000, // 1 minute
  max: 25, // Middle ground between free (10) and premium (50)
  keyGenerator: (req: AuthRequest) => req.user?.id || req.ip || 'anonymous',
  message: {
    success: false,
    error: {
      code: 'CREATION_RATE_LIMIT_EXCEEDED',
      message: 'Creation rate limit exceeded. Consider upgrading for higher limits.',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
});