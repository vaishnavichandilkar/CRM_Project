import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const categories = await prisma.category.findMany();
  console.log('--- Categories ---');
  console.log(JSON.stringify(categories, null, 2));
  
  const products = await prisma.product.findMany({
    include: { category: true }
  });
  console.log('\n--- Products ---');
  console.log(JSON.stringify(products, null, 2));
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
