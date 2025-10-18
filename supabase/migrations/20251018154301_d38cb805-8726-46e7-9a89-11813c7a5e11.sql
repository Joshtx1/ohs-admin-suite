-- Add formfox_auth and other_auth columns to order_items table
ALTER TABLE public.order_items 
ADD COLUMN IF NOT EXISTS formfox_auth TEXT,
ADD COLUMN IF NOT EXISTS other_auth TEXT;