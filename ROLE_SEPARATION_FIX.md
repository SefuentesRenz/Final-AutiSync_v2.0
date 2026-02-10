# 🔐 ROLE SEPARATION FIX - Complete Guide

## ❌ The Problem

When you created an admin/teacher account, it was being stored in **BOTH** the `user_profiles` table AND the `admins` table. This caused:

1. **Account confusion** - One account existing in multiple tables
2. **Login bypass** - You could login as a student using admin credentials
3. **Data inconsistency** - Duplicate records across tables

### Root Cause
In `SignupPage.jsx` lines 206-258, the admin signup code was:
1. Creating a record in `user_profiles` table (line 217)
2. **AND THEN** creating a record in `admins` table (line 251)

This violated the principle: **Each role = ONE table only**

---

## ✅ The Solution

### 1️⃣ Code Changes (Already Applied)

#### A. Fixed Signup Logic (`SignupPage.jsx`)
- **BEFORE**: Admin signup created records in BOTH `user_profiles` AND `admins` tables
- **AFTER**: Admin signup creates records ONLY in `admins` table

```javascript
// OLD CODE (WRONG):
// Step 1: Create user_profile
await createUserProfile(profileData);
// Step 2: Create admin record
await createAdmin(adminData);

// NEW CODE (CORRECT):
// Create ONLY admin record (no user_profile)
await createAdmin(adminData);
```

#### B. Fixed Login Verification (`LoginPage.jsx`)
- **BEFORE**: Only checked which button user clicked, didn't verify account exists in correct table
- **AFTER**: Verifies user exists in the correct role table before allowing login

```javascript
if (userType === "admin") {
  // Check if user EXISTS in admins table
  const { data: adminData } = await supabase
    .from('admins')
    .select('account_status')
    .eq('user_id', userId)
    .single();
  
  if (!adminData) {
    // User doesn't exist as admin - reject login
    setError('This account is not registered as an Admin');
    await supabase.auth.signOut();
    return;
  }
}
```

Similar checks added for parents and students.

#### C. Updated Admin API (`adminsApi.js`)
- Added `account_status` parameter support
- Defaults new admins to 'pending' status (requires approval)

---

### 2️⃣ Database Changes (Run in Supabase)

**📝 Execute this SQL script:** `database/FIX_ROLE_SEPARATION.sql`

#### What it does:

1. **Adds `account_status` column to admins table**
   - Values: 'pending', 'approved', 'rejected'
   - New admins default to 'pending' (requires approval)

2. **Cleans up existing data**
   - Removes any admin records from `user_profiles` table
   - Ensures no user exists in multiple role tables

3. **Ensures proper foreign keys**
   - All tables correctly reference `auth.users(id)`
   - Cascade deletes when auth user is removed

4. **Sets up RLS (Row Level Security) policies**
   - Students can only see their own profile
   - Admins can see all student profiles (for tracking)
   - Parents can only see their own record
   - Each role isolated to their own table

---

## 📋 How to Apply the Fix

### Step 1: Run the SQL Script in Supabase

1. Open your **Supabase Dashboard**
2. Go to **SQL Editor**
3. Copy the entire contents of `database/FIX_ROLE_SEPARATION.sql`
4. Paste and click **Run**
5. Verify the results:

```sql
-- Check for users in multiple tables (should return ZERO rows)
SELECT user_id, COUNT(*) as table_count
FROM (
    SELECT user_id FROM user_profiles
    UNION ALL
    SELECT user_id FROM admins
    UNION ALL
    SELECT user_id FROM parents
) combined
GROUP BY user_id
HAVING COUNT(*) > 1;
```

### Step 2: Test the Application

1. **Test Admin Signup:**
   - Sign up as Admin/Teacher
   - Check: Record created ONLY in `admins` table
   - Check: account_status = 'pending'

2. **Test Student Signup:**
   - Sign up as Student
   - Check: Record created ONLY in `user_profiles` table

