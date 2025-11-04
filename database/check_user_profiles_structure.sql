-- Quick check of user_profiles table structure
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'user_profiles'
ORDER BY ordinal_position;

-- Check if the required columns exist
SELECT 
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'user_profiles' 
            AND column_name = 'phone_number'
        ) THEN '✓ phone_number exists'
        ELSE '✗ phone_number MISSING'
    END as phone_number_check,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'user_profiles' 
            AND column_name = 'role'
        ) THEN '✓ role exists'
        ELSE '✗ role MISSING'
    END as role_check,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'user_profiles' 
            AND column_name = 'account_status'
        ) THEN '✓ account_status exists'
        ELSE '✗ account_status MISSING'
    END as account_status_check;
