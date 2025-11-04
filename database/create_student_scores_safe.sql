-- ============================================
-- SAFE VERSION: Create student_scores table
-- No DROP commands - safe for first-time execution
-- ============================================

-- Step 1: Create the student_scores table
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

-- Step 2: Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_student_scores_student_id 
  ON public.student_scores(student_id);

CREATE INDEX IF NOT EXISTS idx_student_scores_activity 
  ON public.student_scores(student_id, activity_name);

CREATE INDEX IF NOT EXISTS idx_student_scores_difficulty 
  ON public.student_scores(student_id, difficulty_level);

CREATE INDEX IF NOT EXISTS idx_student_scores_category 
  ON public.student_scores(student_id, category);

-- Step 3: Enable Row Level Security
ALTER TABLE public.student_scores ENABLE ROW LEVEL SECURITY;

-- Step 4: Create RLS Policies (only if they don't exist)

-- Policy: Students can view their own scores
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'student_scores' 
    AND policyname = 'Students can view own scores'
  ) THEN
    CREATE POLICY "Students can view own scores"
      ON public.student_scores
      FOR SELECT
      USING (auth.uid() = student_id);
  END IF;
END $$;

-- Policy: Students can insert their own scores
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'student_scores' 
    AND policyname = 'Students can insert own scores'
  ) THEN
    CREATE POLICY "Students can insert own scores"
      ON public.student_scores
      FOR INSERT
      WITH CHECK (auth.uid() = student_id);
  END IF;
END $$;

-- Policy: Students can update their own scores
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'student_scores' 
    AND policyname = 'Students can update own scores'
  ) THEN
    CREATE POLICY "Students can update own scores"
      ON public.student_scores
      FOR UPDATE
      USING (auth.uid() = student_id)
      WITH CHECK (auth.uid() = student_id);
  END IF;
END $$;

-- Policy: Admins can view all scores
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'student_scores' 
    AND policyname = 'Admins can view all scores'
  ) THEN
    CREATE POLICY "Admins can view all scores"
      ON public.student_scores
      FOR SELECT
      USING (
        EXISTS (
          SELECT 1 FROM public.admins
          WHERE admins.user_id = auth.uid()
        )
      );
  END IF;
END $$;

-- Step 5: Create trigger function for updated_at
CREATE OR REPLACE FUNCTION update_student_scores_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 6: Create trigger (will replace if exists)
DROP TRIGGER IF EXISTS update_student_scores_timestamp ON public.student_scores;

CREATE TRIGGER update_student_scores_timestamp
  BEFORE UPDATE ON public.student_scores
  FOR EACH ROW
  EXECUTE FUNCTION update_student_scores_updated_at();

-- Step 7: Add table comment
COMMENT ON TABLE public.student_scores IS 
  'Stores student scores for activity unlock logic. Perfect scores (score = total_questions) unlock the next difficulty level.';

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Verify table was created
SELECT 
  'Table created successfully!' AS status,
  table_name
FROM information_schema.tables
WHERE table_schema = 'public' 
  AND table_name = 'student_scores';

-- Show all columns
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'student_scores'
ORDER BY ordinal_position;

-- Verify RLS is enabled
SELECT 
  tablename,
  rowsecurity AS rls_enabled
FROM pg_tables
WHERE tablename = 'student_scores';

-- List all policies
SELECT 
  policyname,
  cmd AS command,
  permissive
FROM pg_policies
WHERE tablename = 'student_scores';
