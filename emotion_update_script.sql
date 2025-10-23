-- ===============================================
-- EXPRESSION WALL EMOTION UPDATE SCRIPT
-- ===============================================
-- This script updates the emotion expressions in the database
-- to reflect the changes from "Not Fine" to "Upset" and "Calm" to "Tired"
-- 
-- Changes:
-- - "angry" database value represents "Upset" in UI (no DB change needed)
-- - "calm" database value represents "Tired" in UI (no DB change needed)
--
-- Note: The database still uses "angry" and "calm" internally for consistency
-- but the UI now displays them as "Upset" and "Tired" respectively.
-- ===============================================

-- First, let's check what emotions currently exist in the database
SELECT DISTINCT emotion, COUNT(*) as count 
FROM "Expressions" 
GROUP BY emotion 
ORDER BY emotion;

-- Also check User_emotion table if it exists
SELECT DISTINCT 
    ue.emotion_id,
    COUNT(*) as count
FROM "User_emotion" ue
GROUP BY ue.emotion_id
ORDER BY ue.emotion_id;

-- ===============================================
-- CREATE EMOTION MAPPING TABLE FOR UI DISPLAY
-- ===============================================
-- Create a mapping table to track UI display names vs database values
CREATE TABLE IF NOT EXISTS emotion_mappings (
    id SERIAL PRIMARY KEY,
    database_value VARCHAR(50) NOT NULL UNIQUE,
    display_name VARCHAR(50) NOT NULL,
    emoji VARCHAR(10),
    color_class VARCHAR(100),
    is_positive BOOLEAN DEFAULT true,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert the emotion mappings with the new UI names
INSERT INTO emotion_mappings (database_value, display_name, emoji, color_class, is_positive, description) 
VALUES 
    ('happy', 'Happy', '😊', 'from-yellow-400 to-orange-500', true, 'Feeling joyful and content'),
    ('sad', 'Sad', '😢', 'from-blue-400 to-blue-600', false, 'Feeling down or sorrowful'),
    ('angry', 'Upset', '😠', 'from-red-400 to-red-600', false, 'Feeling frustrated, angry, or not fine'),
    ('excited', 'Excited', '🤩', 'from-purple-400 to-pink-500', true, 'Feeling energetic and enthusiastic'),
    ('calm', 'Tired', '😴', 'from-green-400 to-teal-500', true, 'Feeling sleepy, relaxed, or in need of rest')
ON CONFLICT (database_value) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    emoji = EXCLUDED.emoji,
    color_class = EXCLUDED.color_class,
    is_positive = EXCLUDED.is_positive,
    description = EXCLUDED.description,
    updated_at = NOW();

-- ===============================================
-- UPDATE EXISTING RECORDS (IF NEEDED)
-- ===============================================
-- Note: Since we're only changing UI display names and the database
-- values remain the same (angry = Upset, calm = Tired), no data
-- migration is technically required.

-- However, if you had any records with old string values, here's how to update them:

-- Update any records that might have "not fine" to "angry"
UPDATE "Expressions" 
SET emotion = 'angry' 
WHERE LOWER(emotion) IN ('not fine', 'notfine', 'not_fine', 'upset');

-- Update any records that might have "tired" to "calm"
UPDATE "Expressions" 
SET emotion = 'calm' 
WHERE LOWER(emotion) IN ('tired', 'sleepy', 'drowsy');

-- Update any records that might need emotion standardization
UPDATE "Expressions" 
SET emotion = LOWER(TRIM(emotion))
WHERE emotion != LOWER(TRIM(emotion));

-- Ensure all emotions are in the allowed set
UPDATE "Expressions" 
SET emotion = CASE 
    WHEN LOWER(emotion) LIKE '%happy%' OR LOWER(emotion) LIKE '%joy%' THEN 'happy'
    WHEN LOWER(emotion) LIKE '%sad%' OR LOWER(emotion) LIKE '%down%' THEN 'sad'
    WHEN LOWER(emotion) LIKE '%angry%' OR LOWER(emotion) LIKE '%mad%' OR LOWER(emotion) LIKE '%upset%' OR LOWER(emotion) LIKE '%not fine%' THEN 'angry'
    WHEN LOWER(emotion) LIKE '%excited%' OR LOWER(emotion) LIKE '%energetic%' THEN 'excited'
    WHEN LOWER(emotion) LIKE '%calm%' OR LOWER(emotion) LIKE '%tired%' OR LOWER(emotion) LIKE '%sleepy%' THEN 'calm'
    ELSE emotion
END
WHERE emotion NOT IN ('happy', 'sad', 'angry', 'excited', 'calm');

-- ===============================================
-- CREATE HELPER FUNCTIONS
-- ===============================================
-- Function to get display name from database emotion
CREATE OR REPLACE FUNCTION get_emotion_display_name(db_emotion VARCHAR)
RETURNS VARCHAR AS $$
BEGIN
    RETURN CASE db_emotion
        WHEN 'angry' THEN 'Upset'
        WHEN 'calm' THEN 'Tired'
        WHEN 'happy' THEN 'Happy'
        WHEN 'sad' THEN 'Sad'
        WHEN 'excited' THEN 'Excited'
        ELSE INITCAP(db_emotion)
    END;
END;
$$ LANGUAGE plpgsql;

-- Function to get database emotion from display name
CREATE OR REPLACE FUNCTION get_emotion_database_value(display_emotion VARCHAR)
RETURNS VARCHAR AS $$
BEGIN
    RETURN CASE LOWER(display_emotion)
        WHEN 'upset' THEN 'angry'
        WHEN 'tired' THEN 'calm'
        WHEN 'happy' THEN 'happy'
        WHEN 'sad' THEN 'sad'
        WHEN 'excited' THEN 'excited'
        ELSE LOWER(display_emotion)
    END;
END;
$$ LANGUAGE plpgsql;

-- ===============================================
-- VERIFICATION QUERIES
-- ===============================================
-- Check the updated emotion distribution with display names
SELECT 
    emotion as database_emotion,
    get_emotion_display_name(emotion) as display_name,
    COUNT(*) as count,
    ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER(), 2) as percentage
