-- Check RLS policies on Difficulties table
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'Difficulties';

-- If no policies exist, we need to add a policy to allow SELECT
-- Run this to enable RLS and add a policy:
ALTER TABLE "Difficulties" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to Difficulties"
ON "Difficulties"
FOR SELECT
TO public
USING (true);

-- Verify the policy was created
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'Difficulties';
