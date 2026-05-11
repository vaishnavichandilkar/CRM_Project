import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

async function seedAdmin11() {
  const prisma = new PrismaClient();
  
  const adminRole = await prisma.role.findUnique({ where: { name: 'Admin' } });
  if (!adminRole) {
    console.log('Role Admin not found. Please run seed-admin.ts first.');
    return;
  }

  const adminEmail = 'admin11@crm.com';
  const hashedPassword = await bcrypt.hash('admin123', 10);
  
  await prisma.user.upsert({
    where: { email: adminEmail },
    update: { password: hashedPassword },
    create: {
      firstName: 'Admin',
      lastName: 'User',
      email: adminEmail,
      password: hashedPassword,
      roleId: adminRole.id,
      status: 'ACTIVE'
    }
  });
  
  console.log('Admin user created/updated: admin11@crm.com / admin123');
  await prisma.$disconnect();
}

seedAdmin11();
