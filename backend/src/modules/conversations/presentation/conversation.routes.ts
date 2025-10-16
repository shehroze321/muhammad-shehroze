import { Router } from 'express';
import { ConversationController } from './ConversationController';
import { ConversationService } from '../application/ConversationService';
import { ConversationRepository } from '../infrastructure/ConversationRepository';
import { requireAuthOrSession } from '../../../shared/middleware/auth';

const router = Router();

const conversationRepository = new ConversationRepository();
const conversationService = new ConversationService(conversationRepository);
const conversationController = new ConversationController(conversationService);

router.post('/', requireAuthOrSession, conversationController.createConversation);
router.get('/', requireAuthOrSession, conversationController.getConversations);
router.get('/:id', requireAuthOrSession, conversationController.getConversation);
router.patch('/:id', requireAuthOrSession, conversationController.updateConversation);
router.delete('/:id', requireAuthOrSession, conversationController.deleteConversation);

export default router;

