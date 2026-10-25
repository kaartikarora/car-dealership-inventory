import { createApp } from './app';
import { Env } from './config/env';
import { createPrismaClient } from './db/prisma';

// Composition root: the only file that knows how the pieces are wired together.
export function buildApp(env: Env) {
  const prisma = createPrismaClient(env.DATABASE_URL);
  const app = createApp({ corsOrigin: env.CORS_ORIGIN });
  return { app, prisma };
}
