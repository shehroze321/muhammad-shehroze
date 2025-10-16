import { ChatMessage } from '../entities/ChatMessage.entity';
import { Iteration } from '../../../../shared/types';

export interface IChatRepository {
  create(data: {
    conversationId: string;
    userId?: string;
    sessionId?: string;
    role: string;
    content: string;
    tokens?: number;
    language?: string;
    inputType?: string;
    iterations?: Iteration[];
  }): Promise<ChatMessage>;

  findByConversationId(conversationId: string): Promise<ChatMessage[]>;

  findByUserId(userId: string): Promise<ChatMessage[]>;

  countByUserAndMonth(userId: string, month: Date): Promise<number>;
}

