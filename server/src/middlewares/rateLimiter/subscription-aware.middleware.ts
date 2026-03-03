import rateLimit from "express-rate-limit";
import { AuthRequest } from "@/types";

export const subscriptionAwareUploadLimit = rateLimit({
  windowMs: 60 * 1000,
  max: 15,
  keyGenerator: (req: AuthRequest) => `user:${req.user?.id || "anonymous"}`,
  message: { success: false, error: { code: "UPLOAD_RATE_LIMIT_EXCEEDED", message: "Upload rate limit exceeded." } },
  standardHeaders: true,
  legacyHeaders: false,
});

export const subscriptionAwareCreationLimit = rateLimit({
  windowMs: 60 * 1000,
  max: 25,
  keyGenerator: (req: AuthRequest) => `user:${req.user?.id || "anonymous"}`,
  message: { success: false, error: { code: "CREATION_RATE_LIMIT_EXCEEDED", message: "Creation rate limit exceeded." } },
  standardHeaders: true,
  legacyHeaders: false,
});
