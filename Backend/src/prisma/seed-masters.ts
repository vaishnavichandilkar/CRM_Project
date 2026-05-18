import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const masters = [
    {
      name: 'Products',
      slug: 'products',
      config: [
        { label: 'Product Name', key: 'name', dataType: 'string', validationRules: { required: true } },
        { label: 'SKU', key: 'sku', dataType: 'string', validationRules: { required: true } },
        { 
          label: 'Category', 
          key: 'category', 
          dataType: 'dropdown', 
          options: ['Feed', 'Medicine', 'Equipment', 'Chicks', 'General'],
          validationRules: { required: true } 
        },
        { label: 'Price', key: 'price', dataType: 'number', validationRules: { required: true } },
        { label: 'Stock Quantity', key: 'stockQuantity', dataType: 'number', validationRules: { required: true } },
        { label: 'Description', key: 'description', dataType: 'paragraph' },
      ],
    },
    {
      name: 'Customers',
      slug: 'customers',
      config: [
        { label: 'Customer Name', key: 'name', dataType: 'string', validationRules: { required: true } },
        { label: 'Email', key: 'email', dataType: 'string', validationRules: { required: true } },
        { label: 'Phone', key: 'phone', dataType: 'string', validationRules: { required: true } },
        { 
          label: 'Region', 
          key: 'region', 
          dataType: 'dropdown', 
          options: ['North', 'South', 'East', 'West'],
          validationRules: { required: true } 
        },
        { 
          label: 'Customer Type', 
          key: 'type', 
          dataType: 'dropdown', 
          options: ['Retail', 'Wholesale'],
          validationRules: { required: true } 
        },
        { label: 'Address', key: 'address', dataType: 'paragraph' },
      ],
    },
    {
      name: 'Dealers',
      slug: 'dealers',
      config: [
        { label: 'Dealer Name', key: 'name', dataType: 'string', validationRules: { required: true } },
        { label: 'Contact Person', key: 'contactPerson', dataType: 'string', validationRules: { required: true } },
        { label: 'Phone', key: 'phone', dataType: 'string', validationRules: { required: true } },
        { 
          label: 'Region', 
          key: 'region', 
          dataType: 'dropdown', 
          options: ['North', 'South', 'East', 'West'],
          validationRules: { required: true } 
        },
      ],
    },
    {
      name: 'Suppliers',
      slug: 'suppliers',
      config: [
        { label: 'Supplier Name', key: 'name', dataType: 'string', validationRules: { required: true } },
        { label: 'Contact Person', key: 'contactPerson', dataType: 'string', validationRules: { required: true } },
        { label: 'Phone', key: 'phone', dataType: 'string', validationRules: { required: true } },
        { label: 'Product Type', key: 'productType', dataType: 'string', validationRules: { required: true } },
      ],
    },
    {
      name: 'Team',
      slug: 'team',
      config: [
        { label: 'Name', key: 'name', dataType: 'string', validationRules: { required: true } },
        { label: 'Email', key: 'email', dataType: 'string', validationRules: { required: true } },
        { label: 'Phone', key: 'phone', dataType: 'string', validationRules: { required: true } },
        { label: 'Role', key: 'role', dataType: 'string', validationRules: { required: true } },
        { 
          label: 'Region', 
          key: 'region', 
          dataType: 'dropdown', 
          options: ['North', 'South', 'East', 'West'],
          validationRules: { required: true } 
        },
      ],
    },
    {
      name: 'Transporters',
      slug: 'transporters',
      config: [
        { label: 'Transporter Name', key: 'name', dataType: 'string', validationRules: { required: true } },
        { label: 'Contact Person', key: 'contactPerson', dataType: 'string', validationRules: { required: true } },
        { label: 'Phone', key: 'phone', dataType: 'string', validationRules: { required: true } },
        { 
          label: 'Vehicle Type', 
          key: 'vehicleType', 
          dataType: 'dropdown', 
          options: ['Truck', 'Van', 'Bike', 'Other'],
          validationRules: { required: true } 
        },
        { 
          label: 'Region', 
          key: 'region', 
          dataType: 'dropdown', 
          options: ['North', 'South', 'East', 'West'],
          validationRules: { required: true } 
        },
      ],
    },
    {
      name: 'Vet Docs',
      slug: 'vet-docs',
      config: [
        { label: 'Doctor Name', key: 'doctorName', dataType: 'string', validationRules: { required: true } },
        { label: 'Specialty', key: 'specialty', dataType: 'string', validationRules: { required: true } },
        { label: 'Phone', key: 'phone', dataType: 'string', validationRules: { required: true } },
        { 
          label: 'Region', 
          key: 'region', 
          dataType: 'dropdown', 
          options: ['North', 'South', 'East', 'West'],
          validationRules: { required: true } 
        },
      ],
    },
    {
      name: 'SHG',
      slug: 'shg',
      config: [
        { label: 'Group Name', key: 'groupName', dataType: 'string', validationRules: { required: true } },
        { label: 'Leader Name', key: 'leaderName', dataType: 'string', validationRules: { required: true } },
        { label: 'Number of Members', key: 'numberOfMembers', dataType: 'number', validationRules: { required: true } },
        { 
          label: 'Region', 
          key: 'region', 
          dataType: 'dropdown', 
          options: ['North', 'South', 'East', 'West'],
          validationRules: { required: true } 
        },
        { label: 'Activity', key: 'activity', dataType: 'paragraph', validationRules: { required: true } },
      ],
    },
    {
      name: 'Content Plans',
      slug: 'content-plans',
      config: [
        { label: 'Campaign Title', key: 'campaignTitle', dataType: 'string', validationRules: { required: true } },
        { 
          label: 'Platform', 
          key: 'platform', 
          dataType: 'dropdown', 
          options: ['Facebook', 'Instagram', 'LinkedIn', 'Twitter', 'YouTube'],
          validationRules: { required: true } 
        },
        { label: 'Start Date', key: 'startDate', dataType: 'date', validationRules: { required: true } },
        { label: 'End Date', key: 'endDate', dataType: 'date', validationRules: { required: true } },
      ],
    },
    {
      name: 'Promotion Designs',
      slug: 'promotion-designs',
      config: [
        { label: 'Design Title', key: 'designTitle', dataType: 'string', validationRules: { required: true } },
        { 
          label: 'Type', 
          key: 'type', 
          dataType: 'dropdown', 
          options: ['Banner', 'Flyer', 'Social Post', 'Email Template', 'Poster'],
          validationRules: { required: true } 
        },
        { 
          label: 'Status', 
          key: 'status', 
          dataType: 'dropdown', 
          options: ['Draft', 'Approved', 'In Review'],
          validationRules: { required: true } 
        },
      ],
    },
  ];

  for (const master of masters) {
    await prisma.masterConfig.upsert({
      where: { slug: master.slug },
      update: { config: master.config, name: master.name },
      create: master,
    });
    console.log(`Seeded master: ${master.name}`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
