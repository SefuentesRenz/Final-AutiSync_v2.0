-- ============================================================================
-- ADD UNIQUE CONSTRAINTS FOR EMAIL AND FULL NAME
-- ============================================================================
-- This script adds unique constraints to prevent duplicate emails and 
-- duplicate full names within each role table
-- ============================================================================

-- 1. USER_PROFILES TABLE (Students)
-- Add unique constraint for email in user_profiles
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'user_profiles_email_unique'
    ) THEN
        ALTER TABLE user_profiles 
        ADD CONSTRAINT user_profiles_email_unique UNIQUE (email);
        RAISE NOTICE 'Added unique constraint for user_profiles.email';
    ELSE
        RAISE NOTICE 'Unique constraint for user_profiles.email already exists';
    END IF;
END $$;

-- Add unique constraint for full_name in user_profiles (case-insensitive)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'user_profiles_full_name_unique'
    ) THEN
        -- Create unique index with LOWER() for case-insensitive comparison
        CREATE UNIQUE INDEX user_profiles_full_name_unique 
        ON user_profiles (LOWER(full_name));
        RAISE NOTICE 'Added unique constraint for user_profiles.full_name (case-insensitive)';
    ELSE
        RAISE NOTICE 'Unique constraint for user_profiles.full_name already exists';
    END IF;
END $$;

-- 2. ADMINS TABLE (Teachers/Admins)
-- Add unique constraint for email in admins
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'admins_email_unique'
    ) THEN
        ALTER TABLE admins 
        ADD CONSTRAINT admins_email_unique UNIQUE (email);
        RAISE NOTICE 'Added unique constraint for admins.email';
    ELSE
        RAISE NOTICE 'Unique constraint for admins.email already exists';
    END IF;
END $$;

-- Add unique constraint for full_name in admins (case-insensitive)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'admins_full_name_unique'
    ) THEN
        -- Create unique index with LOWER() for case-insensitive comparison
        CREATE UNIQUE INDEX admins_full_name_unique 
        ON admins (LOWER(full_name));
        RAISE NOTICE 'Added unique constraint for admins.full_name (case-insensitive)';
    ELSE
        RAISE NOTICE 'Unique constraint for admins.full_name already exists';
    END IF;
END $$;

-- 3. PARENTS TABLE
-- Add unique constraint for email in parents
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'parents_email_unique'
    ) THEN
        ALTER TABLE parents 
        ADD CONSTRAINT parents_email_unique UNIQUE (email);
        RAISE NOTICE 'Added unique constraint for parents.email';
    ELSE
        RAISE NOTICE 'Unique constraint for parents.email already exists';
    END IF;
END $$;

-- Add unique constraint for full_name in parents (case-insensitive)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'parents_full_name_unique'
    ) THEN
        -- Create unique index with LOWER() for case-insensitive comparison
        CREATE UNIQUE INDEX parents_full_name_unique 
        ON parents (LOWER(full_name));
        RAISE NOTICE 'Added unique constraint for parents.full_name (case-insensitive)';
    ELSE
        RAISE NOTICE 'Unique constraint for parents.full_name already exists';
    END IF;
END $$;

-- ============================================================================
-- VERIFY CONSTRAINTS
-- ============================================================================

-- Check all unique constraints
SELECT 
    conname as constraint_name,
    conrelid::regclass as table_name,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint
WHERE conname LIKE '%email_unique' OR conname LIKE '%full_name_unique'
ORDER BY conrelid::regclass, conname;

-- Check for any existing duplicate emails (should be empty after cleanup)
SELECT 'user_profiles' as table_name, email, COUNT(*) as count
FROM user_profiles
GROUP BY email
HAVING COUNT(*) > 1
UNION ALL
SELECT 'admins' as table_name, email, COUNT(*) as count
FROM admins
GROUP BY email
HAVING COUNT(*) > 1
UNION ALL
SELECT 'parents' as table_name, email, COUNT(*) as count
FROM parents
GROUP BY email
HAVING COUNT(*) > 1;

-- Check for any existing duplicate full names (should be empty after cleanup)
SELECT 'user_profiles' as table_name, full_name, COUNT(*) as count
FROM user_profiles
GROUP BY LOWER(full_name)
HAVING COUNT(*) > 1
UNION ALL
SELECT 'admins' as table_name, full_name, COUNT(*) as count
FROM admins
GROUP BY LOWER(full_name)
HAVING COUNT(*) > 1
UNION ALL
SELECT 'parents' as table_name, full_name, COUNT(*) as count
FROM parents
GROUP BY LOWER(full_name)
HAVING COUNT(*) > 1;

-- ============================================================================
-- CLEANUP DUPLICATES (if any exist)
-- ============================================================================
-- Run this section ONLY if the verification queries above show duplicates

-- CAUTION: This will delete duplicate records, keeping only the most recent one
-- Uncomment and run ONLY if duplicates exist:

/*
-- Clean up duplicate emails in user_profiles (keep most recent)
WITH ranked AS (
  SELECT id, ROW_NUMBER() OVER (PARTITION BY email ORDER BY created_at DESC NULLS LAST) as rn
  FROM user_profiles
)
DELETE FROM user_profiles WHERE id IN (SELECT id FROM ranked WHERE rn > 1);

-- Clean up duplicate emails in admins (keep most recent)
WITH ranked AS (
  SELECT id, ROW_NUMBER() OVER (PARTITION BY email ORDER BY created_at DESC NULLS LAST) as rn
  FROM admins
)
DELETE FROM admins WHERE id IN (SELECT id FROM ranked WHERE rn > 1);

-- Clean up duplicate emails in parents (keep most recent)
WITH ranked AS (
  SELECT id, ROW_NUMBER() OVER (PARTITION BY email ORDER BY created_at DESC NULLS LAST) as rn
  FROM parents
)
DELETE FROM parents WHERE id IN (SELECT id FROM ranked WHERE rn > 1);

-- Clean up duplicate full names in user_profiles (keep most recent)
WITH ranked AS (
  SELECT id, ROW_NUMBER() OVER (PARTITION BY LOWER(full_name) ORDER BY created_at DESC NULLS LAST) as rn
  FROM user_profiles
)
DELETE FROM user_profiles WHERE id IN (SELECT id FROM ranked WHERE rn > 1);

-- Clean up duplicate full names in admins (keep most recent)
WITH ranked AS (
  SELECT id, ROW_NUMBER() OVER (PARTITION BY LOWER(full_name) ORDER BY created_at DESC NULLS LAST) as rn
  FROM admins
)
DELETE FROM admins WHERE id IN (SELECT id FROM ranked WHERE rn > 1);

-- Clean up duplicate full names in parents (keep most recent)
WITH ranked AS (
  SELECT id, ROW_NUMBER() OVER (PARTITION BY LOWER(full_name) ORDER BY created_at DESC NULLS LAST) as rn
  FROM parents
)
DELETE FROM parents WHERE id IN (SELECT id FROM ranked WHERE rn > 1);
*/