FROM "Expressions" 
GROUP BY emotion 
ORDER BY count DESC;

-- Check recent expressions with both database and display values
SELECT 
    id,
    emotion as database_emotion,
    get_emotion_display_name(emotion) as display_name,
    intensity,
    note,
    created_at
FROM "Expressions"
ORDER BY created_at DESC
LIMIT 10;

-- Verify emotion mappings table
SELECT * FROM emotion_mappings ORDER BY database_value;

-- ===============================================
-- CREATE VIEW FOR EASIER QUERYING
-- ===============================================
-- Create a view that automatically shows display names
CREATE OR REPLACE VIEW expressions_with_display AS
SELECT 
    e.*,
    em.display_name,
    em.emoji,
    em.color_class,
    em.is_positive,
    em.description
FROM "Expressions" e
LEFT JOIN emotion_mappings em ON e.emotion = em.database_value;

-- Test the view
SELECT 
    emotion,
    display_name,
    emoji,
    COUNT(*) as count
FROM expressions_with_display
GROUP BY emotion, display_name, emoji
ORDER BY count DESC;

-- ===============================================
-- SAMPLE DATA FOR TESTING (OPTIONAL)
-- ===============================================
-- Uncomment the following if you want to add some test data

/*
-- Insert sample expressions with the updated emotion system
INSERT INTO "Expressions" (emotion, intensity, note, created_at) VALUES
    ('happy', 4, 'Had a great day at school!', NOW() - INTERVAL '1 hour'),
    ('calm', 3, 'Feeling sleepy after lunch (shows as Tired)', NOW() - INTERVAL '2 hours'),
    ('angry', 2, 'Frustrated with homework (shows as Upset)', NOW() - INTERVAL '3 hours'),
    ('excited', 5, 'Looking forward to the field trip!', NOW() - INTERVAL '4 hours'),
    ('sad', 2, 'Missing my friend who moved away', NOW() - INTERVAL '5 hours');
*/

-- ===============================================
-- CLEANUP COMMANDS (UNCOMMENT IF NEEDED)
-- ===============================================
-- If you want to remove the helper objects later:
-- DROP VIEW IF EXISTS expressions_with_display;
-- DROP FUNCTION IF EXISTS get_emotion_display_name(VARCHAR);
-- DROP FUNCTION IF EXISTS get_emotion_database_value(VARCHAR);
-- DROP TABLE IF EXISTS emotion_mappings;

-- Show final status
SELECT 'Emotion update script completed successfully!' as status,
       'UI now shows: angry as Upset, calm as Tired' as changes;