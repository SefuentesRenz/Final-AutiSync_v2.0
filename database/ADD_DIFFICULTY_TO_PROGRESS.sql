-- ========================================
-- ADD DIFFICULTY TRACKING TO PROGRESS
-- ========================================
-- This allows us to track which difficulty level 
-- the student actually played for each activity
-- ========================================

-- Step 1: Add difficulty_id column to user_activity_progress table
ALTER TABLE user_activity_progress 
ADD COLUMN IF NOT EXISTS difficulty_id UUID REFERENCES "Difficulties"(id);

-- Step 2: Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_user_activity_progress_difficulty 
ON user_activity_progress(difficulty_id);

-- Step 3: Verify the column was added
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'user_activity_progress'
AND column_name = 'difficulty_id';

-- Step 4: Check current progress records (should show NULL for difficulty_id initially)
SELECT 
    uap.id,
    uap.user_id,
    uap.activity_id,
    uap.difficulty_id,  -- This should now exist!
    uap.score,
    uap.date_completed,
    a.title as activity_title,
    a.difficulty_id as activity_default_difficulty
FROM user_activity_progress uap
LEFT JOIN activities a ON uap.activity_id = a.id
ORDER BY uap.date_completed DESC
LIMIT 10;

-- ========================================
-- NOTES:
-- ========================================
-- After running this script:
-- 1. The column is added successfully
-- 2. ALL code changes are already done:
--    - progressApi.js updated to save difficulty_id
--    - activityCompletionHandler.js updated to pass difficulty_id
--    - Flashcards.jsx updated to get difficulty UUID and pass it
-- 3. Existing progress records will have NULL difficulty_id 
--    (they'll show activity's default difficulty or N/A)
-- 4. NEW progress records will save the actual difficulty played!
-- 5. Test by playing Colors activity on Intermediate - 
--    it should now show "Intermediate" in Recent Activities!
-- ========================================
