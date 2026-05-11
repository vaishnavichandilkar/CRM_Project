import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

async function seedAdmin() {
  const prisma = new PrismaClient();
  
  // 1. Create/Find Admin role
  let adminRole = await prisma.role.findUnique({
    where: { name: 'Admin' }
  });
  
  if (!adminRole) {
    adminRole = await prisma.role.create({
      data: {
        name: 'Admin',
        description: 'System administrator with full access'
      }
    });
    console.log('Admin role created');
  }

  // 2. Create Admin user
  const adminEmail = 'admin1@crm.com';
  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail }
  });

  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash('admin123', 10);
    await prisma.user.create({
      data: {
        firstName: 'Admin',
        lastName: 'User',
        email: adminEmail,
        password: hashedPassword,
        roleId: adminRole.id,
        status: 'ACTIVE'
      }
    });
    console.log('Admin user created (email: admin1@crm.com, password: admin123)');
  } else {
    console.log('Admin user already exists');
  }

  await prisma.$disconnect();
}

seedAdmin();
