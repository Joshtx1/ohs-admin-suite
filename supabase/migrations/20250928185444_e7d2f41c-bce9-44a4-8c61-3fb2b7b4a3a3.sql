-- Update RLS policies to allow master role access to user_roles table
DROP POLICY IF EXISTS "Admins can view all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can manage roles" ON public.user_roles;

-- Create new policies that include master role
CREATE POLICY "Admins and masters can view all roles" 
ON public.user_roles 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'master'::app_role));

CREATE POLICY "Admins and masters can manage roles" 
ON public.user_roles 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'master'::app_role));

-- Also update profiles table to allow masters to view all profiles
CREATE POLICY "Masters can view all profiles" 
ON public.profiles 
FOR SELECT 
USING (has_role(auth.uid(), 'master'::app_role));