import { PrismaClient } from '@prisma/client';

async function listUsers() {
  const prisma = new PrismaClient();
  const users = await prisma.user.findMany({
    include: { role: true }
  });
  console.log('USERS:', JSON.stringify(users));
  await prisma.$disconnect();
}

listUsers();
