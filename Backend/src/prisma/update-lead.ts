import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const result = await prisma.lead.update({
    where: { id: 2 },
    data: {
      leadData: {
        notes: "ghghgf",
        vehicleType: "Other",
        distance: "12.5"
      }
    }
  });
  console.log('Update result:', result);
}

main().finally(() => prisma.$disconnect());
