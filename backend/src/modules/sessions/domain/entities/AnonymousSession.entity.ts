export class AnonymousSession {
  constructor(
    public id: string,
    public conversationsUsed: number = 0,
    public conversationsLimit: number = 3,
    public expiresAt: Date,
    public createdAt: Date = new Date()
  ) {}

  canCreateConversation(): boolean {
    return this.conversationsUsed < this.conversationsLimit && !this.isExpired();
  }

  incrementUsage(): void {
    if (this.canCreateConversation()) {
      this.conversationsUsed += 1;
    }
  }

  isExpired(): boolean {
    return new Date() > this.expiresAt;
  }

  get remaining(): number {
    return Math.max(0, this.conversationsLimit - this.conversationsUsed);
  }
}

