const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { LeadsService } = require('./dist/modules/leads/leads.service');

async function test() {
  const service = new LeadsService(prisma);
  await service.createLead(1, {
    customerName: "Brand New Dealer",
    customerType: "Wholesale/Dealer",
    mobileNumber: "1231231234",
    status: "OPEN"
  });
  console.log("Lead created!");
  const dealers = await prisma.masterData.findMany({
    where: { masterConfig: { slug: 'dealers' } }
  });
  console.log("Dealers master count:", dealers.length);
  const staticDealers = await prisma.dealer.findMany();
  console.log("Static Dealers count:", staticDealers.length);
}
test().catch(console.error).finally(() => prisma.$disconnect());
