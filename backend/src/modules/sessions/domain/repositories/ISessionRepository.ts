import { AnonymousSession } from '../entities/AnonymousSession.entity';

export interface ISessionRepository {
  create(expiryDays: number): Promise<AnonymousSession>;
  findById(id: string): Promise<AnonymousSession | null>;
  update(id: string, data: Partial<AnonymousSession>): Promise<AnonymousSession>;
  incrementUsage(sessionId: string): Promise<void>;
  claimSession(sessionId: string, userId: string): Promise<void>;
  deleteExpiredSessions(): Promise<number>;
}

