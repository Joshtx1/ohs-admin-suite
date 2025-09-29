-- Add admin role for nope user
INSERT INTO public.user_roles (user_id, role)
VALUES ('289795f8-6649-4b7c-9ecd-c41ac252e491', 'admin'::app_role);