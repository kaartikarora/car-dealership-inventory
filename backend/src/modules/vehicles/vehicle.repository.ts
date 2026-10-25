import { Prisma, PrismaClient } from '../../generated/prisma/client';
import { isRecordNotFound } from '../../db/prismaErrors';
import { Vehicle, VehicleFilters, VehicleInput, VehicleSort, VehicleUpdate } from './vehicle.types';

export interface VehicleRepository {
  list(): Promise<Vehicle[]>;
  search(filters: VehicleFilters): Promise<Vehicle[]>;
  findById(id: string): Promise<Vehicle | null>;
  create(input: VehicleInput): Promise<Vehicle>;
  update(id: string, changes: VehicleUpdate): Promise<Vehicle | null>;
  delete(id: string): Promise<boolean>;
}

type VehicleRow = Omit<Vehicle, 'price'> & { price: { toNumber(): number } };

const ORDER: Record<VehicleSort, Prisma.VehicleOrderByWithRelationInput> = {
  newest: { createdAt: 'desc' },
  price_asc: { price: 'asc' },
  price_desc: { price: 'desc' },
};

// Case-insensitive substring match. Prisma binds the value as a parameter (no SQL injection),
// but does not escape LIKE wildcards, so "%" or "_" typed by a user would match everything.
const escapeLike = (value: string) => value.replace(/[\\%_]/g, (c) => `\\${c}`);
const like = (value: string) => ({ contains: escapeLike(value), mode: 'insensitive' as const });

export const toVehicle = (row: VehicleRow): Vehicle => ({ ...row, price: row.price.toNumber() });

export class PrismaVehicleRepository implements VehicleRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async list(): Promise<Vehicle[]> {
    const rows = await this.prisma.vehicle.findMany({ orderBy: { createdAt: 'desc' } });
    return rows.map(toVehicle);
  }

  async search({ q, make, model, category, minPrice, maxPrice, inStock, sort = 'newest' }: VehicleFilters): Promise<Vehicle[]> {
    const where: Prisma.VehicleWhereInput = {
      ...(q && { OR: [{ make: like(q) }, { model: like(q) }] }),
      ...(make && { make: like(make) }),
      ...(model && { model: like(model) }),
      ...(category && { category }),
      ...((minPrice !== undefined || maxPrice !== undefined) && { price: { gte: minPrice, lte: maxPrice } }),
      ...(inStock && { quantity: { gt: 0 } }),
    };
    const rows = await this.prisma.vehicle.findMany({ where, orderBy: ORDER[sort] });
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
