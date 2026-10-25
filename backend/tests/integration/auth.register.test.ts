import request from 'supertest';
import { app, prisma, resetDb } from '../helpers/testApp';

const valid = { name: 'Asha Rao', email: 'asha@example.com', password: 'correct-horse-9' };

describe('POST /api/auth/register', () => {
  beforeEach(resetDb);

  it('creates a USER and returns 201 with a token and the public user', async () => {
    const res = await request(app).post('/api/auth/register').send(valid);
    expect(res.status).toBe(201);
    expect(res.body.token).toEqual(expect.any(String));
    expect(res.body.user).toEqual({ id: expect.any(String), name: 'Asha Rao', email: 'asha@example.com', role: 'USER' });
  });

  it('never returns the password or its hash', async () => {
    const res = await request(app).post('/api/auth/register').send(valid);
    expect(JSON.stringify(res.body)).not.toMatch(/password/i);
  });

  it('stores a bcrypt hash, not the plain password', async () => {
    await request(app).post('/api/auth/register').send(valid);
    const user = await prisma.user.findUniqueOrThrow({ where: { email: valid.email } });
    expect(user.passwordHash).not.toBe(valid.password);
    expect(user.passwordHash).toMatch(/^\$2[aby]\$/);
  });

  it('normalises the email to trimmed lower case', async () => {
    const res = await request(app).post('/api/auth/register').send({ ...valid, email: '  Asha@Example.COM ' });
    expect(res.body.user.email).toBe('asha@example.com');
  });

  it('rejects a duplicate email with 409, regardless of case', async () => {
    await request(app).post('/api/auth/register').send(valid);
    const res = await request(app).post('/api/auth/register').send({ ...valid, email: 'ASHA@example.com' });
    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe('EMAIL_TAKEN');
  });

  it.each([
    ['missing name', { ...valid, name: undefined }],
    ['invalid email', { ...valid, email: 'not-an-email' }],
    ['short password', { ...valid, password: 'short' }],
    ['password over bcrypt limit', { ...valid, password: 'x'.repeat(73) }],
  ])('returns 400 for %s', async (_label, body) => {
    const res = await request(app).post('/api/auth/register').send(body);
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('ignores a mass-assigned role: public sign-up can never create an admin', async () => {
    const res = await request(app).post('/api/auth/register').send({ ...valid, role: 'ADMIN' });
    expect(res.status).toBe(201);
    expect(res.body.user.role).toBe('USER');
  });
});
