import { NotFoundError } from '../../shared/errors';
import { VehicleRepository } from './vehicle.repository';
import { Vehicle, VehicleFilters, VehicleInput, VehicleUpdate } from './vehicle.types';

export class VehicleService {
  constructor(private readonly vehicles: VehicleRepository) {}

  list(): Promise<Vehicle[]> {
    return this.vehicles.list();
  }

  search(filters: VehicleFilters): Promise<Vehicle[]> {
    return this.vehicles.search(filters);
  }

  async get(id: string): Promise<Vehicle> {
    return (await this.vehicles.findById(id)) ?? notFound();
  }

  create(input: VehicleInput): Promise<Vehicle> {
    return this.vehicles.create(input);
  }

  async update(id: string, changes: VehicleUpdate): Promise<Vehicle> {
    return (await this.vehicles.update(id, changes)) ?? notFound();
  }

  async remove(id: string): Promise<void> {
    if (!(await this.vehicles.delete(id))) notFound();
  }
}

function notFound(): never {
  throw new NotFoundError('Vehicle');
}
