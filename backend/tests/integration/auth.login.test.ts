import request from 'supertest';
import { app, resetDb } from '../helpers/testApp';

const account = { name: 'Asha Rao', email: 'asha@example.com', password: 'correct-horse-9' };

describe('POST /api/auth/login', () => {
  beforeEach(async () => {
    await resetDb();
    await request(app).post('/api/auth/register').send(account);
  });

  it('returns 200 with a token and the public user for valid credentials', async () => {
    const res = await request(app).post('/api/auth/login').send({ email: account.email, password: account.password });
    expect(res.status).toBe(200);
    expect(res.body.token).toEqual(expect.any(String));
    expect(res.body.user).toMatchObject({ email: account.email, role: 'USER' });
    expect(JSON.stringify(res.body)).not.toMatch(/password/i);
  });

  it('accepts the email in any case', async () => {
    const res = await request(app).post('/api/auth/login').send({ email: 'ASHA@Example.com', password: account.password });
    expect(res.status).toBe(200);
  });

  // Same status and message for both, so the endpoint cannot be used to discover which emails exist.
  it('returns the same 401 for a wrong password and an unknown email', async () => {
    const wrongPassword = await request(app).post('/api/auth/login').send({ email: account.email, password: 'nope-nope-1' });
    const unknownEmail = await request(app).post('/api/auth/login').send({ email: 'ghost@example.com', password: 'nope-nope-1' });
    expect(wrongPassword.status).toBe(401);
    expect(unknownEmail.status).toBe(401);
    expect(wrongPassword.body).toEqual(unknownEmail.body);
    expect(wrongPassword.body.error.message).toBe('Invalid email or password');
  });

  it('returns 400 when fields are missing', async () => {
    const res = await request(app).post('/api/auth/login').send({ email: account.email });
    expect(res.status).toBe(400);
  });
});
