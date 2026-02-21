-- ============================================================================
-- ADD CHORE-SPECIFIC BADGES FOR HOUSEHOLD CHORES HELPER
-- ============================================================================
-- Run this in your Supabase SQL editor.
-- These badges are awarded per individual chore activity.
--
-- Completion Badges: earned the first time a student finishes a specific chore.
-- Mastery Badges   : earned when a student scores 100% (3/3) on a specific chore.
-- ============================================================================

-- ── COMPLETION BADGES (Finished the Activity) ────────────────────────────────

INSERT INTO badges (title, description, icon_url, criteria) VALUES
('Dishwashing Starter',  'Complete the Washing Dishes activity',   '🍽️', '{"activity": "specific_chore", "chore": "washing_dishes",  "count": 1}'),
('Table Tidy Helper',    'Complete the Wiping Table activity',     '🧽', '{"activity": "specific_chore", "chore": "wiping_table",    "count": 1}'),
('Bed Setup Star',       'Complete the Making Bed activity',       '🛏️', '{"activity": "specific_chore", "chore": "making_bed",      "count": 1}'),
('Floor Care Helper',    'Complete the Sweeping Floor activity',   '🧹', '{"activity": "specific_chore", "chore": "sweeping_floor",  "count": 1}'),
('Plant Care Starter',   'Complete the Watering Plants activity',  '🌱', '{"activity": "specific_chore", "chore": "watering_plants", "count": 1}');

-- ── MASTERY BADGES (3/3 Perfect Score) ───────────────────────────────────────

INSERT INTO badges (title, description, icon_url, criteria) VALUES
('Dishwashing Expert',   'Get 3/3 in Washing Dishes',   '🍽️', '{"activity": "specific_chore_mastery", "chore": "washing_dishes",  "count": 1}'),
('Table Care Champion',  'Get 3/3 in Wiping Table',     '🧽', '{"activity": "specific_chore_mastery", "chore": "wiping_table",    "count": 1}'),
('Bed Making Master',    'Get 3/3 in Making Bed',       '🛏️', '{"activity": "specific_chore_mastery", "chore": "making_bed",      "count": 1}'),
('Floor Care Pro',       'Get 3/3 in Sweeping Floor',   '🧹', '{"activity": "specific_chore_mastery", "chore": "sweeping_floor",  "count": 1}'),
('Plant Care Guardian',  'Get 3/3 in Watering Plants',  '🌱', '{"activity": "specific_chore_mastery", "chore": "watering_plants", "count": 1}');
