import { createApp } from './app';
import { Env } from './config/env';
import { createPrismaClient } from './db/prisma';
import { createLoginRateLimiter } from './middleware/rateLimit';
import { AuthController } from './modules/auth/auth.controller';
import { authRoutes } from './modules/auth/auth.routes';
import { AuthService } from './modules/auth/auth.service';
import { PrismaUserRepository } from './modules/users/user.repository';
import { BcryptPasswordHasher } from './security/passwordHasher';
import { JwtTokenService } from './security/tokenService';

// Composition root: the only file that knows how the pieces are wired together.
export function buildApp(env: Env) {
  const prisma = createPrismaClient(env.DATABASE_URL);
  const tokens = new JwtTokenService(env.JWT_SECRET, env.JWT_EXPIRES_IN);
  const hasher = new BcryptPasswordHasher(env.BCRYPT_COST);

  const authService = new AuthService(new PrismaUserRepository(prisma), hasher, tokens);

  const app = createApp({
    corsOrigin: env.CORS_ORIGIN,
    routers: {
      '/api/auth': authRoutes(
        new AuthController(authService),
        createLoginRateLimiter({ limit: env.LOGIN_RATE_LIMIT, windowMs: env.LOGIN_RATE_WINDOW_MS }),
      ),
    },
  });
  return { app, prisma, tokens };
}
