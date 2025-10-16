import { Response, NextFunction } from 'express';
import { ChatService } from '../application/ChatService';
import { QuotaService } from '../application/QuotaService';
import { successResponse } from '../../../shared/utils';
import { AuthRequest } from '../../../shared/types';

export class ChatController {
  constructor(
    private chatService: ChatService,
    private quotaService: QuotaService
  ) {}

  sendMessage = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const conversationId = req.params.conversationId || req.body.conversationId;
      const { content, language = 'english', inputType = 'text' } = req.body;
      const userId = req.user?.id;
      const sessionId = req.sessionId;

      if (!conversationId) {
        res.status(400).json({
          success: false,
          error: { code: 'VALIDATION_ERROR', message: 'conversationId is required' }
        });
        return;
      }

      const result = await this.chatService.sendMessage(
        conversationId,
        content,
        language,
        inputType,
        userId,
        sessionId
      );

      res.status(201).json(
        successResponse({
          userMessage: {
            id: result.userMessage.id,
            role: result.userMessage.role,
            content: result.userMessage.content,
            createdAt: result.userMessage.createdAt,
          },
          assistantMessage: {
            id: result.assistantMessage.id,
            role: result.assistantMessage.role,
            content: result.assistantMessage.content,
            tokens: result.assistantMessage.tokens,
            iterations: result.assistantMessage.iterations,
            createdAt: result.assistantMessage.createdAt,
          },
          quotaRemaining: result.quotaRemaining,
        })
      );
    } catch (error) {
      next(error);
    }
  };

  getMessages = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { conversationId } = req.params;

      const messages = await this.chatService.getConversationMessages(conversationId);

      res.status(200).json(
        successResponse({
          conversation: {
            id: conversationId,
          },
          messages: messages.map((msg) => ({
            id: msg.id,
            role: msg.role,
            content: msg.content,
            tokens: msg.tokens,
            iterations: msg.iterations,
            createdAt: msg.createdAt,
          })),
        })
      );
    } catch (error) {
      next(error);
    }
  };

  getUsage = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.id;
      const sessionId = req.sessionId;

      const stats = await this.quotaService.getUsageStats(userId, sessionId);

      res.status(200).json(successResponse(stats));
    } catch (error) {
      next(error);
    }
  };
}

