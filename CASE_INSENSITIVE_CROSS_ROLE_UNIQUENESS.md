# Case-Insensitive Cross-Role Uniqueness Validation

## Overview
This implementation ensures that:
1. **Case-insensitive uniqueness**: "Asi Valdez" and "asi valdez" are treated as the same name
2. **Cross-role uniqueness**: A name like "Asi Valdez" cannot be used for both a student AND a parent
3. **Email uniqueness**: Emails are unique across all roles, case-insensitive

## What This Prevents

### ❌ NOT ALLOWED (Rejected)
- Creating "Asi Valdez" as student, then "asi valdez" as parent (case variation)
- Creating "john@example.com" as admin, then "John@Example.com" as student (case variation)
- Creating "Maria Garcia" as parent, then "MARIA GARCIA" as student (case variation)
- Creating same name across different roles (e.g., "Alex Smith" as both student and admin)

### ✅ ALLOWED (Accepted)
- "John Smith" and "Jane Smith" (different names)
- "Maria Garcia" and "Maria Rodriguez" (different last names)
- Each person can only have ONE account regardless of role

## Implementation

### 1. Database Level (SQL Migration)
**File**: `database/ADD_CASE_INSENSITIVE_UNIQUE_CONSTRAINTS.sql`

Creates case-insensitive unique indexes using PostgreSQL's `LOWER()` function:
```sql
CREATE UNIQUE INDEX user_profiles_full_name_unique_idx 
ON user_profiles (LOWER(TRIM(full_name)));

CREATE UNIQUE INDEX admins_full_name_unique_idx 
ON admins (LOWER(TRIM(full_name)));

CREATE UNIQUE INDEX parents_full_name_unique_idx 
ON parents (LOWER(TRIM(full_name)));
```

**Important**: Database constraints apply per-table, but application code enforces cross-role checks.

### 2. Application Level (React Validation)
**File**: `src/pages/SignupPage.jsx`

Before signup, checks all three tables (user_profiles, admins, parents) using case-insensitive queries:
```javascript
// Check full name in ALL THREE tables (case-insensitive)
const fullNameChecks = await Promise.all([
  supabase.from('user_profiles').select('full_name').ilike('full_name', formData.fullName.trim()).limit(1),
  supabase.from('admins').select('full_name').ilike('full_name', formData.fullName.trim()).limit(1),
  supabase.from('parents').select('full_name').ilike('full_name', formData.fullName.trim()).limit(1)
]);

const fullNameExists = fullNameChecks.some(result => result.data && result.data.length > 0);
```

**Key Points**:
- Uses `.ilike()` for case-insensitive matching (PostgreSQL ILIKE operator)
- Checks all three tables regardless of the role being signed up for
- Provides clear error messages explaining the restriction

## Setup Instructions

### Step 1: Clean Up Existing Duplicates (if any)
Before applying the migration, check for existing case-insensitive duplicates:

```sql
-- Find duplicate full names (case-insensitive) in user_profiles
SELECT 
    LOWER(TRIM(full_name)) as normalized_name,
    COUNT(*) as count,
    STRING_AGG(full_name, ', ') as variations
FROM user_profiles
GROUP BY LOWER(TRIM(full_name))
HAVING COUNT(*) > 1;

-- Repeat for admins and parents tables
```

If duplicates exist, you'll need to manually resolve them before proceeding.

### Step 2: Run the SQL Migration
In Supabase SQL Editor, run:
```sql
-- Execute the entire file
-- File: database/ADD_CASE_INSENSITIVE_UNIQUE_CONSTRAINTS.sql
```

This will:
- Drop existing unique constraints
- Create new case-insensitive unique indexes
- Apply to email and full_name columns in all three tables

### Step 3: Verify Database Constraints
Run verification queries to confirm indexes are in place:
```sql
-- Check user_profiles indexes
SELECT indexname, indexdef 
FROM pg_indexes 
WHERE tablename = 'user_profiles' 
  AND (indexname LIKE '%email%' OR indexname LIKE '%full_name%');
```

