import { PrismaClient } from '../../generated/prisma/client';
import { toVehicle } from '../vehicles/vehicle.repository';
import { Vehicle } from '../vehicles/vehicle.types';

export interface InventoryRepository {
  /** Takes one unit if any are left. Returns null when the vehicle is missing or sold out. */
  takeOne(id: string): Promise<Vehicle | null>;
  /** Adds stock. Returns null when the vehicle is missing. */
  add(id: string, amount: number): Promise<Vehicle | null>;
}

export class PrismaInventoryRepository implements InventoryRepository {
  constructor(private readonly prisma: PrismaClient) {}

  // One conditional UPDATE: "quantity = quantity - 1 WHERE id = $1 AND quantity > 0".
  // Postgres row locking means two buyers can never both take the last unit,
  // and there is no read-then-write gap for a race to slip through.
  async takeOne(id: string): Promise<Vehicle | null> {
    const { count } = await this.prisma.vehicle.updateMany({
      where: { id, quantity: { gt: 0 } },
      data: { quantity: { decrement: 1 } },
    });
    return count === 1 ? this.find(id) : null;
  }

  // Increment in SQL, so concurrent restocks add up instead of overwriting each other.
  async add(id: string, amount: number): Promise<Vehicle | null> {
    const { count } = await this.prisma.vehicle.updateMany({
      where: { id },
      data: { quantity: { increment: amount } },
    });
    return count === 1 ? this.find(id) : null;
  }

  private async find(id: string): Promise<Vehicle | null> {
    const row = await this.prisma.vehicle.findUnique({ where: { id } });
    return row && toVehicle(row);
  }
}
