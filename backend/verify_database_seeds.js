const db = require('./src/config/db');
const fs = require('fs');
const path = require('path');

async function verifySeeds() {
    try {
        console.log('🔍 Checking database for subjects...');

        // Check if subjects exist
        const result = await db.query('SELECT COUNT(*) FROM subjects');
        const count = parseInt(result.rows[0].count);

        if (count === 0) {
            console.log('📭 No subjects found. Running seed script...');

            // Read and execute the seed SQL file
            const seedSQL = fs.readFileSync(
                path.join(__dirname, '../database/seeds/002_full_syllabus_seeds.sql'),
                'utf8'
            );

            await db.query(seedSQL);
            console.log('✅ Database seeded successfully!');

            // Verify the seeding worked
            const verifyResult = await db.query('SELECT COUNT(*) FROM subjects');
            const newCount = parseInt(verifyResult.rows[0].count);
            console.log(`📚 Inserted ${newCount} subjects.`);

            // List the subjects
            const subjects = await db.query('SELECT name FROM subjects ORDER BY id');
            console.log('Subjects:', subjects.rows.map(s => s.name).join(', '));
        } else {
            console.log(`✅ Found ${count} subjects in database.`);

            // List the subjects
            const subjects = await db.query('SELECT name FROM subjects ORDER BY id');
            console.log('Subjects:', subjects.rows.map(s => s.name).join(', '));
        }

        process.exit(0);
    } catch (error) {
        console.error('❌ Error verifying/seeding database:', error);
        process.exit(1);
    }
}

verifySeeds();
