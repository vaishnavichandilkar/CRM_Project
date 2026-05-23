import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const masterProducts = await prisma.masterData.findMany({
    where: {
      masterConfig: { slug: 'products' }
    }
  });
  console.log('Master products matching Heat Plus:');
  masterProducts.forEach(p => {
    const data = p.data as any;
    if (data?.name?.includes('Heat Plus') || data?.productName?.includes('Heat Plus')) {
      console.log('Master ID:', p.id, 'Data:', data);
    }
  });

  const staticProducts = await prisma.product.findMany();
  console.log('Static products matching Heat Plus:');
  staticProducts.forEach(p => {
    if (p.name.includes('Heat Plus')) {
      console.log('Static ID:', p.id, 'Name:', p.name);
    }
  });
}

main().finally(() => prisma.$disconnect());
