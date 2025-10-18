-- Add FormFox Authorization field to orders table
ALTER TABLE public.orders
ADD COLUMN formfox_auth text;