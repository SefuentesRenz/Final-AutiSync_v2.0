-- Check if user_activity_progress table has difficulty information
-- This will help us understand if we're storing the difficulty level that was played

-- 1. First, check the structure of user_activity_progress table
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'user_activity_progress'
ORDER BY ordinal_position;

-- 2. Check recent progress records to see what data we have
SELECT 
    uap.id,
    uap.user_id,
    uap.activity_id,
    uap.score,
    uap.completion_status,
    uap.date_completed,
    a.title as activity_title,
    a.difficulty_id as activity_default_difficulty,
    d.difficulty as difficulty_name
FROM user_activity_progress uap
LEFT JOIN activities a ON uap.activity_id = a.id
LEFT JOIN "Difficulties" d ON a.difficulty_id = d.id
WHERE a.title = 'Colors'
ORDER BY uap.date_completed DESC
LIMIT 10;

-- 3. Check if there's a difficulty_id column in user_activity_progress
-- If this query succeeds, it means we DO have difficulty tracking per play
SELECT 
    uap.id,
    uap.activity_id,
    uap.difficulty_id,  -- Check if this column exists
    uap.score,
    uap.date_completed,
    a.title
FROM user_activity_progress uap
LEFT JOIN activities a ON uap.activity_id = a.id
WHERE a.title = 'Colors'
ORDER BY uap.date_completed DESC
LIMIT 5;
