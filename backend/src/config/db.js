const { Pool } = require('pg');
const dns = require('dns');
require('dotenv').config();

// Force IPv4 — fixes Render free tier IPv6 issue with Supabase
dns.setDefaultResultOrder('ipv4first');

// Pool configuration for Supabase (connection pooling)
// DATABASE_URL format: postgres://postgres.[USER]:[PASS]@[HOST]:5432/postgres
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false // Required for Supabase/Heroku in many cases
    }
});

pool.on('connect', () => {
    console.log('✅ Grand Hierarchy Database Connected');
});

pool.on('error', (err) => {
    console.error('❌ Database Pool Error:', err);
});

module.exports = {
    query: (text, params) => pool.query(text, params),
    pool
};
