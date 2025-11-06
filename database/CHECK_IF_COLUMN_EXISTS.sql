-- Check if difficulty_id column exists in user_activity_progress table
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'user_activity_progress'
ORDER BY ordinal_position;
