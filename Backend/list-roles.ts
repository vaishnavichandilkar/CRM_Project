import { PrismaClient } from '@prisma/client';

async function listRoles() {
  const prisma = new PrismaClient();
  const roles = await prisma.role.findMany();
  console.log('ROLES:', JSON.stringify(roles));
  await prisma.$disconnect();
}

listRoles();
