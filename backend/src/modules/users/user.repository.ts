import { PrismaClient } from '../../generated/prisma/client';
import { isUniqueViolation } from '../../db/prismaErrors';
import { ConflictError } from '../../shared/errors';
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
  async create(user: NewUser): Promise<User> {
    try {
      return await this.prisma.user.create({ data: { ...user, role: 'USER' } });
    } catch (err) {
      if (isUniqueViolation(err)) throw new ConflictError('EMAIL_TAKEN', 'An account with this email already exists');
      throw err;
    }
  }
}
