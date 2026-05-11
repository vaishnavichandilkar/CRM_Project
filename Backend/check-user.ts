import { PrismaClient } from '@prisma/client';

async function checkUser() {
  const prisma = new PrismaClient();
  const email = 'vaishnavichandilkar26@gmail.com';
  const user = await prisma.user.findUnique({ where: { email } });
  if (user) {
    console.log('USER_FOUND:', JSON.stringify(user));
  } else {
    console.log('USER_NOT_FOUND');
  }
  await prisma.$disconnect();
}

checkUser();
