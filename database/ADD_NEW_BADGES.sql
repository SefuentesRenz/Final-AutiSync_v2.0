-- ============================================================================
-- ADD NEW COMPREHENSIVE BADGES FOR ALL ACTIVITIES
-- ============================================================================
-- This script adds difficulty-based badges for academic activities and 
-- progression-based badges for social/daily life skills
-- ============================================================================

-- ACADEMIC ACTIVITY BADGES (Difficulty-Based Upgrades)

-- 🧠 IDENTIFICATION - Recognition Skills Line
INSERT INTO badges (title, description, icon_url, criteria) VALUES
('Skill Spotter', 'Complete a Beginner identification activity', '🔍', '{"activity": "identification", "difficulty": "Beginner", "count": 1}'),
('Recognition Rookie', 'Complete an Intermediate identification activity', '🧩', '{"activity": "identification", "difficulty": "Intermediate", "count": 1}'),
('Recognition Pro', 'Complete a Proficient identification activity', '🎯', '{"activity": "identification", "difficulty": "Proficient", "count": 1}');

-- 🔢 NUMBERS - Number Mastery Line
INSERT INTO badges (title, description, icon_url, criteria) VALUES
('Number Ninja', 'Complete at least one number activity', '🥷', '{"activity": "number", "difficulty": "Beginner", "count": 1}'),
('Number Strategist', 'Complete Intermediate number activities', '⚔️', '{"activity": "number", "difficulty": "Intermediate", "count": 1}'),
('Number Sensei', 'Complete Proficient number activities', '👑', '{"activity": "number", "difficulty": "Proficient", "count": 1}');

-- 🎨 COLORS - Color Awareness Line
INSERT INTO badges (title, description, icon_url, criteria) VALUES
('Color Spotter', 'Complete a Beginner color activity', '🌈', '{"activity": "color", "difficulty": "Beginner", "count": 1}'),
('Color Explorer', 'Complete an Intermediate color activity', '🖌️', '{"activity": "color", "difficulty": "Intermediate", "count": 1}'),
('Color Master', 'Complete a Proficient color activity', '🎨', '{"activity": "color", "difficulty": "Proficient", "count": 1}');

-- 🧩 ACADEMIC PUZZLES - Problem Solving Line
INSERT INTO badges (title, description, icon_url, criteria) VALUES
('Puzzle Starter', 'Complete a Beginner puzzle', '🧠', '{"activity": "puzzle", "difficulty": "Beginner", "count": 1}'),
('Puzzle Thinker', 'Complete an Intermediate puzzle', '🔓', '{"activity": "puzzle", "difficulty": "Intermediate", "count": 1}'),
('Puzzle Mastermind', 'Complete a Proficient puzzle', '🏆', '{"activity": "puzzle", "difficulty": "Proficient", "count": 1}');

-- 🔗 MATCHING TYPE - Association Skills Line
INSERT INTO badges (title, description, icon_url, criteria) VALUES
('Match Maker', 'Complete a Beginner matching activity', '🔗', '{"activity": "matching", "difficulty": "Beginner", "count": 1}'),
('Logic Matcher', 'Complete an Intermediate matching activity', '🧠', '{"activity": "matching", "difficulty": "Intermediate", "count": 1}'),
('Perfect Matcher', 'Complete a Proficient matching activity', '🎯', '{"activity": "matching", "difficulty": "Proficient", "count": 1}');

-- 👁️ VISUAL MEMORY CHALLENGE - Memory Skills Line
INSERT INTO badges (title, description, icon_url, criteria) VALUES
('Memory Observer', 'Complete a Beginner visual memory activity', '👀', '{"activity": "memory", "difficulty": "Beginner", "count": 1}'),
('Memory Builder', 'Complete an Intermediate visual memory activity', '🧠', '{"activity": "memory", "difficulty": "Intermediate", "count": 1}'),
('Memory Champion', 'Complete a Proficient visual memory activity', '🏅', '{"activity": "memory", "difficulty": "Proficient", "count": 1}');

-- SOCIAL & DAILY LIFE SKILL BADGES (Skill-Based Progression)

