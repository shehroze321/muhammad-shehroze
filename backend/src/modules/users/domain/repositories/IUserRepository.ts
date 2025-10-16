import { User } from '../entities/User.entity';

export interface IUserRepository {
  create(data: {
    email: string;
    password: string;
    name: string;
  }): Promise<User>;

  findById(id: string): Promise<User | null>;

  findByEmail(email: string): Promise<User | null>;

  update(
    id: string,
    data: Partial<{
      name: string;
      freeQuotaUsed: number;
      lastQuotaReset: Date;
      stripeCustomerId: string;
    }>
  ): Promise<User>;

  incrementFreeQuota(userId: string): Promise<void>;

  resetFreeQuota(userId: string): Promise<void>;

  findUsersNeedingQuotaReset(): Promise<User[]>;

  delete(id: string): Promise<void>;
}

