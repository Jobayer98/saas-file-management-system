import { AuthRequest } from '@/types';
import { verifyAccessToken } from '@/utils/helpers/jwt.helper';
import { Response, NextFunction } from 'express';

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    const queryToken = req.query.token as string;
    
    let token: string | undefined;
    
    // Check Authorization header first
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }
    // Fall back to query parameter for media files (images, videos, etc.)
    else if (queryToken) {
      token = queryToken;
    }
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token provided',
      });
    }

    const decoded = verifyAccessToken(token);
    
    req.user = decoded;
    next();
    return;
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token',
    });
  }
};

export const requireAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user?.isAdmin) {
    return res.status(403).json({
      success: false,
      message: 'Admin access required',
    });
  }
  next();
  return;
};
