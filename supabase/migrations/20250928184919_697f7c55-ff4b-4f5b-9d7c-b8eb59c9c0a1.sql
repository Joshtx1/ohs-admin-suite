-- Update the user role to admin so they can access the Users menu
UPDATE public.user_roles 
SET role = 'admin'::app_role 
WHERE user_id = (SELECT id FROM auth.users LIMIT 1);