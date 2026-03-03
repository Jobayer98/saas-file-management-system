import redis from '@/lib/redis';
import { Response, NextFunction } from 'express';
import { AppError } from '@/middlewares/error/error.middleware';
import { AuthRequest } from '@/types';

interface ConcurrencyOptions {
  maxConcurrent: number;
  keyGenerator?: (req: AuthRequest) => string;
  timeout?: number; // in seconds
}

export const concurrencyLimit = (options: ConcurrencyOptions) => {
  const { maxConcurrent, keyGenerator, timeout = 30 } = options;

  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    const key = keyGenerator ? keyGenerator(req) : `concurrency:${req.user?.id || req.ip}`;
    const countKey = `${key}:count`;

    try {
      // Get current concurrent operations count
      const currentCount = await redis.get(countKey);
      const count = currentCount ? parseInt(currentCount) : 0;

      if (count >= maxConcurrent) {
        throw new AppError(
          'Too many concurrent operations. Please wait for current operations to complete.',
          429,
          'CONCURRENT_LIMIT_EXCEEDED'
        );
      }

      // Increment counter
      const multi = redis.multi();
      multi.incr(countKey);
      multi.expire(countKey, timeout);
      await multi.exec();

      // Add cleanup on response finish
      const cleanup = async () => {
        try {
          await redis.decr(countKey);
        } catch (error) {
          console.error('Failed to decrement concurrency counter:', error);
        }
      };

      res.on('finish', cleanup);
      res.on('close', cleanup);
      res.on('error', cleanup);

      next();
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      console.error('Concurrency middleware error:', error);
      next();
    }
  };
};

// Predefined concurrency limiters
export const uploadConcurrencyLimit = concurrencyLimit({
  maxConcurrent: 3,
  keyGenerator: (req) => `upload:${req.user?.id}`,
  timeout: 300, // 5 minutes for uploads
});

export const bulkOperationConcurrencyLimit = concurrencyLimit({
  maxConcurrent: 1,
  keyGenerator: (req) => `bulk:${req.user?.id}`,
  timeout: 600, // 10 minutes for bulk operations
});