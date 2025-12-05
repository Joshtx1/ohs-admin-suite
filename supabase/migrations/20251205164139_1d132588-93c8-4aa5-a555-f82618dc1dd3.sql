-- Add marketplace_test column to services table
ALTER TABLE public.services 
ADD COLUMN IF NOT EXISTS marketplace_test boolean DEFAULT false;