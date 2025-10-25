-- Allow unauthenticated users to look up profiles by username for login
-- This is needed for the username-based login flow
CREATE POLICY "Allow username lookup for login"
ON public.profiles
FOR SELECT
TO anon
USING (true);