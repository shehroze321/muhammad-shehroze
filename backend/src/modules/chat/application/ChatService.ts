import { IChatRepository } from '../domain/repositories/IChatRepository';
import { IConversationRepository } from '../../conversations/domain/repositories/IConversationRepository';
import { OpenAIService } from './OpenAIService';
import { QuotaService } from './QuotaService';
import { ChatMessage } from '../domain/entities/ChatMessage.entity';
import { GenerationResult, MessageRole } from '../../../shared/types';
import { generateConversationTitle } from '../../../shared/utils';

export class ChatService {
  constructor(
    private chatRepository: IChatRepository,
    private conversationRepository: IConversationRepository,
    private openAIService: OpenAIService,
    private quotaService: QuotaService
  ) {}

  async sendMessage(
    conversationId: string,
    content: string,
    language: string,
    inputType: string,
    userId?: string,
    sessionId?: string
  ): Promise<{
    userMessage: ChatMessage;
    assistantMessage: ChatMessage;
    quotaRemaining: any;
  }> {
    await this.quotaService.checkQuota(userId, sessionId);

    const conversation = await this.conversationRepository.findById(conversationId);
    if (!conversation) {
      throw new Error('Conversation not found');
    }

    if (!conversation.canAccess(userId, sessionId)) {
      throw new Error('Access denied to this conversation');
    }

    const userMessage = await this.chatRepository.create({
      conversationId,
      userId,
      sessionId,
      role: MessageRole.USER,
      content,
      language,
      inputType,
    });

    const result: GenerationResult = await this.openAIService.runGenerationCycle(
      content,
      language
    );

    const assistantMessage = await this.chatRepository.create({
      conversationId,
      userId,
      sessionId,
      role: MessageRole.ASSISTANT,
      content: result.finalPost,
      tokens: result.tokens,
      language,
      inputType: 'text',
      iterations: result.iterations,
    });

    await this.conversationRepository.incrementMessageCount(conversationId);

    if (conversation.messageCount === 0) {
      const title = generateConversationTitle(content);
      await this.conversationRepository.update(conversationId, { title });
    }

    await this.quotaService.deductUsage(userId, sessionId);

    const updatedQuotaInfo = await this.quotaService.checkQuota(userId, sessionId);

    return {
      userMessage,
      assistantMessage,
      quotaRemaining: updatedQuotaInfo,
    };
  }

  async getConversationMessages(conversationId: string): Promise<ChatMessage[]> {
    const messages = await this.chatRepository.findByConversationId(conversationId);
    return messages;
  }
}

