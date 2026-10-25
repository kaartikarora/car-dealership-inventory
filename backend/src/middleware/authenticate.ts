import { RequestHandler } from 'express';
import { TokenService } from '../security/tokenService';
import { UnauthorizedError } from '../shared/errors';

// Requires "Authorization: Bearer <jwt>" and attaches { id, role } to req.user.
export const authenticate = (tokens: TokenService): RequestHandler => (req, _res, next) => {
  const [scheme, token] = req.headers.authorization?.split(' ') ?? [];
  if (scheme !== 'Bearer' || !token) throw new UnauthorizedError();

  const { sub, role } = tokens.verify(token);
  req.user = { id: sub, role };
  next();
};
