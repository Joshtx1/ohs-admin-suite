-- Convert service_group from text to text array for multi-select support
-- First, wrap existing text values in arrays
ALTER TABLE public.services 
ALTER COLUMN service_group TYPE text[] USING ARRAY[service_group]::text[];

-- Update any null values to empty arrays
UPDATE public.services 
SET service_group = ARRAY[]::text[] 
WHERE service_group IS NULL;