import { databaseService } from '../../../config/database';
import { SubscriptionPlan } from '../domain/entities/SubscriptionPlan.entity';
import { ISubscriptionPlanRepository } from '../domain/repositories/ISubscriptionPlanRepository';

export class SubscriptionPlanRepository implements ISubscriptionPlanRepository {
  private get prisma() {
    return databaseService.getClient();
  }
  async create(data: {
    tier: string;
    name: string;
    maxMessages: number;
    monthlyPrice: number;
    yearlyPrice: number;
    features: string[];
    isActive?: boolean;
  }): Promise<SubscriptionPlan> {
    const plan = await this.prisma.subscriptionPlan.create({
      data: {
        tier: data.tier,
        name: data.name,
        maxMessages: data.maxMessages,
        monthlyPrice: data.monthlyPrice,
        yearlyPrice: data.yearlyPrice,
        features: JSON.stringify(data.features),
        isActive: data.isActive ?? true,
      },
    });

    return this.toEntity(plan);
  }

  async findById(id: string): Promise<SubscriptionPlan | null> {
    const plan = await this.prisma.subscriptionPlan.findUnique({
      where: { id },
    });

    return plan ? this.toEntity(plan) : null;
  }

  async findByTier(tier: string): Promise<SubscriptionPlan | null> {
    const plan = await this.prisma.subscriptionPlan.findUnique({
      where: { tier },
    });

    return plan ? this.toEntity(plan) : null;
  }

  async findAll(): Promise<SubscriptionPlan[]> {
    const plans = await this.prisma.subscriptionPlan.findMany({
      orderBy: { createdAt: 'asc' },
    });

    return plans.map((plan) => this.toEntity(plan));
  }

  async findActive(): Promise<SubscriptionPlan[]> {
    const plans = await this.prisma.subscriptionPlan.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'asc' },
    });

    return plans.map((plan) => this.toEntity(plan));
  }

  async update(
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
    const updateData: any = { ...data };
    
    if (data.features) {
      updateData.features = JSON.stringify(data.features);
    }

    const plan = await this.prisma.subscriptionPlan.update({
      where: { id },
      data: updateData,
    });

    return this.toEntity(plan);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.subscriptionPlan.delete({
      where: { id },
    });
  }

  private toEntity(plan: any): SubscriptionPlan {
    return new SubscriptionPlan(
      plan.id,
      plan.tier,
      plan.name,
      plan.maxMessages,
      plan.monthlyPrice,
      plan.yearlyPrice,
      JSON.parse(plan.features || '[]'),
      plan.isActive,
      plan.createdAt,
      plan.updatedAt
    );
  }
}
