const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { LeadsService } = require('./dist/modules/leads/leads.service');

async function main() {
  const service = new LeadsService(prisma);
  const leadDto = {
    customerName: 'New Test Dealer',
    customerType: 'Wholesale/Dealer',
    mobileNumber: '9998887776',
    customerData: {
      type: 'Wholesale/Dealer',
    }
  };
  
  const created = await service.createLead(1, leadDto);
  console.log("Created Lead:", created);

  const dealers = await prisma.masterData.findMany({
    where: { masterConfig: { slug: 'dealers' } }
  });
  console.log("Dealers master:", dealers);
}

main().finally(() => prisma.$disconnect());
