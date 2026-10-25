import { z } from 'zod';

export const restockSchema = z.object({
  amount: z.number().int('Amount must be a whole number').positive('Amount must be at least 1').max(10_000),
});

export type RestockInput = z.infer<typeof restockSchema>;
