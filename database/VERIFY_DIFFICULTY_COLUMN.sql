-- Check for difficulty_id column in ALL schemas
SELECT 
    table_schema,
    table_name,
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns
WHERE column_name = 'difficulty_id'
AND table_name = 'user_activity_progress';

-- Also check the table structure directly
SELECT * FROM user_activity_progress LIMIT 1;

-- Check if we can query difficulty_id
SELECT 
    id,
    activity_id,
    difficulty_id,
    date_completed
FROM user_activity_progress
ORDER BY date_completed DESC
LIMIT 5;
