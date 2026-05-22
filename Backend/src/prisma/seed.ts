import { PrismaClient, UserStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { seedMasters } from './seed-masters';
import { seedProductsData } from './seed-products';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding roles and permissions...');

  // 1. Create Permissions
  const permissionsData = [
    { name: 'full_access', displayName: 'Full Access' },
    { name: 'user_management', displayName: 'User Management' },
    { name: 'system_settings', displayName: 'System Settings' },
    { name: 'reports', displayName: 'Reports' },
    { name: 'reports_basic', displayName: 'Basic Reports' },
    { name: 'sales', displayName: 'Sales' },
    { name: 'leads', displayName: 'Leads' },
    { name: 'visits', displayName: 'Visits' },
    { name: 'team_management', displayName: 'Team Management' },
    { name: 'approvals', displayName: 'Approvals' },
  ];

  const permissions = [];
  for (const p of permissionsData) {
    const permission = await prisma.permission.upsert({
      where: { name: p.name },
      update: {},
      create: p,
    });
    permissions.push(permission);
  }

  // 2. Create Roles
  const roles = [
    { name: 'Admin', description: 'Super administrator with full access' },
    { name: 'Manager', description: 'Regional or department manager' },
    { name: 'Sales Rep', description: 'Standard sales representative' },
  ];

  const createdRoles: Record<string, any> = {};
  for (const r of roles) {
    const role = await prisma.role.upsert({
      where: { name: r.name },
      update: {},
      create: r,
    });
    createdRoles[r.name] = role;
  }

  // 3. Assign Permissions to Roles
  // Admin gets all permissions
  for (const p of permissions) {
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: createdRoles['Admin'].id,
          permissionId: p.id,
        },
      },
      update: {},
      create: {
        roleId: createdRoles['Admin'].id,
        permissionId: p.id,
      },
    });
  }

  // Manager gets most permissions
  const managerPermissions = ['user_management', 'reports', 'sales', 'leads', 'visits', 'team_management', 'approvals'];
  for (const p of permissions.filter(perm => managerPermissions.includes(perm.name))) {
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: createdRoles['Manager'].id,
          permissionId: p.id,
        },
      },
      update: {},
      create: {
        roleId: createdRoles['Manager'].id,
        permissionId: p.id,
      },
    });
  }

  // Sales Rep gets basic permissions
  const salesPermissions = ['reports_basic', 'sales', 'leads', 'visits'];
  for (const p of permissions.filter(perm => salesPermissions.includes(perm.name))) {
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: createdRoles['Sales Rep'].id,
          permissionId: p.id,
        },
      },
      update: {},
      create: {
        roleId: createdRoles['Sales Rep'].id,
        permissionId: p.id,
      },
    });
  }

  // 4. Create Initial Admin User
  const adminEmail = 'admin@crm.com';
  const hashedPassword = await bcrypt.hash('admin123', 10);
  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      firstName: 'System',
      lastName: 'Admin',
      password: hashedPassword,
      roleId: createdRoles['Admin'].id,
      status: UserStatus.ACTIVE,
    },
  });

  // 5. Create Initial Categories
  const categoriesData = [
    { name: 'Electronics' },
    { name: 'Hardware' },
    { name: 'Software' },
    { name: 'Office Supplies' },
  ];

  for (const c of categoriesData) {
    await prisma.category.upsert({
      where: { name: c.name },
      update: {},
      create: c,
    });
  }

  console.log('Seeding masters...');
  await seedMasters(prisma);

  console.log('Seeding agro products...');
  await seedProductsData(prisma);

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
