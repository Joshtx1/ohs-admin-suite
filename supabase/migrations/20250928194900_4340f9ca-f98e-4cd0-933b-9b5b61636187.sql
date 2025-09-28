-- Allow reading email by username for login purposes
CREATE POLICY "Allow email lookup by username for login"
ON public.profiles 
FOR SELECT 
TO anon
USING (username IS NOT NULL);