-- =====================================================
-- DIAGNOSTIC: Check Activities Difficulty Configuration
-- =====================================================

-- Step 1: First, get the ACTUAL UUID values for difficulties
-- COPY THESE UUIDs - YOU'LL NEED THEM!
SELECT 
  id as difficulty_uuid,
  name as difficulty_name
FROM "Difficulties"
ORDER BY name;

-- Step 2: Check which activities have NULL difficulty_id
SELECT 
  id,
  title,
  category_id,
  difficulty_id,
  CASE 
    WHEN difficulty_id IS NULL THEN '❌ NO DIFFICULTY'
    ELSE '✅ HAS DIFFICULTY'
  END as status
FROM activities
ORDER BY title;

-- Step 3: Check categories
SELECT 
  id as category_uuid,
  category_name
FROM "Categories";

-- Step 4: See activities grouped by category
SELECT 
  c.category_name,
  a.title,
  a.difficulty_id,
  d.name as difficulty_name
FROM activities a
LEFT JOIN "Categories" c ON a.category_id = c.id
LEFT JOIN "Difficulties" d ON a.difficulty_id = d.id
ORDER BY c.category_name, a.title;

-- =====================================================
-- FIX: Assign Difficulty Levels to Academic Activities
-- =====================================================

-- IMPORTANT: The difficulty_id column is UUID type, not integer!
-- You MUST use the actual UUID values from Step 1 above

-- First, declare variables with your actual UUIDs
-- Replace these with YOUR actual UUIDs from Step 1:
DO $$
DECLARE
  beginner_id UUID;
  intermediate_id UUID;
  proficient_id UUID;
  academic_category_id UUID;
BEGIN
  -- Get difficulty UUIDs
  SELECT id INTO beginner_id FROM "Difficulties" WHERE name = 'Beginner';
  SELECT id INTO intermediate_id FROM "Difficulties" WHERE name = 'Intermediate';
  SELECT id INTO proficient_id FROM "Difficulties" WHERE name = 'Proficient';
  
  -- Get Academic Skills category ID
  SELECT id INTO academic_category_id FROM "Categories" WHERE category_name ILIKE '%academic%';
  
  -- Display the IDs (for verification)
  RAISE NOTICE 'Beginner ID: %', beginner_id;
  RAISE NOTICE 'Intermediate ID: %', intermediate_id;
  RAISE NOTICE 'Proficient ID: %', proficient_id;
  RAISE NOTICE 'Academic Category ID: %', academic_category_id;
  
  -- Now update activities with proper UUIDs
  -- Note: This sets DEFAULT difficulty to Beginner for all Academic activities
  -- Adjust as needed for your specific activities
  
  UPDATE activities 
  SET difficulty_id = beginner_id 
  WHERE category_id = academic_category_id
    AND difficulty_id IS NULL;
    
END $$;

-- =====================================================
-- ALTERNATIVE: Manual UUID Updates (if script above doesn't work)
-- =====================================================

-- Step 1: Run this to get your UUIDs:
-- SELECT id, name FROM "Difficulties";

-- Step 2: Copy the UUIDs and use them below (replace the example UUIDs):

/*
-- Example (replace with YOUR actual UUIDs):
UPDATE activities 
SET difficulty_id = 'YOUR-BEGINNER-UUID-HERE'::uuid
WHERE title ILIKE '%identification%' 
  AND difficulty_id IS NULL;

UPDATE activities 
SET difficulty_id = 'YOUR-BEGINNER-UUID-HERE'::uuid
WHERE title ILIKE '%color%' 
  AND difficulty_id IS NULL;

UPDATE activities 
SET difficulty_id = 'YOUR-INTERMEDIATE-UUID-HERE'::uuid
WHERE title ILIKE '%matching%' 
  AND difficulty_id IS NULL;
*/

-- =====================================================
-- VERIFICATION: Check After Updates
-- =====================================================

-- Run this to verify your changes:
SELECT 
  a.title,
  c.category_name,
  d.name as difficulty_name,
  a.difficulty_id as difficulty_uuid
FROM activities a
LEFT JOIN "Categories" c ON a.category_id = c.id
LEFT JOIN "Difficulties" d ON a.difficulty_id = d.id
ORDER BY c.category_name, a.title;

-- =====================================================
-- IMPORTANT NOTES:
-- =====================================================

-- 1. difficulty_id is UUID type, NOT integer!
-- 2. Academic Skills activities SHOULD have a difficulty_id UUID
-- 3. Social/Daily Life Skills activities SHOULD have difficulty_id = NULL
-- 4. Use ::uuid to cast string UUIDs when needed
