-- Add Other Auth field to orders table
ALTER TABLE public.orders
ADD COLUMN other_auth text;