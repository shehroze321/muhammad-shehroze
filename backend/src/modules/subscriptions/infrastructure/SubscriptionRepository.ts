import { databaseService } from '../../../config/database';
import { Subscription } from '../domain/entities/Subscription.entity';
import { ISubscriptionRepository } from '../domain/repositories/ISubscriptionRepository';
import { SubscriptionTier, BillingCycle } from '../../../shared/types';

export class SubscriptionRepository implements ISubscriptionRepository {
  private get prisma() {
    return databaseService.getClient();
  }
  async create(data: {
    userId: string;
    planId?: string;
    tier: string;
    maxMessages: number;
    price: number;
    billingCycle: string;
    autoRenew?: boolean;
    startDate: Date;
    endDate: Date;
  }): Promise<Subscription> {
    const subscription = await this.prisma.subscription.create({
      data: {
        userId: data.userId,
        planId: data.planId || null,
        tier: data.tier,
        maxMessages: data.maxMessages,
        price: data.price,
        billingCycle: data.billingCycle,
        autoRenew: data.autoRenew ?? true,
        isActive: true,
        startDate: data.startDate,
        endDate: data.endDate,
        renewalDate: data.endDate,
      },
    });

    return this.toEntity(subscription);
  }

  async findById(id: string): Promise<Subscription | null> {
    const subscription = await this.prisma.subscription.findUnique({
      where: { id },
    });

    return subscription ? this.toEntity(subscription) : null;
  }

  async findByUserId(userId: string): Promise<Subscription[]> {
    const subscriptions = await this.prisma.subscription.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    return subscriptions.map((s) => this.toEntity(s));
  }

  async findActiveByUserId(userId: string): Promise<Subscription[]> {
    const subscriptions = await this.prisma.subscription.findMany({
      where: {
        userId,
        isActive: true,
        endDate: {
          gte: new Date(),
        },
      },
      orderBy: [{ maxMessages: 'desc' }, { usedMessages: 'asc' }],
    });

    return subscriptions.map((s) => this.toEntity(s));
  }

  async update(
    id: string,
    data: Partial<{
      autoRenew: boolean;
      isActive: boolean;
      usedMessages: number;
      renewalDate: Date;
      endDate: Date;
    }>
  ): Promise<Subscription> {
    const subscription = await this.prisma.subscription.update({
      where: { id },
      data,
    });

    return this.toEntity(subscription);
  }

  async incrementUsage(subscriptionId: string): Promise<void> {
    await this.prisma.subscription.update({
      where: { id: subscriptionId },
      data: {
        usedMessages: {
          increment: 1,
        },
      },
    });
  }

  async findDueForRenewal(): Promise<Subscription[]> {
    const now = new Date();

    const subscriptions = await this.prisma.subscription.findMany({
      where: {
        isActive: true,
        autoRenew: true,
        renewalDate: {
          lte: now,
        },
      },
    });

    return subscriptions.map((s) => this.toEntity(s));
  }

  async markInactive(subscriptionId: string): Promise<void> {
    await this.prisma.subscription.update({
      where: { id: subscriptionId },
      data: {
        isActive: false,
        autoRenew: false,
      },
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.subscription.delete({
      where: { id },
    });
  }

  private toEntity(data: any): Subscription {
    return new Subscription(
      data.id,
      data.userId,
      data.planId || null,
      data.tier as SubscriptionTier,
      data.maxMessages,
      data.usedMessages,
      Number(data.price),
      data.billingCycle as BillingCycle,
      data.autoRenew,
      data.isActive,
      data.startDate,
      data.endDate,
      data.renewalDate,
      data.stripeSubId,
      data.createdAt,
      data.updatedAt
    );
  }
}

