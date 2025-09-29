-- Update nope user to admin role
UPDATE public.user_roles 
SET role = 'admin'::app_role 
WHERE user_id = 'c9bff6c4-55a7-4d48-9369-80c91de5e4db';