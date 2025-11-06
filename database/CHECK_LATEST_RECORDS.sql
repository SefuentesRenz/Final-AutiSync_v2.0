-- Check the most recent 5 progress records
-- Look at the difficulty_id column to see if any are NOT NULL
SELECT 
    id,
    user_id,
    activity_id,
    difficulty_id,
    score,
    date_completed,
    student_name
FROM user_activity_progress
ORDER BY date_completed DESC
LIMIT 5;

-- Also check which activities these are
SELECT 
    uap.id,
    uap.difficulty_id,
    uap.score,
    uap.date_completed,
    a.title as activity_title,
    d.difficulty as difficulty_name
FROM user_activity_progress uap
LEFT JOIN activities a ON uap.activity_id = a.id
LEFT JOIN "Difficulties" d ON uap.difficulty_id = d.id
ORDER BY uap.date_completed DESC
LIMIT 5;
