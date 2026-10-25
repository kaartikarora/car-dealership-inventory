# Test Report

Generated on 2026-10-25 from a clean run on Node 22.22, PostgreSQL 16.15.

| Suite | Command | Result |
|---|---|---|
| Backend (Jest + Supertest, real PostgreSQL) | `cd backend && npm run test:coverage` | 13 suites, **99 passed**, 0 failed |
| Backend coverage | | **98.2% statements**, 94.4% branches, 100% functions |
| Frontend (Vitest + React Testing Library + MSW) | `cd frontend && npm run coverage` | 11 files, **44 passed**, 0 failed |
| Frontend coverage | | **91.3% statements**, 92.5% lines |
| Frontend lint (oxlint) | `npm run lint` | 0 errors, 2 fast-refresh warnings |
| Frontend production build | `npm run build` | succeeds |

Backend integration tests run against a dedicated `dealership_test` database (never the development one). Migrations are applied once before the run and every test file truncates the tables it uses.

## Backend: every test

```text
Loaded Prisma config from prisma.config.ts.

Prisma schema loaded from prisma/schema.prisma.
Datasource "db": PostgreSQL database "dealership_test", schema "public" at "localhost:5432"

1 migration found in prisma/migrations


No pending migrations to apply.
PASS tests/unit/auth.service.test.ts
  AuthService
    ✓ registers a user with a hashed password and returns a token (4 ms)
    ✓ refuses a duplicate email (1 ms)
    ✓ logs in with the right password (1 ms)
    ✓ rejects a wrong password and an unknown email with the same error (5 ms)

PASS tests/integration/vehicles.crud.test.ts
  POST /api/vehicles
    ✓ lets an admin add a vehicle and returns 201 with it (749 ms)
    ✓ returns price as a number with cents intact (38 ms)
    ✓ ignores a client-supplied id (32 ms)
    ✓ returns 400 for missing make (30 ms)
    ✓ returns 400 for blank model (27 ms)
    ✓ returns 400 for unknown category (28 ms)
    ✓ returns 400 for zero price (17 ms)
    ✓ returns 400 for fractional cents (21 ms)
    ✓ returns 400 for negative quantity (30 ms)
    ✓ returns 400 for fractional quantity (23 ms)
    ✓ returns 401 without a token (27 ms)
    ✓ returns 403 for a regular user (15 ms)
  GET /api/vehicles
    ✓ lists every vehicle, newest first (34 ms)
    ✓ returns 401 without a token (19 ms)
  GET /api/vehicles/:id
    ✓ returns one vehicle (41 ms)
    ✓ returns 404 for an unknown id and 400 for a malformed one (25 ms)
  PUT /api/vehicles/:id
    ✓ lets an admin update some fields and keeps the rest (36 ms)
    ✓ returns 400 for an empty or invalid update (28 ms)
    ✓ returns 404 for an unknown vehicle (137 ms)
    ✓ returns 403 for a regular user (22 ms)
  DELETE /api/vehicles/:id
    ✓ lets an admin delete a vehicle (204), after which it is gone (34 ms)
    ✓ returns 403 for a regular user and leaves the vehicle in place (26 ms)
    ✓ returns 404 for an unknown vehicle (21 ms)

PASS tests/integration/inventory.test.ts
  POST /api/vehicles/:id/purchase
    ✓ decreases stock by exactly one and returns the updated vehicle (178 ms)
    ✓ returns 409 OUT_OF_STOCK at zero and leaves stock at zero (47 ms)
    ✓ sells the last unit exactly once when buyers race for it (59 ms)
    ✓ returns 404 for an unknown vehicle (42 ms)
    ✓ returns 401 without a token (23 ms)
  POST /api/vehicles/:id/restock
    ✓ lets an admin add stock and returns the updated vehicle (31 ms)
    ✓ applies concurrent restocks without losing any (29 ms)
    ✓ returns 403 for a regular user and leaves stock unchanged (22 ms)
    ✓ returns 400 for missing amount (19 ms)
    ✓ returns 400 for zero (23 ms)
    ✓ returns 400 for negative (19 ms)
    ✓ returns 400 for fractional (15 ms)
    ✓ returns 400 for huge (18 ms)
    ✓ returns 404 for an unknown vehicle (16 ms)

PASS tests/integration/auth.register.test.ts
  POST /api/auth/register
    ✓ creates a USER and returns 201 with a token and the public user (78 ms)
    ✓ never returns the password or its hash (18 ms)
    ✓ stores a bcrypt hash, not the plain password (27 ms)
    ✓ normalises the email to trimmed lower case (22 ms)
    ✓ rejects a duplicate email with 409, regardless of case (22 ms)
    ✓ returns 400 for missing name (12 ms)
    ✓ returns 400 for invalid email (12 ms)
    ✓ returns 400 for short password (13 ms)
    ✓ returns 400 for password over bcrypt limit (19 ms)
    ✓ ignores a mass-assigned role: public sign-up can never create an admin (27 ms)

PASS tests/integration/auth.login.test.ts
  POST /api/auth/login
    ✓ returns 200 with a token and the public user for valid credentials (122 ms)
    ✓ accepts the email in any case (31 ms)
    ✓ returns the same 401 for a wrong password and an unknown email (133 ms)
    ✓ returns 400 when fields are missing (21 ms)

PASS tests/integration/vehicles.search.test.ts
  GET /api/vehicles/search
    ✓ matches make partially and case-insensitively (13 ms)
    ✓ matches model partially (7 ms)
    ✓ filters by exact category (4 ms)
    ✓ filters by an inclusive price range (6 ms)
    ✓ accepts only one side of the price range (8 ms)
    ✓ free text q matches make or model (7 ms)
    ✓ combines filters with AND (4 ms)
    ✓ can hide sold-out vehicles (4 ms)
    ✓ sorts by price when asked (4 ms)
    ✓ returns every vehicle when no filter is given and [] when nothing matches (7 ms)
    ✓ treats LIKE wildcards in input as plain text (4 ms)
    ✓ returns 400 for minPrice above maxPrice (2 ms)
    ✓ returns 400 for non-numeric price (3 ms)
    ✓ returns 400 for unknown category (3 ms)
    ✓ returns 400 for unknown sort (2 ms)
    ✓ returns 401 without a token (2 ms)

PASS tests/integration/user.repository.test.ts
  PrismaUserRepository
    ✓ creates users with the USER role (73 ms)
    ✓ maps a unique-email violation to a 409 ConflictError instead of a 500 (195 ms)

PASS tests/unit/validate.test.ts
  validate middleware
    ✓ replaces the body with the parsed, coerced values (3 ms)
    ✓ throws a ValidationError listing each failing field (2 ms)
    ✓ can replace req.query on a real Express 5 request (7 ms)
    ✓ responds 400 with details through the error handler (8 ms)

PASS tests/integration/health.test.ts
  GET /api/health
    ✓ returns 200 with status ok (4 ms)
    ✓ returns 404 JSON for unknown routes (3 ms)
    ✓ returns 413 for oversized bodies and 400 for malformed JSON (8 ms)

PASS tests/unit/loginRateLimit.test.ts
  login rate limiter
    ✓ returns 429 with a JSON error once the limit is reached (59 ms)

PASS tests/unit/env.test.ts
  loadEnv
    ✓ applies defaults for optional settings (1 ms)
    ✓ refuses to start with a short JWT secret (3 ms)
    ✓ refuses to start without a database URL (1 ms)

PASS tests/security/jwt-attacks.test.ts
  authenticate and requireRole
    ✓ lets a valid token through and exposes the user id and role (30 ms)
    ✓ returns 401 when the Authorization header is missing (3 ms)
    ✓ returns 401 for a header that is not a Bearer token (2 ms)
    ✓ returns 403 when a USER calls an admin route (3 ms)
    ✓ lets an ADMIN call an admin route (2 ms)
  JWT attacks are rejected with 401
    ✓ forged role: a token signed with a different secret (2 ms)
    ✓ tampered payload: role changed after signing (3 ms)
    ✓ alg "none": an unsigned token (2 ms)
    ✓ algorithm switch: HS512 signed with the real secret (3 ms)
    ✓ expired token, with a message the UI can act on (3 ms)
    ✓ garbage token (3 ms)

PASS tests/unit/inventory.service.test.ts
  InventoryService
    ✓ purchase returns the vehicle with one fewer in stock (1 ms)
    ✓ purchase explains a sold-out vehicle as OUT_OF_STOCK
    ✓ purchase explains a missing vehicle as NOT_FOUND
    ✓ restock adds the amount, or 404s for a missing vehicle (1 ms)
```

