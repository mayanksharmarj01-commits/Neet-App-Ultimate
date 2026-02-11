const db = require('./src/config/db');

async function updateUserRole() {
    const args = process.argv.slice(2);

    if (args.length < 2) {
        console.log('Usage: node update-role.js <email> <role>');
        console.log('Roles: student, teacher, admin');
        process.exit(1);
    }

    const [email, role] = args;

    const validRoles = ['student', 'teacher', 'admin'];
    if (!validRoles.includes(role)) {
        console.log('❌ Invalid role. Must be: student, teacher, or admin');
        process.exit(1);
    }

    try {
        const result = await db.query(
            'UPDATE users SET role = $1 WHERE email = $2 RETURNING id, name, email, role',
            [role, email]
        );

        if (result.rows.length === 0) {
            console.log(`❌ No user found with email: ${email}`);
        } else {
            console.log('✅ User role updated successfully!');
            console.log(result.rows[0]);
        }
    } catch (error) {
        console.error('❌ Error updating role:', error);
    } finally {
        process.exit(0);
    }
}

updateUserRole();
