-- =====================================================
-- STEP 1: Find the correct column name for Difficulties
-- =====================================================

-- Run this to see ALL columns in the Difficulties table:
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'Difficulties';

-- OR just select everything to see the data:
SELECT * FROM "Difficulties";

-- =====================================================
-- Common column names:
-- - name
-- - difficulty_name
-- - difficulty_level
-- - level
-- - title
-- =====================================================

-- After you find the correct column name, update:
-- 1. src/lib/progressApi.js (line 297)
-- 2. The SQL queries below

-- =====================================================
-- STEP 2: Update Activities (REPLACE 'name' with actual column)
-- =====================================================

-- Example: If column is 'difficulty_name', use this:
UPDATE activities 
SET difficulty_id = (
  SELECT id FROM "Difficulties" 
  WHERE difficulty_name = 'Beginner'
)
WHERE category_id IN (
  SELECT id FROM "Categories" WHERE category_name ILIKE '%academic%'
)
AND difficulty_id IS NULL;

-- =====================================================
-- STEP 3: Verify
-- =====================================================

SELECT 
  a.title,
  c.category_name,
  d.* -- Shows ALL difficulty columns
FROM activities a
LEFT JOIN "Categories" c ON a.category_id = c.id
LEFT JOIN "Difficulties" d ON a.difficulty_id = d.id
WHERE a.title IN ('Colors', 'Identification', 'Matching Type')
ORDER BY a.title;
