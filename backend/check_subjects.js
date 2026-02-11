const db = require('./src/config/db');

async function checkSubjects() {
    try {
        console.log('Checking subjects table...');
        const res = await db.query('SELECT * FROM subjects');
        console.log(`Found ${res.rows.length} subjects:`);
        console.table(res.rows);

        if (res.rows.length === 0) {
            console.log('Subjects table is empty! Seeding default subjects...');
            await db.query(`
                INSERT INTO subjects (name, icon) VALUES 
                ('Physics', 'Atom'),
                ('Chemistry', 'Activity'),
                ('Botany', 'Book'),
                ('Zoology', 'Dna')
                ON CONFLICT DO NOTHING;
            `);
            console.log('✅ Default subjects seeded.');
        }

        process.exit(0);
    } catch (err) {
        console.error('❌ Error checking/seeding subjects:', err);
        process.exit(1);
    }
}

checkSubjects();
