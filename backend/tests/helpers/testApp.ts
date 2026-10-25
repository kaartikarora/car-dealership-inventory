import { loadEnv } from '../../src/config/env';
import { buildApp } from '../../src/container';

// One app and one Prisma client per test file.
export const { app, prisma } = buildApp(loadEnv());

export const resetDb = () => prisma.$executeRawUnsafe('TRUNCATE TABLE vehicles, users CASCADE');
