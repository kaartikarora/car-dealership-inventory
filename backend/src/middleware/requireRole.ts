import { RequestHandler } from 'express';
import { Role } from '../generated/prisma/enums';
import { ForbiddenError, UnauthorizedError } from '../shared/errors';

// Must run after authenticate. The role comes from the verified token, never from the request body.
export const requireRole = (role: Role): RequestHandler => (req, _res, next) => {
  if (!req.user) throw new UnauthorizedError();
  if (req.user.role !== role) throw new ForbiddenError();
  next();
};
