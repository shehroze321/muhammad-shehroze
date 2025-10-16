import { Router } from 'express';
import { AuthController } from './AuthController';
import { AuthService } from '../application/AuthService';
import { UserRepository } from '../infrastructure/UserRepository';
import { authenticate } from '../../../shared/middleware/auth';
import { validate } from '../../../shared/middleware/validate';
import { registerSchema, loginSchema, updateProfileSchema } from './auth.validation';

const router = Router();

const userRepository = new UserRepository();
const authService = new AuthService(userRepository);
const authController = new AuthController(authService);

// Public routes
router.post('/register', validate(registerSchema), authController.register);
router.post('/login', validate(loginSchema), authController.login);
router.post('/verify-email', authController.verifyEmail);
router.post('/resend-verification', authController.resendVerification);

// Protected routes
router.get('/me', authenticate, authController.getProfile);
router.patch('/profile', authenticate, validate(updateProfileSchema), authController.updateProfile);
router.post('/logout', authenticate, authController.logout);

export default router;

