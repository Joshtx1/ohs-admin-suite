-- Add separate address fields for billing and physical addresses
ALTER TABLE public.clients 
ADD COLUMN IF NOT EXISTS billing_city TEXT,
ADD COLUMN IF NOT EXISTS billing_state TEXT,
ADD COLUMN IF NOT EXISTS billing_zip TEXT,
ADD COLUMN IF NOT EXISTS physical_city TEXT,
ADD COLUMN IF NOT EXISTS physical_state TEXT,
ADD COLUMN IF NOT EXISTS physical_zip TEXT;

-- Migrate existing billing_city_state_zip data
-- Expected format: "City, ST Zip"
UPDATE public.clients
SET 
  billing_city = CASE 
    WHEN billing_city_state_zip IS NOT NULL AND billing_city_state_zip != '' 
    THEN TRIM(SPLIT_PART(billing_city_state_zip, ',', 1))
    ELSE NULL 
  END,
  billing_state = CASE 
    WHEN billing_city_state_zip IS NOT NULL AND billing_city_state_zip != '' 
    THEN TRIM(SPLIT_PART(SPLIT_PART(billing_city_state_zip, ',', 2), ' ', 1))
    ELSE NULL 
  END,
  billing_zip = CASE 
    WHEN billing_city_state_zip IS NOT NULL AND billing_city_state_zip != '' 
    THEN TRIM(SPLIT_PART(SPLIT_PART(billing_city_state_zip, ',', 2), ' ', 2))
    ELSE NULL 
  END
WHERE billing_city_state_zip IS NOT NULL;

-- Migrate existing physical_city_state_zip data
UPDATE public.clients
SET 
  physical_city = CASE 
    WHEN physical_city_state_zip IS NOT NULL AND physical_city_state_zip != '' 
    THEN TRIM(SPLIT_PART(physical_city_state_zip, ',', 1))
    ELSE NULL 
  END,
  physical_state = CASE 
    WHEN physical_city_state_zip IS NOT NULL AND physical_city_state_zip != '' 
    THEN TRIM(SPLIT_PART(SPLIT_PART(physical_city_state_zip, ',', 2), ' ', 1))
    ELSE NULL 
  END,
  physical_zip = CASE 
    WHEN physical_city_state_zip IS NOT NULL AND physical_city_state_zip != '' 
    THEN TRIM(SPLIT_PART(SPLIT_PART(physical_city_state_zip, ',', 2), ' ', 2))
    ELSE NULL 
  END
WHERE physical_city_state_zip IS NOT NULL;

-- Add comment for clarity
COMMENT ON COLUMN public.clients.billing_city IS 'Billing address city';
COMMENT ON COLUMN public.clients.billing_state IS 'Billing address state (two-letter code)';
COMMENT ON COLUMN public.clients.billing_zip IS 'Billing address ZIP code';
COMMENT ON COLUMN public.clients.physical_city IS 'Physical address city';
COMMENT ON COLUMN public.clients.physical_state IS 'Physical address state (two-letter code)';
COMMENT ON COLUMN public.clients.physical_zip IS 'Physical address ZIP code';