import { IConversationRepository } from '../domain/repositories/IConversationRepository';
import { Conversation } from '../domain/entities/Conversation.entity';
import { NotFoundError, ForbiddenError } from '../../../shared/errors';
import { generateConversationTitle } from '../../../shared/utils';

export class ConversationService {
  constructor(private conversationRepository: IConversationRepository) {}

  async createConversation(
    userId?: string,
    sessionId?: string,
    title?: string
  ): Promise<Conversation> {
    const conversation = await this.conversationRepository.create({
      userId,
      sessionId,
      title,
      isAnonymous: !userId && !!sessionId,
    });

    return conversation;
  }

  async getConversation(
    conversationId: string,
    userId?: string,
    sessionId?: string
  ): Promise<Conversation> {
    const conversation = await this.conversationRepository.findById(conversationId);

    if (!conversation) {
      throw new NotFoundError('Conversation');
    }

    if (!conversation.canAccess(userId, sessionId)) {
      throw new ForbiddenError('You do not have access to this conversation');
    }

    return conversation;
  }

  async getUserConversations(
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
  }> {
    const result = await this.conversationRepository.findByUserId(userId, options);
    return result;
  }

  async getSessionConversations(
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
  }> {
    const result = await this.conversationRepository.findBySessionId(sessionId, options);
    return result;
  }

  async updateConversationTitle(
    conversationId: string,
    title: string,
    userId?: string,
    sessionId?: string
  ): Promise<Conversation> {
    await this.getConversation(conversationId, userId, sessionId);

    const conversation = await this.conversationRepository.update(conversationId, {
      title,
    });

    return conversation;
  }

  async deleteConversation(
    conversationId: string,
    userId?: string,
    sessionId?: string
  ): Promise<void> {
    await this.getConversation(conversationId, userId, sessionId);

    await this.conversationRepository.delete(conversationId);
  }

  async autoGenerateTitle(conversationId: string, firstMessage: string): Promise<void> {
    const title = generateConversationTitle(firstMessage);
    await this.conversationRepository.update(conversationId, { title });
  }
}

