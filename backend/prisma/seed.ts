// Seeds an admin, a demo customer and a showroom of vehicles.
// Safe to run more than once: users are upserted and vehicles are only added to an empty table.
import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { createPrismaClient } from '../src/db/prisma';

const prisma = createPrismaClient(process.env.DATABASE_URL!);

const vehicles = [
  { make: 'Toyota', model: 'Corolla', category: 'SEDAN', price: 21500, quantity: 6 },
  { make: 'Honda', model: 'Civic', category: 'SEDAN', price: 24000, quantity: 4 },
  { make: 'Hyundai', model: 'Elantra', category: 'SEDAN', price: 20800, quantity: 0 },
  { make: 'Toyota', model: 'RAV4', category: 'SUV', price: 32000, quantity: 3 },
  { make: 'Mahindra', model: 'XUV700', category: 'SUV', price: 27500, quantity: 5 },
  { make: 'Kia', model: 'Seltos', category: 'SUV', price: 23900, quantity: 1 },
  { make: 'Tesla', model: 'Model 3', category: 'EV', price: 41000, quantity: 2 },
  { make: 'Tata', model: 'Nexon EV', category: 'EV', price: 18900, quantity: 7 },
  { make: 'Hyundai', model: 'Ioniq 5', category: 'EV', price: 45500, quantity: 0 },
  { make: 'Ford', model: 'F-150', category: 'TRUCK', price: 45000, quantity: 2 },
  { make: 'Volkswagen', model: 'Golf', category: 'HATCHBACK', price: 26500, quantity: 3 },
  { make: 'Maruti Suzuki', model: 'Swift', category: 'HATCHBACK', price: 8900, quantity: 9 },
  { make: 'Ford', model: 'Mustang', category: 'COUPE', price: 39000, quantity: 1 },
  { make: 'BMW', model: 'M4', category: 'COUPE', price: 78500, quantity: 1 },
] as const;

async function upsertUser(name: string, email: string, password: string, role: 'USER' | 'ADMIN') {
  const passwordHash = await bcrypt.hash(password, Number(process.env.BCRYPT_COST ?? 10));
  await prisma.user.upsert({
    where: { email: email.toLowerCase() },
    update: {},
    create: { name, email: email.toLowerCase(), passwordHash, role },
  });
  console.log(`${role.padEnd(5)} ready: ${email}`);
}

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminEmail || !adminPassword) throw new Error('Set ADMIN_EMAIL and ADMIN_PASSWORD before seeding');

  await upsertUser('Showroom Admin', adminEmail, adminPassword, 'ADMIN');
  if (process.env.DEMO_USER_EMAIL && process.env.DEMO_USER_PASSWORD) {
    await upsertUser('Demo Customer', process.env.DEMO_USER_EMAIL, process.env.DEMO_USER_PASSWORD, 'USER');
  }

  if ((await prisma.vehicle.count()) === 0) {
    await prisma.vehicle.createMany({ data: [...vehicles] });
    console.log(`Added ${vehicles.length} vehicles`);
  } else {
    console.log('Vehicles already present, skipped');
  }
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
