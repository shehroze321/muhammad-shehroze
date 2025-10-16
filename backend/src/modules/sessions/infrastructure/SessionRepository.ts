import { databaseService } from '../../../config/database';
import { AnonymousSession } from '../domain/entities/AnonymousSession.entity';
import { ISessionRepository } from '../domain/repositories/ISessionRepository';
import { calculateExpiryDate } from '../../../shared/utils';
import { config } from '../../../config/env';

export class SessionRepository implements ISessionRepository {
  private get prisma() {
    return databaseService.getClient();
  }
  async create(expiryDays: number = config.anonymousSessionExpiryDays): Promise<AnonymousSession> {
    const session = await this.prisma.anonymousSession.create({
      data: {
        expiresAt: calculateExpiryDate(expiryDays),
        conversationsLimit: config.freeConversationsLimit,
      },
    });

    return this.toEntity(session);
  }

  async findById(id: string): Promise<AnonymousSession | null> {
    const session = await this.prisma.anonymousSession.findUnique({
      where: { id },
    });

    return session ? this.toEntity(session) : null;
  }

  async update(
    id: string,
    data: Partial<AnonymousSession>
  ): Promise<AnonymousSession> {
    const session = await this.prisma.anonymousSession.update({
      where: { id },
      data,
    });

    return this.toEntity(session);
  }

  async incrementUsage(sessionId: string): Promise<void> {
    await this.prisma.anonymousSession.update({
      where: { id: sessionId },
      data: {
        conversationsUsed: {
          increment: 1,
        },
      },
    });
  }

  async claimSession(sessionId: string, userId: string): Promise<void> {
    await this.prisma.$transaction([
      this.prisma.conversation.updateMany({
        where: { sessionId },
        data: {
          userId,
          sessionId: null,
          isAnonymous: false,
        },
      }),
      this.prisma.chatMessage.updateMany({
        where: { sessionId },
        data: {
          userId,
          sessionId: null,
        },
      }),
    ]);
  }

  async deleteExpiredSessions(): Promise<number> {
    const result = await this.prisma.anonymousSession.deleteMany({
      where: {
        expiresAt: {
          lt: new Date(),
        },
      },
    });

    return result.count;
  }

  private toEntity(data: any): AnonymousSession {
    return new AnonymousSession(
      data.id,
      data.conversationsUsed,
      data.conversationsLimit,
      data.expiresAt,
      data.createdAt
    );
  }
}

