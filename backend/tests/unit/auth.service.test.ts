import { AuthService } from '../../src/modules/auth/auth.service';
import { UserRepository } from '../../src/modules/users/user.repository';
import { NewUser, User } from '../../src/modules/users/user.types';
import { PasswordHasher } from '../../src/security/passwordHasher';
import { TokenService } from '../../src/security/tokenService';
import { ConflictError, UnauthorizedError } from '../../src/shared/errors';

// Pure unit tests: the service depends only on interfaces, so fakes stand in for Postgres, bcrypt and JWT.
class InMemoryUsers implements UserRepository {
  users: User[] = [];
  async findByEmail(email: string) { return this.users.find((u) => u.email === email) ?? null; }
  async create(u: NewUser) { const user = { ...u, id: `u${this.users.length + 1}`, role: 'USER' as const }; this.users.push(user); return user; }
}
const hasher: PasswordHasher = { hash: async (p) => `hashed:${p}`, verify: async (p, h) => h === `hashed:${p}` };
const tokens: TokenService = { sign: ({ sub, role }) => `token:${sub}:${role}`, verify: jest.fn() };

describe('AuthService', () => {
  let users: InMemoryUsers;
  let auth: AuthService;

  beforeEach(() => {
    users = new InMemoryUsers();
    auth = new AuthService(users, hasher, tokens);
  });

  it('registers a user with a hashed password and returns a token', async () => {
    const result = await auth.register({ name: 'A', email: 'a@x.com', password: 'secret-pass' });
    expect(users.users[0].passwordHash).toBe('hashed:secret-pass');
    expect(result).toEqual({ token: 'token:u1:USER', user: { id: 'u1', name: 'A', email: 'a@x.com', role: 'USER' } });
  });

  it('refuses a duplicate email', async () => {
    await auth.register({ name: 'A', email: 'a@x.com', password: 'secret-pass' });
    await expect(auth.register({ name: 'B', email: 'a@x.com', password: 'other-pass' })).rejects.toBeInstanceOf(ConflictError);
  });

  it('logs in with the right password', async () => {
    await auth.register({ name: 'A', email: 'a@x.com', password: 'secret-pass' });
    await expect(auth.login({ email: 'a@x.com', password: 'secret-pass' })).resolves.toMatchObject({ token: 'token:u1:USER' });
  });

  it('rejects a wrong password and an unknown email with the same error', async () => {
    await auth.register({ name: 'A', email: 'a@x.com', password: 'secret-pass' });
    await expect(auth.login({ email: 'a@x.com', password: 'wrong' })).rejects.toThrow(new UnauthorizedError('Invalid email or password'));
    await expect(auth.login({ email: 'b@x.com', password: 'wrong' })).rejects.toThrow(new UnauthorizedError('Invalid email or password'));
  });
});
