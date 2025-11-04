# Admin Account Approval System - Setup Instructions

## Overview
This system allows new admin/teacher accounts to be reviewed and approved by existing administrators before they can access the system. This ensures that only verified teachers can access student information.

## Database Setup

### Step 1: Run the Migration Script
Execute the SQL script to add the required columns to your database:

```sql
-- Run this in your Supabase SQL Editor
-- File: database/add_account_status.sql
```

This script will:
- Add `role` column to `user_profiles` (values: 'student', 'teacher', 'admin', 'parent')
- Add `account_status` column to `user_profiles` (values: 'pending', 'approved', 'rejected')
- Set existing accounts to 'approved' status
- Create indexes for better query performance

### Step 2: Verify the Changes
After running the script, verify the changes:

```sql
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'user_profiles' 
AND column_name IN ('role', 'account_status');
```

You should see both columns listed.

## How It Works

### For New Admin Sign-ups:
1. User selects "Admin/Teacher" during signup
2. System creates:
   - Auth user in `auth.users`
   - Profile in `user_profiles` with `role='admin'` and `account_status='pending'`
   - Record in `admins` table
3. User receives confirmation: "Your account is pending approval"
4. Account appears in the "Pending Accounts" page for existing admins

### For Existing Admins:
1. Navigate to `/pending-accounts` or click "Pending Accounts" in the navigation
2. View list of pending admin/teacher registrations
3. Review account details (name, email, registration date, role)
4. Click "Approve" to grant access or "Reject" to deny access
5. Approved accounts can immediately log in
6. Rejected accounts cannot log in and see an error message

### For Student Sign-ups:
- Students are automatically approved (no review needed)
- `account_status` is set to 'approved' by default
- Students can log in immediately after email verification

## Login Validation

When an admin/teacher tries to log in:
- System checks their `account_status`
- **Pending**: "Your account is pending approval. Please wait for an administrator to approve your account."
- **Rejected**: "Your account has been rejected. Please contact support."
- **Approved**: Login proceeds normally

## API Functions

### `getPendingAccounts()`
Returns all user profiles with `account_status = 'pending'`

```javascript
import { getPendingAccounts } from '../lib/accountApprovalApi';

const { data, error } = await getPendingAccounts();
// data: Array of pending accounts with user_id, username, full_name, email, role, created_at
```

### `approveAccount(userId)`
Sets `account_status = 'approved'` for the specified user

```javascript
import { approveAccount } from '../lib/accountApprovalApi';

const { data, error } = await approveAccount(userId);
```

### `rejectAccount(userId)`
Sets `account_status = 'rejected'` for the specified user

```javascript
import { rejectAccount } from '../lib/accountApprovalApi';

const { data, error } = await rejectAccount(userId);
```

## File Changes

### Modified Files:
1. **src/pages/SignupPage.jsx**
   - Admin signup now creates `user_profiles` record with `role='admin'` and `account_status='pending'`
   - Shows appropriate success message for admin signups

2. **src/pages/LoginPage.jsx**
   - Checks `account_status` for admin logins
   - Prevents login if account is pending or rejected

3. **src/lib/userProfilesApi.js**
   - Updated `createUserProfile()` to accept `role` and `account_status` parameters

4. **src/lib/accountApprovalApi.js**
   - Created API functions for managing pending accounts

5. **src/Admin/PendingAccounts.jsx**
   - UI component for viewing and managing pending accounts

6. **src/App.jsx**
   - Added route for `/pending-accounts` page

7. **src/components/ChatContext.jsx**
   - Fixed to use `user_id` instead of `id` column

### New Files:
1. **database/add_account_status.sql** - Migration script
2. **ACCOUNT_APPROVAL_SETUP.md** - This file

## Testing the System

### Test Admin Signup Flow:
1. Go to signup page
2. Select "Admin/Teacher" user type
3. Fill in required fields
4. Submit form
5. Verify success message mentions "pending approval"
6. Check that account appears in Pending Accounts page
7. Try to log in - should see "pending approval" error

### Test Approval Flow:
1. Log in as an existing admin
2. Navigate to `/pending-accounts`
3. Click "Approve" on a pending account
4. Verify account disappears from pending list
5. Log out and log in as the approved account
6. Verify successful login

### Test Rejection Flow:
1. Log in as an existing admin
2. Navigate to `/pending-accounts`
3. Click "Reject" on a pending account
4. Verify account disappears from pending list
5. Log out and try to log in as the rejected account
6. Verify "account rejected" error message

## Troubleshooting

### Pending Accounts not showing up
- Verify the migration script ran successfully
- Check that new signups have `account_status='pending'` in database
- Check browser console for API errors

### Login still works for pending accounts
- Verify LoginPage.jsx has the account_status check code
- Check that the database query is working (check console logs)
- Clear browser cache and try again

### Database errors during signup
- Ensure the `role` and `account_status` columns exist
- Check Supabase logs for detailed error messages
- Verify RLS policies allow INSERT into user_profiles

## Security Considerations

1. **RLS Policies**: Ensure Row Level Security policies allow:
   - Admins to view pending accounts
   - Admins to update account_status
   - New users to create their own profile

2. **Email Verification**: Always require email verification for admin accounts

3. **Audit Trail**: Consider logging all approval/rejection actions for compliance

## Future Enhancements

- Email notifications when accounts are approved/rejected
- Bulk approval/rejection functionality
- Admin notes/comments on accounts
- Automatic approval after manual verification steps
- Integration with SSO/SAML for institutional accounts

## Support

For issues or questions, check:
1. Browser console for JavaScript errors
2. Supabase logs for database errors
3. Network tab for API request/response details
