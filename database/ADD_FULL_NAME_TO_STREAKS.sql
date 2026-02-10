-- ============================================================================ 
-- ADD FULL_NAME COLUMN TO STREAKS TABLE
-- ============================================================================
-- This migration adds the full_name column to the streaks table for easier identification
-- of students in Supabase and admin dashboards.
-- ============================================================================

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'streaks' 
        AND column_name = 'full_name'
    ) THEN
        ALTER TABLE streaks 
        ADD COLUMN full_name TEXT;
        
        COMMENT ON COLUMN streaks.full_name IS 'Student full name for admin visibility';
        
        RAISE NOTICE 'Column full_name added successfully';
    ELSE
        RAISE NOTICE 'Column full_name already exists';
    END IF;
END $$;

-- Verify the column was added
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns
WHERE table_name = 'streaks'
ORDER BY ordinal_position;
