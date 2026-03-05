-- ============================================================================
-- ADD CASHIER GAME BADGES (5 New Progression Badges)
-- ============================================================================
-- Replaces the old cashier badges (Cashier Beginner, Smart Shopper, Checkout Champion)
-- with a new 5-badge progression system for the Cashier Game
-- ============================================================================

-- Step 1: Remove old cashier badges (if they exist)
DELETE FROM student_badges WHERE badge_id IN (
  SELECT id FROM badges WHERE title IN ('Cashier Beginner', 'Smart Shopper', 'Checkout Champion')
);
DELETE FROM badges WHERE title IN ('Cashier Beginner', 'Smart Shopper', 'Checkout Champion');

-- Step 2: Insert the 5 new Cashier Game badges

-- 🛒 Cash Register Starter — Finish the Cashier Game once
INSERT INTO badges (title, description, icon_url, criteria) VALUES
('Cash Register Starter', 'Successfully finish the Cashier Game once', '🛒', '{"activity": "cashier", "type": "completion", "count": 1}');

-- 💵 Counter Helper — Finish the Cashier Game 3 times
INSERT INTO badges (title, description, icon_url, criteria) VALUES
('Counter Helper', 'Finish 3 sets of the Cashier Game', '💵', '{"activity": "cashier", "type": "completion", "count": 3}');

-- 🧾 Checkout Champion — Get a perfect score at least 3 times
INSERT INTO badges (title, description, icon_url, criteria) VALUES
('Checkout Champion', 'Get a perfect score in the Cashier Game at least 3 times', '🧾', '{"activity": "cashier", "type": "perfect", "count": 3}');

-- 💰 Cash Handling Master — Get a perfect score at least 5 times
INSERT INTO badges (title, description, icon_url, criteria) VALUES
('Cash Handling Master', 'Get a perfect score in the Cashier Game at least 5 times', '💰', '{"activity": "cashier", "type": "perfect", "count": 5}');

-- 🏪 Trusted Cashier — Get a perfect score at least 10 times (Ultimate Mastery)
INSERT INTO badges (title, description, icon_url, criteria) VALUES
('Trusted Cashier', 'Get a perfect score in the Cashier Game at least 10 times — Ultimate Mastery!', '🏪', '{"activity": "cashier", "type": "perfect", "count": 10}');

-- Step 3: Verify the new badges were added
SELECT id, title, description, icon_url, criteria FROM badges 
WHERE title IN (
  'Cash Register Starter',
  'Counter Helper', 
  'Checkout Champion',
  'Cash Handling Master',
  'Trusted Cashier'
)
ORDER BY 
  CASE title
    WHEN 'Cash Register Starter' THEN 1
    WHEN 'Counter Helper' THEN 2
    WHEN 'Checkout Champion' THEN 3
    WHEN 'Cash Handling Master' THEN 4
    WHEN 'Trusted Cashier' THEN 5
  END;
