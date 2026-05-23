const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const config = await prisma.masterConfig.findUnique({ where: { slug: 'dealers' }});
  if (config) {
    const data = await prisma.masterData.findMany({ where: { masterConfigId: config.id }});
    console.log("Dealers:", data);
  } else {
    console.log("Dealers config not found");
  }
}
main().finally(() => prisma.$disconnect());
