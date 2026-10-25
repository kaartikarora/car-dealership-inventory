import { PrismaClient } from '../../generated/prisma/client';
import { NewUser, User } from './user.types';

export interface UserRepository {
  findByEmail(email: string): Promise<User | null>;
  create(user: NewUser): Promise<User>;
}

export class PrismaUserRepository implements UserRepository {
  constructor(private readonly prisma: PrismaClient) {}

  findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { email } });
  }

  // Role is not accepted here at all: every self-registered account is a USER.
  create(user: NewUser): Promise<User> {
    return this.prisma.user.create({ data: { ...user, role: 'USER' } });
  }
}
