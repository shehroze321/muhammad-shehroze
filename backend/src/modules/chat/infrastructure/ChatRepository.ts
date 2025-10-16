import { databaseService } from '../../../config/database';
import { ChatMessage } from '../domain/entities/ChatMessage.entity';
import { IChatRepository } from '../domain/repositories/IChatRepository';
import { Iteration, MessageRole } from '../../../shared/types';
import { getStartOfMonth, getEndOfMonth } from '../../../shared/utils';

export class ChatRepository implements IChatRepository {
  private get prisma() {
    return databaseService.getClient();
  }
  async create(data: {
    conversationId: string;
    userId?: string;
    sessionId?: string;
    role: string;
    content: string;
    tokens?: number;
    language?: string;
    inputType?: string;
    iterations?: Iteration[];
  }): Promise<ChatMessage> {
    const message = await this.prisma.chatMessage.create({
      data: {
        conversationId: data.conversationId,
        userId: data.userId || null,
        sessionId: data.sessionId || null,
        role: data.role,
        content: data.content,
        tokens: data.tokens || 0,
        language: data.language || 'english',
        inputType: data.inputType || 'text',
        iterations: data.iterations ? (JSON.stringify(data.iterations) as any) : undefined,
      },
    });

    return this.toEntity(message);
  }

  async findByConversationId(conversationId: string): Promise<ChatMessage[]> {
    const messages = await this.prisma.chatMessage.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'asc' },
    });

    return messages.map((m) => this.toEntity(m));
  }

  async findByUserId(userId: string): Promise<ChatMessage[]> {
    const messages = await this.prisma.chatMessage.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    return messages.map((m) => this.toEntity(m));
  }

  async countByUserAndMonth(userId: string, month: Date): Promise<number> {
    const startOfMonth = getStartOfMonth(month);
    const endOfMonth = getEndOfMonth(month);

    const count = await this.prisma.chatMessage.count({
      where: {
        userId,
        role: 'user',
        createdAt: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
      },
    });

    return count;
  }

  private toEntity(data: any): ChatMessage {
    return new ChatMessage(
      data.id,
      data.conversationId,
      data.userId,
      data.sessionId,
      data.role as MessageRole,
      data.content,
      data.tokens,
      data.language,
      data.inputType,
      data.iterations ? JSON.parse(data.iterations as string) : undefined,
      data.createdAt
    );
  }
}

