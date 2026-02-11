const db = require('./src/config/db');

// Complete NEET Biology chapters for Botany and Zoology
const biologyChapters = [
    // ========== BOTANY (subject_id: 3) ==========
    // Class 11
    { name: 'The Living World', subject_id: 3, class_level: 11, is_reduced_syllabus: false },
    { name: 'Biological Classification', subject_id: 3, class_level: 11, is_reduced_syllabus: false },
    { name: 'Plant Kingdom', subject_id: 3, class_level: 11, is_reduced_syllabus: false },
    { name: 'Morphology of Flowering Plants', subject_id: 3, class_level: 11, is_reduced_syllabus: false },
    { name: 'Anatomy of Flowering Plants', subject_id: 3, class_level: 11, is_reduced_syllabus: false },
    { name: 'Structural Organisation in Animals', subject_id: 3, class_level: 11, is_reduced_syllabus: false },
    { name: 'Cell - The Unit of Life', subject_id: 3, class_level: 11, is_reduced_syllabus: false },
    { name: 'Biomolecules', subject_id: 3, class_level: 11, is_reduced_syllabus: false },
    { name: 'Cell Cycle and Cell Division', subject_id: 3, class_level: 11, is_reduced_syllabus: false },
    { name: 'Transport in Plants', subject_id: 3, class_level: 11, is_reduced_syllabus: false },
    { name: 'Mineral Nutrition', subject_id: 3, class_level: 11, is_reduced_syllabus: false },
    { name: 'Photosynthesis in Higher Plants', subject_id: 3, class_level: 11, is_reduced_syllabus: false },
    { name: 'Respiration in Plants', subject_id: 3, class_level: 11, is_reduced_syllabus: false },
    { name: 'Plant Growth and Development', subject_id: 3, class_level: 11, is_reduced_syllabus: false },

    // Class 12
    { name: 'Reproduction in Organisms', subject_id: 3, class_level: 12, is_reduced_syllabus: false },
    { name: 'Sexual Reproduction in Flowering Plants', subject_id: 3, class_level: 12, is_reduced_syllabus: false },
    { name: 'Principles of Inheritance and Variation', subject_id: 3, class_level: 12, is_reduced_syllabus: false },
    { name: 'Molecular Basis of Inheritance', subject_id: 3, class_level: 12, is_reduced_syllabus: false },
    { name: 'Evolution', subject_id: 3, class_level: 12, is_reduced_syllabus: false },
    { name: 'Human Health and Disease', subject_id: 3, class_level: 12, is_reduced_syllabus: false },
    { name: 'Strategies for Enhancement in Food Production', subject_id: 3, class_level: 12, is_reduced_syllabus: false },
    { name: 'Microbes in Human Welfare', subject_id: 3, class_level: 12, is_reduced_syllabus: false },
    { name: 'Biotechnology - Principles and Processes', subject_id: 3, class_level: 12, is_reduced_syllabus: false },
    { name: 'Biotechnology and its Applications', subject_id: 3, class_level: 12, is_reduced_syllabus: false },
    { name: 'Organisms and Populations', subject_id: 3, class_level: 12, is_reduced_syllabus: false },
    { name: 'Ecosystem', subject_id: 3, class_level: 12, is_reduced_syllabus: false },
    { name: 'Biodiversity and Conservation', subject_id: 3, class_level: 12, is_reduced_syllabus: false },
    { name: 'Environmental Issues', subject_id: 3, class_level: 12, is_reduced_syllabus: false },

    // ========== ZOOLOGY (subject_id: 4) ==========
    // Class 11
    { name: 'The Living World', subject_id: 4, class_level: 11, is_reduced_syllabus: false },
    { name: 'Biological Classification', subject_id: 4, class_level: 11, is_reduced_syllabus: false },
    { name: 'Animal Kingdom', subject_id: 4, class_level: 11, is_reduced_syllabus: false },
    { name: 'Structural Organisation in Animals', subject_id: 4, class_level: 11, is_reduced_syllabus: false },
    { name: 'Cell - The Unit of Life', subject_id: 4, class_level: 11, is_reduced_syllabus: false },
    { name: 'Biomolecules', subject_id: 4, class_level: 11, is_reduced_syllabus: false },
    { name: 'Cell Cycle and Cell Division', subject_id: 4, class_level: 11, is_reduced_syllabus: false },
    { name: 'Digestion and Absorption', subject_id: 4, class_level: 11, is_reduced_syllabus: false },
    { name: 'Breathing and Exchange of Gases', subject_id: 4, class_level: 11, is_reduced_syllabus: false },
    { name: 'Body Fluids and Circulation', subject_id: 4, class_level: 11, is_reduced_syllabus: false },
    { name: 'Excretory Products and their Elimination', subject_id: 4, class_level: 11, is_reduced_syllabus: false },
    { name: 'Locomotion and Movement', subject_id: 4, class_level: 11, is_reduced_syllabus: false },
    { name: 'Neural Control and Coordination', subject_id: 4, class_level: 11, is_reduced_syllabus: false },
    { name: 'Chemical Coordination and Integration', subject_id: 4, class_level: 11, is_reduced_syllabus: false },

    // Class 12
    { name: 'Reproduction in Organisms', subject_id: 4, class_level: 12, is_reduced_syllabus: false },
    { name: 'Human Reproduction', subject_id: 4, class_level: 12, is_reduced_syllabus: false },
    { name: 'Reproductive Health', subject_id: 4, class_level: 12, is_reduced_syllabus: false },
    { name: 'Principles of Inheritance and Variation', subject_id: 4, class_level: 12, is_reduced_syllabus: false },
    { name: 'Molecular Basis of Inheritance', subject_id: 4, class_level: 12, is_reduced_syllabus: false },
    { name: 'Evolution', subject_id: 4, class_level: 12, is_reduced_syllabus: false },
    { name: 'Human Health and Disease', subject_id: 4, class_level: 12, is_reduced_syllabus: false },
    { name: 'Microbes in Human Welfare', subject_id: 4, class_level: 12, is_reduced_syllabus: false },
    { name: 'Biotechnology - Principles and Processes', subject_id: 4, class_level: 12, is_reduced_syllabus: false },
    { name: 'Biotechnology and its Applications', subject_id: 4, class_level: 12, is_reduced_syllabus: false },
    { name: 'Organisms and Populations', subject_id: 4, class_level: 12, is_reduced_syllabus: false },
    { name: 'Ecosystem', subject_id: 4, class_level: 12, is_reduced_syllabus: false },
    { name: 'Biodiversity and Conservation', subject_id: 4, class_level: 12, is_reduced_syllabus: false },
    { name: 'Environmental Issues', subject_id: 4, class_level: 12, is_reduced_syllabus: false }
];

