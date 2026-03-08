import { Router } from 'express';
import { getContainer } from '../container';
import { validate } from '../middlewares/validation/validate.middleware';
import { authenticate } from '../middlewares/auth/auth.middleware';
import { updateProfileSchema, changePasswordSchema } from '../validators/user/user.validator';

const router = Router();

// Lazy getter for controller
const getController = () => getContainer().profileController;

// All routes require authentication
router.use(authenticate);

router.get('/profile', (req, res, next) => getController().getProfile(req, res, next));
router.put('/profile', validate(updateProfileSchema), (req, res, next) => getController().updateProfile(req, res, next));
router.put('/change-password', validate(changePasswordSchema), (req, res, next) => getController().changePassword(req, res, next));
router.delete('/account', (req, res, next) => getController().deleteAccount(req, res, next));

export default router;
