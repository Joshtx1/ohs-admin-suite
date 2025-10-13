-- Add billing_client_id to orders table for separate billing party
ALTER TABLE public.orders 
ADD COLUMN billing_client_id uuid REFERENCES public.clients(id);

-- Add comment to clarify the field
COMMENT ON COLUMN public.orders.billing_client_id IS 'The client responsible for payment (can be different from the registrant client_id)';