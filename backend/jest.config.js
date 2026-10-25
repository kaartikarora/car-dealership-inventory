/** @type {import('jest').Config} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/tests'],
  // Applies migrations to the test database once before the run.
  globalSetup: '<rootDir>/tests/setup/globalSetup.ts',
  // Points DATABASE_URL at TEST_DATABASE_URL before any app code loads.
  setupFiles: ['<rootDir>/tests/setup/env.ts'],
  setupFilesAfterEnv: ['<rootDir>/tests/setup/afterAll.ts'],
  collectCoverageFrom: ['src/**/*.ts', '!src/server.ts', '!src/generated/**'],
  coverageReporters: ['text', 'text-summary', 'lcov'],
};
