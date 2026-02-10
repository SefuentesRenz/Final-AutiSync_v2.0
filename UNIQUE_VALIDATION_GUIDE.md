# 🔒 UNIQUE EMAIL & NAME VALIDATION - Implementation Guide

## Overview

The system now enforces uniqueness for emails and full names to prevent duplicate accounts:

✅ **One email per system** - No duplicate emails across all tables  
✅ **One full name per role** - No duplicate names within student/admin/parent tables  
✅ **Case-insensitive** - "John Doe" and "john doe" are treated as duplicates  

---

## 🎯 Validation Rules

### 1. Email Uniqueness (System-Wide)
- **Rule:** Each email can only be used ONCE across the entire system
- **Scope:** Checked across `user_profiles`, `admins`, and `parents` tables
- **Example:** If `john@example.com` is used by a student, no admin or parent can use it

### 2. Full Name Uniqueness (Per Role)
- **Rule:** Each full name can only be used ONCE within each role table
- **Scope:** 
  - Students: Checked in `user_profiles` only
  - Admins: Checked in `admins` only
  - Parents: Checked in `parents` only
- **Case-insensitive:** "John Doe" = "john doe" = "JOHN DOE"
- **Example:** 
  - ✅ Student "John Smith" + Admin "John Smith" = ALLOWED (different roles)
  - ❌ Student "John Smith" + Student "john smith" = BLOCKED (same role, same name)

---

## 🔧 Implementation

### Database Level (Supabase)

**File:** `database/ADD_UNIQUE_CONSTRAINTS.sql`

Adds unique constraints to all three tables:
1. Email unique constraint (all tables)
2. Full name unique index with LOWER() for case-insensitive comparison

### Application Level (React)

**File:** `src/pages/SignupPage.jsx`

Validates BEFORE creating auth account:
1. Checks if email exists in any of the 3 tables
2. Checks if full name exists in the target role table
3. Shows clear error messages if duplicates found

---

## 📝 Setup Instructions

### Step 1: Run Database Migration

Open **Supabase SQL Editor** and run:
```sql
-- File: database/ADD_UNIQUE_CONSTRAINTS.sql
```

This will:
- Add unique constraints for emails
- Add unique indexes for full names (case-insensitive)
- Verify no existing duplicates

### Step 2: Check for Existing Duplicates

The SQL script includes verification queries. If duplicates are found:

```sql
-- Shows duplicate emails (if any)
SELECT 'user_profiles' as table_name, email, COUNT(*) as count
FROM user_profiles
GROUP BY email
HAVING COUNT(*) > 1
-- ... (runs for all 3 tables)
```

### Step 3: Clean Up Duplicates (if needed)

If Step 2 shows duplicates, uncomment and run the cleanup section in the SQL script:

```sql
-- Keeps most recent record, deletes older duplicates
WITH ranked AS (
  SELECT id, ROW_NUMBER() OVER (PARTITION BY email ORDER BY created_at DESC) as rn
  FROM user_profiles
)
DELETE FROM user_profiles WHERE id IN (SELECT id FROM ranked WHERE rn > 1);
```

---

## 🧪 Testing

### Test Case 1: Duplicate Email (System-Wide)
1. Sign up as Student with `test@example.com`
2. Try to sign up as Admin with `test@example.com`
3. **Expected:** ❌ Error: "This email is already registered"

### Test Case 2: Duplicate Full Name (Same Role)
1. Sign up as Student with name "John Doe"
2. Try to sign up as another Student with name "john doe"
3. **Expected:** ❌ Error: "An account with the name 'john doe' already exists"

### Test Case 3: Same Full Name (Different Role)
1. Sign up as Student with name "Jane Smith"
2. Sign up as Admin with name "Jane Smith"
3. **Expected:** ✅ Both accounts created successfully (different roles)

### Test Case 4: Case Variations
1. Sign up as Student with name "Mike Johnson"
2. Try to sign up as Student with name "MIKE JOHNSON"
3. **Expected:** ❌ Error: "An account with the name 'MIKE JOHNSON' already exists"

---

## 📊 Error Messages

| Scenario | Error Message |
|----------|--------------|
| Email exists | ❌ This email is already registered. Please use a different email or try logging in. |
| Full name exists | ❌ An account with the name "[Name]" already exists. Please use your full legal name or contact support if this is an error. |
| Validation error | Error validating account information. Please try again. |

---

## 🔍 Verification Queries

### Check all unique constraints:
```sql
SELECT 
    conname as constraint_name,
    conrelid::regclass as table_name,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint
WHERE conname LIKE '%email_unique' OR conname LIKE '%full_name_unique'
ORDER BY conrelid::regclass, conname;
```

### Find duplicate emails (should return empty):
```sql
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
```

### Find duplicate names (should return empty):
```sql
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
```

---

## 🚨 Important Notes

1. **Email is trimmed and lowercased** before checking to avoid whitespace/case issues
2. **Full name is case-insensitive** - uses ILIKE in queries and LOWER() in database
3. **Different roles can have same name** - Validation is per-role, not system-wide
4. **Database constraints are backup** - Application validates first for better UX
5. **Existing accounts are not affected** - Only new signups are validated

---

## 🐛 Troubleshooting

### Issue: "Email already registered" but can't find account
**Solution:** Check all 3 tables:
```sql
SELECT 'user_profiles' as source, email, full_name FROM user_profiles WHERE email = 'test@example.com'
UNION ALL
SELECT 'admins', email, full_name FROM admins WHERE email = 'test@example.com'
UNION ALL
SELECT 'parents', email, full_name FROM parents WHERE email = 'test@example.com';
```

### Issue: Constraint violation error in console
**Solution:** Run the cleanup queries to remove existing duplicates, then re-run the constraint SQL

### Issue: Same name allowed for same role
**Solution:** Verify the unique index was created:
```sql
SELECT * FROM pg_indexes WHERE indexname LIKE '%full_name_unique%';
```

---

## 🎨 Future Enhancements

Potential improvements:
- [ ] Add username uniqueness validation for students
- [ ] Allow administrators to merge duplicate accounts
- [ ] Add phonetic name matching to catch similar names (e.g., "Jon" vs "John")
- [ ] Email verification before account activation
- [ ] Admin dashboard to view and manage duplicate resolution

---

**Last Updated:** January 23, 2026  
**Status:** ✅ Fully Implemented  
**Files Modified:**
- `database/ADD_UNIQUE_CONSTRAINTS.sql` (new)
- `src/pages/SignupPage.jsx`
