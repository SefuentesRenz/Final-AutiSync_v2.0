-- ===============================================
-- 24-HOUR EXPRESSION CLEANUP SCRIPT
-- ===============================================
-- This script sets up automatic cleanup of old expressions
-- for better performance while maintaining admin/parent access
-- ===============================================

-- Option 1: Create a view for 24-hour expressions (Student Homepage)
CREATE OR REPLACE VIEW expressions_24h AS
SELECT 
    e.*,
    s.id as student_id,
    s.profile_id,
    up.full_name,
    up.username
FROM "Expressions" e
LEFT JOIN students s ON e.student_id = s.id
LEFT JOIN user_profiles up ON s.profile_id = up.id
WHERE e.created_at >= NOW() - INTERVAL '24 hours'
ORDER BY e.created_at DESC;

-- Option 2: Create a function to clean old expressions (run daily)
-- NOTE: This permanently deletes old data. Use carefully!
CREATE OR REPLACE FUNCTION cleanup_old_expressions()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    -- Delete expressions older than 30 days (keeping some history for admin/parents)
    DELETE FROM "Expressions" 
    WHERE created_at < NOW() - INTERVAL '30 days';
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    -- Log the cleanup
    INSERT INTO system_logs (action, details, created_at)
    VALUES ('cleanup_expressions', 
            'Deleted ' || deleted_count || ' expressions older than 30 days',
            NOW())
    ON CONFLICT DO NOTHING; -- In case system_logs table doesn't exist
    
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Option 3: Create a more sophisticated archiving system
CREATE TABLE IF NOT EXISTS expressions_archive (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    original_id UUID,
    student_id UUID,
    emotion VARCHAR(50),
    intensity INTEGER,
    note TEXT,
    original_created_at TIMESTAMP WITH TIME ZONE,
    archived_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Function to archive old expressions instead of deleting
CREATE OR REPLACE FUNCTION archive_old_expressions()
RETURNS INTEGER AS $$
DECLARE
    archived_count INTEGER;
BEGIN
    -- Move expressions older than 7 days to archive
    INSERT INTO expressions_archive (
        original_id, student_id, emotion, intensity, note, original_created_at
    )
    SELECT id, student_id, emotion, intensity, note, created_at
    FROM "Expressions"
    WHERE created_at < NOW() - INTERVAL '7 days'
    AND id NOT IN (SELECT original_id FROM expressions_archive WHERE original_id IS NOT NULL);
    
    GET DIAGNOSTICS archived_count = ROW_COUNT;
    
    -- Delete the archived expressions from main table
    DELETE FROM "Expressions" 
    WHERE created_at < NOW() - INTERVAL '7 days';
    
    RETURN archived_count;
END;
$$ LANGUAGE plpgsql;

-- ===============================================
-- SCHEDULE AUTOMATIC CLEANUP (PostgreSQL/Supabase)
-- ===============================================
-- For Supabase, you can use pg_cron extension if available
-- Or set up a webhook/function to run this periodically

-- Enable pg_cron extension (if available)
-- CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule daily cleanup at 2 AM
-- SELECT cron.schedule('cleanup-expressions', '0 2 * * *', 'SELECT cleanup_old_expressions();');

-- ===============================================
-- ALTERNATIVE: Create indexes for better performance
-- ===============================================
-- Index for 24-hour queries
CREATE INDEX IF NOT EXISTS idx_expressions_created_at_24h 
ON "Expressions" (created_at) 
WHERE created_at >= NOW() - INTERVAL '24 hours';

-- Index for student queries
CREATE INDEX IF NOT EXISTS idx_expressions_student_created 
ON "Expressions" (student_id, created_at DESC);

-- ===============================================
-- VERIFICATION QUERIES
-- ===============================================
-- Test the 24-hour view
SELECT COUNT(*) as expressions_24h FROM expressions_24h;

-- Check current data distribution
SELECT 
    DATE(created_at) as date,
    COUNT(*) as count
FROM "Expressions"
WHERE created_at >= NOW() - INTERVAL '7 days'
GROUP BY DATE(created_at)
ORDER BY date DESC;

-- Test cleanup function (without actually running it)
-- SELECT cleanup_old_expressions(); -- Uncomment to run

SELECT 'Expression 24-hour system setup complete!' as status;