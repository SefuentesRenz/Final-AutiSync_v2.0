-- Quick test to find missing male students
-- Run this in your database to check the student connections

-- 1. Check all male students in user_profiles
SELECT 
    up.full_name,
    up.gender,
    up.user_id,
    s.id as student_table_id,
    CASE 
        WHEN s.id IS NULL THEN 'NO STUDENTS TABLE ENTRY'
        ELSE 'HAS STUDENTS TABLE ENTRY'
    END as status
FROM user_profiles up
LEFT JOIN students s ON s.profile_id = up.id
WHERE LOWER(up.gender) = 'male'
ORDER BY up.full_name;

-- 2. Check specifically for the 4 mentioned students
SELECT 
    up.full_name,
    up.gender,
    up.user_id,
    s.id as student_table_id
FROM user_profiles up
LEFT JOIN students s ON s.profile_id = up.id
WHERE LOWER(up.full_name) SIMILAR TO '%(isaiah|kobe|xaian|gi)%'
ORDER BY up.full_name;

-- 3. Count total male students
SELECT 
    COUNT(*) as total_male_profiles,
    COUNT(s.id) as male_with_student_entries
FROM user_profiles up
LEFT JOIN students s ON s.profile_id = up.id
WHERE LOWER(up.gender) = 'male';