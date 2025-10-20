-- Add service_group column to services table
ALTER TABLE public.services 
ADD COLUMN service_group text;

-- Copy all data from category to service_group
UPDATE public.services 
SET service_group = category;

-- Add unique constraint to service_code
ALTER TABLE public.services 
ADD CONSTRAINT services_service_code_unique UNIQUE (service_code);