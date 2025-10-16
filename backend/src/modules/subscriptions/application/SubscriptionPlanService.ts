import { ISubscriptionPlanRepository } from '../domain/repositories/ISubscriptionPlanRepository';
import { SubscriptionPlan } from '../domain/entities/SubscriptionPlan.entity';
import { BadRequestError, NotFoundError } from '../../../shared/errors';

export class SubscriptionPlanService {
  constructor(private subscriptionPlanRepository: ISubscriptionPlanRepository) {}

  async createPlan(data: {
    tier: string;
    name: string;
    maxMessages: number;
    monthlyPrice: number;
    yearlyPrice: number;
    features: string[];
    isActive?: boolean;
  }): Promise<SubscriptionPlan> {
    const existingPlan = await this.subscriptionPlanRepository.findByTier(data.tier);
    if (existingPlan) {
      throw new BadRequestError('Subscription plan with this tier already exists');
    }

    return await this.subscriptionPlanRepository.create(data);
  }

  async getAllPlans(): Promise<SubscriptionPlan[]> {
    return await this.subscriptionPlanRepository.findAll();
  }

  async getActivePlans(): Promise<SubscriptionPlan[]> {
    return await this.subscriptionPlanRepository.findActive();
  }

  async getPlanById(id: string): Promise<SubscriptionPlan> {
    const plan = await this.subscriptionPlanRepository.findById(id);
    if (!plan) {
      throw new NotFoundError('Subscription plan not found');
    }
    return plan;
  }

  async getPlanByTier(tier: string): Promise<SubscriptionPlan> {
    const plan = await this.subscriptionPlanRepository.findByTier(tier);
    if (!plan) {
      throw new NotFoundError('Subscription plan not found');
    }
    return plan;
  }

  async updatePlan(
    id: string,
    data: Partial<{
      name: string;
      maxMessages: number;
      monthlyPrice: number;
      yearlyPrice: number;
      features: string[];
      isActive: boolean;
    }>
  ): Promise<SubscriptionPlan> {
    const existingPlan = await this.subscriptionPlanRepository.findById(id);
    if (!existingPlan) {
      throw new NotFoundError('Subscription plan not found');
    }

    if (data.name && data.name !== existingPlan.name) {
      const conflictingPlan = await this.subscriptionPlanRepository.findByTier(data.name.toLowerCase());
      if (conflictingPlan && conflictingPlan.id !== id) {
        throw new BadRequestError('A plan with this tier already exists');
      }
    }

    return await this.subscriptionPlanRepository.update(id, data);
  }

  async deletePlan(id: string): Promise<void> {
    const plan = await this.subscriptionPlanRepository.findById(id);
    if (!plan) {
      throw new NotFoundError('Subscription plan not found');
    }

    await this.subscriptionPlanRepository.delete(id);
  }

  async togglePlanStatus(id: string): Promise<SubscriptionPlan> {
    const plan = await this.subscriptionPlanRepository.findById(id);
    if (!plan) {
      throw new NotFoundError('Subscription plan not found');
    }

    return await this.subscriptionPlanRepository.update(id, {
      isActive: !plan.isActive,
    });
  }
}
