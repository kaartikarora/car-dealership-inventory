import { loadEnv } from '../../src/config/env';

const base = { DATABASE_URL: 'postgresql://x', JWT_SECRET: 'x'.repeat(32) };

describe('loadEnv', () => {
  it('applies defaults for optional settings', () => {
    expect(loadEnv(base)).toMatchObject({ PORT: 4000, JWT_EXPIRES_IN: '1d', BCRYPT_COST: 10, LOGIN_RATE_LIMIT: 10 });
  });

  it('refuses to start with a short JWT secret', () => {
    expect(() => loadEnv({ ...base, JWT_SECRET: 'short' })).toThrow(/JWT_SECRET/);
  });

  it('refuses to start without a database URL', () => {
    expect(() => loadEnv({ JWT_SECRET: base.JWT_SECRET })).toThrow(/DATABASE_URL/);
  });
});