## Backend: coverage

```text
--------------------------|---------|----------|---------|---------|-------------------
File                      | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s 
--------------------------|---------|----------|---------|---------|-------------------
All files                 |   98.19 |    94.36 |     100 |   98.66 |                   
 src                      |     100 |        0 |     100 |     100 |                   
  app.ts                  |     100 |        0 |     100 |     100 | 13                
  container.ts            |     100 |      100 |     100 |     100 |                   
 src/config               |     100 |      100 |     100 |     100 |                   
  env.ts                  |     100 |      100 |     100 |     100 |                   
 src/db                   |     100 |      100 |     100 |     100 |                   
  prisma.ts               |     100 |      100 |     100 |     100 |                   
  prismaErrors.ts         |     100 |      100 |     100 |     100 |                   
 src/middleware           |   94.54 |    91.66 |     100 |   95.23 |                   
  authenticate.ts         |     100 |      100 |     100 |     100 |                   
  errorHandler.ts         |   88.23 |      100 |     100 |   86.66 | 23-24             
  rateLimit.ts            |     100 |      100 |     100 |     100 |                   
  requireRole.ts          |   88.88 |       50 |     100 |     100 | 7                 
  validate.ts             |     100 |      100 |     100 |     100 |                   
 src/modules/auth         |     100 |      100 |     100 |     100 |                   
  auth.controller.ts      |     100 |      100 |     100 |     100 |                   
  auth.routes.ts          |     100 |      100 |     100 |     100 |                   
  auth.schemas.ts         |     100 |      100 |     100 |     100 |                   
  auth.service.ts         |     100 |      100 |     100 |     100 |                   
 src/modules/inventory    |     100 |      100 |     100 |     100 |                   
  inventory.controller.ts |     100 |      100 |     100 |     100 |                   
  inventory.repository.ts |     100 |      100 |     100 |     100 |                   
  inventory.routes.ts     |     100 |      100 |     100 |     100 |                   
  inventory.schemas.ts    |     100 |      100 |     100 |     100 |                   
  inventory.service.ts    |     100 |      100 |     100 |     100 |                   
 src/modules/users        |    92.3 |      100 |     100 |      90 |                   
  user.repository.ts      |      90 |      100 |     100 |   88.88 | 24                
  user.types.ts           |     100 |      100 |     100 |     100 |                   
 src/modules/vehicles     |   98.82 |      100 |     100 |    98.7 |                   
  vehicle.controller.ts   |     100 |      100 |     100 |     100 |                   
  vehicle.repository.ts   |   96.29 |      100 |     100 |   95.23 | 65                
  vehicle.routes.ts       |     100 |      100 |     100 |     100 |                   
  vehicle.schemas.ts      |     100 |      100 |     100 |     100 |                   
  vehicle.service.ts      |     100 |      100 |     100 |     100 |                   
 src/security             |   94.73 |    83.33 |     100 |     100 |                   
  passwordHasher.ts       |     100 |      100 |     100 |     100 |                   
  tokenService.ts         |   92.85 |    83.33 |     100 |     100 | 36                
 src/shared               |     100 |    66.66 |     100 |     100 |                   
  errors.ts               |     100 |    66.66 |     100 |     100 | 34                
--------------------------|---------|----------|---------|---------|-------------------

=============================== Coverage summary ===============================
Statements   : 98.19% ( 327/333 )
Branches     : 94.36% ( 67/71 )
Functions    : 100% ( 87/87 )
Lines        : 98.66% ( 295/299 )
================================================================================
Test Suites: 13 passed, 13 total
Tests:       99 passed, 99 total
Snapshots:   0 total
Time:        6.693 s, estimated 7 s
Ran all test suites.
```

