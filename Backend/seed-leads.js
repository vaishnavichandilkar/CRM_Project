const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function seedLeadsConfig() {
  try {
    const defaultConfig = [
      { label: "Lead Source", key: "source", dataType: "dropdown", options: ["META_ADS", "GOOGLE_ADS", "REFERRAL", "WEBSITE", "OTHER"], validationRules: { required: true } },
      { label: "Lead Status", key: "status", dataType: "dropdown", options: ["OPEN", "IN_PROGRESS", "WON", "LOST"], validationRules: { required: true } },
      { label: "Lead Conversation Notes", key: "notes", dataType: "paragraph", validationRules: { required: false } }
    ];

    const existing = await prisma.masterConfig.findUnique({ where: { slug: 'leads' } });
    if (existing) {
      await prisma.masterConfig.update({
        where: { slug: 'leads' },
        data: { config: defaultConfig }
      });
      console.log('Successfully updated leads master config with default fields!');
    } else {
      await prisma.masterConfig.create({
        data: {
          name: 'Leads',
          slug: 'leads',
          config: defaultConfig
        }
      });
      console.log('Successfully seeded leads master config with default fields!');
    }
  } catch (error) {
    console.error('Error seeding leads config:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedLeadsConfig();
