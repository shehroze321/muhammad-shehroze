import { SubscriptionTier, BillingCycle } from '../../../../shared/types';

export class Subscription {
  constructor(
    public id: string,
    public userId: string,
    public planId: string | null,
    public tier: SubscriptionTier,
    public maxMessages: number,
    public usedMessages: number,
    public price: number,
    public billingCycle: BillingCycle,
    public autoRenew: boolean,
    public isActive: boolean,
    public startDate: Date,
    public endDate: Date,
    public renewalDate: Date | null,
    public stripeSubId: string | null,
    public createdAt: Date,
    public updatedAt: Date
  ) {}

  hasQuota(): boolean {
    return this.maxMessages === -1 || this.usedMessages < this.maxMessages;
  }

  isExpired(): boolean {
    return new Date() > this.endDate;
  }

  get remaining(): number {
    if (this.maxMessages === -1) return -1;
    return Math.max(0, this.maxMessages - this.usedMessages);
  }
}

