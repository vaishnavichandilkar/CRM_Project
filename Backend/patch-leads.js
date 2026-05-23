const fs = require('fs');
const path = require('path');

const leadsServicePath = path.join(__dirname, 'src/modules/leads/leads.service.ts');
let content = fs.readFileSync(leadsServicePath, 'utf8');

const replacementBlock = `
      const custType = (dto.customerData?.type || dto.customerType || rawDto.type || 'Retail').toLowerCase();
      const isDealer = custType.includes('dealer') || custType.includes('wholesale');
      const targetSlug = isDealer ? 'dealers' : 'customers';

      const customerConfig = await this.prisma.masterConfig.findUnique({
        where: { slug: targetSlug },
      });

      if (customerConfig) {
        const existingCustomers = await this.prisma.masterData.findMany({
          where: { masterConfigId: customerConfig.id },
        });

        const emailToCheck = dto.email?.trim() || dto.customerData?.email?.trim();
        const phoneToCheck = dto.mobileNumber?.trim() || dto.customerData?.phone?.trim() || rawDto.phone?.trim() || dto.customerData?.mobileNumber?.trim();
        const nameToCheck = dto.customerName?.trim() || dto.customerData?.name?.trim();

        const matchedCustomer = existingCustomers.find((c: any) => {
          const cData = c.data as any;
          if (!cData) return false;

          const emailMatch = emailToCheck && cData.email && cData.email.toLowerCase() === emailToCheck.toLowerCase();
          const nameMatch = nameToCheck && cData.name && cData.name.toLowerCase() === nameToCheck.toLowerCase();

          // A match is only valid if:
          // 1. The name matches exactly (case-insensitive) OR
          // 2. The email matches exactly (case-insensitive) AND nameToCheck is either missing or matches
          if (nameMatch) return true;
          if (emailMatch && (!nameToCheck || !cData.name || cData.name.toLowerCase() === nameToCheck.toLowerCase())) return true;

          return false;
        });

        if (matchedCustomer) {
          finalCustomerId = matchedCustomer.id;
        } else if (nameToCheck) {
          const newCustomerData: any = {
            name: nameToCheck,
            email: emailToCheck || '',
            phone: phoneToCheck || '',
            region: dto.customerData?.region || rawDto.region || 'North',
            type: dto.customerData?.type || dto.customerType || rawDto.type || 'Retail',
            address: dto.address || dto.customerData?.address || '',
          };

          if (dto.customerData && typeof dto.customerData === 'object') {
            for (const key of Object.keys(dto.customerData)) {
              if (newCustomerData[key] === undefined) {
                newCustomerData[key] = dto.customerData[key];
              }
            }
          }

          if (isDealer) {
            newCustomerData.contactPerson = nameToCheck; // fallback
          }

          if (!newCustomerData.customerCode && !isDealer) {
            const currentCustomerRecordsCount = await this.prisma.masterData.count({
              where: { masterConfigId: customerConfig.id }
            });
            newCustomerData.customerCode = \`CUST\${String(currentCustomerRecordsCount + 1).padStart(3, '0')}\`;
          }

          const createdCustomer = await this.prisma.masterData.create({
            data: {
              masterConfigId: customerConfig.id,
              data: newCustomerData,
            },
          });

          finalCustomerId = createdCustomer.id;

          // Synchronize to static Customer table
          try {
            const rawRegion = (newCustomerData.region || 'North').toUpperCase();
            const validRegion = ['NORTH', 'SOUTH', 'EAST', 'WEST'].includes(rawRegion) ? rawRegion : 'NORTH';
            
            const rawType = (newCustomerData.type || 'Retail').toUpperCase();
            const validCustomerType = ['RETAIL', 'WHOLESALE'].includes(rawType) ? rawType : 'RETAIL';

            if (isDealer) {
              await this.prisma.dealer.create({
                data: {
                  name: newCustomerData.name,
                  contactPerson: newCustomerData.contactPerson || newCustomerData.name,
                  phone: newCustomerData.phone || '',
                  region: validRegion as any,
                }
              });
            } else {
              const uniqueEmail = newCustomerData.email && newCustomerData.email.trim() !== '' 
                ? newCustomerData.email.trim().toLowerCase() 
                : \`temp_\${Date.now()}_\${Math.random().toString(36).substr(2, 5)}@example.com\`;

              const existingStatic = await this.prisma.customer.findUnique({
                where: { email: uniqueEmail }
              });

              if (!existingStatic) {
                await this.prisma.customer.create({
                  data: {
                    name: newCustomerData.name,
                    email: uniqueEmail,
                    phone: newCustomerData.phone || '',
                    region: validRegion as any,
                    type: validCustomerType as any,
                    address: newCustomerData.address || '',
                  }
                });
              }
            }
          } catch (err) {
            console.error("Failed to sync to static Customer model:", err);
          }
        }
      }
`;

const searchPattern = /const customerConfig = await this\.prisma\.masterConfig\.findUnique\(\{\s*where: \{ slug: 'customers' \},\s*\}\);.*?catch \(err\) \{\s*console\.error\("Failed to sync to static Customer model:", err\);\s*\}\s*\}\s*\}\s*\}/gs;

// Replace both occurrences
let matches = 0;
content = content.replace(searchPattern, (match) => {
    matches++;
    return replacementBlock;
});

console.log('Matches replaced:', matches);

if (matches === 2) {
    fs.writeFileSync(leadsServicePath, content);
    console.log('Successfully patched leads.service.ts');
} else {
    console.log('Failed to patch, expected 2 matches, found ' + matches);
}
