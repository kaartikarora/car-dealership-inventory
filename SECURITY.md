# Security Notes

This app handles accounts, passwords and money-like data, so it was built with an attacker in mind. Each row below names a threat, the control that stops it, and the automated test that proves the control works. All tests live in `backend/tests/`.

## Threats, controls and proof

| Threat | Control | Proven by |
|---|---|---|
| **Privilege escalation at sign-up** (sending `"role": "ADMIN"` in the register body) | The register schema has no `role` field, and the user repository always writes `USER`. | `auth.register.test.ts` › *ignores a mass-assigned role* |
| **Forged admin token** (JWT signed with a guessed secret) | Tokens are verified with the server secret. A secret shorter than 32 characters stops the server from starting. | `jwt-attacks.test.ts` › *forged role*; `env.test.ts` › *short JWT secret* |
| **Tampered token** (role edited in the payload, signature kept) | Signature verification fails. | `jwt-attacks.test.ts` › *tampered payload* |
| **`alg: none` and algorithm-switch attacks** | Verification pins `algorithms: ['HS256']`. | `jwt-attacks.test.ts` › *alg "none"*, *algorithm switch* |
| **Replay of an old token** | Tokens expire (`JWT_EXPIRES_IN`, 1 day by default). The UI signs the user out on a 401. | `jwt-attacks.test.ts` › *expired token*; `api.test.ts` › *notifies listeners on 401* |
| **Customers calling admin endpoints** | `requireRole('ADMIN')` reads the role from the verified token only, on create, update, delete and restock. The UI hides admin controls, but the API is what enforces it. | `vehicles.crud.test.ts` and `inventory.test.ts` › *403 for a regular user* |
| **Password guessing** | Login is rate-limited per IP (10 attempts per 15 minutes by default) and returns 429 with `Retry-After`. | `loginRateLimit.test.ts` |
| **Account enumeration** | Wrong password and unknown email return the same 401 and message. An unknown email is still compared against a dummy bcrypt hash, so response time doesn't reveal which emails exist. | `auth.login.test.ts` › *same 401 for a wrong password and an unknown email* |
| **Password theft from the database** | bcrypt with a configurable cost. Passwords over 72 bytes are rejected instead of being silently truncated. | `auth.register.test.ts` › *stores a bcrypt hash*, *password over bcrypt limit* |
| **Password hash leaks in responses** | Every response goes through `toPublicUser`, which drops the hash. | `auth.register.test.ts` / `auth.login.test.ts` › *never returns the password* |
| **SQL injection** | All queries go through Prisma with bound parameters. No raw SQL takes user input. | n/a (by construction) |
| **LIKE wildcard abuse** (`%` in search to dump everything) | `%`, `_` and `\` in search input are escaped. A test caught that Prisma doesn't do this itself. | `vehicles.search.test.ts` › *treats LIKE wildcards in input as plain text* |
| **Mass assignment on vehicles** (setting `id`, timestamps) | Zod schemas strip unknown keys before the service sees the body. | `vehicles.crud.test.ts` › *ignores a client-supplied id* |
| **Overselling under concurrency** (two buyers, one car) | Purchase is a single conditional `UPDATE … WHERE quantity > 0`, backed by a `CHECK (quantity >= 0)` constraint. | `inventory.test.ts` › *sells the last unit exactly once when buyers race for it* |
| **Oversized or malformed bodies** | JSON body limit of 10 kB (413). Malformed JSON gets a clean 400. | `health.test.ts` |
| **Information leaks in errors** | Unknown errors are logged on the server and returned as a generic 500. `x-powered-by` is disabled. | `errorHandler.ts` |
| **Clickjacking, MIME sniffing and similar browser attacks** | `helmet` sets security headers. CORS allows only the origins in `CORS_ORIGIN`. | `app.ts` |
| **Secrets in git** | `.env` files are ignored; only `.env.example` templates are committed. Production secrets live in the Render and Vercel dashboards (`sync: false`, `generateValue` in `render.yaml`). | `.gitignore` |

## Known trade-offs

- **Token in `localStorage`.** It's simple and works across a split frontend and API domain, but malicious script on the page could read it. React escapes output and the app renders no user-supplied HTML. An httpOnly cookie with CSRF protection would be the next step.
- **Role inside the token.** A demoted admin keeps admin rights until their token expires (at most `JWT_EXPIRES_IN`). Checking the user on every request, or using short tokens with refresh tokens, would close that gap.
- **Public demo accounts.** The demo admin on the live site can change data. Re-running the seed restores the showroom.
- **In-memory rate limit store.** It's per instance and resets on restart. Several instances would need a shared store such as Redis.

## Reporting

Found something? Please open a GitHub issue without exploit details, or contact the maintainer directly.
