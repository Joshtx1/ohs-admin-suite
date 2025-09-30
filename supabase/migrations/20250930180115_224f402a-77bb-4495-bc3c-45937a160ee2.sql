-- Add new address fields for dual address system
ALTER TABLE public.clients 
ADD COLUMN billing_street_address TEXT,
ADD COLUMN billing_city_state_zip TEXT,
ADD COLUMN physical_street_address TEXT,
ADD COLUMN physical_city_state_zip TEXT,
ADD COLUMN net_terms TEXT DEFAULT '30';

-- Migrate existing address data to both billing and physical addresses
UPDATE public.clients
SET 
  billing_street_address = mailing_street_address,
  billing_city_state_zip = mailing_city_state_zip,
  physical_street_address = mailing_street_address,
  physical_city_state_zip = mailing_city_state_zip
WHERE mailing_street_address IS NOT NULL OR mailing_city_state_zip IS NOT NULL;

-- Rename payment_status to payment_method for clarity (keeping the column but using it differently)
COMMENT ON COLUMN public.clients.payment_status IS 'Payment method: Check, ACH, Credit Card, Cash';