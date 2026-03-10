import { Router } from "express";
import { getContainer } from "../container";
import { validate } from "../middlewares/validation/validate.middleware";
import { authenticate } from "../middlewares/auth/auth.middleware";
import {
  registerSchema,
  loginSchema,
  verifyEmailSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  refreshTokenSchema,
} from "../validators/auth/auth.validator";

const router = Router();

// Lazy getter for controller
const getController = () => getContainer().authController;

router.post("/register", validate(registerSchema), (req, res, next) =>
  getController().register(req, res, next),
);
router.post("/login", validate(loginSchema), (req, res, next) =>
  getController().login(req, res, next),
);
router.post("/logout", (req, res, next) =>
  getController().logout(req, res, next),
);
router.post("/verify-email", validate(verifyEmailSchema), (req, res, next) =>
  getController().verifyEmail(req, res, next),
);
router.post(
  "/forgot-password",
  validate(forgotPasswordSchema),
  (req, res, next) => getController().forgotPassword(req, res, next),
);
router.post(
  "/reset-password",
  validate(resetPasswordSchema),
  (req, res, next) => getController().resetPassword(req, res, next),
);
router.post("/refresh-token", validate(refreshTokenSchema), (req, res, next) =>
  getController().refreshToken(req, res, next),
);
router.get("/me", authenticate, (req, res, next) =>
  getController().getMe(req, res, next),
);

export default router;
