-- =====================================================
-- SIMPLE FIX: Assign Difficulty to Academic Activities
-- =====================================================

-- This script uses UUIDs (not integers) because your difficulty_id is UUID type

-- Step 1: Check the structure of Difficulties table
-- Run this first to see what columns exist:
SELECT * FROM "Difficulties" LIMIT 5;

-- Step 2: Check what we have
SELECT id, difficulty FROM "Difficulties" ORDER BY difficulty;

-- Step 3: Update ALL Academic activities with Beginner difficulty
UPDATE activities 
SET difficulty_id = (
  SELECT id FROM "Difficulties" 
  WHERE difficulty = 'Beginner'
)
WHERE category_id IN (
  SELECT id FROM "Categories" WHERE category_name ILIKE '%academic%'
)
AND difficulty_id IS NULL;

-- Step 4: Verify the changes
SELECT 
  a.title,
  c.category_name,
  d.difficulty as difficulty_level
FROM activities a
LEFT JOIN "Categories" c ON a.category_id = c.id
LEFT JOIN "Difficulties" d ON a.difficulty_id = d.id
WHERE c.category_name ILIKE '%academic%'
ORDER BY a.title;

-- =====================================================
-- Expected Result:
-- All Academic activities should now show "Beginner" as difficulty_level
-- Social/Daily Life activities should still show NULL (blank)
-- =====================================================
