-- Update existing mem_status values to use proper capitalization
UPDATE public.clients
SET mem_status = 'Member'
WHERE LOWER(mem_status) = 'member';

UPDATE public.clients
SET mem_status = 'Non-member'
WHERE LOWER(mem_status) IN ('non-member', 'non member', 'nonmember');

UPDATE public.clients
SET mem_status = 'Other'
WHERE mem_status IS NOT NULL 
  AND LOWER(mem_status) NOT IN ('member', 'non-member', 'non member', 'nonmember');