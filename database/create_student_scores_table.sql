-- Create student_scores table for activity unlock logic
-- This table tracks student scores to determine which difficulty levels are unlocked

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

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_student_scores_student_id ON public.student_scores(student_id);
CREATE INDEX IF NOT EXISTS idx_student_scores_activity ON public.student_scores(student_id, activity_name);
CREATE INDEX IF NOT EXISTS idx_student_scores_difficulty ON public.student_scores(student_id, difficulty_level);

-- Enable RLS
ALTER TABLE public.student_scores ENABLE ROW LEVEL SECURITY;

-- Policy: Students can view and insert/update their own scores
CREATE POLICY "Students can view own scores"
  ON public.student_scores
  FOR SELECT
  USING (auth.uid() = student_id);

CREATE POLICY "Students can insert own scores"
  ON public.student_scores
  FOR INSERT
  WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Students can update own scores"
  ON public.student_scores
  FOR UPDATE
  USING (auth.uid() = student_id);

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

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_student_scores_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_student_scores_timestamp
  BEFORE UPDATE ON public.student_scores
  FOR EACH ROW
  EXECUTE FUNCTION update_student_scores_updated_at();

-- Add helpful comment
COMMENT ON TABLE public.student_scores IS 'Stores student scores for activity unlock logic. Perfect scores (score = total_questions) unlock the next difficulty level.';
