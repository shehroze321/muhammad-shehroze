import { databaseService } from '../../../config/database';
import { Conversation } from '../domain/entities/Conversation.entity';
import { IConversationRepository } from '../domain/repositories/IConversationRepository';

export class ConversationRepository implements IConversationRepository {
  private get prisma() {
    return databaseService.getClient();
  }
  async create(data: {
    userId?: string;
    sessionId?: string;
    title?: string;
    isAnonymous?: boolean;
  }): Promise<Conversation> {
    const conversation = await this.prisma.conversation.create({
      data: {
        userId: data.userId || null,
        sessionId: data.sessionId || null,
        title: data.title || 'New Conversation',
        isAnonymous: data.isAnonymous || false,
      },
    });

    return this.toEntity(conversation);
  }

  async findById(id: string): Promise<Conversation | null> {
    const conversation = await this.prisma.conversation.findUnique({
      where: { id },
    });

    return conversation ? this.toEntity(conversation) : null;
  }

  async findByUserId(
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
    const page = options?.page || 1;
    const limit = options?.limit || 20;
    const skip = (page - 1) * limit;

    const whereClause: any = { userId };
    
    if (options?.search) {
      whereClause.title = {
        contains: options.search,
      };
    }

    const [conversations, total] = await Promise.all([
      this.prisma.conversation.findMany({
        where: whereClause,
        orderBy: { updatedAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.conversation.count({
        where: whereClause,
      }),
    ]);

    const totalPages = Math.ceil(total / limit);
    const hasMore = page < totalPages;

    return {
      conversations: conversations.map((c) => this.toEntity(c)),
      total,
      page,
      totalPages,
      hasMore,
    };
  }

  async findBySessionId(
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
    const page = options?.page || 1;
    const limit = options?.limit || 20;
    const skip = (page - 1) * limit;

    const whereClause: any = { sessionId };
    
    if (options?.search) {
      whereClause.title = {
        contains: options.search,
      };
    }

    const [conversations, total] = await Promise.all([
      this.prisma.conversation.findMany({
        where: whereClause,
        orderBy: { updatedAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.conversation.count({
        where: whereClause,
      }),
    ]);

    const totalPages = Math.ceil(total / limit);
    const hasMore = page < totalPages;

    return {
      conversations: conversations.map((c) => this.toEntity(c)),
      total,
      page,
      totalPages,
      hasMore,
    };
  }

  async update(
    id: string,
    data: Partial<{
      title: string;
      messageCount: number;
    }>
  ): Promise<Conversation> {
    const conversation = await this.prisma.conversation.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date(),
      },
    });

    return this.toEntity(conversation);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.conversation.delete({
      where: { id },
    });
  }

  async incrementMessageCount(conversationId: string): Promise<void> {
    await this.prisma.conversation.update({
      where: { id: conversationId },
      data: {
        messageCount: {
          increment: 1,
        },
        updatedAt: new Date(),
      },
    });
  }

  private toEntity(data: any): Conversation {
    return new Conversation(
      data.id,
      data.userId,
      data.sessionId,
      data.title,
      data.isAnonymous,
      data.messageCount,
      data.createdAt,
      data.updatedAt
    );
  }
}

