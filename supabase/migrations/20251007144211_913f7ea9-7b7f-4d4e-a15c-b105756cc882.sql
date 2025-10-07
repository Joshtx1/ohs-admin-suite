-- Add new fields to clients table for enhanced billing and PO tracking
ALTER TABLE public.clients
ADD COLUMN IF NOT EXISTS po_required boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS billing_name text,
ADD COLUMN IF NOT EXISTS billing_emails text[];

-- Add helpful comment
COMMENT ON COLUMN public.clients.po_required IS 'Indicates if a PO number is required for orders from this client';
COMMENT ON COLUMN public.clients.billing_name IS 'Name to use on billing invoices';
COMMENT ON COLUMN public.clients.billing_emails IS 'Array of email addresses for billing notifications';