## Frontend: summary

```text
Test Files  11 passed (11)
      Tests  44 passed (44)
   Duration  8.98s (environment 45%, tests 32%, setup 12%, import 7%, worker 3%, transform 2%)
```

## Frontend: coverage

```text
% Coverage report from v8
-------------------|---------|----------|---------|---------|-------------------
File               | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s 
-------------------|---------|----------|---------|---------|-------------------
All files          |   91.32 |    83.33 |   88.48 |   92.51 |                   
 src               |       0 |        0 |       0 |       0 |                   
  App.tsx          |       0 |        0 |       0 |       0 | 11-31             
 src/components    |   86.95 |       80 |   80.95 |   94.73 |                   
  Layout.tsx       |       0 |        0 |       0 |       0 | 5-6               
  Modal.tsx        |     100 |    83.33 |     100 |     100 | 28                
  Toast.tsx        |   78.94 |    66.66 |   66.66 |     100 | 43                
 ...features/admin |   87.87 |       80 |   89.28 |   90.16 |                   
  DeleteDialog.tsx |    87.5 |       50 |      75 |    87.5 | 18                
  ...ockDialog.tsx |   86.66 |    63.63 |      80 |   92.85 | 27                
  ...ormDialog.tsx |      75 |    83.33 |      80 |   78.94 | 49-53             
 src/features/auth |   91.42 |    71.42 |   94.73 |   92.06 |                   
  AuthContext.tsx  |   78.26 |       50 |    87.5 |   78.94 | 26-27,35-36       
  LoginPage.tsx    |     100 |     87.5 |     100 |     100 | 35                
  RegisterPage.tsx |   94.11 |     62.5 |     100 |   93.75 | 36                
 ...ures/inventory |     100 |    83.33 |     100 |     100 |                   
  ...aseButton.tsx |     100 |    83.33 |     100 |     100 | 17,23             
 ...tures/vehicles |   96.15 |    89.74 |   91.89 |   95.31 |                   
  ...boardPage.tsx |   83.33 |    75.86 |      60 |   83.33 | 45,55             
  FilterBar.tsx    |   94.11 |      100 |   91.66 |   92.85 | 43                
  StatsStrip.tsx   |     100 |    83.33 |     100 |     100 | 13                
 src/lib           |   95.45 |    90.32 |    90.9 |      96 |                   
  api.ts           |   97.29 |       90 |    90.9 |     100 | 3,50              
  format.ts        |     100 |     87.5 |     100 |     100 | 15                
  session.ts       |   77.77 |      100 |      75 |   77.77 | 13,20             
-------------------|---------|----------|---------|---------|-------------------

=============================== Coverage summary ===============================
Statements   : 91.32% ( 316/346 )
Branches     : 83.33% ( 180/216 )
Functions    : 88.48% ( 123/139 )
Lines        : 92.51% ( 272/294 )
================================================================================
```
