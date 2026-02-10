-- ============================================================================
-- FIX ROLE SEPARATION: Ensure proper table segregation by user role
-- ============================================================================
-- This script fixes the issue where admin/teacher accounts were being stored
-- in both user_profiles and admins tables. Each role should be in ONE table only:
-- - Students → user_profiles ONLY
-- - Teachers/Admins → admins ONLY  
-- - Parents → parents ONLY
-- ============================================================================

-- Step 1: Add account_status column to admins table if it doesn't exist
-- This allows admin accounts to require approval before logging in
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'admins' 
        AND column_name = 'account_status'
    ) THEN
        ALTER TABLE admins 
        ADD COLUMN account_status TEXT DEFAULT 'pending' 
        CHECK (account_status IN ('pending', 'approved', 'rejected'));
        
        COMMENT ON COLUMN admins.account_status IS 'Account approval status: pending (waiting approval), approved (can login), rejected (denied access)';
    END IF;
END $$;

-- Step 2: Clean up existing data - Remove admin records from user_profiles table
-- Identify admins that exist in both tables and remove them from user_profiles
DELETE FROM user_profiles 
WHERE user_id IN (
    SELECT user_id FROM admins
);

-- Step 3: Ensure proper foreign key constraints
-- Make sure all tables reference auth.users(id) correctly

-- For user_profiles (students only)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'user_profiles_user_id_fkey' 
        AND table_name = 'user_profiles'
    ) THEN
        ALTER TABLE user_profiles
        ADD CONSTRAINT user_profiles_user_id_fkey 
        FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
    END IF;
END $$;

-- For admins table (teachers/admins only)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'admins_user_id_fkey' 
        AND table_name = 'admins'
    ) THEN
        ALTER TABLE admins
        ADD CONSTRAINT admins_user_id_fkey 
        FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
    END IF;
END $$;

-- For parents table (parents only)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'parents_user_id_fkey' 
        AND table_name = 'parents'
    ) THEN
        ALTER TABLE parents
        ADD CONSTRAINT parents_user_id_fkey 
        FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Step 4: Create RLS (Row Level Security) Policies
-- Enable RLS on all role tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE parents ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Students can view own profile" ON user_profiles;
DROP POLICY IF EXISTS "Students can update own profile" ON user_profiles;
DROP POLICY IF EXISTS "Admins can view all student profiles" ON user_profiles;
DROP POLICY IF EXISTS "Admins can view own admin record" ON admins;
DROP POLICY IF EXISTS "Admins can update own admin record" ON admins;
DROP POLICY IF EXISTS "Parents can view own parent record" ON parents;
DROP POLICY IF EXISTS "Parents can update own parent record" ON parents;
DROP POLICY IF EXISTS "Service role can do anything" ON user_profiles;
DROP POLICY IF EXISTS "Service role can do anything" ON admins;
DROP POLICY IF EXISTS "Service role can do anything" ON parents;

-- ============================================================================
-- USER_PROFILES TABLE POLICIES (Students Only)
-- ============================================================================

-- Allow students to view their own profile
CREATE POLICY "Students can view own profile"
ON user_profiles
FOR SELECT
USING (auth.uid() = user_id);

-- Allow students to update their own profile
CREATE POLICY "Students can update own profile"
ON user_profiles
FOR UPDATE
USING (auth.uid() = user_id);

-- Allow admins to view all student profiles (they need this for tracking/monitoring)
CREATE POLICY "Admins can view all student profiles"
ON user_profiles
FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM admins 
        WHERE admins.user_id = auth.uid()
        AND admins.account_status = 'approved'
    )
);

-- Allow service role (backend) to do anything for user_profiles
CREATE POLICY "Service role can do anything"
ON user_profiles
FOR ALL
USING (auth.jwt()->>'role' = 'service_role');

-- ============================================================================
-- ADMINS TABLE POLICIES (Teachers/Admins Only)
-- ============================================================================

-- Allow admins to view their own record
CREATE POLICY "Admins can view own admin record"
ON admins
FOR SELECT
USING (auth.uid() = user_id);

-- Allow admins to update their own record
CREATE POLICY "Admins can update own admin record"
ON admins
FOR UPDATE
USING (auth.uid() = user_id);

-- Allow service role (backend) to do anything for admins
CREATE POLICY "Service role can do anything"
ON admins
FOR ALL
USING (auth.jwt()->>'role' = 'service_role');

-- ============================================================================
-- PARENTS TABLE POLICIES (Parents Only)
-- ============================================================================

-- Allow parents to view their own record
CREATE POLICY "Parents can view own parent record"
ON parents
FOR SELECT
USING (auth.uid() = user_id);

-- Allow parents to update their own record
CREATE POLICY "Parents can update own parent record"
ON parents
FOR UPDATE
USING (auth.uid() = user_id);

-- Allow service role (backend) to do anything for parents
CREATE POLICY "Service role can do anything"
ON parents
FOR ALL
USING (auth.jwt()->>'role' = 'service_role');

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Run these queries to verify the fixes worked correctly:

-- 1. Check for any user_ids that exist in multiple role tables (should be ZERO)
SELECT 
    'PROBLEM: User exists in multiple role tables' as issue,
    user_id,
    COUNT(*) as table_count
FROM (
    SELECT user_id, 'user_profiles' as table_name FROM user_profiles
    UNION ALL
    SELECT user_id, 'admins' as table_name FROM admins
    UNION ALL
    SELECT user_id, 'parents' as table_name FROM parents
) combined
GROUP BY user_id
HAVING COUNT(*) > 1;

-- 2. Verify all admins have account_status column
SELECT 
    full_name, 
    email, 
    account_status,
    created_at
FROM admins
ORDER BY created_at DESC;

-- 3. Check RLS is enabled
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables
WHERE tablename IN ('user_profiles', 'admins', 'parents')
ORDER BY tablename;

-- 4. List all active policies
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies
WHERE tablename IN ('user_profiles', 'admins', 'parents')
ORDER BY tablename, policyname;

-- ============================================================================
-- NOTES FOR FUTURE SIGNUPS
-- ============================================================================
-- After running this script:
-- 
-- 1. STUDENT SIGNUPS should:
--    - Create record ONLY in user_profiles table
--    - NOT create records in admins or parents tables
--
-- 2. ADMIN/TEACHER SIGNUPS should:
--    - Create record ONLY in admins table
--    - NOT create records in user_profiles or parents tables
--    - Default account_status should be 'pending' (requires approval)
--
-- 3. PARENT SIGNUPS should:
--    - Create record ONLY in parents table
--    - NOT create records in user_profiles or admins tables
--
-- 4. LOGIN VERIFICATION should:
--    - Check the user exists in the correct table for their selected role
--    - Reject login if user is in wrong table
--    - For admins, also check account_status is 'approved'
-- ============================================================================
