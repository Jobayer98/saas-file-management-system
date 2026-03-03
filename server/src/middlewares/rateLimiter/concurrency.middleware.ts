import { Response, NextFunction } from 'express';
import { AppError } from '@/middlewares/error/error.middleware';
import { AuthRequest } from '@/types';

interface ConcurrencyOptions {
  maxConcurrent: number;
  keyGenerator?: (req: AuthRequest) => string;
  timeout?: number;
}

const concurrencyStore = new Map<string, number>();

export const concurrencyLimit = (options: ConcurrencyOptions) => {
  const { maxConcurrent, keyGenerator, timeout = 30 } = options;

  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    const key = keyGenerator ? keyGenerator(req) : `concurrency:${req.user?.id || 'anonymous'}`;
    const currentCount = concurrencyStore.get(key) || 0;

    if (currentCount >= maxConcurrent) {
      throw new AppError('Too many concurrent operations.', 429, 'CONCURRENT_LIMIT_EXCEEDED');
    }

    concurrencyStore.set(key, currentCount + 1);

    const cleanup = () => {
      const count = concurrencyStore.get(key) || 0;
      count <= 1 ? concurrencyStore.delete(key) : concurrencyStore.set(key, count - 1);
    };

    res.on('finish', cleanup);
    res.on('close', cleanup);
    res.on('error', cleanup);
    setTimeout(cleanup, timeout * 1000);

    next();
  };
};

export const uploadConcurrencyLimit = concurrencyLimit({
  maxConcurrent: 3,
  keyGenerator: (req) => `upload:${req.user?.id}`,
  timeout: 300,
});

export const bulkOperationConcurrencyLimit = concurrencyLimit({
  maxConcurrent: 1,
  keyGenerator: (req) => `bulk:${req.user?.id}`,
  timeout: 600,
});