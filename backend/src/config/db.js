const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

let connectionString = process.env.DATABASE_URL || '';

// Normalize sslmode parameter to prevent pg-connection-string deprecation warning
if (
  connectionString &&
  connectionString.includes('sslmode=require') &&
  !connectionString.includes('uselibpqcompat=')
) {
  connectionString += '&uselibpqcompat=true';
}

const pool = new Pool({
  connectionString: connectionString || undefined,
  ssl: connectionString
    ? {
        rejectUnauthorized: false
      }
    : false
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle PostgreSQL client:', err.message);
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool
};
