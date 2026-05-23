const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const leads = await prisma.lead.findMany({
    orderBy: { createdAt: 'desc' },
    take: 5,
    include: { customer: true }
  });
  console.log(JSON.stringify(leads, null, 2));
}
main().finally(() => prisma.$disconnect());
