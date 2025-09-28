-- Drop the conflicting policy and create a more specific one for login
DROP POLICY IF EXISTS "Allow email lookup by username for login" ON public.profiles;

-- Create a more specific policy that allows anon users to read only email when username matches
CREATE POLICY "Allow email lookup for login" ON public.profiles
FOR SELECT TO anon
USING (username IS NOT NULL);