import { Conversation } from '../entities/Conversation.entity';

export interface IConversationRepository {
  create(data: {
    userId?: string;
    sessionId?: string;
    title?: string;
    isAnonymous?: boolean;
  }): Promise<Conversation>;

  findById(id: string): Promise<Conversation | null>;

  findByUserId(
    userId: string,
    options?: {
      search?: string;
      page?: number;
      limit?: number;
    }
  ): Promise<{
    conversations: Conversation[];
    total: number;
    page: number;
    totalPages: number;
    hasMore: boolean;
  }>;

  findBySessionId(
    sessionId: string,
    options?: {
      search?: string;
      page?: number;
      limit?: number;
    }
  ): Promise<{
    conversations: Conversation[];
    total: number;
    page: number;
    totalPages: number;
    hasMore: boolean;
  }>;

  update(
    id: string,
    data: Partial<{
      title: string;
      messageCount: number;
    }>
  ): Promise<Conversation>;

  delete(id: string): Promise<void>;

  incrementMessageCount(conversationId: string): Promise<void>;
}

