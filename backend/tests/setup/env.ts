// Runs before each test file loads any app code.
import 'dotenv/config';

process.env.NODE_ENV = 'test';
process.env.BCRYPT_COST = '4'; // fast hashing in tests
process.env.LOGIN_RATE_LIMIT = '1000'; // the limiter has its own focused test
process.env.JWT_SECRET ??= 'test-secret-that-is-at-least-32-characters-long';
// Tests never touch the development database.
process.env.DATABASE_URL = process.env.TEST_DATABASE_URL!;
