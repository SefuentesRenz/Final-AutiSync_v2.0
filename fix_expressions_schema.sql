-- Fix Expressions table schema to use user_id instead of student_id

-- First check if the column exists and what records we have
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'Expressions' 
  AND table_schema = 'public';

-- Check current data to understand the structure
SELECT * FROM "Expressions" LIMIT 5;

-- If student_id column exists, rename it to user_id
-- (Only run this if student_id column exists)
-- ALTER TABLE "Expressions" RENAME COLUMN student_id TO user_id;

-- If user_id column doesn't exist, add it
-- ALTER TABLE "Expressions" ADD COLUMN user_id UUID;

-- If we need to migrate data from student_id to user_id:
-- UPDATE "Expressions" SET user_id = student_id WHERE user_id IS NULL;

-- Drop the old student_id column if it still exists after migration
-- ALTER TABLE "Expressions" DROP COLUMN IF EXISTS student_id;

-- Add foreign key constraint to link to user_profiles
-- ALTER TABLE "Expressions" 
-- ADD CONSTRAINT expressions_user_id_fkey 
-- FOREIGN KEY (user_id) REFERENCES user_profiles(user_id);

-- Ensure the user_id column is not null
-- ALTER TABLE "Expressions" ALTER COLUMN user_id SET NOT NULL;