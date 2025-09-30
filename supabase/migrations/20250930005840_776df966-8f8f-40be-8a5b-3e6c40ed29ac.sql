-- Add payment_terms column to clients table
ALTER TABLE public.clients 
ADD COLUMN payment_terms text DEFAULT 'Bill';

-- Add a comment to document the column
COMMENT ON COLUMN public.clients.payment_terms IS 'Payment terms for the client: Bill or Cash';