import { ISubscriptionRepository } from '../domain/repositories/ISubscriptionRepository';
import { SubscriptionPlanService } from './SubscriptionPlanService';
import { Subscription } from '../domain/entities/Subscription.entity';
import { SubscriptionTier, BillingCycle } from '../../../shared/types';
import { NotFoundError, BadRequestError } from '../../../shared/errors';

export class SubscriptionService {
  constructor(
    private subscriptionRepository: ISubscriptionRepository,
    private subscriptionPlanService: SubscriptionPlanService
  ) {}

  async createSubscription(
    userId: string,
    tier: SubscriptionTier,
    billingCycle: BillingCycle
  ): Promise<Subscription> {
    // Get plan from database
    const plan = await this.subscriptionPlanService.getPlanByTier(tier);
    
    const price = plan.getPrice(billingCycle);
    
    const startDate = new Date();
    const endDate = new Date();

    if (billingCycle === BillingCycle.MONTHLY) {
      endDate.setMonth(endDate.getMonth() + 1);
    } else {
      endDate.setFullYear(endDate.getFullYear() + 1);
    }

    const subscription = await this.subscriptionRepository.create({
      userId,
      planId: plan.id,
      tier,
      maxMessages: plan.maxMessages,
      price,
      billingCycle,
      autoRenew: true,
      startDate,
      endDate,
    });

    return subscription;
  }

  async getUserSubscriptions(userId: string): Promise<Subscription[]> {
    const subscriptions = await this.subscriptionRepository.findByUserId(userId);
    return subscriptions;
  }

  async getActiveSubscriptions(userId: string): Promise<Subscription[]> {
    const subscriptions = await this.subscriptionRepository.findActiveByUserId(userId);
    return subscriptions;
  }

  async toggleAutoRenew(subscriptionId: string, userId: string): Promise<Subscription> {
    const subscription = await this.subscriptionRepository.findById(subscriptionId);

    if (!subscription) {
      throw new NotFoundError('Subscription');
    }

    if (subscription.userId !== userId) {
      throw new BadRequestError('Unauthorized to modify this subscription');
    }

    const updated = await this.subscriptionRepository.update(subscriptionId, {
      autoRenew: !subscription.autoRenew,
    });

    return updated;
  }

  async cancelSubscription(subscriptionId: string, userId: string): Promise<void> {
    const subscription = await this.subscriptionRepository.findById(subscriptionId);

    if (!subscription) {
      throw new NotFoundError('Subscription');
    }

    if (subscription.userId !== userId) {
      throw new BadRequestError('Unauthorized to cancel this subscription');
    }


    await this.subscriptionRepository.update(subscriptionId, {
      autoRenew: false,
    });

    await this.subscriptionRepository.markInactive(subscriptionId);
  }

  async renewSubscription(subscriptionId: string): Promise<Subscription> {
    const subscription = await this.subscriptionRepository.findById(subscriptionId);

    if (!subscription) {
      throw new NotFoundError('Subscription');
    }

    const paymentFailed = Math.random() < 0.2;

    if (paymentFailed) {
      await this.subscriptionRepository.markInactive(subscriptionId);
      throw new BadRequestError('Payment failed. Subscription marked inactive.');
    }

    const newStartDate = new Date(subscription.endDate);
    const newEndDate = new Date(newStartDate);

    if (subscription.billingCycle === BillingCycle.MONTHLY) {
      newEndDate.setMonth(newEndDate.getMonth() + 1);
    } else {
      newEndDate.setFullYear(newEndDate.getFullYear() + 1);
    }

    const renewed = await this.subscriptionRepository.update(subscriptionId, {
      usedMessages: 0,
      endDate: newEndDate,
      renewalDate: newEndDate,
    });

    return renewed;
  }

  async processAutoRenewals(): Promise<{
    renewed: number;
    failed: number;
  }> {
    const dueSubscriptions = await this.subscriptionRepository.findDueForRenewal();

    let renewed = 0;
    let failed = 0;

    for (const subscription of dueSubscriptions) {
      try {
        await this.renewSubscription(subscription.id);
        renewed++;
      } catch (error) {
        failed++;
        console.error(
          `Failed to renew subscription ${subscription.id}:`,
          error instanceof Error ? error.message : 'Unknown error'
        );
      }
    }

    return { renewed, failed };
  }

  async updateSubscription(
    subscriptionId: string,
    userId: string,
    data: Partial<{
      maxMessages: number;
      price: number;
      billingCycle: string;
      autoRenew: boolean;
      endDate: Date;
    }>
  ): Promise<Subscription> {
    const subscription = await this.subscriptionRepository.findById(subscriptionId);

    if (!subscription) {
      throw new NotFoundError('Subscription not found');
    }

    if (subscription.userId !== userId) {
      throw new BadRequestError('Unauthorized to modify this subscription');
    }

    const updateData: any = {};
    if (data.maxMessages !== undefined) updateData.maxMessages = data.maxMessages;
    if (data.price !== undefined) updateData.price = data.price;
    if (data.autoRenew !== undefined) updateData.autoRenew = data.autoRenew;
    if (data.endDate !== undefined) updateData.endDate = data.endDate;

    return await this.subscriptionRepository.update(subscriptionId, updateData);
  }

  async deleteSubscription(subscriptionId: string, userId: string): Promise<void> {
    const subscription = await this.subscriptionRepository.findById(subscriptionId);

    if (!subscription) {
      throw new NotFoundError('Subscription not found');
    }

    if (subscription.userId !== userId) {
      throw new BadRequestError('Unauthorized to delete this subscription');
    }

    await this.subscriptionRepository.delete(subscriptionId);
  }

  async getSubscriptionById(subscriptionId: string, userId: string): Promise<Subscription> {
    const subscription = await this.subscriptionRepository.findById(subscriptionId);

    if (!subscription) {
      throw new NotFoundError('Subscription not found');
    }

    if (subscription.userId !== userId) {
      throw new BadRequestError('Unauthorized to view this subscription');
    }

    return subscription;
  }
}

