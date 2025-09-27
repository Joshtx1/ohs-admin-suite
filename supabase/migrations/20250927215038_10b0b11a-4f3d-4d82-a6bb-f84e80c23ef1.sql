-- Add service_code column to services table
ALTER TABLE public.services 
ADD COLUMN service_code TEXT UNIQUE;

-- Create an index on service_code for better performance
CREATE INDEX idx_services_service_code ON public.services(service_code);

-- Add a function to generate service codes
CREATE OR REPLACE FUNCTION generate_service_code()
RETURNS TEXT AS $$
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
$$ LANGUAGE plpgsql;

-- Update existing services to have service codes
UPDATE public.services 
SET service_code = generate_service_code() 
WHERE service_code IS NULL;

-- Add NOT NULL constraint after updating existing records
ALTER TABLE public.services 
ALTER COLUMN service_code SET NOT NULL;