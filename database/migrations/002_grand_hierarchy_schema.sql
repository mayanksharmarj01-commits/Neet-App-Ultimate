-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. ENUMS for Questions
CREATE TYPE question_level AS ENUM (
    'NCERT_Example', 
    'Foundation', 
    'NEET_PYQ', 
    'AIIMS_PYQ', 
    'JEE_Main_Selection'
);

CREATE TYPE question_type AS ENUM (
    'MCQ', 
    'Assertion_Reason', 
    'Match_Column', 
    'Statement_Based', 
    'Diagram_Based', 
    'Graph_Interpretation', 
    'Incorrect_Statement'
);

CREATE TYPE user_role AS ENUM ('student', 'teacher');
CREATE TYPE subscription_type AS ENUM ('free', 'premium', 'pro');
CREATE TYPE chapter_status AS ENUM ('not_started', 'in_progress', 'completed');

-- 2. Core Hierarchy
CREATE TABLE subjects (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    icon_url TEXT,
    total_questions INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE chapters (
    id SERIAL PRIMARY KEY,
    subject_id INTEGER REFERENCES subjects(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    class_level INTEGER CHECK (class_level IN (11, 12)),
    is_reduced_syllabus BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    chapter_id INTEGER REFERENCES chapters(id) ON DELETE CASCADE,
    topic_tag VARCHAR(100),
    level question_level NOT NULL,
    type question_type NOT NULL,
    content JSONB NOT NULL, -- Flexible structure for options, column A/B, image URLs etc.
    correct_answer JSONB NOT NULL, -- Can store 'A' or { "A": 1, "B": 2 }
    explanation TEXT,
    explanation_image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Users & Progress
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role user_role DEFAULT 'student',
    subscription_type subscription_type DEFAULT 'free',
    xp INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE chapter_progress (
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    chapter_id INTEGER REFERENCES chapters(id) ON DELETE CASCADE,
    status chapter_status DEFAULT 'not_started',
    accuracy_percentage DECIMAL(5,2) DEFAULT 0.00,
    is_weak_chapter BOOLEAN DEFAULT FALSE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, chapter_id)
);

CREATE TABLE attempts (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    question_id UUID REFERENCES questions(id) ON DELETE CASCADE,
    time_taken_seconds INTEGER,
    is_correct BOOLEAN NOT NULL,
    selected_option JSONB,
    attempted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_questions_chapter ON questions(chapter_id);
CREATE INDEX idx_attempts_user_question ON attempts(user_id, question_id);
CREATE INDEX idx_chapter_progress_user ON chapter_progress(user_id);
