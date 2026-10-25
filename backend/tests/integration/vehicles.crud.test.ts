import request from 'supertest';
import { app, resetDb } from '../helpers/testApp';
import { authHeader, createVehicle, sampleVehicle } from '../helpers/fixtures';

const MISSING_ID = '00000000-0000-4000-8000-000000000000';

let admin: { Authorization: string };
let user: { Authorization: string };

beforeEach(async () => {
  await resetDb();
  admin = await authHeader('ADMIN');
  user = await authHeader('USER');
});

describe('POST /api/vehicles', () => {
  it('lets an admin add a vehicle and returns 201 with it', async () => {
    const res = await request(app).post('/api/vehicles').set(admin).send(sampleVehicle);
    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({ ...sampleVehicle, id: expect.any(String) });
  });

  it('returns price as a number with cents intact', async () => {
    const res = await request(app).post('/api/vehicles').set(admin).send({ ...sampleVehicle, price: 19999.99 });
    expect(res.body.price).toBe(19999.99);
  });

  it('ignores a client-supplied id', async () => {
    const res = await request(app).post('/api/vehicles').set(admin).send({ ...sampleVehicle, id: MISSING_ID });
    expect(res.body.id).not.toBe(MISSING_ID);
  });

  it.each([
    ['missing make', { ...sampleVehicle, make: undefined }],
    ['blank model', { ...sampleVehicle, model: '   ' }],
    ['unknown category', { ...sampleVehicle, category: 'SPACESHIP' }],
    ['zero price', { ...sampleVehicle, price: 0 }],
    ['fractional cents', { ...sampleVehicle, price: 10.999 }],
    ['negative quantity', { ...sampleVehicle, quantity: -1 }],
    ['fractional quantity', { ...sampleVehicle, quantity: 1.5 }],
  ])('returns 400 for %s', async (_label, body) => {
    const res = await request(app).post('/api/vehicles').set(admin).send(body);
    expect(res.status).toBe(400);
  });

  it('returns 401 without a token', async () => {
    expect((await request(app).post('/api/vehicles').send(sampleVehicle)).status).toBe(401);
  });

  it('returns 403 for a regular user', async () => {
    expect((await request(app).post('/api/vehicles').set(user).send(sampleVehicle)).status).toBe(403);
  });
});

describe('GET /api/vehicles', () => {
  it('lists every vehicle, newest first', async () => {
    await createVehicle({ model: 'Older' });
    await createVehicle({ model: 'Newer' });
    const res = await request(app).get('/api/vehicles').set(user);
    expect(res.status).toBe(200);
    expect(res.body.map((v: { model: string }) => v.model)).toEqual(['Newer', 'Older']);
  });

  it('returns 401 without a token', async () => {
    expect((await request(app).get('/api/vehicles')).status).toBe(401);
  });
});

describe('GET /api/vehicles/:id', () => {
  it('returns one vehicle', async () => {
    const v = await createVehicle();
    const res = await request(app).get(`/api/vehicles/${v.id}`).set(user);
    expect(res.status).toBe(200);
    expect(res.body.id).toBe(v.id);
  });

  it('returns 404 for an unknown id and 400 for a malformed one', async () => {
    expect((await request(app).get(`/api/vehicles/${MISSING_ID}`).set(user)).status).toBe(404);
    expect((await request(app).get('/api/vehicles/not-a-uuid').set(user)).status).toBe(400);
  });
});

describe('PUT /api/vehicles/:id', () => {
  it('lets an admin update some fields and keeps the rest', async () => {
    const v = await createVehicle();
    const res = await request(app).put(`/api/vehicles/${v.id}`).set(admin).send({ price: 20000 });
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ price: 20000, make: 'Toyota', quantity: 4 });
  });

  it('returns 400 for an empty or invalid update', async () => {
    const v = await createVehicle();
    expect((await request(app).put(`/api/vehicles/${v.id}`).set(admin).send({})).status).toBe(400);
    expect((await request(app).put(`/api/vehicles/${v.id}`).set(admin).send({ price: -5 })).status).toBe(400);
  });

  it('returns 404 for an unknown vehicle', async () => {
    expect((await request(app).put(`/api/vehicles/${MISSING_ID}`).set(admin).send({ price: 1 })).status).toBe(404);
  });

  it('returns 403 for a regular user', async () => {
    const v = await createVehicle();
    expect((await request(app).put(`/api/vehicles/${v.id}`).set(user).send({ price: 1 })).status).toBe(403);
  });
});

describe('DELETE /api/vehicles/:id', () => {
  it('lets an admin delete a vehicle (204), after which it is gone', async () => {
    const v = await createVehicle();
    expect((await request(app).delete(`/api/vehicles/${v.id}`).set(admin)).status).toBe(204);
    expect((await request(app).get(`/api/vehicles/${v.id}`).set(user)).status).toBe(404);
  });

  it('returns 403 for a regular user and leaves the vehicle in place', async () => {
    const v = await createVehicle();
    expect((await request(app).delete(`/api/vehicles/${v.id}`).set(user)).status).toBe(403);
    expect((await request(app).get(`/api/vehicles/${v.id}`).set(user)).status).toBe(200);
  });

  it('returns 404 for an unknown vehicle', async () => {
    expect((await request(app).delete(`/api/vehicles/${MISSING_ID}`).set(admin)).status).toBe(404);
  });
});
