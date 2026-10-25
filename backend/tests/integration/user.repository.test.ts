import { PrismaUserRepository } from '../../src/modules/users/user.repository';
import { ConflictError } from '../../src/shared/errors';
import { prisma, resetDb } from '../helpers/testApp';

describe('PrismaUserRepository', () => {
  const repo = new PrismaUserRepository(prisma);
  const user = { name: 'A', email: 'a@example.com', passwordHash: 'hash' };

  beforeEach(resetDb);

  it('creates users with the USER role', async () => {
    expect((await repo.create(user)).role).toBe('USER');
  });

  // Two sign-ups can both pass the "email free?" check; the unique index must still win cleanly.
  it('maps a unique-email violation to a 409 ConflictError instead of a 500', async () => {
    await repo.create(user);
    await expect(repo.create(user)).rejects.toBeInstanceOf(ConflictError);
  });
});
