-- Fix the generate_service_code function to set proper search_path
CREATE OR REPLACE FUNCTION generate_service_code()
RETURNS TEXT 
LANGUAGE plpgsql
STABLE 
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  code_prefix TEXT := '03';
  random_suffix TEXT;
  new_code TEXT;
  code_exists BOOLEAN := TRUE;
BEGIN
  WHILE code_exists LOOP
    -- Generate a random 4-character alphanumeric suffix
    random_suffix := upper(substring(md5(random()::text) from 1 for 4));
    new_code := code_prefix || random_suffix;
    
    -- Check if this code already exists
    SELECT EXISTS(SELECT 1 FROM public.services WHERE service_code = new_code) INTO code_exists;
  END LOOP;
  
  RETURN new_code;
END;
$$;