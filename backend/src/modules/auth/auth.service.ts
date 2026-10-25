import { PasswordHasher } from '../../security/passwordHasher';
import { TokenService } from '../../security/tokenService';
import { ConflictError, UnauthorizedError } from '../../shared/errors';
import { UserRepository } from '../users/user.repository';
import { PublicUser, toPublicUser } from '../users/user.types';
import { LoginInput, RegisterInput } from './auth.schemas';

// Compared against when the email is unknown, so both failure paths take about the same time.
const DUMMY_HASH = '$2b$10$CwTycUXWue0Thq9StjUM0uJ8.3jQh1F9CBn3lZ9l0dYJc5fxwFq1e';

export interface AuthResult {
  token: string;
  user: PublicUser;
}

export class AuthService {
  constructor(
    private readonly users: UserRepository,
    private readonly hasher: PasswordHasher,
    private readonly tokens: TokenService,
  ) {}

  async register({ name, email, password }: RegisterInput): Promise<AuthResult> {
    if (await this.users.findByEmail(email)) {
      throw new ConflictError('EMAIL_TAKEN', 'An account with this email already exists');
    }
    const user = await this.users.create({ name, email, passwordHash: await this.hasher.hash(password) });
    return this.issue(user);
  }

  async login({ email, password }: LoginInput): Promise<AuthResult> {
    const user = await this.users.findByEmail(email);
    const valid = await this.hasher.verify(password, user?.passwordHash ?? DUMMY_HASH);
    if (!user || !valid) throw new UnauthorizedError('Invalid email or password');
    return this.issue(user);
  }

  private issue(user: Parameters<typeof toPublicUser>[0]): AuthResult {
    return { token: this.tokens.sign({ sub: user.id, role: user.role }), user: toPublicUser(user) };
  }
}
