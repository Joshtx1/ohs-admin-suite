-- Update user code generation to be sequential starting from 5001
CREATE OR REPLACE FUNCTION public.generate_user_code()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  next_code INTEGER;
  new_code TEXT;
BEGIN
  -- Get the highest existing user code number and increment
  SELECT COALESCE(MAX(CAST(user_code AS INTEGER)), 5000) + 1
  INTO next_code
  FROM public.profiles
  WHERE user_code ~ '^[0-9]+$';
  
  -- If no codes exist or all are below 5001, start at 5001
  IF next_code < 5001 THEN
    next_code := 5001;
  END IF;
  
  new_code := next_code::TEXT;
  
  RETURN new_code;
END;
$$;