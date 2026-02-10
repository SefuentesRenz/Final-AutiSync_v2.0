-- =========================================================
-- ADD CASE-INSENSITIVE UNIQUE CONSTRAINTS
-- =========================================================
-- This migration enforces case-insensitive uniqueness for
-- email and full_name across all user tables to prevent
-- duplicate accounts with different case variations.
-- =========================================================

-- Step 1: Drop existing unique constraints if they exist
ALTER TABLE user_profiles DROP CONSTRAINT IF EXISTS user_profiles_email_key;
ALTER TABLE user_profiles DROP CONSTRAINT IF EXISTS user_profiles_full_name_key;
ALTER TABLE admins DROP CONSTRAINT IF EXISTS admins_email_key;
ALTER TABLE admins DROP CONSTRAINT IF EXISTS admins_full_name_key;
ALTER TABLE parents DROP CONSTRAINT IF EXISTS parents_email_key;
ALTER TABLE parents DROP CONSTRAINT IF EXISTS parents_full_name_key;

-- Step 2: Drop existing unique indexes if they exist
DROP INDEX IF EXISTS user_profiles_email_unique_idx;
DROP INDEX IF EXISTS user_profiles_full_name_unique_idx;
DROP INDEX IF EXISTS admins_email_unique_idx;
DROP INDEX IF EXISTS admins_full_name_unique_idx;
DROP INDEX IF EXISTS parents_email_unique_idx;
DROP INDEX IF EXISTS parents_full_name_unique_idx;

-- Step 3: Create case-insensitive unique indexes for email
-- Using LOWER() function to ensure case-insensitive uniqueness
CREATE UNIQUE INDEX user_profiles_email_unique_idx ON user_profiles (LOWER(email));
CREATE UNIQUE INDEX admins_email_unique_idx ON admins (LOWER(email));
CREATE UNIQUE INDEX parents_email_unique_idx ON parents (LOWER(email));

-- Step 4: Create case-insensitive unique indexes for full_name
-- Using LOWER() and TRIM() to ensure case-insensitive uniqueness
CREATE UNIQUE INDEX user_profiles_full_name_unique_idx ON user_profiles (LOWER(TRIM(full_name)));
CREATE UNIQUE INDEX admins_full_name_unique_idx ON admins (LOWER(TRIM(full_name)));
CREATE UNIQUE INDEX parents_full_name_unique_idx ON parents (LOWER(TRIM(full_name)));

-- =========================================================
-- VERIFICATION QUERIES
-- =========================================================
-- Run these to verify the constraints are in place:

-- Check indexes on user_profiles
SELECT 
    indexname, 
    indexdef 
FROM 
    pg_indexes 
WHERE 
    tablename = 'user_profiles' 
    AND (indexname LIKE '%email%' OR indexname LIKE '%full_name%');

-- Check indexes on admins
SELECT 
    indexname, 
    indexdef 
FROM 
    pg_indexes 
WHERE 
    tablename = 'admins' 
    AND (indexname LIKE '%email%' OR indexname LIKE '%full_name%');

-- Check indexes on parents
SELECT 
    indexname, 
    indexdef 
FROM 
    pg_indexes 
WHERE 
    tablename = 'parents' 
    AND (indexname LIKE '%email%' OR indexname LIKE '%full_name%');

-- =========================================================
-- CLEANUP: Find and remove case-insensitive duplicates
-- =========================================================
-- Before running this migration, you may want to identify
-- and clean up any existing case-insensitive duplicates:

-- Find duplicate emails in user_profiles (case-insensitive)
SELECT 
    LOWER(email) as normalized_email,
    COUNT(*) as count,
    STRING_AGG(email, ', ') as variations
FROM user_profiles
GROUP BY LOWER(email)
HAVING COUNT(*) > 1;

-- Find duplicate full names in user_profiles (case-insensitive)
SELECT 
    LOWER(TRIM(full_name)) as normalized_name,
    COUNT(*) as count,
    STRING_AGG(full_name, ', ') as variations
FROM user_profiles
GROUP BY LOWER(TRIM(full_name))
HAVING COUNT(*) > 1;

-- Repeat for admins and parents tables...

-- =========================================================
-- NOTES
-- =========================================================
-- 1. This migration will FAIL if there are existing records
--    with case-insensitive duplicates.
-- 2. Clean up duplicates before running this migration.
-- 3. The LOWER() function ensures "Asi Valdez" and "asi valdez"
--    are treated as the same value.
-- 4. Application code should also validate case-insensitively
--    to provide better error messages to users.
-- =========================================================
