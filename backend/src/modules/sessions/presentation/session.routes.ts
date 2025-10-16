import { Router } from 'express';
import { SessionController } from './SessionController';
import { SessionService } from '../application/SessionService';
import { SessionRepository } from '../infrastructure/SessionRepository';
import { authenticate } from '../../../shared/middleware/auth';

const router = Router();

const sessionRepository = new SessionRepository();
const sessionService = new SessionService(sessionRepository);
const sessionController = new SessionController(sessionService);

// Public routes
router.post('/', sessionController.createSession);
router.get('/:sessionId', sessionController.getSession);

// Protected routes
router.post('/:sessionId/claim', authenticate, sessionController.claimSession);

export default router;

