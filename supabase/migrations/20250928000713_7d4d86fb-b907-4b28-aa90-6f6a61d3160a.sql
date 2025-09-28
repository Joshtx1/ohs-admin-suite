-- Add new fields to clients table based on Excel headers
ALTER TABLE public.clients 
ADD COLUMN IF NOT EXISTS profile text, -- maps to Billing ID
ADD COLUMN IF NOT EXISTS client_name text, -- maps to ClientName
ADD COLUMN IF NOT EXISTS bill_to text, -- maps to Bill To
ADD COLUMN IF NOT EXISTS short_code text, -- maps to Short Code
ADD COLUMN IF NOT EXISTS mem_status text, -- maps to Mem Status
ADD COLUMN IF NOT EXISTS mem_type text, -- maps to Mem Type
ADD COLUMN IF NOT EXISTS mailing_street_address text, -- maps to Mailing Street Address
ADD COLUMN IF NOT EXISTS mailing_city_state_zip text, -- maps to Mailing City State Zip
ADD COLUMN IF NOT EXISTS comments text, -- maps to COMMENTS
ADD COLUMN IF NOT EXISTS billing_der text, -- maps to BILLING DER
ADD COLUMN IF NOT EXISTS billing_temp_company_name text, -- maps to Billing Temp. Company Name
ADD COLUMN IF NOT EXISTS payment_status text, -- maps to Payment Status
ADD COLUMN IF NOT EXISTS admin_der text; -- maps to ADMIN DER

-- Create index on profile for better performance
CREATE INDEX IF NOT EXISTS idx_clients_profile ON public.clients(profile);

-- Create index on short_code for better performance  
CREATE INDEX IF NOT EXISTS idx_clients_short_code ON public.clients(short_code);

