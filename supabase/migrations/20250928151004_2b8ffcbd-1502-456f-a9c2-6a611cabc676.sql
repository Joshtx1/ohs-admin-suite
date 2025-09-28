-- Add SSN field to trainees table and make it unique
ALTER TABLE public.trainees 
ADD COLUMN ssn text UNIQUE;

-- Create index on SSN for better performance
CREATE INDEX idx_trainees_ssn ON public.trainees(ssn);

-- Update existing mock records with SSN values
UPDATE public.trainees 
SET ssn = CASE 
  WHEN name = 'John Michael Smith' THEN '123-45-6789'
  WHEN name = 'Maria Elena Garcia' THEN '987-65-4321'
  ELSE NULL
END;