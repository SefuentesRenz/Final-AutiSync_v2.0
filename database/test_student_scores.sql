-- ============================================
-- SIMPLE TEST QUERIES FOR student_scores table
-- ============================================

-- 1. Check if table exists
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'student_scores'
) AS table_exists;

-- 2. Count records in table
SELECT COUNT(*) AS total_records
FROM public.student_scores;

-- 3. View all records (if any)
SELECT 
  id,
  student_id,
  activity_name,
  category,
  difficulty_level,
  score,
  total_questions,
  completed_at
FROM public.student_scores
ORDER BY completed_at DESC;

-- 4. Check RLS policies
SELECT 
  policyname,
  cmd,
  permissive
FROM pg_policies
WHERE tablename = 'student_scores';

-- 5. Test INSERT (replace with your actual student_id)
-- Uncomment and modify this to test:
/*
INSERT INTO public.student_scores (
  student_id,
  activity_name,
  category,
  difficulty_level,
  score,
  total_questions
) VALUES (
  '21b26180-f701-48b8-a5e2-5d953e80bdc7', -- Replace with your student ID
  'Colors',
  'Academic',
  'Beginner',
  3,
  5
);
*/

-- 6. After testing, you can delete test records:
/*
DELETE FROM public.student_scores
WHERE activity_name = 'Colors' 
AND difficulty_level = 'Beginner';
*/
