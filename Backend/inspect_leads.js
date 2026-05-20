const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const leads = await prisma.lead.findMany();
  console.log("ALL LEADS IN DB:");
  leads.forEach(l => {
    console.log(`ID: ${l.id}, LeadNum: ${l.leadNumber}, CustName: ${l.customerName}, Status: ${l.status}, IsConverted: ${l.isConverted}`);
  });
}

main().catch(e => console.error(e)).finally(() => prisma.$disconnect());
