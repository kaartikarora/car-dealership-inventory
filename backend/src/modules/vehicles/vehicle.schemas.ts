import { z } from 'zod';
import { Category } from '../../generated/prisma/enums';

const text = (label: string) => z.string().trim().min(1, `${label} is required`).max(60);

// Positive, at most 2 decimal places, and within DECIMAL(12,2).
const price = z
  .number()
  .positive('Price must be greater than 0')
  .max(9_999_999_999.99)
  .refine((n) => Math.abs(Math.round(n * 100) - n * 100) < 1e-6, 'Price can have at most 2 decimal places');

const quantity = z.number().int('Quantity must be a whole number').min(0).max(100_000);

export const vehicleIdSchema = z.object({ id: z.uuid('Invalid vehicle id') });

// Unknown keys (id, createdAt, ...) are stripped, so clients cannot mass-assign them.
export const createVehicleSchema = z.object({
  make: text('Make'),
  model: text('Model'),
  category: z.enum(Category),
  price,
  quantity: quantity.default(0),
});

export const updateVehicleSchema = createVehicleSchema
  .partial()
  .extend({ quantity: quantity.optional() })
  .refine((body) => Object.keys(body).length > 0, 'Provide at least one field to update');
