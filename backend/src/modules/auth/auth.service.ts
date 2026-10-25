import { PasswordHasher } from '../../security/passwordHasher';
import { TokenService } from '../../security/tokenService';
import { ConflictError } from '../../shared/errors';
import { UserRepository } from '../users/user.repository';
import { PublicUser, toPublicUser } from '../users/user.types';
import { RegisterInput } from './auth.schemas';

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

  private issue(user: Parameters<typeof toPublicUser>[0]): AuthResult {
    return { token: this.tokens.sign({ sub: user.id, role: user.role }), user: toPublicUser(user) };
  }
}
