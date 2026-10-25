import jwt, { SignOptions } from 'jsonwebtoken';
import { Role } from '../generated/prisma/enums';
import { UnauthorizedError } from '../shared/errors';

export interface TokenPayload {
  sub: string;
  role: Role;
}

export interface TokenService {
  sign(payload: TokenPayload): string;
  verify(token: string): TokenPayload;
}

const ALGORITHM = 'HS256';

// Issues and verifies JWTs. The algorithm is pinned on both sides, which blocks
// "alg: none" tokens and algorithm-confusion attacks.
export class JwtTokenService implements TokenService {
  constructor(
    private readonly secret: string,
    private readonly expiresIn: string,
  ) {}

  sign({ sub, role }: TokenPayload): string {
    return jwt.sign({ role }, this.secret, {
      algorithm: ALGORITHM,
      subject: sub,
      expiresIn: this.expiresIn as SignOptions['expiresIn'],
    });
  }

  verify(token: string): TokenPayload {
    try {
      const decoded = jwt.verify(token, this.secret, { algorithms: [ALGORITHM] });
      if (typeof decoded === 'string' || !decoded.sub || !decoded.role) throw new Error('Malformed token');
      return { sub: decoded.sub, role: decoded.role as Role };
    } catch (err) {
      const expired = err instanceof jwt.TokenExpiredError;
      throw new UnauthorizedError(expired ? 'Token expired' : 'Invalid token');
    }
  }
}