You should see:
- `user_profiles_email_unique_idx`
- `user_profiles_full_name_unique_idx`

### Step 4: Test Application Validation
The code in `SignupPage.jsx` is already updated. Test the following scenarios:

#### Test 1: Case Variation - Same Role
1. Create account: "John Doe" as student
2. Try to create: "john doe" as student
3. **Expected**: ❌ Rejected with error message

#### Test 2: Case Variation - Different Role
1. Create account: "Maria Garcia" as parent
2. Try to create: "MARIA GARCIA" as student
3. **Expected**: ❌ Rejected with error message

#### Test 3: Cross-Role Same Name
1. Create account: "Alex Smith" as admin
2. Try to create: "Alex Smith" as parent (exact same case)
3. **Expected**: ❌ Rejected with error message

#### Test 4: Different Names
1. Create account: "Sarah Johnson" as student
2. Create account: "Sarah Williams" as parent
3. **Expected**: ✅ Both accepted (different last names)

## Error Messages

Users will see clear feedback:

### Email Duplicate
```
❌ This email is already registered. Please use a different email or try logging in.
```

### Full Name Duplicate (Case-Insensitive or Cross-Role)
```
❌ An account with the name "Asi Valdez" already exists (regardless of role or capitalization). 
Please use your full legal name or contact support if this is an error.
```

## Technical Details

### PostgreSQL ILIKE vs LOWER()
- **ILIKE**: Used in application queries for case-insensitive matching
- **LOWER()**: Used in database indexes for case-insensitive uniqueness
- Both work together to enforce consistent behavior

### Why Check All Three Tables?
Database unique constraints only apply within a single table. To enforce cross-role uniqueness (preventing "Asi Valdez" from being both a student and parent), the application must check all tables before creating an account.

### Performance Considerations
- Unique indexes make lookups fast (O(log n))
- Checking three tables in parallel (Promise.all) is efficient
- LOWER() index ensures case-insensitive queries use the index

## Troubleshooting

### Error: "duplicate key value violates unique constraint"
**Cause**: A case-insensitive duplicate already exists in the database.

**Solution**: The application validation should catch this before reaching the database. If you see this error:
1. Check if there's a bug in the validation logic
2. Verify the validation code is actually running
3. Look for race conditions (two signups at exact same time)

### Migration Fails: "could not create unique index"
**Cause**: Existing case-insensitive duplicates in the database.

**Solution**:
1. Run the duplicate detection queries provided in the SQL file
2. Manually clean up duplicates
3. Re-run the migration

### Application Still Allows Duplicates
**Possible Causes**:
1. SignupPage.jsx changes not saved/deployed
2. Using old cached version of the page
3. Validation code not executing (check console logs)

**Solution**:
1. Hard refresh browser (Ctrl+Shift+R)
2. Check browser console for validation logs
3. Verify code changes are deployed

## Security Notes

1. **One Person = One Account**: This system enforces that each unique person (identified by full legal name) can only have one account in the entire system, regardless of role.

2. **Case Sensitivity**: Names are case-insensitive to prevent users from bypassing restrictions with different capitalization.

3. **Cross-Role Protection**: Users cannot create multiple accounts with the same name across different roles (student, parent, admin).

4. **Email Protection**: Same rules apply to email addresses.

## Maintenance

### Adding New User Tables
If you add a new user table in the future (e.g., "teachers"):
1. Add case-insensitive unique indexes for email and full_name
2. Update SignupPage.jsx to include the new table in validation checks
3. Test thoroughly

### Updating Validation Logic
When modifying validation:
- Always use `.ilike()` for case-insensitive matching
- Always check ALL user tables for cross-role uniqueness
- Always trim input before checking
- Always provide clear error messages

## Summary
✅ Case-insensitive uniqueness enforced at both database and application levels  
✅ Cross-role uniqueness prevents same name across different user types  
✅ Clear error messages guide users  
✅ Fast performance with indexed lookups  
✅ Comprehensive validation before account creation  
