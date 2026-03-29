const fetch = require('node-fetch'); // we use global fetch usually in Node 20+, let's just use native fetch

async function run() {
  try {
    const res = await fetch('http://localhost:3000/api/ai/auto-schedule', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ startDate: '2026-03-28', endDate: '2026-04-03', mode: 'FILL_GAPS' })
    });
    const data = await res.json();
    const proposals = data.scenarios[0].proposals;
    console.log("Got proposals:", proposals.length);
    
    console.log("Applying to bulk...");
    const res2 = await fetch('http://localhost:3000/api/planning/bulk', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ assignments: proposals })
    });
    const result = await res2.json();
    console.log("Bulk Result:", result);
  } catch (err) {
    console.error("FAIL", err);
  }
}
run();
