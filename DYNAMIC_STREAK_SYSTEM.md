# 🔥 DYNAMIC STREAK SYSTEM - Implementation Guide

## Overview

The streak system has been updated from static to dynamic, tracking student logins with the following rules:

✅ **Increments only once per day** (between 6:00 AM - 3:00 PM)  
✅ **Resets to 0 after 3 consecutive days** of no login  
✅ **Tracks login activity** separately from streak increments  

---

## 🎯 Core Features

### 1. **Time Window Restriction**
- Streak increments **ONLY** between **6:00 AM - 3:00 PM** (local time)
- Logins outside this window are tracked but don't increment streak
- Motivates students to login during school/study hours

### 2. **Once-Per-Day Increment**
- Student can login multiple times per day
- Streak increments **only once** per calendar day
- Uses `last_streak_increment_date` to track daily increments

### 3. **3-Day Reset Rule**
- If student doesn't login for **3 consecutive days**, streak resets to **0**
- 2-day gap: Streak resets to 1 (fresh start)
- 1-day gap: Streak continues normally (+1)

### 4. **Longest Streak Tracking**
- Automatically tracks and updates longest streak achieved
- Persists even after streak resets

---

## 📊 Database Schema

### Streaks Table Columns:
```sql
CREATE TABLE streaks (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    current_streak INTEGER DEFAULT 0,
    longest_streak INTEGER DEFAULT 0,
    last_active_date DATE,                    -- Last login date
    last_streak_increment_date DATE,          -- Last date streak was incremented
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

---

## 🔧 Implementation Details

### Files Modified:

1. **`src/lib/streaksApi.js`**
   - Added `isWithinStreakWindow()` - checks if current time is 6AM-3PM
   - Added `updateStreakOnLogin()` - main streak logic with time window & 3-day reset
   - Updated `getStudentStreak()` - includes new `last_streak_increment_date` column

2. **`src/pages/HomePage.jsx`**
   - Added `updateLoginStreak()` function
   - Calls streak update on component mount (when user logs in)
   - Imports `updateStreakOnLogin` from streaksApi

3. **`database/ADD_STREAK_INCREMENT_DATE.sql`**
   - Migration script to add `last_streak_increment_date` column
   - Initializes existing records with `last_active_date`

---

## 📝 How It Works

### Example Scenarios:

#### Scenario 1: Daily Login ✅
```
Day 1 (8:00 AM): Login → Streak = 1
Day 2 (9:00 AM): Login → Streak = 2
Day 3 (7:30 AM): Login → Streak = 3
Day 4 (10:00 AM): Login → Streak = 4
```

#### Scenario 2: Multiple Logins Same Day ✅
```
Day 1 (8:00 AM): Login → Streak = 1
Day 1 (2:00 PM): Login → Streak = 1 (no change)
Day 1 (5:00 PM): Login → Streak = 1 (outside window, no change)
Day 2 (9:00 AM): Login → Streak = 2
```

#### Scenario 3: Login Outside Time Window ⏰
```
Day 1 (8:00 AM): Login → Streak = 1
Day 2 (5:00 PM): Login → Streak = 1 (outside 6AM-3PM window)
Day 3 (7:00 AM): Login → Streak = 2 (previous day didn't count)
```

#### Scenario 4: 3-Day Gap - Reset to 0 🔄
```
Day 1 (8:00 AM): Login → Streak = 5
[Day 2, 3, 4: No login]
Day 5 (9:00 AM): Login → Streak = 0 (reset due to 3+ day gap)
Day 6 (10:00 AM): Login → Streak = 1 (starting fresh)
```

#### Scenario 5: 2-Day Gap - Reset to 1 🔄
```
Day 1 (8:00 AM): Login → Streak = 3
[Day 2, 3: No login]
Day 4 (9:00 AM): Login → Streak = 1 (reset but not to 0)
```

---

## 🚀 Setup Instructions

### Step 1: Run Database Migration
```sql
-- In Supabase SQL Editor, run:
-- File: database/ADD_STREAK_INCREMENT_DATE.sql
```

This adds the `last_streak_increment_date` column to the `streaks` table.

### Step 2: Verify Column Exists
```sql
SELECT 
    column_name, 
    data_type 
FROM information_schema.columns
WHERE table_name = 'streaks';
```

You should see:
- `current_streak`
- `longest_streak`
- `last_active_date`
- `last_streak_increment_date` ← **NEW**

### Step 3: Test the System

1. **Test Time Window:**
   - Login between 6:00 AM - 3:00 PM → Streak should increment
   - Login outside this window → Streak stays same

2. **Test Once-Per-Day:**
   - Login multiple times same day → Streak increments once only

3. **Test 3-Day Reset:**
   - Don't login for 3 days → Streak resets to 0 on next login

---

## 🔍 Debugging

### Check Streak Data:
```sql
SELECT 
    user_id,
    current_streak,
    longest_streak,
    last_active_date,
    last_streak_increment_date,
    updated_at
FROM streaks
WHERE user_id = 'your-user-id-here';
```

### Console Logs:
Check browser console for streak updates:
- `🔥 updateStreakOnLogin called for student`
- `🕐 Time check: isWithinWindow`
- `✅ Streak already incremented today`
- `🔥 Consecutive day detected, incrementing streak`
- `🔥 3+ days gap detected, RESETTING streak to 0`

### Manual Streak Update (Testing):
```sql
-- Manually set streak for testing
UPDATE streaks 
SET 
    current_streak = 5,
    last_active_date = CURRENT_DATE - INTERVAL '1 day',
    last_streak_increment_date = CURRENT_DATE - INTERVAL '1 day'
WHERE user_id = 'your-user-id-here';
```

---

## 🎨 UI Updates

The streak display in **Learning Hub** (`StudentPage.jsx`) automatically shows the current streak from the database:

```jsx
<span className="text-6xl font-bold text-orange-600">
  {streakData ? streakData.current_streak : streakDays}
</span>
```

No additional UI changes needed - it fetches fresh data from the `streaks` table.

---

## ⚙️ Configuration

### Change Time Window:
Edit `src/lib/streaksApi.js`:
```javascript
function isWithinStreakWindow() {
  const startTime = 6 * 60;  // Change 6 to different hour (e.g., 7 for 7AM)
  const endTime = 15 * 60;   // Change 15 to different hour (e.g., 16 for 4PM)
  // ...
}
```

### Change Reset Days:
Edit `src/lib/streaksApi.js` in `updateStreakOnLogin()`:
```javascript
if (diffDays >= 3) {  // Change 3 to different number of days
  newCurrentStreak = 0;
  console.log('🔥 3+ days gap detected, RESETTING streak to 0');
}
```

---

## 📈 Future Enhancements

Potential improvements:
- [ ] Add notifications when streak is about to break (2 days without login)
- [ ] Show streak history/calendar view
- [ ] Add badges for streak milestones (7 days, 30 days, etc.)
- [ ] Allow admins to configure time window via settings
- [ ] Add parent notifications for child's streak achievements

---

## 🐛 Troubleshooting

### Issue: Streak not incrementing
**Solution:** Check:
1. Current time is between 6:00 AM - 3:00 PM
2. User hasn't already incremented streak today
3. Database column `last_streak_increment_date` exists

### Issue: Streak resets unexpectedly
**Solution:** Check:
1. Last login dates in database
2. Day difference calculation (should account for timezone)
3. Console logs for reset messages

### Issue: Streak shows 0 always
**Solution:** 
1. Run migration script to add `last_streak_increment_date`
2. Check if user record exists in `streaks` table
3. Verify `updateStreakOnLogin()` is being called on HomePage load

---

**Last Updated:** January 23, 2026  
**Status:** ✅ Fully Implemented and Tested  
