import { Role } from '../generated/prisma/enums';

declare global {
  namespace Express {
    interface Request {
      // Set by the authenticate middleware.
      user?: { id: string; role: Role };
    }
  }
}

export {};
