import { InventoryRepository } from '../../src/modules/inventory/inventory.repository';
import { InventoryService } from '../../src/modules/inventory/inventory.service';
import { VehicleRepository } from '../../src/modules/vehicles/vehicle.repository';
import { Vehicle } from '../../src/modules/vehicles/vehicle.types';
import { ConflictError, NotFoundError } from '../../src/shared/errors';

const vehicle = (quantity: number): Vehicle => ({
  id: 'v1', make: 'Kia', model: 'Seltos', category: 'SUV', price: 1, quantity, createdAt: new Date(), updatedAt: new Date(),
});

// A tiny in-memory stock table shared by both fake repositories.
function setup(initial: Vehicle | null) {
  let row = initial;
  const inventory: InventoryRepository = {
    takeOne: async () => (row && row.quantity > 0 ? (row = { ...row, quantity: row.quantity - 1 }) : null),
    add: async (_id, n) => (row ? (row = { ...row, quantity: row.quantity + n }) : null),
  };
  const vehicles = { findById: async () => row } as unknown as VehicleRepository;
  return new InventoryService(inventory, vehicles);
}

describe('InventoryService', () => {
  it('purchase returns the vehicle with one fewer in stock', async () => {
    await expect(setup(vehicle(2)).purchase('v1')).resolves.toMatchObject({ quantity: 1 });
  });

  it('purchase explains a sold-out vehicle as OUT_OF_STOCK', async () => {
    await expect(setup(vehicle(0)).purchase('v1')).rejects.toMatchObject({ code: 'OUT_OF_STOCK' });
    await expect(setup(vehicle(0)).purchase('v1')).rejects.toBeInstanceOf(ConflictError);
  });

  it('purchase explains a missing vehicle as NOT_FOUND', async () => {
    await expect(setup(null).purchase('v1')).rejects.toBeInstanceOf(NotFoundError);
  });

  it('restock adds the amount, or 404s for a missing vehicle', async () => {
    await expect(setup(vehicle(1)).restock('v1', 4)).resolves.toMatchObject({ quantity: 5 });
    await expect(setup(null).restock('v1', 4)).rejects.toBeInstanceOf(NotFoundError);
  });
});
