import { Iteration, MessageRole } from '../../../../shared/types';

export class ChatMessage {
  constructor(
    public id: string,
    public conversationId: string,
    public userId: string | null,
    public sessionId: string | null,
    public role: MessageRole,
    public content: string,
    public tokens: number = 0,
    public language: string = 'english',
    public inputType: string = 'text',
    public iterations?: Iteration[],
    public createdAt: Date = new Date()
  ) {}

  isUserMessage(): boolean {
    return this.role === MessageRole.USER;
  }

  isAssistantMessage(): boolean {
    return this.role === MessageRole.ASSISTANT;
  }
}

