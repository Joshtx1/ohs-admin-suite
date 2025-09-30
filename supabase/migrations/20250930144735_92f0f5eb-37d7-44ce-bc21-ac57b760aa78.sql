-- Update department and room assignments for all service categories

-- DRUG AND ALCOHOL → Room 2
UPDATE public.services
SET 
  department = 'Drug&Alcohol',
  room = '2'
WHERE category = 'DRUG AND ALCOHOL';

-- AUDIO → Room 3
UPDATE public.services
SET 
  department = 'Audio',
  room = '3'
WHERE category = 'AUDIO';

-- MEQ → Room 3
UPDATE public.services
SET 
  department = 'Audio',
  room = '3'
WHERE category = 'MEQ';

-- RESPIRATOR FIT → Room 4
UPDATE public.services
SET 
  department = 'Fit/PFT',
  room = '4'
WHERE category = 'RESPIRATOR FIT';

-- Standalone PFT services (PFT in name but NOT in PHYSICAL FCE category) → Room 4
UPDATE public.services
SET 
  department = 'Fit/PFT',
  room = '4'
WHERE category != 'PHYSICAL FCE' 
  AND (UPPER(name) LIKE '%PFT%' OR UPPER(description) LIKE '%PFT%');

-- LAB → Room 5
UPDATE public.services
SET 
  department = 'Labs',
  room = '5'
WHERE category = 'LAB';

-- PHYSICAL FCE → Room 5 (includes physicals with PFT)
UPDATE public.services
SET 
  department = 'Physical/FCE',
  room = '5'
WHERE category = 'PHYSICAL FCE';

-- VISION → Room 5
UPDATE public.services
SET 
  department = 'Vitals',
  room = '5'
WHERE category = 'VISION';

-- MISC → Room 1
UPDATE public.services
SET 
  department = 'Admin',
  room = '1'
WHERE category = 'MISC';