import { Response, NextFunction } from 'express';
import { ConversationService } from '../application/ConversationService';
import { successResponse } from '../../../shared/utils';
import { AuthRequest } from '../../../shared/types';

export class ConversationController {
  constructor(private conversationService: ConversationService) {}

  createConversation = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { title } = req.body;
      const userId = req.user?.id;
      const sessionId = req.sessionId;

      const conversation = await this.conversationService.createConversation(
        userId,
        sessionId,
        title
      );

      res.status(201).json(successResponse(conversation));
    } catch (error) {
      next(error);
    }
  };

  getConversations = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id;
      const sessionId = req.sessionId;
      const { search, page = 1, limit = 20 } = req.query;

      let result;

      if (userId) {
        result = await this.conversationService.getUserConversations(
          userId,
          {
            search: search as string,
            page: parseInt(page as string),
            limit: parseInt(limit as string),
          }
        );
      } else if (sessionId) {
        result = await this.conversationService.getSessionConversations(
          sessionId,
          {
            search: search as string,
            page: parseInt(page as string),
            limit: parseInt(limit as string),
          }
        );
      } else {
        res.status(200).json(successResponse({ 
          conversations: [], 
          total: 0,
          page: 1,
          totalPages: 0,
          hasMore: false
        }));
        return;
      }

      res.status(200).json(
        successResponse({
          conversations: result.conversations,
          total: result.total,
          page: result.page,
          totalPages: result.totalPages,
          hasMore: result.hasMore,
        })
      );
    } catch (error) {
      next(error);
    }
  };

  getConversation = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const userId = req.user?.id;
      const sessionId = req.sessionId;

      const conversation = await this.conversationService.getConversation(
        id,
        userId,
        sessionId
      );

      res.status(200).json(successResponse(conversation));
    } catch (error) {
      next(error);
    }
  };

  updateConversation = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const { title } = req.body;
      const userId = req.user?.id;
      const sessionId = req.sessionId;

      const conversation = await this.conversationService.updateConversationTitle(
        id,
        title,
        userId,
        sessionId
      );

      res.status(200).json(successResponse(conversation));
    } catch (error) {
      next(error);
    }
  };

  deleteConversation = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const userId = req.user?.id;
      const sessionId = req.sessionId;

      await this.conversationService.deleteConversation(id, userId, sessionId);

      res.status(200).json(successResponse(null, 'Conversation deleted successfully'));
    } catch (error) {
      next(error);
    }
  };
}

