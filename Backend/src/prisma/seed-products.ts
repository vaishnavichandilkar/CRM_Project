import { PrismaClient } from '@prisma/client';

export async function seedProductsData(prisma: PrismaClient) {
  const productsConfig = await prisma.masterConfig.findUnique({
    where: { slug: 'products' },
  });

  if (!productsConfig) {
    console.log('Products config not found, skipping product seed.');
    return;
  }

  const productsToSeed = [
    { name: 'Heat Plus', quantity: '2 Kg 750 gm', dealerRate: 1040, customerRate: 1280 },
    { name: 'Growmax', quantity: '300 gm', dealerRate: 200, customerRate: 230 },
    { name: 'Growmax', quantity: '1 kg', dealerRate: 468, customerRate: 595 },
    { name: 'Navmin', quantity: '1 kg', dealerRate: 171, customerRate: 217 },
    { name: 'Navmin', quantity: '5 Kg', dealerRate: 798, customerRate: 1015 },
    { name: 'Navmin', quantity: '20 kg', dealerRate: 3190, customerRate: 4060 },
    { name: 'Garbhacare', quantity: '1 kg', dealerRate: 450, customerRate: 576 },
    { name: 'Mast Guard', quantity: '250 gm', dealerRate: 330, customerRate: 420 },
    { name: 'Mast Guard', quantity: '500 gm', dealerRate: 605, customerRate: 770 },
    { name: 'Milkiyana', quantity: '1 Ltr', dealerRate: 185, customerRate: 233 },
    { name: 'Milkiyana', quantity: '5 Ltr', dealerRate: 700, customerRate: 910 },
    { name: 'Fat Plus', quantity: '300 gm', dealerRate: 200, customerRate: 260 },
    { name: 'Dugdh samrudhi sarki pend', quantity: '40kg', dealerRate: 1700, customerRate: 1750 },
    { name: 'Murghas', quantity: 'kg', dealerRate: 7.1, customerRate: 7.5 },
  ];

  // First, wipe all existing products to prevent duplicates during re-seeds
  await prisma.masterData.deleteMany({
    where: {
      masterConfigId: productsConfig.id
    }
  });

  for (let i = 0; i < productsToSeed.length; i++) {
    const p = productsToSeed[i];
    
    const productData = {
      name: p.name,
      quantity: p.quantity,
      dealerRate: p.dealerRate,
      customerRate: p.customerRate,
    };

    await prisma.masterData.create({
      data: {
        masterConfigId: productsConfig.id,
        data: productData,
      }
    });
  }

  console.log(`Seeded ${productsToSeed.length} products dynamically!`);
}
