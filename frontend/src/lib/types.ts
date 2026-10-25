// Shapes shared with the API (see backend/src/modules/*/types).
export type Role = 'USER' | 'ADMIN';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
}

export interface AuthResult {
  token: string;
  user: User;
}

export const CATEGORIES = ['SEDAN', 'SUV', 'HATCHBACK', 'TRUCK', 'EV', 'COUPE'] as const;
export type Category = (typeof CATEGORIES)[number];

export interface Vehicle {
  id: string;
  make: string;
  model: string;
  category: Category;
  price: number;
  quantity: number;
  createdAt: string;
  updatedAt: string;
}

export type VehicleInput = Pick<Vehicle, 'make' | 'model' | 'category' | 'price' | 'quantity'>;

export type VehicleSort = 'newest' | 'price_asc' | 'price_desc';

export interface VehicleFilters {
  q?: string;
  category?: Category;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  sort?: VehicleSort;
}