-- Insert sample data from the Excel file (only if not exists)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.clients WHERE profile = 'RP-00001') THEN
    INSERT INTO public.clients (
      profile, client_name, company_name, contact_person, email, phone, 
      bill_to, short_code, mem_status, mem_type, 
      mailing_street_address, mailing_city_state_zip, comments, 
      billing_temp_company_name, payment_status, status
    ) VALUES 
    ('RP-00001', 'Ohmstede Industrial Services', 'Ohmstede Industrial Services', 'Accounts Payables', 'oisaps@ohmstede.net', '832-861-5955', 
     'Ohmstede Industrial Services
Attn: Accounts Payables
2450 South Shore Blvd. Ste. 120
League City, Texas 77573', 'OHM', 'M', 'Contractor',
     '2450 South Shore Blvd. Ste. 120', 'League City, Texas 77573', 'PAID 2024 MBR-SHIP P/APP',
     'RP-00001 Ohmstede Industrial Services', 'Check', 'active'),

    ('RP-00002', 'Gallop Corporation', 'Gallop Corporation', 'Nikki Miller', 'veronica.trevino@gallopcgi.com', '281-449-1051',
     'Gallop Corporation
Attn: Nikki Miller
1602 Mooney Road
Houston, Texas 77093', 'GAL', 'M', 'Contractor',
     '1602 Mooney Road', 'Houston, Texas 77093', 'PAID 2024 MBR-SHIP P/APP',
     'RP-00002 Gallop Corporation', 'ACH', 'active'),

    ('RP-00003', 'Sulzer Tower Field Service (US) Inc.', 'Sulzer Tower Field Service (US) Inc.', 'Accounts Payable', 'fssc_us_p2p_invoices_le_494@sulzer.com', '281-441-5272',
     'Sulzer Tower Field Service (US) Inc. Attn: Accounts Payable
8505 East Northbelt
Humble, Texas 77396', 'SUL', 'M', 'Contractor',
     '8505 East Northbelt', 'Humble, Texas 77396', 'PAID 2024 MBR-SHIP P/APP',
     'RP-00003 Sulzer Tower Field Service (US) Inc.', 'Credit Card', 'active'),

    ('RP-00004', 'Tower Force', 'Tower Force', 'Accounts', 'ap@towerforce.com', '281-506-7152',
     'Tower Force
Attn: Accounts
PO Box 1150
Deer Park, Texas 77536', 'TWF', 'M', 'Contractor',
     '4804 Railroad Ave', 'Deer Park, Texas 77536', 'PAID 2024 MBR-SHIP P/APP',
     'RP-00004 Tower Force', 'Check', 'active'),

    ('RP-00005', 'Cat-Spec, Ltd. c/o Stronghold Specialty', 'Cat-Spec, Ltd. c/o Stronghold Specialty', 'Brandy Young', 'ap@strongholdspecialtyltd.com', '281-402-7690',
     'Cat-Spec, LTD c/o Stronghold Specialty
Attn: Brandy Young
13100 Space Center BLVD. Ste 300
Houston, Texas 77059', 'CAT', 'M', 'Contractor',
     '225 South 16th Street', 'La Porte, Texas 77571', 'PAID 2024 MBR-SHIP P/APP',
     'RP-00005 Cat-Spec, Ltd. c/o Stronghold Specialty', 'Check', 'active'),

    ('RP-00006', 'Koch Specialty Plant Services', 'Koch Specialty Plant Services', 'Taylor Teel', 'KSPSAP@Kochind.com', '713-427-7700',
     'Koch Specialty Plant Services
Attn: Taylor Teel
12221 East Sam Houston Pkwy.
Houston, Texas 77044', 'KOC', 'M', 'Contractor',
     '12221 East Sam Houston Pkwy.', 'Houston, Texas 77044', 'PAID 2024 MBR-SHIP P/APP',
     'RP-00006 Koch Specialty Plant Services', 'ACH', 'active'),

    ('RP-00007', 'Hi-Tech Industrial Services, LLC', 'Hi-Tech Industrial Services, LLC', 'Nancy Pereira', 'nancy.pereira@hi-techindustrial.com', '281-844-8937',
     'Hi-Tech Industrial Services, LLC
Attn: Nancy Pereira
PO Box 249
Deer Park, Texas 77536', 'HIT', 'M', 'Contractor',
     'PO Box 249', 'Deer Park, Texas 77536', 'PAID 2024 MBR-SHIP P/APP',
     'RP-00007 Hi-Tech Industrial Services, LLC', 'Check', 'active'),

    ('RP-00008', 'Foerster Instruments, INC.', 'Foerster Instruments, INC.', 'Accounts Payable', 'jennifer.leehr@foerstergroup.com', '412-788-8976',
     'Foerster Instruments, INC.
Attn: Accounts Payable
140 Industrial Dr.
Pittsburgh, Pennsylvania 15275', 'FOE', 'M', 'Contractor',
     '140 Industrial Dr.', 'Pittsburgh, Pennsylvania 15275', 'PAID 2024 MBR-SHIP W/APP',
     'RP-00008 Foerster Instruments, INC.', 'Check', 'active'),

    ('RP-00009', 'Brock Services, LLC', 'Brock Services, LLC', 'Kim Godeaux', 'invoices@brockgroup.coupahost.com', '409-951-4268',
     'Brock Services, LLC
Attn: Kim Godeaux
P.O. Box 217
Beaumont, Texas 77704', 'BCK', 'M', 'Contractor',
     'P.O. Box 217', 'Beaumont, Texas 77704', '',
     'RP-00009 Brock Services, LLC', 'ACH', 'active'),

    ('RP-00010', 'JV Industrial Companies, Ltd.', 'JV Industrial Companies, Ltd.', 'Samantha Cross', 'jvicmedsafe@jvic.com', '281-967-8482',
     'JV Industrial Companies, Ltd.
Attn: Samantha Cross
3741 Red Bluff Rd, Suite 200
Pasadena, Texas 77503', 'JVI', 'M', 'Contractor',
     '3741 Red Bluff Rd, Suite 200', 'Pasadena, Texas 77503', 'PAID 2024 MBR-SHIP W/APP',
     'RP-00010 JV Industrial Companies, Ltd.', 'Check', 'active');
  END IF;
END $$;