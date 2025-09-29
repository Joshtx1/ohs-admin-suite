-- Update all RLS policies to give admin users master permissions

-- Update profiles table policies
DROP POLICY IF EXISTS "Masters can view all profiles" ON public.profiles;
CREATE POLICY "Admins and masters can view all profiles" 
ON public.profiles 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'master'::app_role));

-- Update permissions table policies  
DROP POLICY IF EXISTS "Admins and masters can manage permissions" ON public.permissions;
CREATE POLICY "Admins and masters can manage permissions" 
ON public.permissions 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'master'::app_role));

-- Update role_permissions table policies
DROP POLICY IF EXISTS "Admins and masters can manage role permissions" ON public.role_permissions;
CREATE POLICY "Admins and masters can manage role permissions" 
ON public.role_permissions 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'master'::app_role));

-- Update user_roles table policies
DROP POLICY IF EXISTS "Admins and masters can manage roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins and masters can view all roles" ON public.user_roles;

CREATE POLICY "Admins and masters can manage roles" 
ON public.user_roles 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'master'::app_role));

CREATE POLICY "Admins and masters can view all roles" 
ON public.user_roles 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'master'::app_role));