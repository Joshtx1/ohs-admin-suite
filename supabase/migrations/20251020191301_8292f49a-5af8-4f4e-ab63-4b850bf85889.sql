-- Add service_metadata to services table
ALTER TABLE public.services 
ADD COLUMN IF NOT EXISTS service_metadata JSONB DEFAULT '{}'::jsonb;

-- Add item_metadata to order_items table
ALTER TABLE public.order_items 
ADD COLUMN IF NOT EXISTS item_metadata JSONB DEFAULT '{}'::jsonb;

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_services_metadata ON public.services USING gin (service_metadata);
CREATE INDEX IF NOT EXISTS idx_order_items_metadata ON public.order_items USING gin (item_metadata);