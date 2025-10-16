import { SubscriptionPlan } from '../entities/SubscriptionPlan.entity';

export interface ISubscriptionPlanRepository {
  create(data: {
    tier: string;
    name: string;
    maxMessages: number;
    monthlyPrice: number;
    yearlyPrice: number;
    features: string[];
    isActive?: boolean;
  }): Promise<SubscriptionPlan>;

  findById(id: string): Promise<SubscriptionPlan | null>;

  findByTier(tier: string): Promise<SubscriptionPlan | null>;

  findAll(): Promise<SubscriptionPlan[]>;

  findActive(): Promise<SubscriptionPlan[]>;

  update(
    id: string,
    data: Partial<{
      name: string;
      maxMessages: number;
      monthlyPrice: number;
      yearlyPrice: number;
      features: string[];
      isActive: boolean;
    }>
  ): Promise<SubscriptionPlan>;

  delete(id: string): Promise<void>;
}
