-- Check the actual schema of Expressions table
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'Expressions';

-- Also check if there are any records in the table
SELECT COUNT(*) as total_expressions FROM "Expressions";

-- Check what columns actually exist
SELECT * FROM "Expressions" LIMIT 1;