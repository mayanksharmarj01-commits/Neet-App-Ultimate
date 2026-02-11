-- Fix user roles - Add admin and teacher to enum type
-- Run this SQL in your PostgreSQL database

-- Option 1: If you have user_role ENUM, alter it to add new values
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'admin';
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'teacher';

-- Option 2: If the above doesn't work, drop and recreate the enum
-- First, change column to text temporarily
ALTER TABLE users ALTER COLUMN role TYPE VARCHAR(50);

-- Drop the old enum
DROP TYPE IF EXISTS user_role;

-- Create new enum with all values
CREATE TYPE user_role AS ENUM ('student', 'teacher', 'admin');

-- Change column back to use the enum
ALTER TABLE users ALTER COLUMN role TYPE user_role USING role::user_role;

-- Set default value
ALTER TABLE users ALTER COLUMN role SET DEFAULT 'student';
