-- Clear existing dummy data (CASCADE handles chapters and questions)
TRUNCATE TABLE subjects RESTART IDENTITY CASCADE;

-- 1. Insert Core Subjects
INSERT INTO subjects (name, icon_url) VALUES 
('Physics', 'https://cdn-icons-png.flaticon.com/512/3011/3011578.png'),
('Chemistry', 'https://cdn-icons-png.flaticon.com/512/3011/3011566.png'),
('Botany', 'https://cdn-icons-png.flaticon.com/512/3011/3011590.png'),
('Zoology', 'https://cdn-icons-png.flaticon.com/512/3011/3011585.png');

-- 2. PHYSICS CHAPTERS
-- Class 11
INSERT INTO chapters (subject_id, class_level, name) 
SELECT id, 11, unnest(ARRAY[
    'Units and Measurements', 'Motion in a Straight Line', 'Motion in a Plane', 
    'Laws of Motion', 'Work, Energy and Power', 'System of Particles and Rotational Motion', 
    'Gravitation', 'Mechanical Properties of Solids', 'Mechanical Properties of Fluids', 
    'Thermal Properties of Matter', 'Thermodynamics', 'Kinetic Theory of Gases', 
    'Oscillations', 'Waves'
]) FROM subjects WHERE name = 'Physics';

-- Class 12
INSERT INTO chapters (subject_id, class_level, name) 
SELECT id, 12, unnest(ARRAY[
    'Electric Charges and Fields', 'Electrostatic Potential and Capacitance', 'Current Electricity', 
    'Moving Charges and Magnetism', 'Magnetism and Matter', 'Electromagnetic Induction', 
    'Alternating Current', 'Electromagnetic Waves', 'Ray Optics and Optical Instruments', 
    'Wave Optics', 'Dual Nature of Radiation and Matter', 'Atoms', 'Nuclei', 
    'Semiconductor Electronics'
]) FROM subjects WHERE name = 'Physics';

-- 3. CHEMISTRY CHAPTERS
-- Class 11
INSERT INTO chapters (subject_id, class_level, name) 
SELECT id, 11, unnest(ARRAY[
    'Some Basic Concepts of Chemistry', 'Structure of Atom', 'Classification of Elements and Periodicity in Properties', 
    'Chemical Bonding and Molecular Structure', 'Thermodynamics', 'Equilibrium', 'Redox Reactions', 
    'Hydrogen', 'The s-Block Elements', 'The p-Block Elements (Group 13 & 14)', 
    'Environmental Chemistry', 'Organic Chemistry – Some Basic Principles and Techniques', 'Hydrocarbons'
]) FROM subjects WHERE name = 'Chemistry';

-- Class 12
INSERT INTO chapters (subject_id, class_level, name) 
SELECT id, 12, unnest(ARRAY[
    'Solutions', 'Electrochemistry', 'Chemical Kinetics', 'Surface Chemistry', 
    'The p-Block Elements (Group 15–18)', 'The d- and f-Block Elements', 'Coordination Compounds', 
    'Haloalkanes and Haloarenes', 'Alcohols, Phenols and Ethers', 'Aldehydes, Ketones and Carboxylic Acids', 
    'Amines', 'Biomolecules', 'Polymers', 'Chemistry in Everyday Life'
]) FROM subjects WHERE name = 'Chemistry';

-- 4. BOTANY CHAPTERS
-- Class 11
INSERT INTO chapters (subject_id, class_level, name) 
SELECT id, 11, unnest(ARRAY[
    'The Living World', 'Biological Classification', 'Plant Kingdom', 
    'Morphology of Flowering Plants', 'Anatomy of Flowering Plants', 'Structural Organisation in Animals', 
    'Cell: The Unit of Life', 'Biomolecules', 'Cell Cycle and Cell Division', 
    'Transport in Plants', 'Mineral Nutrition', 'Photosynthesis in Higher Plants', 
    'Respiration in Plants', 'Plant Growth and Development'
]) FROM subjects WHERE name = 'Botany';

-- Class 12
INSERT INTO chapters (subject_id, class_level, name) 
SELECT id, 12, unnest(ARRAY[
    'Reproduction in Organisms', 'Sexual Reproduction in Flowering Plants', 'Principles of Inheritance and Variation', 
    'Molecular Basis of Inheritance', 'Evolution', 'Strategies for Enhancement in Food Production', 
    'Microbes in Human Welfare', 'Biotechnology: Principles and Processes', 'Biotechnology and its Applications', 
    'Organisms and Populations', 'Ecosystem', 'Biodiversity and Conservation', 'Environmental Issues'
]) FROM subjects WHERE name = 'Botany';

-- 5. ZOOLOGY CHAPTERS
-- Class 11
INSERT INTO chapters (subject_id, class_level, name) 
SELECT id, 11, unnest(ARRAY[
    'Animal Kingdom', 'Structural Organisation in Animals', 'Digestion and Absorption', 
    'Breathing and Exchange of Gases', 'Body Fluids and Circulation', 'Excretory Products and their Elimination', 
    'Locomotion and Movement', 'Neural Control and Coordination', 'Chemical Coordination and Integration'
]) FROM subjects WHERE name = 'Zoology';

-- Class 12
INSERT INTO chapters (subject_id, class_level, name) 
SELECT id, 12, unnest(ARRAY[
    'Human Reproduction', 'Reproductive Health', 'Human Health and Disease'
]) FROM subjects WHERE name = 'Zoology';
