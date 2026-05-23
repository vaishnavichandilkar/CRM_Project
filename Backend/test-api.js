const fetch = require('node-fetch');

async function main() {
  const payload = {
    customerName: "New Auto Dealer",
    customerType: "Wholesale",
    mobileNumber: "9998887776",
    customerData: {
      type: "Wholesale"
    },
    status: "OPEN"
  };

  const res = await fetch('http://localhost:3000/api/leads', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  const data = await res.json();
  console.log("Lead response:", data);
}

main();
