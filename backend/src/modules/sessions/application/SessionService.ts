import { ISessionRepository } from '../domain/repositories/ISessionRepository';
import { AnonymousSession } from '../domain/entities/AnonymousSession.entity';
import { NotFoundError, QuotaExceededError } from '../../../shared/errors';

export class SessionService {
  constructor(private sessionRepository: ISessionRepository) {}

  async createSession(): Promise<AnonymousSession> {
    const session = await this.sessionRepository.create(30); // 30 days expiry
    return session;
  }

  async getSession(sessionId: string): Promise<AnonymousSession> {
    const session = await this.sessionRepository.findById(sessionId);

    if (!session) {
      throw new NotFoundError('Session');
    }

    if (session.isExpired()) {
      throw new QuotaExceededError('Session has expired. Please create a new session.');
    }

    return session;
  }

  async checkQuota(sessionId: string): Promise<boolean> {
    const session = await this.getSession(sessionId);
    return session.canCreateConversation();
  }

  async incrementUsage(sessionId: string): Promise<void> {
    const session = await this.getSession(sessionId);

    if (!session.canCreateConversation()) {
      throw new QuotaExceededError(
        "You've used all 3 free conversations. Sign up to continue!",
        {
          conversationsUsed: session.conversationsUsed,
          conversationsLimit: session.conversationsLimit,
        }
      );
    }

    await this.sessionRepository.incrementUsage(sessionId);
  }

  async claimSession(sessionId: string, userId: string): Promise<number> {
    const session = await this.getSession(sessionId);

    await this.sessionRepository.claimSession(sessionId, userId);

    return session.conversationsUsed;
  }

  async cleanupExpiredSessions(): Promise<number> {
    const deleted = await this.sessionRepository.deleteExpiredSessions();
    return deleted;
  }
}

