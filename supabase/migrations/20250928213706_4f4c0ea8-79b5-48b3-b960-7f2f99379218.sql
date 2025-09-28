-- Update the user trigger to generate username automatically
CREATE OR REPLACE FUNCTION public.generate_username()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  base_username TEXT;
  final_username TEXT;
  counter INTEGER := 0;
  username_exists BOOLEAN := TRUE;
BEGIN
  -- Extract first name and last name from raw_user_meta_data would be ideal,
  -- but we'll use email prefix as fallback for existing users
  -- This function will be called from the updated trigger
  
  RETURN NULL; -- Will be set by the updated trigger
END;
$$;

-- Update the handle_new_user function to generate username
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  base_username TEXT;
  final_username TEXT;
  counter INTEGER := 0;
  username_exists BOOLEAN := TRUE;
BEGIN
  -- Extract email prefix for username base
  base_username := split_part(NEW.email, '@', 1);
  
  -- Clean up the base username (remove special characters)
  base_username := regexp_replace(base_username, '[^a-zA-Z0-9]', '', 'g');
  base_username := lower(base_username);
  
  -- Ensure minimum length
  IF length(base_username) < 3 THEN
    base_username := base_username || 'user';
  END IF;
  
  -- Find unique username
  final_username := base_username;
  WHILE username_exists LOOP
    -- Check if username exists
    SELECT EXISTS(
      SELECT 1 FROM public.profiles 
      WHERE username = final_username AND user_id != NEW.id
    ) INTO username_exists;
    
    IF username_exists THEN
      counter := counter + 1;
      final_username := base_username || counter::text;
    END IF;
  END LOOP;

  -- Insert into profiles with generated username
  INSERT INTO public.profiles (user_id, first_name, last_name, email, username)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'first_name', ''),
    COALESCE(NEW.raw_user_meta_data ->> 'last_name', ''),
    NEW.email,
    final_username
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
$$;