3. **Test Parent Signup:**
   - Sign up as Parent
   - Check: Record created ONLY in `parents` table

4. **Test Login Restrictions:**
   - Create an admin account
   - Try to login using "Student" button
   - Should show error: "This account is not registered as a Student"

5. **Test Admin Approval:**
   - Admin with 'pending' status tries to login
   - Should show error: "Your account is pending approval"
   - Approve admin in database: `UPDATE admins SET account_status = 'approved' WHERE email = 'admin@example.com';`
   - Admin can now login successfully

---

## 🎯 Expected Behavior After Fix

### Signup Rules:
| User Type | Stored In | Also Stored In | Status |
|-----------|-----------|----------------|---------|
| **Student** | `user_profiles` | ❌ None | Active immediately |
| **Admin/Teacher** | `admins` | ❌ None | Pending (requires approval) |
| **Parent** | `parents` | ❌ None | Active immediately |

### Login Rules:
| Login As | Checks | Action |
|----------|--------|--------|
| **Student** | User exists in `user_profiles` | ✅ Allow if exists, ❌ Reject if not |
| **Admin** | User exists in `admins` AND status = 'approved' | ✅ Allow if approved, ❌ Reject if not |
| **Parent** | User exists in `parents` | ✅ Allow if exists, ❌ Reject if not |

---

## 🔍 Verification Commands

### Check where a specific user exists:
```sql
-- Replace 'user-uuid-here' with actual user_id
SELECT 'user_profiles' as table_name, full_name, email 
FROM user_profiles WHERE user_id = 'user-uuid-here'
UNION ALL
SELECT 'admins' as table_name, full_name, email 
FROM admins WHERE user_id = 'user-uuid-here'
UNION ALL
SELECT 'parents' as table_name, full_name, email 
FROM parents WHERE user_id = 'user-uuid-here';
```

### Check admin approval statuses:
```sql
SELECT 
    full_name, 
    email, 
    account_status,
    created_at
FROM admins
ORDER BY created_at DESC;
```

### Approve an admin account:
```sql
UPDATE admins 
SET account_status = 'approved' 
WHERE email = 'teacher@example.com';
```

---

## 🚨 Important Notes

1. **Existing Admin Accounts**: If you have existing admin accounts that are in BOTH tables, the SQL script will remove them from `user_profiles` automatically.

2. **Admin Approval Required**: New admin signups will have `account_status = 'pending'`. You'll need to manually approve them in the database or build an approval UI.

3. **Auth Users Remain**: This fix doesn't delete any `auth.users` records. It only cleans up the role tables.

4. **Backward Compatibility**: If you have existing systems expecting admins in `user_profiles`, you'll need to update those queries to check the `admins` table instead.

---

## 📞 Troubleshooting

### "This account is not registered as [Role]"
- User is trying to login with wrong role button
- Solution: Use the correct role button (Student/Admin/Parent)

### "Your account is pending approval"
- Admin account needs approval
- Solution: Run `UPDATE admins SET account_status = 'approved' WHERE email = 'admin@example.com';`

### "Foreign key constraint violation"
- Auth user creation timing issue
- Solution: Already handled with retry logic in code. Wait a few seconds and try again.

### User exists in multiple tables
- Old data not cleaned up
- Solution: Run the cleanup section of the SQL script again

---

## 🎉 Success Criteria

✅ Students can only signup/login as students  
✅ Admins can only signup/login as admins  
✅ Parents can only signup/login as parents  
✅ No user exists in multiple role tables  
✅ Admin accounts require approval before login  
✅ Each role is properly isolated  

---

**Last Updated**: January 23, 2026  
**Files Modified**:
- `src/pages/SignupPage.jsx`
- `src/pages/LoginPage.jsx`
- `src/lib/adminsApi.js`
- `database/FIX_ROLE_SEPARATION.sql` (new)
