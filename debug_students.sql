-- Debug SQL queries to check male students issue

-- 1. Check all user profiles with gender info
SELECT 
    full_name, 
    gender, 
    user_id,
    id as profile_id,
    CASE 
        WHEN gender IS NULL THEN 'NULL'
        WHEN TRIM(LOWER(gender)) = 'male' THEN 'MALE_MATCH'
        ELSE 'OTHER: ' || gender
    END as gender_status
FROM user_profiles 
ORDER BY full_name;

-- 2. Check students table connections
SELECT 
    s.id as student_id,
    s.profile_id,
    up.full_name,
    up.gender,
    up.user_id
FROM students s
LEFT JOIN user_profiles up ON s.profile_id = up.id
ORDER BY up.full_name;

-- 3. Find the 4 specific male students mentioned
SELECT 
    up.full_name,
    up.gender,
    up.user_id,
    s.id as student_table_id
FROM user_profiles up
LEFT JOIN students s ON s.profile_id = up.id
WHERE LOWER(up.full_name) SIMILAR TO '%(isaiah|kobe|xaian|gi)%'
ORDER BY up.full_name;

-- 4. Check for gender case sensitivity issues
SELECT 
    full_name,
    gender,
    LOWER(TRIM(gender)) as normalized_gender,
    LENGTH(gender) as gender_length
FROM user_profiles 
WHERE gender IS NOT NULL
ORDER BY full_name;

-- 5. Fix potential gender case issues (if needed)
-- UPDATE user_profiles 
-- SET gender = 'Male' 
-- WHERE LOWER(TRIM(gender)) = 'male' AND gender != 'Male';