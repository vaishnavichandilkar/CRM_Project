import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  try {
    const user = await prisma.user.findUnique({
      where: { email: 'ankita@gmail.com' },
      include: {
        modulePreferences: true,
        role: {
          include: {
            permissions: {
              include: {
                permission: true
              }
            }
          }
        }
      }
    });
    console.log('User query successful:', user);
  } catch (err) {
    console.error('Database query crashed:', err);
  }
}
main().finally(() => prisma.$disconnect());
