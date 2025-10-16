export class User {
  constructor(
    public id: string,
    public email: string,
    public password: string,
    public name: string,
    public isEmailVerified: boolean = false,
    public emailVerifiedAt?: Date,
    public freeQuotaUsed: number = 0,
    public freeQuotaLimit: number = 3,
    public lastQuotaReset: Date = new Date(),
    public stripeCustomerId?: string,
    public createdAt: Date = new Date(),
    public updatedAt: Date = new Date()
  ) {}

  // Check if user can use free quota
  canUseFreeQuota(): boolean {
    return this.freeQuotaUsed < this.freeQuotaLimit;
  }

  // Increment free quota usage
  incrementFreeQuota(): void {
    if (this.canUseFreeQuota()) {
      this.freeQuotaUsed += 1;
    }
  }

  // Reset free quota
  resetFreeQuota(): void {
    this.freeQuotaUsed = 0;
    this.lastQuotaReset = new Date();
  }

  // Check if quota reset is needed
  needsQuotaReset(): boolean {
    const now = new Date();
    const lastReset = new Date(this.lastQuotaReset);

    return (
      now.getMonth() !== lastReset.getMonth() ||
      now.getFullYear() !== lastReset.getFullYear()
    );
  }
}

