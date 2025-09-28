-- Assign admin role to neonbelly99@gmail.com user
INSERT INTO public.user_roles (user_id, role)
SELECT u.id, 'admin'::app_role
FROM auth.users u
WHERE u.email = 'neonbelly99@gmail.com'
AND NOT EXISTS (
  SELECT 1 FROM public.user_roles ur 
  WHERE ur.user_id = u.id AND ur.role = 'admin'::app_role
);