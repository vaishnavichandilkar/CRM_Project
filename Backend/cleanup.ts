import { PrismaClient } from '@prisma/client';
import { seedProductsData } from './src/prisma/seed-products';
const prisma = new PrismaClient();
async function main() {
  await seedProductsData(prisma);
}
main().finally(() => prisma.$disconnect());
