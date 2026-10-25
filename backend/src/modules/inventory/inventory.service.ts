import { ConflictError, NotFoundError } from '../../shared/errors';
import { VehicleRepository } from '../vehicles/vehicle.repository';
import { Vehicle } from '../vehicles/vehicle.types';
import { InventoryRepository } from './inventory.repository';

export class InventoryService {
  constructor(
    private readonly inventory: InventoryRepository,
    private readonly vehicles: VehicleRepository,
  ) {}

  async purchase(id: string): Promise<Vehicle> {
    const updated = await this.inventory.takeOne(id);
    if (updated) return updated;
    // The update matched nothing: work out why, only on the failure path.
    if (!(await this.vehicles.findById(id))) throw new NotFoundError('Vehicle');
    throw new ConflictError('OUT_OF_STOCK', 'This vehicle is out of stock');
  }

  async restock(id: string, amount: number): Promise<Vehicle> {
    const updated = await this.inventory.add(id, amount);
    if (!updated) throw new NotFoundError('Vehicle');
    return updated;
  }
}
