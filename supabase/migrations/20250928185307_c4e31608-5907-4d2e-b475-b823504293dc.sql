-- Update user to master role (highest access level)
UPDATE public.user_roles 
SET role = 'master'::app_role 
WHERE user_id = (SELECT user_id FROM profiles WHERE email = 'neonbelly99@gmail.com');