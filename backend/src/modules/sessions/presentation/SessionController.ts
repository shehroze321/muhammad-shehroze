import { Request, Response, NextFunction } from 'express';
import { SessionService } from '../application/SessionService';
import { successResponse } from '../../../shared/utils';
import { AuthRequest } from '../../../shared/types';

export class SessionController {
  constructor(private sessionService: SessionService) {}

  createSession = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const session = await this.sessionService.createSession();

      res.status(201).json(
        successResponse({
          sessionId: session.id,
          conversationsUsed: session.conversationsUsed,
          conversationsLimit: session.conversationsLimit,
          expiresAt: session.expiresAt,
        })
      );
    } catch (error) {
      next(error);
    }
  };

  getSession = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { sessionId } = req.params;

      const session = await this.sessionService.getSession(sessionId);

      res.status(200).json(
        successResponse({
          sessionId: session.id,
          conversationsUsed: session.conversationsUsed,
          conversationsLimit: session.conversationsLimit,
          remaining: session.remaining,
          expiresAt: session.expiresAt,
        })
      );
    } catch (error) {
      next(error);
    }
  };

  claimSession = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        throw new Error('User not authenticated');
      }

      const { sessionId } = req.params;

      const conversationsClaimed = await this.sessionService.claimSession(
        sessionId,
        req.user.id
      );

      res.status(200).json(
        successResponse(
          { conversationsClaimed },
          'Anonymous conversations claimed successfully'
        )
      );
    } catch (error) {
      next(error);
    }
  };
}

