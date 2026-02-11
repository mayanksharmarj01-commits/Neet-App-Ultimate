const db = require('./src/config/db');

// Comprehensive chapter data for NEET Physics and Chemistry
const chapters = [
    // ========== PHYSICS (subject_id: 1) ==========
    // Class 11
    { name: 'Physical World', subject_id: 1, class_level: 11, is_reduced_syllabus: false },
    { name: 'Units and Measurements', subject_id: 1, class_level: 11, is_reduced_syllabus: false },
    { name: 'Motion in a Straight Line', subject_id: 1, class_level: 11, is_reduced_syllabus: false },
    { name: 'Motion in a Plane', subject_id: 1, class_level: 11, is_reduced_syllabus: false },
    { name: 'Laws of Motion', subject_id: 1, class_level: 11, is_reduced_syllabus: false },
    { name: 'Work, Energy and Power', subject_id: 1, class_level: 11, is_reduced_syllabus: false },
    { name: 'System of Particles and Rotational Motion', subject_id: 1, class_level: 11, is_reduced_syllabus: false },
    { name: 'Gravitation', subject_id: 1, class_level: 11, is_reduced_syllabus: false },
    { name: 'Mechanical Properties of Solids', subject_id: 1, class_level: 11, is_reduced_syllabus: false },
    { name: 'Mechanical Properties of Fluids', subject_id: 1, class_level: 11, is_reduced_syllabus: false },
    { name: 'Thermal Properties of Matter', subject_id: 1, class_level: 11, is_reduced_syllabus: false },
    { name: 'Thermodynamics', subject_id: 1, class_level: 11, is_reduced_syllabus: false },
    { name: 'Kinetic Theory', subject_id: 1, class_level: 11, is_reduced_syllabus: false },
    { name: 'Oscillations', subject_id: 1, class_level: 11, is_reduced_syllabus: false },
    { name: 'Waves', subject_id: 1, class_level: 11, is_reduced_syllabus: false },

    // Class 12
    { name: 'Electric Charges and Fields', subject_id: 1, class_level: 12, is_reduced_syllabus: false },
    { name: 'Electrostatic Potential and Capacitance', subject_id: 1, class_level: 12, is_reduced_syllabus: false },
    { name: 'Current Electricity', subject_id: 1, class_level: 12, is_reduced_syllabus: false },
    { name: 'Moving Charges and Magnetism', subject_id: 1, class_level: 12, is_reduced_syllabus: false },
    { name: 'Magnetism and Matter', subject_id: 1, class_level: 12, is_reduced_syllabus: false },
    { name: 'Electromagnetic Induction', subject_id: 1, class_level: 12, is_reduced_syllabus: false },
    { name: 'Alternating Current', subject_id: 1, class_level: 12, is_reduced_syllabus: false },
    { name: 'Electromagnetic Waves', subject_id: 1, class_level: 12, is_reduced_syllabus: false },
    { name: 'Ray Optics and Optical Instruments', subject_id: 1, class_level: 12, is_reduced_syllabus: false },
    { name: 'Wave Optics', subject_id: 1, class_level: 12, is_reduced_syllabus: false },
    { name: 'Dual Nature of Radiation and Matter', subject_id: 1, class_level: 12, is_reduced_syllabus: false },
    { name: 'Atoms', subject_id: 1, class_level: 12, is_reduced_syllabus: false },
    { name: 'Nuclei', subject_id: 1, class_level: 12, is_reduced_syllabus: false },
    { name: 'Semiconductor Electronics', subject_id: 1, class_level: 12, is_reduced_syllabus: false },
    { name: 'Communication Systems', subject_id: 1, class_level: 12, is_reduced_syllabus: true },

    // ========== CHEMISTRY (subject_id: 2) ==========
    // Class 11
    { name: 'Some Basic Concepts of Chemistry', subject_id: 2, class_level: 11, is_reduced_syllabus: false },
    { name: 'Structure of Atom', subject_id: 2, class_level: 11, is_reduced_syllabus: false },
    { name: 'Classification of Elements and Periodicity', subject_id: 2, class_level: 11, is_reduced_syllabus: false },
    { name: 'Chemical Bonding and Molecular Structure', subject_id: 2, class_level: 11, is_reduced_syllabus: false },
    { name: 'States of Matter', subject_id: 2, class_level: 11, is_reduced_syllabus: false },
    { name: 'Thermodynamics', subject_id: 2, class_level: 11, is_reduced_syllabus: false },
    { name: 'Equilibrium', subject_id: 2, class_level: 11, is_reduced_syllabus: false },
    { name: 'Redox Reactions', subject_id: 2, class_level: 11, is_reduced_syllabus: false },
    { name: 'Hydrogen', subject_id: 2, class_level: 11, is_reduced_syllabus: false },
    { name: 'The s-Block Elements', subject_id: 2, class_level: 11, is_reduced_syllabus: false },
    { name: 'The p-Block Elements', subject_id: 2, class_level: 11, is_reduced_syllabus: false },
    { name: 'Organic Chemistry - Basic Principles', subject_id: 2, class_level: 11, is_reduced_syllabus: false },
    { name: 'Hydrocarbons', subject_id: 2, class_level: 11, is_reduced_syllabus: false },
    { name: 'Environmental Chemistry', subject_id: 2, class_level: 11, is_reduced_syllabus: true },

    // Class 12
    { name: 'The Solid State', subject_id: 2, class_level: 12, is_reduced_syllabus: false },
    { name: 'Solutions', subject_id: 2, class_level: 12, is_reduced_syllabus: false },
    { name: 'Electrochemistry', subject_id: 2, class_level: 12, is_reduced_syllabus: false },
    { name: 'Chemical Kinetics', subject_id: 2, class_level: 12, is_reduced_syllabus: false },
    { name: 'Surface Chemistry', subject_id: 2, class_level: 12, is_reduced_syllabus: false },
    { name: 'General Principles of Isolation of Elements', subject_id: 2, class_level: 12, is_reduced_syllabus: false },
    { name: 'The p-Block Elements (Group 15-18)', subject_id: 2, class_level: 12, is_reduced_syllabus: false },
    { name: 'The d and f Block Elements', subject_id: 2, class_level: 12, is_reduced_syllabus: false },
    { name: 'Coordination Compounds', subject_id: 2, class_level: 12, is_reduced_syllabus: false },
    { name: 'Haloalkanes and Haloarenes', subject_id: 2, class_level: 12, is_reduced_syllabus: false },
    { name: 'Alcohols, Phenols and Ethers', subject_id: 2, class_level: 12, is_reduced_syllabus: false },
    { name: 'Aldehydes, Ketones and Carboxylic Acids', subject_id: 2, class_level: 12, is_reduced_syllabus: false },
    { name: 'Amines', subject_id: 2, class_level: 12, is_reduced_syllabus: false },
    { name: 'Biomolecules', subject_id: 2, class_level: 12, is_reduced_syllabus: false },
    { name: 'Polymers', subject_id: 2, class_level: 12, is_reduced_syllabus: false },
    { name: 'Chemistry in Everyday Life', subject_id: 2, class_level: 12, is_reduced_syllabus: false }
];