-- 🧾 CASHIER GAME - Transaction Skills Line
INSERT INTO badges (title, description, icon_url, criteria) VALUES
('Cashier Beginner', 'Complete the cashier game', '💳', '{"activity": "cashier", "count": 1}'),
('Smart Shopper', 'Successfully finish multiple cashier rounds', '🧾', '{"activity": "cashier", "count": 3}'),
('Checkout Champion', 'Demonstrate consistent correct transactions', '🏆', '{"activity": "cashier", "count": 5}');

-- 💰 MONEY VALUE GAME - Financial Awareness Line
INSERT INTO badges (title, description, icon_url, criteria) VALUES
('Money Explorer', 'Complete the money value game', '💵', '{"activity": "money", "count": 1}'),
('Value Identifier', 'Correctly identify money values', '🧮', '{"activity": "money", "count": 3}'),
('Money Smart Star', 'Show strong money-handling skills', '👑', '{"activity": "money", "count": 5}');

-- 👋 SOCIAL GREETINGS - Social Interaction Line
INSERT INTO badges (title, description, icon_url, criteria) VALUES
('First Greeting', 'Complete a social greeting activity', '👋', '{"activity": "greeting", "count": 1}'),
('Friendly Speaker', 'Practice multiple greetings', '😊', '{"activity": "greeting", "count": 3}'),
('Social Confidence Star', 'Show consistent greeting success', '🌟', '{"activity": "greeting", "count": 5}');

-- 🧼 HYGIENE HERO - Self-Care Skills Line
INSERT INTO badges (title, description, icon_url, criteria) VALUES
('Hygiene Starter', 'Complete a hygiene activity', '🧼', '{"activity": "hygiene", "count": 1}'),
('Clean Habit Builder', 'Practice regular hygiene', '🪥', '{"activity": "hygiene", "count": 3}'),
('Hygiene Hero', 'Demonstrate good hygiene routines', '🦸', '{"activity": "hygiene", "count": 5}');

-- 🏠 HOUSEHOLD CHORES HELPER - Home Responsibility Line
INSERT INTO badges (title, description, icon_url, criteria) VALUES
('Chore Starter', 'Complete a household task', '🧹', '{"activity": "chore", "count": 1}'),
('Helpful Hands', 'Complete multiple chores', '🧺', '{"activity": "chore", "count": 3}'),
('Household Helper Hero', 'Show consistent responsibility', '🏆', '{"activity": "chore", "count": 5}');

-- 🚦 SAFE STREET CROSSING - Safety Skills Line (already exists but adding progression)
INSERT INTO badges (title, description, icon_url, criteria) VALUES
('Safety Learner', 'Complete the street crossing game', '🚶', '{"activity": "street", "count": 1}'),
('Street Smart', 'Practice safe crossing multiple times', '🚦', '{"activity": "street", "count": 3}'),
('Safety Champion', 'Master safe street crossing', '🏆', '{"activity": "street", "count": 5}');

-- Verify the new badges were added
SELECT COUNT(*) as total_new_badges FROM badges 
WHERE title IN (
  'Skill Spotter', 'Recognition Rookie', 'Recognition Pro',
  'Number Ninja', 'Number Strategist', 'Number Sensei',
  'Color Spotter', 'Color Explorer', 'Color Master',
  'Puzzle Starter', 'Puzzle Thinker', 'Puzzle Mastermind',
  'Match Maker', 'Logic Matcher', 'Perfect Matcher',
  'Memory Observer', 'Memory Builder', 'Memory Champion',
  'Cashier Beginner', 'Smart Shopper', 'Checkout Champion',
  'Money Explorer', 'Value Identifier', 'Money Smart Star',
  'First Greeting', 'Friendly Speaker', 'Social Confidence Star',
  'Hygiene Starter', 'Clean Habit Builder', 'Hygiene Hero',
  'Chore Starter', 'Helpful Hands', 'Household Helper Hero',
  'Safety Learner', 'Street Smart', 'Safety Champion'
);

-- Display all badges
SELECT title, description, icon_url, criteria FROM badges ORDER BY title;
