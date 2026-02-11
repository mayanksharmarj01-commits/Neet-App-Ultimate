const { Pool } = require('pg');
require('dotenv').config();

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
