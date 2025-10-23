-- COMPREHENSIVE DATABASE MIGRATION SCRIPT
-- This script will clean up your Supabase database schema according to the new requirements

-- =====================================================
-- STEP 1: BACKUP IMPORTANT DATA (OPTIONAL BUT RECOMMENDED)
-- =====================================================

-- If you want to backup data from old tables before dropping them:
-- CREATE TABLE profiles_backup AS SELECT * FROM profiles;
-- CREATE TABLE user_activity_progress_backup AS SELECT * FROM user_activity_progress;
-- CREATE TABLE "Activities_backup" AS SELECT * FROM "Activities";

-- =====================================================
-- STEP 2: UPDATE FOREIGN KEY CONSTRAINTS FOR NOTIFICATIONS
-- =====================================================

-- Drop old foreign key constraints on notifications table
ALTER TABLE notifications DROP CONSTRAINT IF EXISTS notifications_recipient_id_fkey;

-- Add new constraints to reference parents and admins directly
-- (Assuming recipient_id can reference either parents or admins)
-- Note: You may need to add a recipient_type column to distinguish between parent and admin

-- =====================================================
-- STEP 3: UPDATE FOREIGN KEY CONSTRAINTS FOR ALERTS
-- =====================================================

-- Drop old foreign key constraints on alerts table
ALTER TABLE alert DROP CONSTRAINT IF EXISTS alert_user_profile_id_fkey;

-- Update alerts table to reference students instead of user_profiles
-- First, add a new column for student_id if it doesn't exist
ALTER TABLE alert ADD COLUMN IF NOT EXISTS student_id INTEGER;

-- Update existing records (if you have data to migrate)
-- UPDATE alert SET student_id = (
--     SELECT s.id FROM students s 
--     JOIN user_profiles up ON s.profile_id = up.id 
--     WHERE up.id = alert.user_profile_id
-- );

-- Add foreign key constraint to students table
ALTER TABLE alert 
  ADD CONSTRAINT alert_student_id_fkey 
  FOREIGN KEY (student_id) 
  REFERENCES students(id) 
  ON DELETE CASCADE;

-- Remove the old user_profile_id column after migration
-- ALTER TABLE alert DROP COLUMN IF EXISTS user_profile_id;

-- =====================================================
-- STEP 4: UPDATE FOREIGN KEY CONSTRAINTS FOR STUDENT_PROGRESS
-- =====================================================

-- student_progress should reference students, parents, and admins
-- Add foreign key constraints as needed (assuming these columns exist)

-- For students reference:
ALTER TABLE student_progress DROP CONSTRAINT IF EXISTS student_progress_student_id_fkey;
ALTER TABLE student_progress 
  ADD CONSTRAINT student_progress_student_id_fkey 
  FOREIGN KEY (student_id) 
  REFERENCES students(id) 
  ON DELETE CASCADE;

-- =====================================================
-- STEP 5: UPDATE TABLES TO USE NEW STRUCTURE
-- =====================================================

