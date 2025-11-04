-- Add role and account_status columns to user_profiles table
-- This enables the admin account approval workflow

-- Add phone_number column if it doesn't exist (needed for admin accounts)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'user_profiles' 
        AND column_name = 'phone_number'
    ) THEN
        ALTER TABLE public.user_profiles 
        ADD COLUMN phone_number text;
        
        COMMENT ON COLUMN public.user_profiles.phone_number IS 'User phone number (optional)';
    END IF;
END $$;

-- Add role column if it doesn't exist
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
        
        COMMENT ON COLUMN public.user_profiles.role IS 'User role: student, teacher, admin, or parent';
    END IF;
END $$;

-- Add account_status column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'user_profiles' 
        AND column_name = 'account_status'
    ) THEN
        ALTER TABLE public.user_profiles 
        ADD COLUMN account_status text DEFAULT 'approved' CHECK (account_status IN ('pending', 'approved', 'rejected'));
        
        COMMENT ON COLUMN public.user_profiles.account_status IS 'Account approval status for admin/teacher accounts';
    END IF;
END $$;

-- Update existing records to have approved status if NULL
UPDATE public.user_profiles 
SET account_status = 'approved' 
WHERE account_status IS NULL;

-- Set role for existing records based on their presence in other tables
-- Students: if they don't have a role yet, default to 'student'
UPDATE public.user_profiles 
SET role = 'student' 
WHERE role IS NULL;

-- Update admins if they exist in admins table
UPDATE public.user_profiles up
SET role = 'admin', account_status = 'approved'
FROM public.admins a
WHERE up.user_id = a.user_id AND up.role IS NULL;

-- Update parents if they exist in parents table
UPDATE public.user_profiles up
SET role = 'parent', account_status = 'approved'
FROM public.parents p
WHERE up.user_id = p.user_id AND up.role IS NULL;

-- Create index on account_status for faster queries
CREATE INDEX IF NOT EXISTS idx_user_profiles_account_status 
ON public.user_profiles(account_status);

-- Create index on role for faster queries
CREATE INDEX IF NOT EXISTS idx_user_profiles_role 
ON public.user_profiles(role);

-- Display results
SELECT 
    role,
    account_status,
    COUNT(*) as count
FROM public.user_profiles
GROUP BY role, account_status
ORDER BY role, account_status;

SELECT 'Migration completed successfully!' as status;
