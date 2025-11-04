# 🚀 Quick Start Guide - Admin Account Approval System

## ⚠️ CRITICAL: Run SQL First!

The admin signup is failing because your database is missing required columns. Follow these steps **in order**:

---

## Step 1: Run the SQL Migration (5 minutes)

### Option A: Copy & Paste (Recommended)
1. Open your **Supabase Dashboard**
2. Go to **SQL Editor** (left sidebar)
3. Click **"New Query"**
4. Copy the entire contents of `COMPLETE_SETUP.sql`
5. Paste into the SQL editor
6. Click **"Run"** or press `Ctrl+Enter`
7. Wait for success message: ✅ MIGRATION COMPLETED SUCCESSFULLY!

### Option B: Use Existing File
1. Open `database/add_account_status.sql`
2. Follow same steps as Option A

---

## Step 2: Verify Database Changes (1 minute)

After running SQL, verify in Supabase:

1. Go to **Table Editor** → `user_profiles`
2. Check that these columns exist:
   - ✓ `phone_number` (text)
   - ✓ `role` (text)
   - ✓ `account_status` (text)

3. Or run this quick check:
```sql
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'user_profiles' 
AND column_name IN ('phone_number', 'role', 'account_status');
```

You should see all 3 columns!

---

## Step 3: Test Admin Signup (2 minutes)

1. **Go to your signup page**: `/signuppage`
2. **Select**: "Admin/Teacher" as user type
3. **Fill in the form**:
   - Full Name: Your Name
   - Email: test@example.com
   - Username: testadmin
   - Phone: 1234567890
   - Password: (at least 6 characters)
4. **Click "Sign Up"**
5. **Look for success message**: 
   > "Admin account created successfully! Your account is pending approval..."

---

## Step 4: View Pending Accounts (1 minute)

1. **Login** as an existing admin (if you have one)
2. **Navigate to**: `/pending-accounts` 
   - Or click "Pending Accounts" in the navigation
3. **You should see**:
   - The new account you just created
   - Name, email, role, registration date
   - "Approve" and "Reject" buttons

---

## Step 5: Approve the Account (30 seconds)

1. **Click "Approve"** on the pending account
2. **Confirm** the approval
3. **Account disappears** from pending list
4. **Log out** and log in with the new account
5. **Success!** You should be able to log in

---

## 🎯 How It Works

### For New Admin Signups:
```
Sign Up → Account Status = "pending" → Appears in Pending Accounts Page
```

### For Existing Admins:
```
View Pending Accounts → Click Approve/Reject → Account Status Updated
```

### For Login:
```
Login Attempt → Check account_status → Allow/Block based on status
```

---

## 🐛 Troubleshooting

### Problem: "Could not find the 'phone_number' column"
**Solution**: You didn't run the SQL migration. Go back to Step 1.

### Problem: "Auth user not ready" warnings in console
**Solution**: This is normal! The system automatically retries. Wait 20-30 seconds during signup.

### Problem: 406 errors in console
**Solution**: 
1. Clear browser cache
2. Refresh Supabase dashboard
3. Re-run the SQL migration
4. Try signup again

### Problem: Account created but not showing in Pending Accounts
**Solution**: Check the database:
```sql
SELECT * FROM user_profiles WHERE account_status = 'pending';
```

### Problem: Can't see Pending Accounts page
**Solution**: Make sure you're logged in as an admin and navigate to `/pending-accounts`

---

## 📊 Check System Status

Run this in SQL Editor to see all accounts:

```sql
SELECT 
    full_name,
    email,
    role,
    account_status,
    created_at
FROM user_profiles
ORDER BY created_at DESC
LIMIT 10;
```

---

## ✅ Success Checklist

- [ ] SQL migration completed (COMPLETE_SETUP.sql)
- [ ] Verified columns exist (phone_number, role, account_status)
- [ ] Created test admin account via signup
- [ ] Saw pending account in /pending-accounts page
- [ ] Approved the account successfully
- [ ] Logged in with approved account

---

## 🎓 What You Built

You now have a complete admin approval workflow:

1. **Security**: Only verified teachers can access student data
2. **Accountability**: All admin signups must be approved
3. **Visibility**: Existing admins can review all pending accounts
4. **Control**: Approve or reject accounts with one click

---

## 📝 Files Reference

- `COMPLETE_SETUP.sql` - Main migration script (run this first!)
- `database/add_account_status.sql` - Alternative migration script
- `database/check_user_profiles_structure.sql` - Verification queries
- `RUN_THIS_SQL_FIRST.md` - Detailed SQL instructions
- `ACCOUNT_APPROVAL_SETUP.md` - Complete technical documentation

---

## 🆘 Still Having Issues?

1. Check browser console for detailed errors
2. Check Supabase logs (Dashboard → Logs)
3. Verify all files were saved correctly
4. Make sure dev server is running (`npm run dev`)
5. Try a hard refresh (`Ctrl+Shift+R`)

**Remember**: The SQL migration is required! The app cannot work without the database columns.