-- Update parents table to have direct user info (if columns don't exist)
ALTER TABLE parents ADD COLUMN IF NOT EXISTS user_id UUID;
ALTER TABLE parents ADD COLUMN IF NOT EXISTS full_name TEXT;
ALTER TABLE parents ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE parents ADD COLUMN IF NOT EXISTS phone_number TEXT;
ALTER TABLE parents ADD COLUMN IF NOT EXISTS address TEXT;

-- Add foreign key to auth.users
ALTER TABLE parents 
  ADD CONSTRAINT parents_user_id_fkey 
  FOREIGN KEY (user_id) 
  REFERENCES auth.users(id) 
  ON DELETE CASCADE;

-- Update admins table to have direct user info (if columns don't exist)
ALTER TABLE admins ADD COLUMN IF NOT EXISTS user_id UUID;
ALTER TABLE admins ADD COLUMN IF NOT EXISTS full_name TEXT;
ALTER TABLE admins ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE admins ADD COLUMN IF NOT EXISTS phone_number TEXT;
ALTER TABLE admins ADD COLUMN IF NOT EXISTS address TEXT;

-- Add foreign key to auth.users
ALTER TABLE admins 
  ADD CONSTRAINT admins_user_id_fkey 
  FOREIGN KEY (user_id) 
  REFERENCES auth.users(id) 
  ON DELETE CASCADE;

-- =====================================================
-- STEP 6: REMOVE UNWANTED COLUMNS FROM USER_PROFILES
-- =====================================================

-- Remove stars_earned and learning_styles columns from user_profiles
ALTER TABLE user_profiles DROP COLUMN IF EXISTS stars_earned;
ALTER TABLE user_profiles DROP COLUMN IF EXISTS learning_styles;

-- =====================================================
-- STEP 7: DROP OLD FOREIGN KEY CONSTRAINTS FROM OBSOLETE TABLES
-- =====================================================

-- Find and drop all foreign key constraints referencing the profiles table
DO $$ 
DECLARE
    constraint_record RECORD;
BEGIN
    FOR constraint_record IN 
        SELECT tc.constraint_name, tc.table_name
        FROM information_schema.table_constraints AS tc
        JOIN information_schema.key_column_usage AS kcu
          ON tc.constraint_name = kcu.constraint_name
          AND tc.table_schema = kcu.table_schema
        JOIN information_schema.constraint_column_usage AS ccu
          ON ccu.constraint_name = tc.constraint_name
          AND ccu.table_schema = tc.table_schema
        WHERE tc.constraint_type = 'FOREIGN KEY'
          AND ccu.table_name = 'profiles'
    LOOP
        EXECUTE 'ALTER TABLE ' || constraint_record.table_name || 
                ' DROP CONSTRAINT IF EXISTS ' || constraint_record.constraint_name;
    END LOOP;
END $$;

-- Drop foreign key constraints referencing user_activity_progress
DO $$ 
DECLARE
    constraint_record RECORD;
BEGIN
    FOR constraint_record IN 
        SELECT tc.constraint_name, tc.table_name
        FROM information_schema.table_constraints AS tc
        JOIN information_schema.key_column_usage AS kcu
          ON tc.constraint_name = kcu.constraint_name
          AND tc.table_schema = kcu.table_schema
        JOIN information_schema.constraint_column_usage AS ccu
          ON ccu.constraint_name = tc.constraint_name
          AND ccu.table_schema = tc.table_schema
        WHERE tc.constraint_type = 'FOREIGN KEY'
          AND ccu.table_name = 'user_activity_progress'
    LOOP
        EXECUTE 'ALTER TABLE ' || constraint_record.table_name || 
                ' DROP CONSTRAINT IF EXISTS ' || constraint_record.constraint_name;
    END LOOP;
END $$;

-- Drop foreign key constraints referencing Activities (uppercase)
DO $$ 
DECLARE
    constraint_record RECORD;
BEGIN
    FOR constraint_record IN 
        SELECT tc.constraint_name, tc.table_name
        FROM information_schema.table_constraints AS tc
        JOIN information_schema.key_column_usage AS kcu
          ON tc.constraint_name = kcu.constraint_name
          AND tc.table_schema = kcu.table_schema
        JOIN information_schema.constraint_column_usage AS ccu
          ON ccu.constraint_name = tc.constraint_name
          AND ccu.table_schema = tc.table_schema
        WHERE tc.constraint_type = 'FOREIGN KEY'
          AND ccu.table_name = 'Activities'
    LOOP
        EXECUTE 'ALTER TABLE ' || constraint_record.table_name || 
                ' DROP CONSTRAINT IF EXISTS ' || constraint_record.constraint_name;
    END LOOP;
END $$;

-- =====================================================
-- STEP 8: DROP OBSOLETE TABLES
-- =====================================================

-- Drop the old profiles table
DROP TABLE IF EXISTS profiles CASCADE;

-- Drop the duplicate user_activity_progress table
DROP TABLE IF EXISTS user_activity_progress CASCADE;

-- Drop the uppercase Activities table (keeping lowercase activities)
DROP TABLE IF EXISTS "Activities" CASCADE;

-- =====================================================
-- STEP 9: UPDATE NOTIFICATIONS AND ALERTS TO REFERENCE CORRECT TABLES
-- =====================================================

-- Update notifications table to reference parents and admins
-- You may need to add a recipient_type column to distinguish
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS recipient_type TEXT DEFAULT 'admin';

-- Add check constraint for recipient types
ALTER TABLE notifications 
  ADD CONSTRAINT notifications_recipient_type_check 
  CHECK (recipient_type IN ('admin', 'parent'));

-- =====================================================
-- STEP 10: CONNECT SIMULATION GAME AND OTHER TABLES TO ACTIVITIES
-- =====================================================

-- Connect simulation_game table to activities (lowercase)
-- Add activity_id column if it doesn't exist
ALTER TABLE simulation_game ADD COLUMN IF NOT EXISTS activity_id INTEGER;

-- Add foreign key constraint
ALTER TABLE simulation_game 
  ADD CONSTRAINT simulation_game_activity_id_fkey 
  FOREIGN KEY (activity_id) 
  REFERENCES activities(id) 
  ON DELETE CASCADE;

-- Connect categories table to activities if needed
-- (Assuming you want to use string references instead of separate categories table)

-- Connect difficulties table to activities if needed
-- (Assuming you want to use string references instead of separate difficulties table)

-- =====================================================
-- STEP 11: FINAL CLEANUP AND VERIFICATION
-- =====================================================

-- Add updated_at triggers for timestamp management
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply to relevant tables
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;
CREATE TRIGGER update_user_profiles_updated_at 
    BEFORE UPDATE ON user_profiles 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_activities_updated_at ON activities;
CREATE TRIGGER update_activities_updated_at 
    BEFORE UPDATE ON activities 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Run these queries to verify the migration was successful:

-- 1. Check that old tables are gone
-- SELECT table_name FROM information_schema.tables 
-- WHERE table_schema = 'public' 
-- AND table_name IN ('profiles', 'user_activity_progress', 'Activities');

-- 2. Check new table structure
-- SELECT table_name, column_name, data_type 
-- FROM information_schema.columns 
-- WHERE table_name IN ('parents', 'admins', 'activities', 'user_profiles')
-- ORDER BY table_name, ordinal_position;

-- 3. Check foreign key constraints
-- SELECT tc.table_name, tc.constraint_name, ccu.table_name AS foreign_table_name
-- FROM information_schema.table_constraints AS tc
-- JOIN information_schema.constraint_column_usage AS ccu
--   ON ccu.constraint_name = tc.constraint_name
-- WHERE tc.constraint_type = 'FOREIGN KEY'
-- ORDER BY tc.table_name;

-- =====================================================
-- NOTES:
-- =====================================================
-- 1. Run this script step by step, not all at once
-- 2. Backup your database before running
-- 3. Test in a development environment first
-- 4. Some steps may need adjustment based on your exact schema
-- 5. Make sure to update your application code to match the new schema
-- =====================================================
