-- ============================================
-- STEP 1: Check if table exists
-- ============================================
-- Run this first to verify:
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'student_scores'
);
-- If this returns 'false', the table doesn't exist and needs to be created

-- ============================================
-- STEP 2: Drop existing table if it has issues (OPTIONAL - only if recreating)
-- ============================================
-- DROP TABLE IF EXISTS public.student_scores CASCADE;

-- ============================================
-- STEP 3: Create the student_scores table
-- ============================================
CREATE TABLE IF NOT EXISTS public.student_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  activity_name TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'Academic',
  difficulty_level TEXT NOT NULL CHECK (difficulty_level IN ('Beginner', 'Intermediate', 'Proficient')),
  score INTEGER NOT NULL DEFAULT 0,
  total_questions INTEGER NOT NULL DEFAULT 0,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure one record per student + activity + difficulty combination
  UNIQUE(student_id, activity_name, difficulty_level)
);

-- ============================================
-- STEP 4: Create indexes for performance
-- ============================================
CREATE INDEX IF NOT EXISTS idx_student_scores_student_id 
  ON public.student_scores(student_id);

CREATE INDEX IF NOT EXISTS idx_student_scores_activity 
  ON public.student_scores(student_id, activity_name);

CREATE INDEX IF NOT EXISTS idx_student_scores_difficulty 
  ON public.student_scores(student_id, difficulty_level);

CREATE INDEX IF NOT EXISTS idx_student_scores_category 
  ON public.student_scores(student_id, category);

-- ============================================
-- STEP 5: Enable Row Level Security
-- ============================================
ALTER TABLE public.student_scores ENABLE ROW LEVEL SECURITY;

-- ============================================
-- STEP 6: Drop existing policies (if recreating)
-- ============================================
DROP POLICY IF EXISTS "Students can view own scores" ON public.student_scores;
DROP POLICY IF EXISTS "Students can insert own scores" ON public.student_scores;
DROP POLICY IF EXISTS "Students can update own scores" ON public.student_scores;
DROP POLICY IF EXISTS "Admins can view all scores" ON public.student_scores;

-- ============================================
-- STEP 7: Create RLS Policies
-- ============================================

-- Policy: Students can view their own scores
CREATE POLICY "Students can view own scores"
  ON public.student_scores
  FOR SELECT
  USING (auth.uid() = student_id);

-- Policy: Students can insert their own scores
CREATE POLICY "Students can insert own scores"
  ON public.student_scores
  FOR INSERT
  WITH CHECK (auth.uid() = student_id);

-- Policy: Students can update their own scores
CREATE POLICY "Students can update own scores"
  ON public.student_scores
  FOR UPDATE
  USING (auth.uid() = student_id)
  WITH CHECK (auth.uid() = student_id);

-- Policy: Admins can view all scores
CREATE POLICY "Admins can view all scores"
  ON public.student_scores
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.admins
      WHERE admins.user_id = auth.uid()
    )
  );

-- ============================================
-- STEP 8: Create trigger for updated_at
-- ============================================
CREATE OR REPLACE FUNCTION update_student_scores_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_student_scores_timestamp ON public.student_scores;

CREATE TRIGGER update_student_scores_timestamp
  BEFORE UPDATE ON public.student_scores
  FOR EACH ROW
  EXECUTE FUNCTION update_student_scores_updated_at();

-- ============================================
-- STEP 9: Add table comment
-- ============================================
COMMENT ON TABLE public.student_scores IS 
  'Stores student scores for activity unlock logic. Perfect scores (score = total_questions) unlock the next difficulty level.';

-- ============================================
-- STEP 10: Verify table was created successfully
-- ============================================
SELECT 
  table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'student_scores'
ORDER BY ordinal_position;

-- ============================================
-- STEP 11: Verify RLS is enabled
-- ============================================
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables
WHERE tablename = 'student_scores';

-- ============================================
-- STEP 12: List all policies on the table
-- ============================================
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'student_scores';
