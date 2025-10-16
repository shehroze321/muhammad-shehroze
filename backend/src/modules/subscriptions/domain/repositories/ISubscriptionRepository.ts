import { Subscription } from '../entities/Subscription.entity';

export interface ISubscriptionRepository {
  create(data: {
    userId: string;
    planId?: string;
    tier: string;
    maxMessages: number;
    price: number;
    billingCycle: string;
    autoRenew?: boolean;
    startDate: Date;
    endDate: Date;
  }): Promise<Subscription>;

  findById(id: string): Promise<Subscription | null>;

  findByUserId(userId: string): Promise<Subscription[]>;

  findActiveByUserId(userId: string): Promise<Subscription[]>;

  update(
    id: string,
    data: Partial<{
      autoRenew: boolean;
      isActive: boolean;
      usedMessages: number;
      renewalDate: Date;
      endDate: Date;
    }>
  ): Promise<Subscription>;

  incrementUsage(subscriptionId: string): Promise<void>;

  findDueForRenewal(): Promise<Subscription[]>;

  markInactive(subscriptionId: string): Promise<void>;

  delete(id: string): Promise<void>;
}

