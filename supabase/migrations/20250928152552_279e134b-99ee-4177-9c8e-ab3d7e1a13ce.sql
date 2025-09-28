-- Add human-readable unique identifier field to trainees
ALTER TABLE public.trainees ADD COLUMN unique_id TEXT;

-- Create a function to generate sequential unique IDs for trainees
CREATE OR REPLACE FUNCTION public.generate_trainee_unique_id()
RETURNS TEXT AS $$
DECLARE
  next_id INTEGER;
  new_unique_id TEXT;
BEGIN
  -- Get the next sequential number
  SELECT COALESCE(MAX(CAST(SUBSTRING(unique_id FROM '[0-9]+') AS INTEGER)), 0) + 1
  INTO next_id
  FROM public.trainees
  WHERE unique_id ~ '^T[0-9]+$';
  
  -- Format as T followed by 6-digit number (e.g., T000001, T000002)
  new_unique_id := 'T' || LPAD(next_id::TEXT, 6, '0');
  
  RETURN new_unique_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger to auto-generate unique_id on insert
CREATE OR REPLACE FUNCTION public.set_trainee_unique_id()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.unique_id IS NULL THEN
    NEW.unique_id := generate_trainee_unique_id();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER trigger_set_trainee_unique_id
  BEFORE INSERT ON public.trainees
  FOR EACH ROW
  EXECUTE FUNCTION public.set_trainee_unique_id();

-- Add unique constraint to unique_id
ALTER TABLE public.trainees ADD CONSTRAINT unique_trainee_id UNIQUE (unique_id);

-- Update existing records with unique IDs using a simple counter approach
DO $$
DECLARE
  rec RECORD;
  counter INTEGER := 1;
BEGIN
  FOR rec IN SELECT id FROM public.trainees WHERE unique_id IS NULL ORDER BY created_at LOOP
    UPDATE public.trainees 
    SET unique_id = 'T' || LPAD(counter::TEXT, 6, '0')
    WHERE id = rec.id;
    counter := counter + 1;
  END LOOP;
END $$;