import { Response, NextFunction } from "express";
import { getContainer } from "@/container";
import { AuthRequest } from "@/types";

export const cacheMiddleware = (ttl: number = 300) => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const container = getContainer();
      const cacheService = container.cacheService;

      const cacheKey = `route:${req.method}:${req.originalUrl}:${req.user?.id || "guest"}`;

      const cached = await cacheService.get(cacheKey);
      if (cached) {
        return res.json(cached);
      }

      const originalJson = res.json.bind(res);
      res.json = (body: any) => {
        cacheService
          .set(cacheKey, body, ttl)
          .catch((err) => console.error("Cache set error:", err));
        return originalJson(body);
      };

      next();
      return;
    } catch (error) {
      next();
      return;
    }
  };
};
