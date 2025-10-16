import { IUserRepository } from '../../users/domain/repositories/IUserRepository';
import { ISessionRepository } from '../../sessions/domain/repositories/ISessionRepository';
import { databaseService } from '../../../config/database';
import { QuotaExceededError } from '../../../shared/errors';
import { QuotaInfo, UsageStats } from '../../../shared/types';
import { getFirstDayOfNextMonth } from '../../../shared/utils';

export class QuotaService {
  private get prisma() {
    return databaseService.getClient();
  }
  constructor(
    private userRepository: IUserRepository,
    private sessionRepository: ISessionRepository
  ) {}

  async checkQuota(userId?: string, sessionId?: string): Promise<QuotaInfo> {
    if (!userId && sessionId) {
      const session = await this.sessionRepository.findById(sessionId);
      if (!session) {
        throw new QuotaExceededError('Invalid session');
      }

      if (!session.canCreateConversation()) {
        throw new QuotaExceededError(
          "You've used all 3 free conversations. Sign up to continue!",
          {
            conversationsUsed: session.conversationsUsed,
            conversationsLimit: session.conversationsLimit,
          }
        );
      }

      return {
        type: 'session',
        remaining: session.remaining,
        total: session.conversationsLimit,
        message: `You have ${session.remaining} free conversation(s) remaining`,
      };
    }

    if (userId) {
      const user = await this.userRepository.findById(userId);
      if (!user) {
        throw new QuotaExceededError('User not found');
      }

      if (user.needsQuotaReset()) {
        await this.userRepository.resetFreeQuota(userId);
        user.resetFreeQuota();
      }

      if (user.canUseFreeQuota()) {
        return {
          type: 'free',
          remaining: user.freeQuotaLimit - user.freeQuotaUsed,
          total: user.freeQuotaLimit,
          message: `You have ${user.freeQuotaLimit - user.freeQuotaUsed} free message(s) remaining this month`,
        };
      }

      const activeSubscriptions = await this.prisma.subscription.findMany({
        where: {
          userId,
          isActive: true,
          endDate: {
            gte: new Date(),
          },
        },
        orderBy: [
          { maxMessages: 'desc' }, 
          { usedMessages: 'asc' }, 
        ],
      });

      for (const sub of activeSubscriptions) {
        if (sub.maxMessages === -1) {
          return {
            type: 'subscription',
            remaining: -1,
            total: -1,
            message: `Unlimited messages (${sub.tier} plan)`,
          };
        }

        if (sub.usedMessages < sub.maxMessages) {
          return {
            type: 'subscription',
            remaining: sub.maxMessages - sub.usedMessages,
            total: sub.maxMessages,
            message: `${sub.maxMessages - sub.usedMessages} messages remaining (${sub.tier} plan)`,
          };
        }
      }

      throw new QuotaExceededError(
        'No available quota. Please upgrade your plan to continue.',
        { freeQuotaUsed: user.freeQuotaUsed, subscriptions: activeSubscriptions.length }
      );
    }

    throw new QuotaExceededError('Authentication or session required');
  }

  async deductUsage(userId?: string, sessionId?: string): Promise<void> {
    if (!userId && sessionId) {
      await this.sessionRepository.incrementUsage(sessionId);
      return;
    }

    if (userId) {
      const user = await this.userRepository.findById(userId);
      if (!user) return;

      if (user.canUseFreeQuota()) {
        await this.userRepository.incrementFreeQuota(userId);
        return;
      }

      const activeSubscriptions = await this.prisma.subscription.findMany({
        where: {
          userId,
          isActive: true,
          endDate: {
            gte: new Date(),
          },
        },
        orderBy: [
          { maxMessages: 'desc' },
          { usedMessages: 'asc' },
        ],
      });

      for (const sub of activeSubscriptions) {
        if (sub.maxMessages === -1 || sub.usedMessages < sub.maxMessages) {
          await this.prisma.subscription.update({
            where: { id: sub.id },
            data: {
              usedMessages: {
                increment: 1,
              },
            },
          });
          return;
        }
      }
    }
  }

  async getUsageStats(userId?: string, sessionId?: string): Promise<UsageStats> {
    if (!userId && sessionId) {
      const session = await this.sessionRepository.findById(sessionId);
      if (!session) {
        throw new Error('Session not found');
      }

      return {
        userType: 'anonymous',
        sessionQuota: {
          used: session.conversationsUsed,
          limit: session.conversationsLimit,
          remaining: session.remaining,
        },
        message: 'Sign up to get 3 free messages per month and access to premium plans!',
      };
    }

    if (userId) {
      const user = await this.userRepository.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      const subscriptions = await this.prisma.subscription.findMany({
        where: {
          userId,
          isActive: true,
          endDate: {
            gte: new Date(),
          },
        },
      });

      const totalConversations = await this.prisma.conversation.count({
        where: { userId },
      });

      return {
        userType: 'authenticated',
        freeQuota: {
          used: user.freeQuotaUsed,
          limit: user.freeQuotaLimit,
          remaining: user.freeQuotaLimit - user.freeQuotaUsed,
          resetsOn: getFirstDayOfNextMonth(),
        },
        subscriptions: subscriptions.map((sub: any) => ({
          tier: sub.tier,
          used: sub.usedMessages,
          limit: sub.maxMessages,
          remaining: sub.maxMessages === -1 ? -1 : sub.maxMessages - sub.usedMessages,
          endsAt: sub.endDate,
        })),
        totalConversations,
      };
    }

    throw new Error('Authentication required');
  }
}

