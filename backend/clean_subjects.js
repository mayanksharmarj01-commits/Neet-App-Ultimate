const db = require('./src/config/db');

async function cleanSubjects() {
    try {
        console.log('Cleaning up subjects table...');

        // Remove names with extra quotes
        await db.query(`UPDATE subjects SET name = TRIM(BOTH '''' FROM name)`);

        // Remove duplicates (keep lowest ID for each name)
        await db.query(`
            DELETE FROM subjects 
            WHERE id NOT IN (
                SELECT MIN(id) 
                FROM subjects 
                GROUP BY name
            )
        `);

        const res = await db.query('SELECT * FROM subjects');
        console.log(`Cleaned up! Found ${res.rows.length} unique subjects:`);
        console.table(res.rows);

        process.exit(0);
    } catch (err) {
        console.error('❌ Error cleaning subjects:', err);
        process.exit(1);
    }
}

cleanSubjects();
