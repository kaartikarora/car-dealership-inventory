import request from 'supertest';
import { app, resetDb } from '../helpers/testApp';
import { authHeader, createVehicle } from '../helpers/fixtures';

let user: { Authorization: string };

const search = (query: Record<string, string | number>) =>
  request(app).get('/api/vehicles/search').query(query).set(user);

const models = (res: { body: { model: string }[] }) => res.body.map((v) => v.model).sort();

beforeAll(async () => {
  await resetDb();
  user = await authHeader();
  await createVehicle({ make: 'Toyota', model: 'Corolla', category: 'SEDAN', price: 21500, quantity: 3 });
  await createVehicle({ make: 'Toyota', model: 'RAV4', category: 'SUV', price: 32000, quantity: 0 });
  await createVehicle({ make: 'Tesla', model: 'Model 3', category: 'EV', price: 41000, quantity: 2 });
  await createVehicle({ make: 'Ford', model: 'F-150', category: 'TRUCK', price: 45000, quantity: 5 });
  await createVehicle({ make: 'Honda', model: 'Civic', category: 'SEDAN', price: 24000, quantity: 1 });
});

describe('GET /api/vehicles/search', () => {
  it('matches make partially and case-insensitively', async () => {
    const res = await search({ make: 'toy' });
    expect(res.status).toBe(200);
    expect(models(res)).toEqual(['Corolla', 'RAV4']);
  });

  it('matches model partially', async () => {
    expect(models(await search({ model: 'model' }))).toEqual(['Model 3']);
  });

  it('filters by exact category', async () => {
    expect(models(await search({ category: 'SEDAN' }))).toEqual(['Civic', 'Corolla']);
  });

  it('filters by an inclusive price range', async () => {
    expect(models(await search({ minPrice: 24000, maxPrice: 41000 }))).toEqual(['Civic', 'Model 3', 'RAV4']);
  });

  it('accepts only one side of the price range', async () => {
    expect(models(await search({ minPrice: 41000 }))).toEqual(['F-150', 'Model 3']);
    expect(models(await search({ maxPrice: 21500 }))).toEqual(['Corolla']);
  });

  it('free text q matches make or model', async () => {
    expect(models(await search({ q: 'civ' }))).toEqual(['Civic']);
    expect(models(await search({ q: 'tesla' }))).toEqual(['Model 3']);
  });

  it('combines filters with AND', async () => {
    expect(models(await search({ make: 'toyota', category: 'SUV', maxPrice: 40000 }))).toEqual(['RAV4']);
  });

  it('can hide sold-out vehicles', async () => {
    expect(models(await search({ make: 'toyota', inStock: 'true' }))).toEqual(['Corolla']);
  });

  it('sorts by price when asked', async () => {
    const res = await search({ sort: 'price_asc' });
    expect(res.body.map((v: { price: number }) => v.price)).toEqual([21500, 24000, 32000, 41000, 45000]);
  });

  it('returns every vehicle when no filter is given and [] when nothing matches', async () => {
    expect((await search({})).body).toHaveLength(5);
    expect((await search({ make: 'Ferrari' })).body).toEqual([]);
  });

  it('treats LIKE wildcards in input as plain text', async () => {
    expect((await search({ make: '%' })).body).toEqual([]);
  });

  it.each([
    ['minPrice above maxPrice', { minPrice: 50000, maxPrice: 1000 }],
    ['non-numeric price', { minPrice: 'cheap' }],
    ['unknown category', { category: 'BOAT' }],
    ['unknown sort', { sort: 'random' }],
  ])('returns 400 for %s', async (_label, query) => {
    expect((await search(query)).status).toBe(400);
  });

  it('returns 401 without a token', async () => {
    expect((await request(app).get('/api/vehicles/search')).status).toBe(401);
  });
});
