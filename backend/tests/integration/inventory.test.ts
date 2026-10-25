import request from 'supertest';
import { app, prisma, resetDb } from '../helpers/testApp';
import { authHeader, createVehicle } from '../helpers/fixtures';

const MISSING_ID = '00000000-0000-4000-8000-000000000000';

let admin: { Authorization: string };
let user: { Authorization: string };

const stockOf = async (id: string) => (await prisma.vehicle.findUniqueOrThrow({ where: { id } })).quantity;

beforeEach(async () => {
  await resetDb();
  admin = await authHeader('ADMIN');
  user = await authHeader('USER');
});

describe('POST /api/vehicles/:id/purchase', () => {
  it('decreases stock by exactly one and returns the updated vehicle', async () => {
    const v = await createVehicle({ quantity: 3 });
    const res = await request(app).post(`/api/vehicles/${v.id}/purchase`).set(user);
    expect(res.status).toBe(200);
    expect(res.body.quantity).toBe(2);
    expect(await stockOf(v.id)).toBe(2);
  });

  it('returns 409 OUT_OF_STOCK at zero and leaves stock at zero', async () => {
    const v = await createVehicle({ quantity: 0 });
    const res = await request(app).post(`/api/vehicles/${v.id}/purchase`).set(user);
    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe('OUT_OF_STOCK');
    expect(await stockOf(v.id)).toBe(0);
  });

  // The race the atomic UPDATE ... WHERE quantity > 0 exists for.
  it('sells the last unit exactly once when buyers race for it', async () => {
    const v = await createVehicle({ quantity: 1 });
    const results = await Promise.all(
      Array.from({ length: 5 }, () => request(app).post(`/api/vehicles/${v.id}/purchase`).set(user)),
    );
    const statuses = results.map((r) => r.status).sort();
    expect(statuses).toEqual([200, 409, 409, 409, 409]);
    expect(await stockOf(v.id)).toBe(0);
  });

  it('returns 404 for an unknown vehicle', async () => {
    expect((await request(app).post(`/api/vehicles/${MISSING_ID}/purchase`).set(user)).status).toBe(404);
  });

  it('returns 401 without a token', async () => {
    const v = await createVehicle();
    expect((await request(app).post(`/api/vehicles/${v.id}/purchase`)).status).toBe(401);
  });
});

describe('POST /api/vehicles/:id/restock', () => {
  it('lets an admin add stock and returns the updated vehicle', async () => {
    const v = await createVehicle({ quantity: 2 });
    const res = await request(app).post(`/api/vehicles/${v.id}/restock`).set(admin).send({ amount: 5 });
    expect(res.status).toBe(200);
    expect(res.body.quantity).toBe(7);
  });

  it('applies concurrent restocks without losing any', async () => {
    const v = await createVehicle({ quantity: 0 });
    await Promise.all(
      Array.from({ length: 4 }, () => request(app).post(`/api/vehicles/${v.id}/restock`).set(admin).send({ amount: 3 })),
    );
    expect(await stockOf(v.id)).toBe(12);
  });

  it('returns 403 for a regular user and leaves stock unchanged', async () => {
    const v = await createVehicle({ quantity: 2 });
    expect((await request(app).post(`/api/vehicles/${v.id}/restock`).set(user).send({ amount: 5 })).status).toBe(403);
    expect(await stockOf(v.id)).toBe(2);
  });

  it.each([
    ['missing amount', {}],
    ['zero', { amount: 0 }],
    ['negative', { amount: -3 }],
    ['fractional', { amount: 1.5 }],
    ['huge', { amount: 1_000_001 }],
  ])('returns 400 for %s', async (_label, body) => {
    const v = await createVehicle();
    expect((await request(app).post(`/api/vehicles/${v.id}/restock`).set(admin).send(body)).status).toBe(400);
  });

  it('returns 404 for an unknown vehicle', async () => {
    expect((await request(app).post(`/api/vehicles/${MISSING_ID}/restock`).set(admin).send({ amount: 1 })).status).toBe(404);
  });
});
