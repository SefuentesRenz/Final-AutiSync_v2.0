# Fix Student Profile Editing - Add functional_level Column

## Problem
Student profile editing fails with error:
```
"Error updating profile: Could not find the 'functional_level' column of 'user_profiles' in the schema cache"
```

## Solution
The `functional_level` column is missing from the `user_profiles` table. This column is important for tracking autism support levels.

## How to Fix

### Option 1: Run the Quick Migration Script (Recommended)

1. Go to your **Supabase Dashboard**
2. Navigate to **SQL Editor**
3. Open the file: `database/add_functional_level_column.sql`
4. Copy and paste the entire script into the SQL Editor
5. Click **Run** or press `Ctrl + Enter`
6. You should see: `✓ functional_level column setup complete!`

### Option 2: Run the Complete Setup Script (If starting fresh)

1. Go to your **Supabase Dashboard**
2. Navigate to **SQL Editor**
3. Open the file: `COMPLETE_SETUP.sql`
4. Copy and paste the entire script into the SQL Editor
5. Click **Run** or press `Ctrl + Enter`
6. This will add all required columns including `functional_level`

## What the Migration Does

The script adds the `functional_level` column to `user_profiles` with the following values:
- `needs_minimal_support` - Student needs minimal support
- `needs_moderate_support` - Student needs moderate support
- `needs_substantial_support` - Student needs substantial support
- Empty string `''` - Not specified

## Verify the Fix

After running the migration:

1. Refresh your application (Ctrl + F5)
2. Login as a student
3. Go to **Student Profile** page
4. Click **Edit** button
5. Try changing the **Functional Level** field
6. Click **Save Profile**
7. ✅ The profile should save successfully without errors!

## Technical Details

**Column Added:**
```sql
ALTER TABLE public.user_profiles 
ADD COLUMN functional_level text 
CHECK (functional_level IN ('needs_minimal_support', 'needs_moderate_support', 'needs_substantial_support', ''));
```

**Index Created:**
```sql
CREATE INDEX IF NOT EXISTS idx_user_profiles_functional_level 
ON public.user_profiles(functional_level);
```

## Files Updated

1. ✅ `database/add_functional_level_column.sql` - Quick migration script
2. ✅ `COMPLETE_SETUP.sql` - Updated to include functional_level column

## Need Help?

If you still encounter errors:
1. Check Supabase logs for detailed error messages
2. Verify the column was added: Run in SQL Editor:
   ```sql
   SELECT column_name, data_type 
   FROM information_schema.columns 
   WHERE table_name = 'user_profiles' 
   AND column_name = 'functional_level';
   ```
3. Make sure you're using the latest code from the repository
