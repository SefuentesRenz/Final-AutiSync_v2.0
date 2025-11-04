-- ============================================================================
-- ADD FUNCTIONAL_LEVEL COLUMN TO USER_PROFILES
-- This column tracks autism support levels for students
-- ============================================================================

-- Add functional_level column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'user_profiles' 
        AND column_name = 'functional_level'
    ) THEN
        ALTER TABLE public.user_profiles 
        ADD COLUMN functional_level text 
        CHECK (functional_level IN ('needs_minimal_support', 'needs_moderate_support', 'needs_substantial_support', ''));
        
        RAISE NOTICE '✓ Added functional_level column';
    ELSE
        RAISE NOTICE '✓ functional_level column already exists';
    END IF;
END $$;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_functional_level 
ON public.user_profiles(functional_level);

-- Verify the column was added
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'user_profiles'
AND column_name = 'functional_level';

-- Show success message
SELECT '✓ functional_level column setup complete!' as status;
