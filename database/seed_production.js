const { Pool } = require('pg');
require('dotenv').config({ path: './backend/.env' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

const seedProduction = async () => {
  try {
    console.log('🌱 Starting Production Seeding...');

    // 0. Create Tables (SCHEMA MIGRATION)
    console.log('🏗️  Creating Database Schema...');

    // Safe execution block - handling potential "type already exists" errors gracefully via catch or IF NOT EXISTS logic where possible
    // Note: Use IF NOT EXISTS for tables/extensions. For types, we'll try/catch block them or just let them error (harmless usually)

    await pool.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";');

    // Create ENUMS (Postgres doesn't support IF NOT EXISTS for types easily in one line, so using a DO block)
    await pool.query(`
      DO $$
      BEGIN
          IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'question_level') THEN
              CREATE TYPE question_level AS ENUM ('NCERT_Example', 'Foundation', 'NEET_PYQ', 'AIIMS_PYQ', 'JEE_Main_Selection');
          END IF;
          IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'question_type') THEN
              CREATE TYPE question_type AS ENUM ('MCQ', 'Assertion_Reason', 'Match_Column', 'Statement_Based', 'Diagram_Based', 'Graph_Interpretation', 'Incorrect_Statement');
          END IF;
          IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
              CREATE TYPE user_role AS ENUM ('student', 'teacher');
          END IF;
          IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'subscription_type') THEN
              CREATE TYPE subscription_type AS ENUM ('free', 'premium', 'pro');
          END IF;
          IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'chapter_status') THEN
              CREATE TYPE chapter_status AS ENUM ('not_started', 'in_progress', 'completed');
          END IF;
      END$$;
    `);

    // Create Tables
    await pool.query(`
      CREATE TABLE IF NOT EXISTS subjects (
          id SERIAL PRIMARY KEY,
          name VARCHAR(100) NOT NULL,
          icon_url TEXT,
          total_questions INTEGER DEFAULT 0,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS chapters (
          id SERIAL PRIMARY KEY,
          subject_id INTEGER REFERENCES subjects(id) ON DELETE CASCADE,
          name VARCHAR(255) NOT NULL,
          class_level INTEGER CHECK (class_level IN (11, 12)),
          is_reduced_syllabus BOOLEAN DEFAULT FALSE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS questions (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          chapter_id INTEGER REFERENCES chapters(id) ON DELETE CASCADE,
          topic_tag VARCHAR(100),
          level question_level NOT NULL,
          type question_type NOT NULL,
          content JSONB NOT NULL,
          correct_answer JSONB NOT NULL,
          explanation TEXT,
          explanation_image_url TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS users (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          name VARCHAR(255) NOT NULL,
          email VARCHAR(255) UNIQUE NOT NULL,
          password_hash TEXT NOT NULL,
          role user_role DEFAULT 'student',
          subscription_type subscription_type DEFAULT 'free',
          xp INTEGER DEFAULT 0,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS chapter_progress (
          user_id UUID REFERENCES users(id) ON DELETE CASCADE,
          chapter_id INTEGER REFERENCES chapters(id) ON DELETE CASCADE,
          status chapter_status DEFAULT 'not_started',
          accuracy_percentage DECIMAL(5,2) DEFAULT 0.00,
          is_weak_chapter BOOLEAN DEFAULT FALSE,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          PRIMARY KEY (user_id, chapter_id)
      );

      CREATE TABLE IF NOT EXISTS attempts (
          id SERIAL PRIMARY KEY,
          user_id UUID REFERENCES users(id) ON DELETE CASCADE,
          question_id UUID REFERENCES questions(id) ON DELETE CASCADE,
          time_taken_seconds INTEGER,
          is_correct BOOLEAN NOT NULL,
          selected_option JSONB,
          attempted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE INDEX IF NOT EXISTS idx_questions_chapter ON questions(chapter_id);
      CREATE INDEX IF NOT EXISTS idx_attempts_user_question ON attempts(user_id, question_id);
      CREATE INDEX IF NOT EXISTS idx_chapter_progress_user ON chapter_progress(user_id);
    `);

    console.log('✅ Schema Created Successfully.');

    // 1. Insert Subjects
    console.log('📚 Integrating Subjects...');
    await pool.query(`
      INSERT INTO subjects (name, icon_url) VALUES 
      ('Physics', 'https://cdn-icons-png.flaticon.com/512/3011/3011578.png'),
      ('Chemistry', 'https://cdn-icons-png.flaticon.com/512/3011/3011566.png'),
      ('Botany', 'https://cdn-icons-png.flaticon.com/512/3011/3011590.png'),
      ('Zoology', 'https://cdn-icons-png.flaticon.com/512/3011/3011585.png')
      ON CONFLICT DO NOTHING;
    `);

    // 2. Insert Physics Chapters (Class 11 & 12)
    console.log('⚡ Inserting Physics Chapters...');
    const physicsQuery = `
      INSERT INTO chapters (subject_id, class_level, name) 
      SELECT id, 11, unnest(ARRAY[
        'Units and Measurements', 'Motion in a Straight Line', 'Motion in a Plane', 
        'Laws of Motion', 'Work, Energy and Power', 'System of Particles and Rotational Motion', 
        'Gravitation', 'Mechanical Properties of Solids', 'Mechanical Properties of Fluids', 
        'Thermal Properties of Matter', 'Thermodynamics', 'Kinetic Theory of Gases', 
        'Oscillations', 'Waves'
      ]::text[]) FROM subjects WHERE name = 'Physics'
      UNION ALL
      SELECT id, 12, unnest(ARRAY[
        'Electric Charges and Fields', 'Electrostatic Potential and Capacitance', 'Current Electricity', 
        'Moving Charges and Magnetism', 'Magnetism and Matter', 'Electromagnetic Induction', 
        'Alternating Current', 'Electromagnetic Waves', 'Ray Optics and Optical Instruments', 
        'Wave Optics', 'Dual Nature of Radiation and Matter', 'Atoms', 'Nuclei', 
        'Semiconductor Electronics'
      ]::text[]) FROM subjects WHERE name = 'Physics'
      ON CONFLICT DO NOTHING;
    `;
    await pool.query(physicsQuery);

    // 3. Insert Chemistry Chapters
    console.log('🧪 Inserting Chemistry Chapters...');
    const chemistryQuery = `
      INSERT INTO chapters (subject_id, class_level, name) 
      SELECT id, 11, unnest(ARRAY[
        'Some Basic Concepts of Chemistry', 'Structure of Atom', 'Classification of Elements and Periodicity in Properties', 
        'Chemical Bonding and Molecular Structure', 'Thermodynamics', 'Equilibrium', 'Redox Reactions', 
        'Hydrogen', 'The s-Block Elements', 'The p-Block Elements (Group 13 & 14)', 
        'Environmental Chemistry', 'Organic Chemistry – Some Basic Principles and Techniques', 'Hydrocarbons'
      ]::text[]) FROM subjects WHERE name = 'Chemistry'
      UNION ALL
      SELECT id, 12, unnest(ARRAY[
        'Solutions', 'Electrochemistry', 'Chemical Kinetics', 'Surface Chemistry', 
        'The p-Block Elements (Group 15–18)', 'The d- and f-Block Elements', 'Coordination Compounds', 
        'Haloalkanes and Haloarenes', 'Alcohols, Phenols and Ethers', 'Aldehydes, Ketones and Carboxylic Acids', 
        'Amines', 'Biomolecules', 'Polymers', 'Chemistry in Everyday Life'
      ]::text[]) FROM subjects WHERE name = 'Chemistry'
      ON CONFLICT DO NOTHING;
    `;
    await pool.query(chemistryQuery);

    // 4. Insert Botany Chapters
    console.log('🌿 Inserting Botany Chapters...');
    const botanyQuery = `
      INSERT INTO chapters (subject_id, class_level, name) 
      SELECT id, 11, unnest(ARRAY[
        'The Living World', 'Biological Classification', 'Plant Kingdom', 
        'Morphology of Flowering Plants', 'Anatomy of Flowering Plants', 
        'Cell: The Unit of Life', 'Biomolecules', 'Cell Cycle and Cell Division', 
        'Transport in Plants', 'Mineral Nutrition', 'Photosynthesis in Higher Plants', 
        'Respiration in Plants', 'Plant Growth and Development'
      ]::text[]) FROM subjects WHERE name = 'Botany'
      UNION ALL
      SELECT id, 12, unnest(ARRAY[
        'Reproduction in Organisms', 'Sexual Reproduction in Flowering Plants', 'Principles of Inheritance and Variation', 
        'Molecular Basis of Inheritance', 'Evolution', 'Strategies for Enhancement in Food Production', 
        'Microbes in Human Welfare', 'Biotechnology: Principles and Processes', 'Biotechnology and its Applications', 
        'Organisms and Populations', 'Ecosystem', 'Biodiversity and Conservation', 'Environmental Issues'
      ]::text[]) FROM subjects WHERE name = 'Botany'
      ON CONFLICT DO NOTHING;
    `;
    await pool.query(botanyQuery);

    // 5. Insert Zoology Chapters
    console.log('🦁 Inserting Zoology Chapters...');
    const zoologyQuery = `
      INSERT INTO chapters (subject_id, class_level, name) 
      SELECT id, 11, unnest(ARRAY[
        'Animal Kingdom', 'Structural Organisation in Animals', 'Digestion and Absorption', 
        'Breathing and Exchange of Gases', 'Body Fluids and Circulation', 'Excretory Products and their Elimination', 
        'Locomotion and Movement', 'Neural Control and Coordination', 'Chemical Coordination and Integration'
      ]::text[]) FROM subjects WHERE name = 'Zoology'
      UNION ALL
      SELECT id, 12, unnest(ARRAY[
        'Human Reproduction', 'Reproductive Health', 'Human Health and Disease'
      ]::text[]) FROM subjects WHERE name = 'Zoology'
      ON CONFLICT DO NOTHING;
    `;
    await pool.query(zoologyQuery);

    console.log('✅ Seeding Complete! The hierarchy is ready.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding Failed:', err);
    process.exit(1);
  }
};

seedProduction();
