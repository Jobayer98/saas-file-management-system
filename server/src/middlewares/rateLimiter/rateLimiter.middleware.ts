import rateLimit from 'express-rate-limit';

// General API rate limiter
export const generalRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Limit each IP to 1000 requests per windowMs
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many requests from this IP, please try again later.',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// File upload rate limiter (more restrictive)
export const uploadRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // Limit each IP to 10 uploads per minute
  message: {
    success: false,
    error: {
      code: 'UPLOAD_RATE_LIMIT_EXCEEDED',
      message: 'Too many upload requests, please wait before uploading again.',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Folder/File creation rate limiter
export const creationRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30, // Limit each IP to 30 creations per minute
  message: {
    success: false,
    error: {
      code: 'CREATION_RATE_LIMIT_EXCEEDED',
      message: 'Too many creation requests, please slow down.',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Bulk operations rate limiter (very restrictive)
export const bulkOperationRateLimit = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 5, // Limit each IP to 5 bulk operations per 5 minutes
  message: {
    success: false,
    error: {
      code: 'BULK_OPERATION_RATE_LIMIT_EXCEEDED',
      message: 'Too many bulk operations, please wait before trying again.',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// User-specific rate limiter (based on user ID)
export const createUserRateLimit = (windowMs: number, max: number, keyGenerator?: (req: any) => string) => {
  return rateLimit({
    windowMs,
    max,
    keyGenerator: keyGenerator || ((req: any) => req.user?.id || req.ip),
    message: {
      success: false,
      error: {
        code: 'USER_RATE_LIMIT_EXCEEDED',
        message: 'You are making requests too quickly, please slow down.',
      },
    },
    standardHeaders: true,
    legacyHeaders: false,
  });
};