-- Add reason_for_test to orders table
ALTER TABLE public.orders 
ADD COLUMN reason_for_test TEXT;

-- Add department and room to services table
ALTER TABLE public.services 
ADD COLUMN department TEXT,
ADD COLUMN room TEXT;