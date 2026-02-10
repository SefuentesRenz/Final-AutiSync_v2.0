# 🔥 Streak System - Quick Setup Guide

## What Changed?

The streak system is now **dynamic** and tracks student logins automatically!

## 🚀 Quick Setup (3 Steps)

### Step 1: Run SQL Migration
Open **Supabase SQL Editor** and run:
```sql
-- File: database/ADD_STREAK_INCREMENT_DATE.sql

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'streaks' 
        AND column_name = 'last_streak_increment_date'
    ) THEN
        ALTER TABLE streaks 
        ADD COLUMN last_streak_increment_date DATE;
        
        UPDATE streaks 
        SET last_streak_increment_date = last_active_date 
        WHERE last_active_date IS NOT NULL;
    END IF;
END $$;
```

### Step 2: Test It!
1. Login as a student between **6:00 AM - 3:00 PM**
2. Go to **Learning Hub** page
3. Check the streak counter - it should increment!

### Step 3: Verify
Check console logs for:
```
🔥 updateStreakOnLogin called for student
🕐 Time check: isWithinWindow: true
✅ Streak incremented
```

---

## ✅ How It Works Now

| Scenario | Result |
|----------|--------|
| Login at 8:00 AM | ✅ Streak +1 |
| Login at 2:00 PM (same day) | ✅ No change (already incremented) |
| Login at 5:00 PM | ⏰ Outside window (6AM-3PM) |
| Skip 3 days | 🔄 Streak resets to 0 |
| Skip 2 days | 🔄 Streak resets to 1 |
| Consecutive days | 🔥 Streak continues +1 |

---

## 📖 Full Documentation

See **DYNAMIC_STREAK_SYSTEM.md** for complete details.

---

## 🐛 Quick Troubleshooting

**Streak not incrementing?**
- Check if time is between 6AM-3PM
- Check console for logs
- Verify migration ran successfully

**Streak shows 0?**
- Run the migration script
- Check if user exists in `streaks` table
- Try logging out and back in

---

**Status:** ✅ Ready to use!
