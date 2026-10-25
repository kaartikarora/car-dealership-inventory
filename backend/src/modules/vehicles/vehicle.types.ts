import { Category } from '../../generated/prisma/enums';

// The vehicle as the API returns it. Price is a plain number (Decimal in the database).
export interface Vehicle {
  id: string;
  make: string;
  model: string;
  category: Category;
  price: number;
  quantity: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface VehicleInput {
  make: string;
  model: string;
  category: Category;
  price: number;
  quantity: number;
}

export type VehicleUpdate = Partial<VehicleInput>;
