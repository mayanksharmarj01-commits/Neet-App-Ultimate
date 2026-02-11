const db = require('./src/config/db');

async function migrate() {
    try {
        console.log('Checking for profile_picture column...');
        const res = await db.query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name='users' AND column_name='profile_picture';
        `);

        if (res.rows.length === 0) {
            console.log('Adding profile_picture column to users table...');
            await db.query('ALTER TABLE users ADD COLUMN profile_picture TEXT;');
            console.log('✅ Column added successfully.');
        } else {
            console.log('✅ Column profile_picture already exists.');
        }

        process.exit(0);
    } catch (err) {
        console.error('❌ Migration failed:', err);
        process.exit(1);
    }
}

migrate();
