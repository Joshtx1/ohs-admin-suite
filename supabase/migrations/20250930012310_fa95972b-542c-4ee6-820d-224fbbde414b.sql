-- Make client_id nullable for self-pay orders
ALTER TABLE public.orders 
ALTER COLUMN client_id DROP NOT NULL;