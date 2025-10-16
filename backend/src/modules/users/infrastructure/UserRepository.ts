import { databaseService } from '../../../config/database';
import { User } from '../domain/entities/User.entity';
import { IUserRepository } from '../domain/repositories/IUserRepository';
import { getStartOfMonth } from '../../../shared/utils';

export class UserRepository implements IUserRepository {
  private get prisma() {
    return databaseService.getClient();
  }

  async create(data: { email: string; password: string; name: string }): Promise<User> {
    const user = await this.prisma.user.create({
      data,
    });

    return this.toEntity(user);
  }

  async findById(id: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    return user ? this.toEntity(user) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    return user ? this.toEntity(user) : null;
  }

  async update(
    id: string,
    data: Partial<{
      name: string;
      password: string;
      isEmailVerified: boolean;
      emailVerifiedAt: Date;
      freeQuotaUsed: number;
      lastQuotaReset: Date;
      stripeCustomerId: string;
    }>
  ): Promise<User> {
    const user = await this.prisma.user.update({
      where: { id },
      data,
    });

    return this.toEntity(user);
  }

  async incrementFreeQuota(userId: string): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        freeQuotaUsed: {
          increment: 1,
        },
      },
    });
  }

  async resetFreeQuota(userId: string): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        freeQuotaUsed: 0,
        lastQuotaReset: new Date(),
      },
    });
  }

  async findUsersNeedingQuotaReset(): Promise<User[]> {
    const startOfMonth = getStartOfMonth();

    const users = await this.prisma.user.findMany({
      where: {
        lastQuotaReset: {
          lt: startOfMonth,
        },
        freeQuotaUsed: {
          gt: 0,
        },
      },
    });

    return users.map((user: any) => this.toEntity(user));
  }

  async delete(id: string): Promise<void> {
    await this.prisma.user.delete({
      where: { id },
    });
  }

  private toEntity(data: any): User {
    return new User(
      data.id,
      data.email,
      data.password,
      data.name,
      data.isEmailVerified,
      data.emailVerifiedAt,
      data.freeQuotaUsed,
      data.freeQuotaLimit,
      data.lastQuotaReset,
      data.stripeCustomerId,
      data.createdAt,
      data.updatedAt
    );
  }
}

