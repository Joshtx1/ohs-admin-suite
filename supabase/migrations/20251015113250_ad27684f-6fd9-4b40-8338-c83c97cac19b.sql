-- Add billing_client_id to order_items to track which party each service is billed to
ALTER TABLE public.order_items 
ADD COLUMN billing_client_id uuid REFERENCES public.clients(id);

-- Add index for better query performance
CREATE INDEX idx_order_items_billing_client_id ON public.order_items(billing_client_id);

-- Add comment to explain the column
COMMENT ON COLUMN public.order_items.billing_client_id IS 'The client being billed for this specific order item (can be TPA or employer)';