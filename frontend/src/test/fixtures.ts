import type { Vehicle } from '../lib/types';

export const makeVehicle = (overrides: Partial<Vehicle> = {}): Vehicle => ({
  id: 'v1',
  make: 'Toyota',
  model: 'Corolla',
  category: 'SEDAN',
  price: 21500,
  quantity: 4,
  createdAt: '2026-10-25T10:00:00.000Z',
  updatedAt: '2026-10-25T10:00:00.000Z',
  ...overrides,
});
