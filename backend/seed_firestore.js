const { db } = require('./src/config/db');

async function seedFirestore() {
    console.log('🌱 Seeding Firestore with NEET subjects and chapters...');

    // Check if subjects already exist
    const existing = await db.collection('subjects').get();
    if (!existing.empty) {
        console.log(`✅ Already have ${existing.size} subjects. Skipping seed.`);
        process.exit(0);
    }

    const subjects = [
        { name: 'Physics', icon_url: 'https://cdn-icons-png.flaticon.com/512/3011/3011578.png' },
        { name: 'Chemistry', icon_url: 'https://cdn-icons-png.flaticon.com/512/3011/3011566.png' },
        { name: 'Botany', icon_url: 'https://cdn-icons-png.flaticon.com/512/3011/3011590.png' },
        { name: 'Zoology', icon_url: 'https://cdn-icons-png.flaticon.com/512/3011/3011585.png' }
    ];

    const chaptersData = {
        Physics: {
            11: ['Units and Measurements', 'Motion in a Straight Line', 'Motion in a Plane', 'Laws of Motion', 'Work, Energy and Power', 'System of Particles and Rotational Motion', 'Gravitation', 'Mechanical Properties of Solids', 'Mechanical Properties of Fluids', 'Thermal Properties of Matter', 'Thermodynamics', 'Kinetic Theory of Gases', 'Oscillations', 'Waves'],
            12: ['Electric Charges and Fields', 'Electrostatic Potential and Capacitance', 'Current Electricity', 'Moving Charges and Magnetism', 'Magnetism and Matter', 'Electromagnetic Induction', 'Alternating Current', 'Electromagnetic Waves', 'Ray Optics and Optical Instruments', 'Wave Optics', 'Dual Nature of Radiation and Matter', 'Atoms', 'Nuclei', 'Semiconductor Electronics']
        },
        Chemistry: {
            11: ['Some Basic Concepts of Chemistry', 'Structure of Atom', 'Classification of Elements and Periodicity in Properties', 'Chemical Bonding and Molecular Structure', 'Thermodynamics', 'Equilibrium', 'Redox Reactions', 'Hydrogen', 'The s-Block Elements', 'The p-Block Elements (Group 13 & 14)', 'Environmental Chemistry', 'Organic Chemistry – Some Basic Principles and Techniques', 'Hydrocarbons'],
            12: ['Solutions', 'Electrochemistry', 'Chemical Kinetics', 'Surface Chemistry', 'The p-Block Elements (Group 15–18)', 'The d- and f-Block Elements', 'Coordination Compounds', 'Haloalkanes and Haloarenes', 'Alcohols, Phenols and Ethers', 'Aldehydes, Ketones and Carboxylic Acids', 'Amines', 'Biomolecules', 'Polymers', 'Chemistry in Everyday Life']
        },
        Botany: {
            11: ['The Living World', 'Biological Classification', 'Plant Kingdom', 'Morphology of Flowering Plants', 'Anatomy of Flowering Plants', 'Structural Organisation in Animals', 'Cell: The Unit of Life', 'Biomolecules', 'Cell Cycle and Cell Division', 'Transport in Plants', 'Mineral Nutrition', 'Photosynthesis in Higher Plants', 'Respiration in Plants', 'Plant Growth and Development'],
            12: ['Reproduction in Organisms', 'Sexual Reproduction in Flowering Plants', 'Principles of Inheritance and Variation', 'Molecular Basis of Inheritance', 'Evolution', 'Strategies for Enhancement in Food Production', 'Microbes in Human Welfare', 'Biotechnology: Principles and Processes', 'Biotechnology and its Applications', 'Organisms and Populations', 'Ecosystem', 'Biodiversity and Conservation', 'Environmental Issues']
        },
        Zoology: {
            11: ['Animal Kingdom', 'Structural Organisation in Animals', 'Digestion and Absorption', 'Breathing and Exchange of Gases', 'Body Fluids and Circulation', 'Excretory Products and their Elimination', 'Locomotion and Movement', 'Neural Control and Coordination', 'Chemical Coordination and Integration'],
            12: ['Human Reproduction', 'Reproductive Health', 'Human Health and Disease']
        }
    };

    for (const subject of subjects) {
        // Create subject
        const subjectRef = await db.collection('subjects').add(subject);
        console.log(`  📚 Created subject: ${subject.name} (${subjectRef.id})`);

        // Create chapters
        const chapters = chaptersData[subject.name];
        for (const [classLevel, chapterNames] of Object.entries(chapters)) {
            for (const chapterName of chapterNames) {
                await db.collection('chapters').add({
                    subject_id: subjectRef.id,
                    class_level: parseInt(classLevel),
                    name: chapterName
                });
            }
            console.log(`    📖 Added ${chapterNames.length} Class ${classLevel} chapters`);
        }
    }

    console.log('✅ Firestore seeded successfully!');
    process.exit(0);
}

seedFirestore().catch(err => {
    console.error('❌ Seed error:', err);
    process.exit(1);
});
