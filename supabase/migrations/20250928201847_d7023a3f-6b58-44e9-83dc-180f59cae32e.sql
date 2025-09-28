-- Step 2: Update existing roles and delete old profile
-- Delete the existing master_admin profile and related data
DELETE FROM user_roles WHERE user_id = '81e465d4-c8fe-4017-bfe2-2a4a5d01fe15';
DELETE FROM profiles WHERE user_id = '81e465d4-c8fe-4017-bfe2-2a4a5d01fe15';

-- Update existing role assignments to match new hierarchy
-- admin stays as admin (highest role)
-- staff becomes manager  
-- user becomes clerk
-- master becomes admin (since it should be highest)
UPDATE user_roles SET role = 'manager' WHERE role = 'staff';
UPDATE user_roles SET role = 'clerk' WHERE role = 'user';
UPDATE user_roles SET role = 'admin' WHERE role = 'master';

-- Update the handle_new_user function to assign clerk role by default
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (user_id, first_name, last_name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'first_name', ''),
    COALESCE(NEW.raw_user_meta_data ->> 'last_name', ''),
    NEW.email
  );
  
  -- Assign admin role to first user, otherwise clerk
  INSERT INTO public.user_roles (user_id, role)
  VALUES (
    NEW.id,
    CASE 
      WHEN (SELECT COUNT(*) FROM auth.users) = 1 THEN 'admin'::app_role
      ELSE 'clerk'::app_role
    END
  );
  
  RETURN NEW;
END;
$function$;