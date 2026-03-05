-- ============================================================================
-- FIX ALL BADGE ICON_URLs: Replace broken placeholder URLs with proper emojis
-- ============================================================================
-- Many badges have placeholder URLs like https://yourcdn.com/... or
-- https://your-supabase-url.supabase.co/... that don't actually exist.
-- This script replaces ALL broken URLs with proper emoji icons.
-- ============================================================================

-- First, let's see which badges have URL-based icon_urls (broken placeholders)
-- SELECT id, title, icon_url FROM badges WHERE icon_url LIKE 'http%';

-- ============================================================================
-- UPDATE ALL BADGES WITH PROPER EMOJI ICONS
-- ============================================================================

-- Academic - General
UPDATE badges SET icon_url = '📖' WHERE title = 'Academic Star' AND (icon_url LIKE 'http%' OR icon_url IS NULL);
UPDATE badges SET icon_url = '⭐' WHERE title = 'First Step' AND (icon_url LIKE 'http%' OR icon_url IS NULL);
UPDATE badges SET icon_url = '💯' WHERE title = 'Perfect Scorer' AND (icon_url LIKE 'http%' OR icon_url IS NULL);
UPDATE badges SET icon_url = '🏅' WHERE title = 'High Achiever' AND (icon_url LIKE 'http%' OR icon_url IS NULL);
UPDATE badges SET icon_url = '🏠' WHERE title = 'Daily Life Hero' AND (icon_url LIKE 'http%' OR icon_url IS NULL);
UPDATE badges SET icon_url = '🌟' WHERE title = 'All-Rounder' AND (icon_url LIKE 'http%' OR icon_url IS NULL);
UPDATE badges SET icon_url = '🎯' WHERE title = 'Variety Champion' AND (icon_url LIKE 'http%' OR icon_url IS NULL);

-- Identification / Recognition
UPDATE badges SET icon_url = '🔍' WHERE title = 'Skill Spotter' AND (icon_url LIKE 'http%' OR icon_url IS NULL);
UPDATE badges SET icon_url = '🧩' WHERE title = 'Recognition Rookie' AND (icon_url LIKE 'http%' OR icon_url IS NULL);
UPDATE badges SET icon_url = '🎯' WHERE title = 'Recognition Pro' AND (icon_url LIKE 'http%' OR icon_url IS NULL);

-- Numbers
UPDATE badges SET icon_url = '🥷' WHERE title = 'Number Ninja' AND (icon_url LIKE 'http%' OR icon_url IS NULL);
UPDATE badges SET icon_url = '⚔️' WHERE title = 'Number Strategist' AND (icon_url LIKE 'http%' OR icon_url IS NULL);
UPDATE badges SET icon_url = '👑' WHERE title = 'Number Sensei' AND (icon_url LIKE 'http%' OR icon_url IS NULL);

-- Colors
UPDATE badges SET icon_url = '🌈' WHERE title = 'Color Spotter' AND (icon_url LIKE 'http%' OR icon_url IS NULL);
UPDATE badges SET icon_url = '🖌️' WHERE title = 'Color Explorer' AND (icon_url LIKE 'http%' OR icon_url IS NULL);
UPDATE badges SET icon_url = '🎨' WHERE title = 'Color Master' AND (icon_url LIKE 'http%' OR icon_url IS NULL);

-- Puzzles
UPDATE badges SET icon_url = '🧠' WHERE title = 'Puzzle Starter' AND (icon_url LIKE 'http%' OR icon_url IS NULL);
UPDATE badges SET icon_url = '🔓' WHERE title = 'Puzzle Thinker' AND (icon_url LIKE 'http%' OR icon_url IS NULL);
UPDATE badges SET icon_url = '🏆' WHERE title = 'Puzzle Mastermind' AND (icon_url LIKE 'http%' OR icon_url IS NULL);

-- Matching
UPDATE badges SET icon_url = '🔗' WHERE title = 'Match Maker' AND (icon_url LIKE 'http%' OR icon_url IS NULL);
UPDATE badges SET icon_url = '🔗' WHERE title = 'Match Finder' AND (icon_url LIKE 'http%' OR icon_url IS NULL);
UPDATE badges SET icon_url = '🧠' WHERE title = 'Logic Matcher' AND (icon_url LIKE 'http%' OR icon_url IS NULL);
UPDATE badges SET icon_url = '🎯' WHERE title = 'Perfect Matcher' AND (icon_url LIKE 'http%' OR icon_url IS NULL);

