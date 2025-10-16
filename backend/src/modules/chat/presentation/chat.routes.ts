import { Router } from 'express';
import { ChatController } from './ChatController';
import { ChatService } from '../application/ChatService';
import { OpenAIService } from '../application/OpenAIService';
import { QuotaService } from '../application/QuotaService';
import { ChatRepository } from '../infrastructure/ChatRepository';
import { ConversationRepository } from '../../conversations/infrastructure/ConversationRepository';
import { UserRepository } from '../../users/infrastructure/UserRepository';
import { SessionRepository } from '../../sessions/infrastructure/SessionRepository';
import { requireAuthOrSession } from '../../../shared/middleware/auth';

const router = Router();

const chatRepository = new ChatRepository();
const conversationRepository = new ConversationRepository();
const userRepository = new UserRepository();
const sessionRepository = new SessionRepository();

const openAIService = new OpenAIService();
const quotaService = new QuotaService(userRepository, sessionRepository);
const chatService = new ChatService(
  chatRepository,
  conversationRepository,
  openAIService,
  quotaService
);

const chatController = new ChatController(chatService, quotaService);

router.post(
  '/conversations/:conversationId/messages',
  requireAuthOrSession,
  chatController.sendMessage
);

router.get(
  '/conversations/:conversationId/messages',
  requireAuthOrSession,
  chatController.getMessages
);

router.get('/usage', requireAuthOrSession, chatController.getUsage);
router.get('/quota', requireAuthOrSession, chatController.getUsage);

// Direct message endpoint
router.post('/messages', requireAuthOrSession, chatController.sendMessage);

export default router;

