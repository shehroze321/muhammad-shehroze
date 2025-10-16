export class SubscriptionPlan {
  constructor(
    public id: string,
    public tier: string,
    public name: string,
    public maxMessages: number,
    public monthlyPrice: number,
    public yearlyPrice: number,
    public features: string[],
    public isActive: boolean,
    public createdAt: Date,
    public updatedAt: Date
  ) {}

  getPrice(billingCycle: 'monthly' | 'yearly'): number {
    return billingCycle === 'monthly' ? this.monthlyPrice : this.yearlyPrice;
  }

  isUnlimited(): boolean {
    return this.maxMessages === -1;
  }
}
