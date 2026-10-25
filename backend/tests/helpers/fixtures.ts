import { prisma, tokens } from './testApp';

type Role = 'USER' | 'ADMIN';

// Creates a user straight in the database and returns an Authorization header for them.
export async function authHeader(role: Role = 'USER'): Promise<{ Authorization: string }> {
  const user = await prisma.user.create({
    data: { name: `${role} user`, email: `${role.toLowerCase()}-${Date.now()}-${Math.random()}@example.com`, passwordHash: 'x', role },
  });
  return { Authorization: `Bearer ${tokens.sign({ sub: user.id, role })}` };
}

export const sampleVehicle = { make: 'Toyota', model: 'Corolla', category: 'SEDAN', price: 21500, quantity: 4 };

export function createVehicle(overrides: Partial<typeof sampleVehicle> = {}) {
  return prisma.vehicle.create({ data: { ...sampleVehicle, ...overrides } as never });
}
