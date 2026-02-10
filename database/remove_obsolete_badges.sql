-- Remove obsolete badges from the badges table
DELETE FROM badges WHERE title IN (
  'Achievement Hero',
  'Survey Helper',
  'Calm Breather',
  'Friendship Star'
);

-- Optionally, remove from student_badges as well (if you want to clean up awarded badges)
DELETE FROM student_badges WHERE badge_id IN (
  SELECT id FROM badges WHERE title IN (
    'Achievement Hero',
    'Survey Helper',
    'Calm Breather',
    'Friendship Star'
  )
);