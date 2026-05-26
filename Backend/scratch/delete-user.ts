import { PrismaClient } from '@prisma/client';

async function main() {
  const prisma = new PrismaClient();
  try {
    const deleted = await prisma.user.delete({
      where: { email: 'vaishnavichandilkar26@gmail.com' }
    });
    console.log('Deleted user:', deleted);
  } catch (error) {
    console.error('Error deleting user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
