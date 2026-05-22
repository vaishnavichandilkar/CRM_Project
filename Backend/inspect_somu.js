const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  const lead = await prisma.lead.findFirst({
    where: { leadNumber: 'LD-0013' },
    include: { customer: true }
  });
  console.log("LEAD DATA:", JSON.stringify(lead, null, 2));
}

run().catch(e => console.error(e)).finally(() => prisma.$disconnect());
