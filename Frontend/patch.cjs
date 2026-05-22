const fs = require('fs');
let file = fs.readFileSync('src/app/pages/LeadsPage.tsx', 'utf8');
file = file.split('const custType = (formData.customerType || formData.type || formData.customerData?.type || "").toLowerCase();').join('const custType = (formData.type || formData.customerData?.type || formData.customerType || "").toLowerCase();');
fs.writeFileSync('src/app/pages/LeadsPage.tsx', file);
console.log('Patched correctly!');