-- Visual Memory
UPDATE badges SET icon_url = '👀' WHERE title = 'Memory Observer' AND (icon_url LIKE 'http%' OR icon_url IS NULL);
UPDATE badges SET icon_url = '🧠' WHERE title = 'Memory Builder' AND (icon_url LIKE 'http%' OR icon_url IS NULL);
UPDATE badges SET icon_url = '🏅' WHERE title = 'Memory Champion' AND (icon_url LIKE 'http%' OR icon_url IS NULL);

-- Cashier Game
UPDATE badges SET icon_url = '🛒' WHERE title = 'Cash Register Starter' AND (icon_url LIKE 'http%' OR icon_url IS NULL);
UPDATE badges SET icon_url = '💵' WHERE title = 'Counter Helper' AND (icon_url LIKE 'http%' OR icon_url IS NULL);
UPDATE badges SET icon_url = '🧾' WHERE title = 'Checkout Champion' AND (icon_url LIKE 'http%' OR icon_url IS NULL);
UPDATE badges SET icon_url = '💰' WHERE title = 'Cash Handling Master' AND (icon_url LIKE 'http%' OR icon_url IS NULL);
UPDATE badges SET icon_url = '🏪' WHERE title = 'Trusted Cashier' AND (icon_url LIKE 'http%' OR icon_url IS NULL);

-- Money Value
UPDATE badges SET icon_url = '💵' WHERE title = 'Money Explorer' AND (icon_url LIKE 'http%' OR icon_url IS NULL);
UPDATE badges SET icon_url = '🧮' WHERE title = 'Value Identifier' AND (icon_url LIKE 'http%' OR icon_url IS NULL);
UPDATE badges SET icon_url = '👑' WHERE title = 'Money Smart Star' AND (icon_url LIKE 'http%' OR icon_url IS NULL);

-- Social Greetings
UPDATE badges SET icon_url = '👋' WHERE title = 'First Greeting' AND (icon_url LIKE 'http%' OR icon_url IS NULL);
UPDATE badges SET icon_url = '😊' WHERE title = 'Friendly Speaker' AND (icon_url LIKE 'http%' OR icon_url IS NULL);
UPDATE badges SET icon_url = '🌟' WHERE title = 'Social Confidence Star' AND (icon_url LIKE 'http%' OR icon_url IS NULL);

-- Hygiene
UPDATE badges SET icon_url = '🧼' WHERE title = 'Hygiene Starter' AND (icon_url LIKE 'http%' OR icon_url IS NULL);
UPDATE badges SET icon_url = '🪥' WHERE title = 'Clean Habit Builder' AND (icon_url LIKE 'http%' OR icon_url IS NULL);
UPDATE badges SET icon_url = '🦸' WHERE title = 'Hygiene Hero' AND (icon_url LIKE 'http%' OR icon_url IS NULL);

-- Household Chores
UPDATE badges SET icon_url = '🧹' WHERE title = 'Chore Starter' AND (icon_url LIKE 'http%' OR icon_url IS NULL);
UPDATE badges SET icon_url = '🧺' WHERE title = 'Helpful Hands' AND (icon_url LIKE 'http%' OR icon_url IS NULL);
UPDATE badges SET icon_url = '🏆' WHERE title = 'Household Helper Hero' AND (icon_url LIKE 'http%' OR icon_url IS NULL);

-- Street Crossing / Safety
UPDATE badges SET icon_url = '🚶' WHERE title = 'Safety Learner' AND (icon_url LIKE 'http%' OR icon_url IS NULL);
UPDATE badges SET icon_url = '🚦' WHERE title = 'Street Smart' AND (icon_url LIKE 'http%' OR icon_url IS NULL);
UPDATE badges SET icon_url = '🏆' WHERE title = 'Safety Champion' AND (icon_url LIKE 'http%' OR icon_url IS NULL);
UPDATE badges SET icon_url = '🚸' WHERE title = 'Brave Crosser' AND (icon_url LIKE 'http%' OR icon_url IS NULL);
UPDATE badges SET icon_url = '🚦' WHERE title = 'First Step Crosser' AND (icon_url LIKE 'http%' OR icon_url IS NULL);
UPDATE badges SET icon_url = '🛣️' WHERE title = 'Street Smart Explorer' AND (icon_url LIKE 'http%' OR icon_url IS NULL);

