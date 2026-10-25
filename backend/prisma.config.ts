import 'dotenv/config';
import { defineConfig } from 'prisma/config';

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
    seed: 'tsx prisma/seed.ts',
  },
  // Read lazily so `prisma generate` (run on npm install) works before .env exists.
  // Commands that need a database fail with a clear error if it is still unset.
  datasource: {
    url: process.env.DATABASE_URL ?? '',
  },
});