async function seedBiologyChapters() {
    console.log('🌿 Seeding Biology chapters (Botany & Zoology)...\n');

    // Validate
    console.log('✓ Validating chapter data...');
    const invalid = biologyChapters.filter(ch => !ch.name || !ch.subject_id);
    if (invalid.length > 0) {
        console.error('❌ Invalid chapters:', invalid);
        process.exit(1);
    }
    console.log(`✓ All ${biologyChapters.length} chapters validated\n`);

    const client = await db.pool.connect();

    try {
        await client.query('BEGIN');

        let inserted = 0, skipped = 0;

        for (const ch of biologyChapters) {
            const exists = await client.query(
                'SELECT id FROM chapters WHERE name = $1 AND subject_id = $2',
                [ch.name, ch.subject_id]
            );

            if (exists.rows.length > 0) {
                console.log(`⏭️  Skipped: "${ch.name}"`);
                skipped++;
            } else {
                await client.query(
                    'INSERT INTO chapters (name, subject_id, class_level, is_reduced_syllabus) VALUES ($1, $2, $3, $4)',
                    [ch.name, ch.subject_id, ch.class_level, ch.is_reduced_syllabus]
                );
                console.log(`✅ Inserted: "${ch.name}"`);
                inserted++;
            }
        }

        await client.query('COMMIT');

        console.log(`\n✅ Success!`);
        console.log(`   Inserted: ${inserted}`);
        console.log(`   Skipped: ${skipped}`);

    } catch (error) {
        await client.query('ROLLBACK');
        console.error('❌ Error:', error.message);
    } finally {
        client.release();
        process.exit(0);
    }
}

seedBiologyChapters();
