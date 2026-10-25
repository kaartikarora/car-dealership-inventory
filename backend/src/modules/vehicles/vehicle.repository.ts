import { PrismaClient } from '../../generated/prisma/client';
import { isRecordNotFound } from '../../db/prismaErrors';
import { Vehicle, VehicleInput, VehicleUpdate } from './vehicle.types';

export interface VehicleRepository {
  list(): Promise<Vehicle[]>;
  findById(id: string): Promise<Vehicle | null>;
  create(input: VehicleInput): Promise<Vehicle>;
  update(id: string, changes: VehicleUpdate): Promise<Vehicle | null>;
  delete(id: string): Promise<boolean>;
}

type VehicleRow = Omit<Vehicle, 'price'> & { price: { toNumber(): number } };

export const toVehicle = (row: VehicleRow): Vehicle => ({ ...row, price: row.price.toNumber() });

export class PrismaVehicleRepository implements VehicleRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async list(): Promise<Vehicle[]> {
    const rows = await this.prisma.vehicle.findMany({ orderBy: { createdAt: 'desc' } });
    return rows.map(toVehicle);
  }

  async findById(id: string): Promise<Vehicle | null> {
    const row = await this.prisma.vehicle.findUnique({ where: { id } });
    return row && toVehicle(row);
  }

  async create(input: VehicleInput): Promise<Vehicle> {
    return toVehicle(await this.prisma.vehicle.create({ data: input }));
  }

  // Returns null instead of throwing when the vehicle does not exist.
  async update(id: string, changes: VehicleUpdate): Promise<Vehicle | null> {
    try {
      return toVehicle(await this.prisma.vehicle.update({ where: { id }, data: changes }));
    } catch (err) {
      if (isRecordNotFound(err)) return null;
      throw err;
    }
  }

  async delete(id: string): Promise<boolean> {
    const { count } = await this.prisma.vehicle.deleteMany({ where: { id } });
    return count === 1;
  }
}