async function seedChapters() {
    console.log('🌱 Starting chapter seeding process...\n');

    // Validate all chapters before insertion
    console.log('✓ Validating chapter data...');
    const invalid = chapters.filter(ch => !ch.name || !ch.subject_id || !ch.class_level);
    if (invalid.length > 0) {
        console.error('❌ Invalid chapters found:');
        console.error(invalid);
        process.exit(1);
    }
    console.log(`✓ All ${chapters.length} chapters validated\n`);

    const client = await db.pool.connect();

    try {
        await client.query('BEGIN');
        console.log('✓ Transaction started\n');

        let insertedCount = 0;
        let skippedCount = 0;

        for (const chapter of chapters) {
            // Check if chapter already exists
            const existing = await client.query(
                'SELECT id FROM chapters WHERE name = $1 AND subject_id = $2',
                [chapter.name, chapter.subject_id]
            );

            if (existing.rows.length > 0) {
                console.log(`⏭️  Skipped: "${chapter.name}" (already exists)`);
                skippedCount++;
                continue;
            }

            // Insert chapter
            const result = await client.query(
                `INSERT INTO chapters (name, subject_id, class_level, is_reduced_syllabus)
                 VALUES ($1, $2, $3, $4)
                 RETURNING id, name`,
                [chapter.name, chapter.subject_id, chapter.class_level, chapter.is_reduced_syllabus]
            );

            console.log(`✅ Inserted: "${result.rows[0].name}" (ID: ${result.rows[0].id})`);
            insertedCount++;
        }

        await client.query('COMMIT');
        console.log('\n✅ Transaction committed successfully!');
        console.log(`\n📊 Summary:`);
        console.log(`   • Inserted: ${insertedCount} chapters`);
        console.log(`   • Skipped: ${skippedCount} chapters (duplicates)`);
        console.log(`   • Total: ${chapters.length} chapters processed`);

        // Show breakdown by subject
        const summary = await client.query(`
            SELECT 
                s.name as subject,
                COUNT(*) as chapter_count,
                SUM(CASE WHEN c.class_level = 11 THEN 1 ELSE 0 END) as class_11,
                SUM(CASE WHEN c.class_level = 12 THEN 1 ELSE 0 END) as class_12
            FROM chapters c
            JOIN subjects s ON c.subject_id = s.id
            GROUP BY s.name
            ORDER BY s.name
        `);

        console.log('\n📚 Chapters in Database:');
        console.table(summary.rows);

    } catch (error) {
        await client.query('ROLLBACK');
        console.error('\n❌ Error during seeding:');
        console.error(error.message);
        console.error('\nTransaction rolled back. No changes were made.');
        process.exit(1);
    } finally {
        client.release();
        process.exit(0);
    }
}

// Run the seeding
seedChapters();
