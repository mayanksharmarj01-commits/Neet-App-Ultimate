const db = require('./src/config/db');

async function addRolesToEnum() {
    console.log('🔧 Adding admin and teacher roles to enum...\n');

    try {
        // Try to add 'teacher' value
        console.log('Adding "teacher" to user_role enum...');
        try {
            await db.query("ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'teacher'");
            console.log('✅ "teacher" role added\n');
        } catch (err) {
            if (err.message.includes('already exists')) {
                console.log('ℹ️  "teacher" role already exists\n');
            } else {
                throw err;
            }
        }

        // Try to add 'admin' value
        console.log('Adding "admin" to user_role enum...');
        try {
            await db.query("ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'admin'");
            console.log('✅ "admin" role added\n');
        } catch (err) {
            if (err.message.includes('already exists')) {
                console.log('ℹ️  "admin" role already exists\n');
            } else {
                throw err;
            }
        }

        // Verify all enum values
        const enumValues = await db.query(`
            SELECT enumlabel 
            FROM pg_enum 
            WHERE enumtypid = (
                SELECT oid 
                FROM pg_type 
                WHERE typname = 'user_role'
            )
            ORDER BY enumlabel
        `);

        console.log('✅ Success! Valid user roles are now:');
        enumValues.rows.forEach(row => {
            console.log(`   ✓ ${row.enumlabel}`);
        });

        console.log('\n✨ You can now use: node update-role.js email@example.com admin');

    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error('\nIf "IF NOT EXISTS" is not supported, run these commands manually:');
        console.error(`  ALTER TYPE user_role ADD VALUE 'teacher';`);
        console.error(`  ALTER TYPE user_role ADD VALUE 'admin';`);
    } finally {
        process.exit(0);
    }
}

addRolesToEnum();
