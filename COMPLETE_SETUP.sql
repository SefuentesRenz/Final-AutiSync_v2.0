-- ============================================================================
-- COMPLETE SETUP FOR ADMIN ACCOUNT APPROVAL SYSTEM
-- Run this entire script in Supabase SQL Editor
-- ============================================================================

-- Step 1: Add phone_number column (required for admin accounts)
-- ============================================================================
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'user_profiles' 
        AND column_name = 'phone_number'
    ) THEN
        ALTER TABLE public.user_profiles ADD COLUMN phone_number text;
        RAISE NOTICE '✓ Added phone_number column';
    ELSE
        RAISE NOTICE '✓ phone_number column already exists';
    END IF;
END $$;

-- Step 2: Add role column (student/teacher/admin/parent)
-- ============================================================================
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'user_profiles' 
        AND column_name = 'role'
    ) THEN
        ALTER TABLE public.user_profiles 
        ADD COLUMN role text CHECK (role IN ('student', 'teacher', 'admin', 'parent'));
        RAISE NOTICE '✓ Added role column';
    ELSE
        RAISE NOTICE '✓ role column already exists';
    END IF;
END $$;

-- Step 3: Add account_status column (pending/approved/rejected)
-- ============================================================================
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'user_profiles' 
        AND column_name = 'account_status'
    ) THEN
        ALTER TABLE public.user_profiles 
        ADD COLUMN account_status text DEFAULT 'approved' 
        CHECK (account_status IN ('pending', 'approved', 'rejected'));
        RAISE NOTICE '✓ Added account_status column';
    ELSE
        RAISE NOTICE '✓ account_status column already exists';
    END IF;
END $$;

-- Step 4: Set default values for existing records
-- ============================================================================
UPDATE public.user_profiles 
SET role = 'student' 
WHERE role IS NULL;

UPDATE public.user_profiles 
SET account_status = 'approved' 
WHERE account_status IS NULL;

-- Step 5: Update roles based on related tables
-- ============================================================================
-- Set role='admin' for users in admins table
UPDATE public.user_profiles up
SET role = 'admin', account_status = 'approved'
FROM public.admins a
WHERE up.user_id = a.user_id;

-- Set role='parent' for users in parents table  
UPDATE public.user_profiles up
SET role = 'parent', account_status = 'approved'
FROM public.parents p
WHERE up.user_id = p.user_id;

-- Step 6: Create indexes for better performance
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_user_profiles_role 
ON public.user_profiles(role);

CREATE INDEX IF NOT EXISTS idx_user_profiles_account_status 
ON public.user_profiles(account_status);

CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id 
ON public.user_profiles(user_id);

-- Step 7: Verify the setup
-- ============================================================================

-- Check if required columns exist
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'user_profiles'
AND column_name IN ('phone_number', 'role', 'account_status')
ORDER BY 
    CASE column_name
        WHEN 'phone_number' THEN 1
        WHEN 'role' THEN 2
        WHEN 'account_status' THEN 3
    END;

-- Show current data distribution
SELECT 
    COALESCE(role, 'NULL') as role,
    COALESCE(account_status, 'NULL') as account_status,
    COUNT(*) as count
FROM public.user_profiles
GROUP BY role, account_status
ORDER BY role, account_status;

-- Final success message
SELECT 
    '✅ MIGRATION COMPLETED SUCCESSFULLY!' as status,
    'Admin account approval system is now ready!' as message;

-- ============================================================================
-- WHAT THIS SCRIPT DID:
-- ============================================================================
-- 1. Added phone_number column to user_profiles
-- 2. Added role column (student/teacher/admin/parent)
-- 3. Added account_status column (pending/approved/rejected)
-- 4. Set existing records to 'student' role and 'approved' status
-- 5. Updated admin/parent roles based on existing data
-- 6. Created indexes for better query performance
-- 7. Verified all columns were added successfully
--
-- NEXT STEPS:
-- 1. Refresh your Supabase dashboard
-- 2. Test admin signup at /signuppage
-- 3. Check pending accounts at /pending-accounts
-- 4. Approve/reject test accounts
-- ============================================================================
