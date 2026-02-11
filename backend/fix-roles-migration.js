const db = require('./src/config/db');

async function fixUserRoles() {
    console.log('🔧 Fixing user_role enum...\n');

    try {
        // Step 1: Change column to VARCHAR temporarily
        console.log('Step 1: Converting role column to VARCHAR...');
        await db.query('ALTER TABLE users ALTER COLUMN role TYPE VARCHAR(50)');
        console.log('✅ Column converted to VARCHAR\n');

        // Step 2: Drop old enum if exists
        console.log('Step 2: Dropping old enum type...');
        await db.query('DROP TYPE IF EXISTS user_role');
        console.log('✅ Old enum dropped\n');

        // Step 3: Create new enum with all role values
        console.log('Step 3: Creating new enum with admin, teacher, student...');
        await db.query("CREATE TYPE user_role AS ENUM ('student', 'teacher', 'admin')");
        console.log('✅ New enum created\n');

        // Step 4: Convert column back to enum
        console.log('Step 4: Converting role column back to enum...');
        await db.query("ALTER TABLE users ALTER COLUMN role TYPE user_role USING role::user_role");
        console.log('✅ Column converted to enum\n');

        // Step 5: Set default value
        console.log('Step 5: Setting default value to student...');
        await db.query("ALTER TABLE users ALTER COLUMN role SET DEFAULT 'student'");
        console.log('✅ Default value set\n');

        // Verify the changes
        const result = await db.query(`
            SELECT DISTINCT role 
            FROM users 
            ORDER BY role
        `);

        console.log('📊 Current roles in database:');
        result.rows.forEach(row => {
            console.log(`   - ${row.role}`);
        });

        console.log('\n✨ User roles fixed successfully!');
        console.log('   Valid values: student, teacher, admin\n');

    } catch (error) {
        console.error('❌ Error fixing roles:', error.message);
        console.error('\nTroubleshooting:');
        console.error('1. Make sure all existing users have role = "student"');
        console.error('2. If error persists, run the SQL manually from fix-user-roles.sql');
    } finally {
        process.exit(0);
    }
}

fixUserRoles();
