import express from 'express';
import jwt from 'jsonwebtoken';
import request from 'supertest';
import { authenticate } from '../../src/middleware/authenticate';
import { requireRole } from '../../src/middleware/requireRole';
import { errorHandler } from '../../src/middleware/errorHandler';
import { JwtTokenService } from '../../src/security/tokenService';

// Attacks a real Express pipeline (authenticate -> requireRole -> handler) with hostile tokens.
const SECRET = 'a-test-secret-that-is-at-least-32-characters';
const tokens = new JwtTokenService(SECRET, '1h');

const app = express();
app.get('/me', authenticate(tokens), (req, res) => { res.json(req.user); });
app.get('/admin', authenticate(tokens), requireRole('ADMIN'), (_req, res) => { res.json({ ok: true }); });
app.use(errorHandler);

const b64 = (o: object) => Buffer.from(JSON.stringify(o)).toString('base64url');
const bearer = (t: string) => ({ Authorization: `Bearer ${t}` });

describe('authenticate and requireRole', () => {
  it('lets a valid token through and exposes the user id and role', async () => {
    const res = await request(app).get('/me').set(bearer(tokens.sign({ sub: 'u1', role: 'USER' })));
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ id: 'u1', role: 'USER' });
  });

  it('returns 401 when the Authorization header is missing', async () => {
    const res = await request(app).get('/me');
    expect(res.status).toBe(401);
  });

  it('returns 401 for a header that is not a Bearer token', async () => {
    const res = await request(app).get('/me').set('Authorization', 'Basic abc');
    expect(res.status).toBe(401);
  });

  it('returns 403 when a USER calls an admin route', async () => {
    const res = await request(app).get('/admin').set(bearer(tokens.sign({ sub: 'u1', role: 'USER' })));
    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe('FORBIDDEN');
  });

  it('lets an ADMIN call an admin route', async () => {
    const res = await request(app).get('/admin').set(bearer(tokens.sign({ sub: 'a1', role: 'ADMIN' })));
    expect(res.status).toBe(200);
  });
});

describe('JWT attacks are rejected with 401', () => {
  it('forged role: a token signed with a different secret', async () => {
    const forged = jwt.sign({ role: 'ADMIN' }, 'attacker-guessed-secret-attacker-guessed', { subject: 'x' });
    expect((await request(app).get('/admin').set(bearer(forged))).status).toBe(401);
  });

  it('tampered payload: role changed after signing', async () => {
    const [header, , signature] = tokens.sign({ sub: 'u1', role: 'USER' }).split('.');
    const tampered = [header, b64({ sub: 'u1', role: 'ADMIN' }), signature].join('.');
    expect((await request(app).get('/admin').set(bearer(tampered))).status).toBe(401);
  });

  it('alg "none": an unsigned token', async () => {
    const unsigned = `${b64({ alg: 'none', typ: 'JWT' })}.${b64({ sub: 'x', role: 'ADMIN' })}.`;
    expect((await request(app).get('/admin').set(bearer(unsigned))).status).toBe(401);
  });

  it('algorithm switch: HS512 signed with the real secret', async () => {
    const switched = jwt.sign({ role: 'ADMIN' }, SECRET, { algorithm: 'HS512', subject: 'x' });
    expect((await request(app).get('/admin').set(bearer(switched))).status).toBe(401);
  });

  it('expired token, with a message the UI can act on', async () => {
    const expired = jwt.sign({ role: 'USER', exp: Math.floor(Date.now() / 1000) - 60 }, SECRET, { subject: 'u1' });
    const res = await request(app).get('/me').set(bearer(expired));
    expect(res.status).toBe(401);
    expect(res.body.error.message).toBe('Token expired');
  });

  it('garbage token', async () => {
    expect((await request(app).get('/me').set(bearer('not.a.jwt'))).status).toBe(401);
  });
});
