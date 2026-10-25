import request from 'supertest';
import { app } from '../helpers/testApp';

describe('GET /api/health', () => {
  it('returns 200 with status ok', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'ok' });
  });

  it('returns 404 JSON for unknown routes', async () => {
    const res = await request(app).get('/api/nope');
    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });

  it('returns 413 for oversized bodies and 400 for malformed JSON', async () => {
    const big = await request(app).post('/api/health').send({ a: 'x'.repeat(20000) });
    expect(big.status).toBe(413);
    const bad = await request(app).post('/api/health').set('content-type', 'application/json').send('{bad');
    expect(bad.status).toBe(400);
  });
});
