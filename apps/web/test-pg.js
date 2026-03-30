require('dotenv').config({ path: '.env.local' });
const { Client } = require('pg');
const client = new Client({
  connectionString: process.env.DIRECT_URL
});
client.connect()
  .then(() => { console.log('PG CONNECTED'); return client.end(); })
  .catch(e => { console.log('PG ERROR:', e.message); process.exit(1); });
