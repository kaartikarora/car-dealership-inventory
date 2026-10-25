# Car Dealership Inventory System

A full-stack car dealership inventory app: an Express 5 + TypeScript + PostgreSQL (Prisma) API with JWT auth, and a React + Tailwind single-page app. Built test-first.

> The full README (features, architecture, API reference, screenshots) is coming soon.

## Quick start

```bash
# API (needs PostgreSQL with two databases: dealership and dealership_test)
cd backend
cp .env.example .env        # fill in DATABASE_URL, TEST_DATABASE_URL, JWT_SECRET, ADMIN_*
npm install
npx prisma migrate deploy
npm run db:seed
npm run dev                 # http://localhost:4000/api/health

# Web app
cd ../frontend
cp .env.example .env.local
npm install
npm run dev                 # http://localhost:5173
```

## Tests

```bash
cd backend && npm test
cd frontend && npm run test:run
```

See [TEST_REPORT.md](TEST_REPORT.md) and [SECURITY.md](SECURITY.md).
