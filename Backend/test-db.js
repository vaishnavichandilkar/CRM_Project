const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function test() {
  const customerConfig = await prisma.masterConfig.findUnique({ where: { slug: 'dealers' } });
  
  const createdCustomer = await prisma.masterData.create({
    data: {
      masterConfigId: customerConfig.id,
      data: {
        name: "Test Direct Dealer",
        phone: "1231231234",
        region: "North",
        contactPerson: "Test Direct Dealer"
      },
    },
  });
  console.log("Direct dealer created:", createdCustomer);
}
test().catch(console.error).finally(() => prisma.$disconnect());
