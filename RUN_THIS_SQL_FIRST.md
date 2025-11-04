# URGENT: Fix Admin Signup - Run This SQL First!

## Problem
Admin signup is failing because the `user_profiles` table is missing required columns:
- `phone_number`
- `role` 
- `account_status`

## Quick Fix - Run This SQL Now!

Open your Supabase SQL Editor and run this:

```sql
-- Step 1: Add phone_number column
ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS phone_number text;

-- Step 2: Add role column with constraint
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_profiles' AND column_name = 'role'
    ) THEN
        ALTER TABLE public.user_profiles 
        ADD COLUMN role text CHECK (role IN ('student', 'teacher', 'admin', 'parent'));
    END IF;
END $$;

-- Step 3: Add account_status column with constraint
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_profiles' AND column_name = 'account_status'
    ) THEN
        ALTER TABLE public.user_profiles 
        ADD COLUMN account_status text DEFAULT 'approved' 
        CHECK (account_status IN ('pending', 'approved', 'rejected'));
    END IF;
END $$;

-- Step 4: Set defaults for existing records
UPDATE public.user_profiles 
SET 
    role = 'student',
    account_status = 'approved'
WHERE role IS NULL OR account_status IS NULL;

-- Step 5: Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_role 
ON public.user_profiles(role);

CREATE INDEX IF NOT EXISTS idx_user_profiles_account_status 
ON public.user_profiles(account_status);

-- Step 6: Verify the changes
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'user_profiles' 
AND column_name IN ('phone_number', 'role', 'account_status');

-- You should see all 3 columns listed!
```

## After Running SQL

1. **Refresh your Supabase schema cache**:
   - Go to Supabase Dashboard
   - Click on "Table Editor"
   - Select `user_profiles` table
   - Verify the new columns appear

2. **Test admin signup**:
   - Go to your signup page
   - Select "Admin/Teacher"
   - Fill in the form
   - Submit

3. **Check pending accounts**:
   - Login as existing admin
   - Go to `/pending-accounts`
   - You should see the new signup

## What Changed

### Database Schema
- `phone_number` column added (stores admin/teacher phone numbers)
- `role` column added (student/teacher/admin/parent)
- `account_status` column added (pending/approved/rejected)

### Signup Flow
- New admin signups create profile with `account_status='pending'`
- Account appears in Pending Accounts page
- Existing admins can approve or reject

### Login Flow
- Admins with `pending` status cannot log in
- Shows message: "Your account is pending approval"
- Rejected accounts cannot log in

## Troubleshooting

### Still getting 406 errors?
1. Clear browser cache
2. Refresh Supabase dashboard
3. Run the verification query:
   ```sql
   SELECT * FROM information_schema.columns 
   WHERE table_name = 'user_profiles';
   ```

### Still getting "Auth user not ready" errors?
This is normal during signup - the system retries automatically. If signup still fails:
1. Increase wait time in code (already set to retry 5 times)
2. Check Supabase logs for rate limiting
3. Ensure email confirmation is enabled

### Account created but not showing in pending accounts?
Check the database:
```sql
SELECT user_id, full_name, email, role, account_status 
FROM user_profiles 
WHERE account_status = 'pending';
```

## Next Steps

Once SQL is run and working:
1. Test new admin signup
2. Verify appears in pending accounts
3. Test approval flow
4. Test login with approved account

## Complete Migration Script

For a complete setup including all checks and updates, run:
`database/add_account_status.sql`

This includes:
- All column additions
- Default value updates
- Index creation
- Verification queries
