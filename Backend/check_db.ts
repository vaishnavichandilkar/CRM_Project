import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const tables: any[] = await prisma.$queryRaw`SELECT table_name FROM information_schema.tables WHERE table_schema='public'`;
  console.log('Tables in database:', tables.map(t => t.table_name));
}
main().finally(() => prisma.$disconnect());
