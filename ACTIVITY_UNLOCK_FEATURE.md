# Activity Unlock Feature - Implementation Guide

## Overview
The Activity Unlock feature progressively unlocks difficulty levels (Beginner → Intermediate → Proficient) for Academic activities based on student performance. Students must achieve a perfect score (100%) to unlock the next difficulty level.

## How It Works

### Unlock Logic
1. **Beginner**: Always unlocked by default
2. **Intermediate**: Unlocks when student gets 100% score on the same activity in Beginner difficulty
3. **Proficient**: Unlocks when student gets 100% score on the same activity in Intermediate difficulty

### Example Flow
```
Student plays "Identification - Beginner"
├─ Scores 3/3 (100%) ✅
└─ "Identification - Intermediate" unlocks automatically

Student plays "Identification - Intermediate"  
├─ Scores 4/5 (80%) ❌
└─ "Identification - Proficient" remains locked

Student plays "Identification - Intermediate" again
├─ Scores 5/5 (100%) ✅
└─ "Identification - Proficient" unlocks automatically
```

## Files Created/Modified

### New Files
1. **`src/hooks/useActivityUnlock.js`**
   - Custom React hook that fetches student scores from Supabase
   - Determines which activities/difficulties are unlocked
   - Provides `isUnlocked(activityName, difficulty)` function
   - Auto-refreshes when student completes activities

2. **`src/lib/studentScoresApi.js`**
   - API functions to record student scores
   - Handles insert/update logic (only stores best score)
   - Used by Flashcards component after activity completion

3. **`database/create_student_scores_table.sql`**
   - SQL migration to create the `student_scores` table
   - Includes RLS policies (students can only see/modify their own scores)
   - Unique constraint per student + activity + difficulty

### Modified Files
1. **`src/components/DifficultySelector.jsx`**
   - Shows locked/unlocked state for each difficulty
   - Displays 🔒 icon and "Complete X first!" message for locked difficulties
   - Disables click on locked difficulties
   - Dimmed/gray appearance for locked items

2. **`src/components/Flashcards.jsx`**
   - Records scores to `student_scores` table on activity completion
   - Only records for Academic category
   - Calls `recordStudentScore()` in `handleFinish()`

3. **`src/components/ActivitySelectorModal.jsx`**
   - Checks if individual activities are locked based on difficulty
   - Shows lock icon and disabled state for locked activities
   - Only applies to Academic category

4. **`src/pages/FlashcardsPage.jsx`**
   - Passes `selectedDifficulty` prop to ActivitySelectorModal
   - No other changes needed

## Database Setup

### Step 1: Create the Table
Run the SQL migration in your Supabase dashboard:

```sql
-- Located in: database/create_student_scores_table.sql
-- Copy the entire file content and run in Supabase SQL Editor
```

### Step 2: Verify Table Structure
The `student_scores` table should have:
- `id` (UUID, primary key)
- `student_id` (UUID, references auth.users)
- `activity_name` (TEXT, e.g., "Identification", "Numbers")
- `category` (TEXT, e.g., "Academic")
- `difficulty_level` (TEXT, "Beginner" | "Intermediate" | "Proficient")
- `score` (INTEGER, points earned)
- `total_questions` (INTEGER, max possible score)
- `completed_at` (TIMESTAMP)
- Unique constraint on (student_id, activity_name, difficulty_level)

## UI Behavior

### Difficulty Selector Screen
- **Beginner**: Always shows as unlocked (normal colors, clickable)
- **Intermediate**: 
  - Locked: Gray, dimmed, shows 🔒, text "Complete Beginner first!"
  - Unlocked: Orange, clickable, shows emoji 🤔
- **Proficient**:
  - Locked: Gray, dimmed, shows 🔒, text "Complete Intermediate first!"
  - Unlocked: Red, clickable, shows emoji 💪

### Activity Selection Modal
- Locked activities show 🔒 icon in top-right corner
- Locked activities are grayed out and not clickable
- Message: "Complete previous difficulty first!"
- Only applies to Academic category (Social/Daily Life activities are always unlocked)

### After Completion
- Score is automatically recorded to database
- Unlock status refreshes on next visit to Difficulty Selector
- If perfect score achieved, next difficulty becomes available immediately (on next navigation)

## Testing Guide

### Test Scenario 1: First Time User
1. Login as a new student
2. Go to Academic → Beginner → Identification
3. Complete with perfect score (3/3)
4. Go back to Difficulty Selector
5. ✅ Intermediate should now be unlocked
6. ✅ Proficient should still be locked

### Test Scenario 2: Imperfect Score
1. Login as student
2. Go to Academic → Beginner → Numbers
3. Complete with 2/3 score (not perfect)
4. Go back to Difficulty Selector
5. ✅ Intermediate should remain locked (need 100%)

### Test Scenario 3: Full Progression
1. Complete "Colors - Beginner" with 100%
2. Verify Intermediate unlocks
3. Complete "Colors - Intermediate" with 100%
4. Verify Proficient unlocks
5. All three difficulties should now be available for Colors

### Test Scenario 4: Social/Daily Life (No Lock)
1. Go to Social / Daily Life Skill category
2. Select any difficulty
3. ✅ All difficulties should be unlocked (no lock feature for this category)

## Troubleshooting

### Issue: Difficulties Not Unlocking
**Check:**
1. Score was 100% (score === total_questions)
2. `student_scores` table exists in Supabase
3. RLS policies are set up correctly
4. Check browser console for errors in `recordStudentScore()`

### Issue: "Table does not exist" Error
**Solution:**
Run the SQL migration in Supabase dashboard (database/create_student_scores_table.sql)

### Issue: Scores Not Recording
**Check:**
1. User is logged in (`user?.id` exists)
2. Activity is in "Academic" category
3. Check Supabase logs for RLS policy violations
4. Verify student has INSERT permission on `student_scores` table

### Issue: All Activities Locked
**Check:**
1. Database query is returning correct data
2. Check `useActivityUnlock` hook console logs
3. Verify `student_id` matches logged-in user
4. Check for JavaScript errors in browser console

## Future Enhancements

### Possible Improvements
1. **Visual Progress Indicator**: Show % complete for each activity
2. **Unlock Notifications**: Toast/modal when new difficulty unlocks
3. **Activity Dashboard**: Overview showing which activities are unlocked
4. **Partial Unlocks**: Unlock Intermediate at 80% instead of 100%
5. **Time-based Unlocks**: Unlock after certain period regardless of score
6. **Parent Override**: Allow parents/admins to manually unlock activities

### Code Extension Points
- Unlock logic is centralized in `useActivityUnlock` hook
- Change unlock threshold in hook (currently checks `score === total_questions`)
- Add unlock animation in `handleFinish()` function
- Customize lock messages per difficulty in DifficultySelector

## Performance Considerations
- Scores are fetched once per page load (cached in hook state)
- Only queries student's own scores (filtered by student_id)
- Uses Supabase RLS for security (no backend endpoint needed)
- Minimal database calls (insert/update on completion only)

## Security Notes
- RLS policies prevent students from viewing/modifying other students' scores
- Admins can view all scores (for monitoring)
- Score validation happens server-side (Supabase constraints)
- No way to "hack" unlock status from client-side

---

**Created**: 2025-11-03  
**Category**: Student Features  
**Related**: Progress Tracking, Badges, Gamification
