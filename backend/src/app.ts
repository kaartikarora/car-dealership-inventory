import express, { Express, Router } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { errorHandler, notFound } from './middleware/errorHandler';

export interface AppDeps {
  corsOrigin: string;
  routers?: Record<string, Router | Router[]>;
}

// Builds the HTTP layer only. Feature routers are created in container.ts and passed in,
// so this file never imports a database or a service.
export function createApp({ corsOrigin, routers = {} }: AppDeps): Express {
  const app = express();
  app.disable('x-powered-by');
  app.set('trust proxy', 1); // behind Render's proxy, so rate limiting sees the real client IP

  app.use(helmet());
  app.use(cors({ origin: corsOrigin.split(',').map((o) => o.trim()) }));
  app.use(express.json({ limit: '10kb' }));

  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok' });
  });
  for (const [path, router] of Object.entries(routers)) app.use(path, ...[router].flat());

  app.use(notFound);
  app.use(errorHandler);
  return app;
}
