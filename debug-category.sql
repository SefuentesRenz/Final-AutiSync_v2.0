-- Check activity 95 and its category
SELECT a.id, a.title, a.category_id, c.name as category_name
FROM activities a
LEFT JOIN Categories c ON a.category_id = c.id
WHERE a.id = 95;

-- Also check all categories
SELECT * FROM Categories;