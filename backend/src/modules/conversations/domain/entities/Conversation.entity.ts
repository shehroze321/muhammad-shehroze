export class Conversation {
  constructor(
    public id: string,
    public userId: string | null,
    public sessionId: string | null,
    public title: string = 'New Conversation',
    public isAnonymous: boolean = false,
    public messageCount: number = 0,
    public createdAt: Date = new Date(),
    public updatedAt: Date = new Date()
  ) {}

  belongsToUser(userId: string): boolean {
    return this.userId === userId;
  }

  belongsToSession(sessionId: string): boolean {
    return this.sessionId === sessionId;
  }

  canAccess(userId?: string, sessionId?: string): boolean {
    if (userId && this.userId === userId) return true;
    if (sessionId && this.sessionId === sessionId) return true;
    return false;
  }

  incrementMessageCount(): void {
    this.messageCount += 1;
    this.updatedAt = new Date();
  }
}