-- Also handle titles with embedded emojis (strip emoji prefix for matching)
UPDATE badges SET icon_url = '🚸' WHERE title LIKE '%Brave Crosser%' AND (icon_url LIKE 'http%' OR icon_url IS NULL);
UPDATE badges SET icon_url = '🚦' WHERE title LIKE '%First Step Crosser%' AND (icon_url LIKE 'http%' OR icon_url IS NULL);
UPDATE badges SET icon_url = '🛣️' WHERE title LIKE '%Street Smart Explorer%' AND (icon_url LIKE 'http%' OR icon_url IS NULL);

-- Emotions
UPDATE badges SET icon_url = '🙂' WHERE title LIKE '%Emotion Spotter%' AND (icon_url LIKE 'http%' OR icon_url IS NULL);
UPDATE badges SET icon_url = '🧭' WHERE title LIKE '%Emotion Explorer%' AND (icon_url LIKE 'http%' OR icon_url IS NULL);
UPDATE badges SET icon_url = '🌈' WHERE title LIKE '%Emotion Navigator%' AND (icon_url LIKE 'http%' OR icon_url IS NULL);
UPDATE badges SET icon_url = '🧠' WHERE title LIKE '%Emotion Analyst%' AND (icon_url LIKE 'http%' OR icon_url IS NULL);
UPDATE badges SET icon_url = '🌊' WHERE title LIKE '%Emotional Insight%' AND (icon_url LIKE 'http%' OR icon_url IS NULL);
UPDATE badges SET icon_url = '👑' WHERE title LIKE '%Emotion Master%' AND (icon_url LIKE 'http%' OR icon_url IS NULL);
UPDATE badges SET icon_url = '🌟' WHERE title LIKE '%Emotion Specialist%' AND (icon_url LIKE 'http%' OR icon_url IS NULL);

-- Routines / Streaks
UPDATE badges SET icon_url = '🌱' WHERE title LIKE '%Routine Starter%' AND (icon_url LIKE 'http%' OR icon_url IS NULL);
UPDATE badges SET icon_url = '🔁' WHERE title LIKE '%Routine Builder%' AND (icon_url LIKE 'http%' OR icon_url IS NULL);
UPDATE badges SET icon_url = '📅' WHERE title LIKE '%Consistency Champ%' AND (icon_url LIKE 'http%' OR icon_url IS NULL);
UPDATE badges SET icon_url = '🏅' WHERE title LIKE '%Habit Hero%' AND (icon_url LIKE 'http%' OR icon_url IS NULL);
UPDATE badges SET icon_url = '💪' WHERE title LIKE '%Consistency Legend%' AND (icon_url LIKE 'http%' OR icon_url IS NULL);
UPDATE badges SET icon_url = '👑' WHERE title LIKE '%Routine Master%' AND (icon_url LIKE 'http%' OR icon_url IS NULL);
UPDATE badges SET icon_url = '🔥' WHERE title LIKE '%Dedication Star%' AND (icon_url LIKE 'http%' OR icon_url IS NULL);

-- Chore-specific badges
UPDATE badges SET icon_url = '🍽️' WHERE title LIKE '%Dishwashing%' AND (icon_url LIKE 'http%' OR icon_url IS NULL);
UPDATE badges SET icon_url = '🧹' WHERE title LIKE '%Floor Care%' AND (icon_url LIKE 'http%' OR icon_url IS NULL);
UPDATE badges SET icon_url = '🍴' WHERE title LIKE '%Table Setting%' AND (icon_url LIKE 'http%' OR icon_url IS NULL);
UPDATE badges SET icon_url = '🛏️' WHERE title LIKE '%Bed Making%' AND (icon_url LIKE 'http%' OR icon_url IS NULL);
UPDATE badges SET icon_url = '🌱' WHERE title LIKE '%Plant Care%' AND (icon_url LIKE 'http%' OR icon_url IS NULL);
UPDATE badges SET icon_url = '🧹' WHERE title LIKE '%Sweep%' AND (icon_url LIKE 'http%' OR icon_url IS NULL);

-- ============================================================================
-- CATCH-ALL: Fix any remaining badges that still have URL-based icon_url
-- ============================================================================
UPDATE badges SET icon_url = '🏆' WHERE icon_url LIKE 'http%';

-- ============================================================================
-- VERIFY: Show all badges with their updated icons
-- ============================================================================
SELECT id, title, icon_url, 
  CASE 
    WHEN icon_url LIKE 'http%' THEN 'STILL BROKEN'
    WHEN icon_url IS NULL THEN 'NULL'
    ELSE 'OK - Emoji'
  END as status
FROM badges
ORDER BY title;
