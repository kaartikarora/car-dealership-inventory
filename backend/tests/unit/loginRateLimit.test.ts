import express from 'express';
import request from 'supertest';
import { createLoginRateLimiter } from '../../src/middleware/rateLimit';

describe('login rate limiter', () => {
  it('returns 429 with a JSON error once the limit is reached', async () => {
    const app = express();
    app.post('/login', createLoginRateLimiter({ limit: 3, windowMs: 60_000 }), (_req, res) => { res.status(401).end(); });

    for (let i = 0; i < 3; i++) expect((await request(app).post('/login')).status).toBe(401);

    const blocked = await request(app).post('/login');
    expect(blocked.status).toBe(429);
    expect(blocked.body.error.code).toBe('TOO_MANY_REQUESTS');
    expect(blocked.headers['retry-after']).toBeDefined();
  });
});
