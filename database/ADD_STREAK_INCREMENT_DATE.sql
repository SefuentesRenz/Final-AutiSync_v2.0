-- ============================================================================
-- ADD STREAK INCREMENT DATE COLUMN
-- ============================================================================
-- This migration adds the last_streak_increment_date column to track
-- when the streak was last incremented (separate from last_active_date)
-- This allows us to ensure streak only increments once per day
-- ============================================================================

-- Add last_streak_increment_date column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'streaks' 
        AND column_name = 'last_streak_increment_date'
    ) THEN
        ALTER TABLE streaks 
        ADD COLUMN last_streak_increment_date DATE;
        
        COMMENT ON COLUMN streaks.last_streak_increment_date IS 'Date when streak was last incremented (ensures once per day increment)';
        
        -- Initialize with last_active_date for existing records
        UPDATE streaks 
        SET last_streak_increment_date = last_active_date 
        WHERE last_active_date IS NOT NULL;
        
        RAISE NOTICE 'Column last_streak_increment_date added successfully';
    ELSE
        RAISE NOTICE 'Column last_streak_increment_date already exists';
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

-- Show sample data
SELECT 
    user_id,
    current_streak,
    longest_streak,
    last_active_date,
    last_streak_increment_date,
    updated_at
FROM streaks
LIMIT 5;
