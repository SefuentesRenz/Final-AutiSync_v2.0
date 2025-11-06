-- ========================================
-- ADD DIFFICULTY TRACKING COLUMN
-- ========================================
-- Run this script to add difficulty_id column
-- ========================================

ALTER TABLE user_activity_progress 
ADD COLUMN difficulty_id UUID REFERENCES "Difficulties"(id);

CREATE INDEX idx_user_activity_progress_difficulty 
ON user_activity_progress(difficulty_id);

-- Verify the column was added
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'user_activity_progress'
AND column_name = 'difficulty_id';
