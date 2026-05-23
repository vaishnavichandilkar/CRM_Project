import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const leads = await prisma.lead.findMany({
    include: {
      followups: true,
      history: true,
    }
  });

  console.log("=== LEADS IN DATABASE ===");
  for (const lead of leads) {
    console.log(`Lead ID: ${lead.id}, Customer: ${lead.customerName}, Status: ${lead.status}`);
    console.log(`Follow-ups count: ${lead.followups.length}`);
    for (const f of lead.followups) {
      console.log(`  - Follow-up ID: ${f.id}, callDate: ${f.callDate ? f.callDate.toISOString() : null}, nextFollowupDate: ${f.nextFollowupDate ? f.nextFollowupDate.toISOString() : null}, callTime: ${f.callTime}, callType: ${f.callType}, status: ${f.status}`);
    }
    console.log(`History count: ${lead.history.length}`);
    for (const h of lead.history) {
      console.log(`  - History ID: ${h.id}, old: ${h.oldStatus}, new: ${h.newStatus}, timestamp: ${h.timestamp.toISOString()}`);
    }
    console.log("------------------------");
  }
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
