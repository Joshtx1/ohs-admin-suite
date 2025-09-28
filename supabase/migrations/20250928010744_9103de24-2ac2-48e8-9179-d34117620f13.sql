-- Add missing columns to services table
ALTER TABLE public.services 
ADD COLUMN member_price numeric DEFAULT 0,
ADD COLUMN non_member_price numeric DEFAULT 0,
ADD COLUMN valid_for_days integer DEFAULT 0,
ADD COLUMN status text DEFAULT 'A';

-- Update existing services with the correct pricing and validity data based on Excel

-- AUDIO services (365 days valid, $20/$30 pricing)
UPDATE public.services SET member_price = 20, non_member_price = 30, valid_for_days = 365, status = 'A' 
WHERE service_code = 'AUD01';

-- DRUG AND ALCOHOL services (0 days valid, $20/$30 pricing)
UPDATE public.services SET member_price = 20, non_member_price = 30, valid_for_days = 0, status = 'A' 
WHERE service_code IN ('DA01', 'DA02', 'DA03', 'DA04', 'DA05', 'DA06', 'DA07', 'DA08', 'DA09', 'DA10', 'DA11', 'DA12', 'DA13', 'DA14', 'DA15', 'DA16', 'DA17', 'DA18', 'DA19', 'DA20');

-- LAB services (0 days valid, $20/$30 pricing)
UPDATE public.services SET member_price = 20, non_member_price = 30, valid_for_days = 0, status = 'A' 
WHERE service_code IN ('LAB01', 'LAB02', 'LAB03', 'LAB04', 'LAB05', 'LAB06', 'LAB07', 'LAB08', 'LAB09', 'LAB10', 'LAB11', 'LAB12', 'LAB13', 'LAB14', 'LAB15', 'LAB16', 'LAB17', 'LAB18', 'LAB19', 'LAB20', 'LAB21', 'LAB22', 'LAB23', 'LAB24', 'LAB25', 'LAB26', 'LAB27', 'LAB28', 'LAB29', 'LAB30', 'LAB31', 'LAB32', 'LAB33', 'LAB34', 'LAB35', 'LAB36', 'LAB37', 'LAB38', 'LAB39');

-- MEQ services (365 days valid, $20/$30 pricing)
UPDATE public.services SET member_price = 20, non_member_price = 30, valid_for_days = 365, status = 'A' 
WHERE service_code = 'MEQ01';

-- MISC services (0 days valid, $20/$30 pricing)
UPDATE public.services SET member_price = 20, non_member_price = 30, valid_for_days = 0, status = 'A' 
WHERE service_code IN ('MSC01', 'MSC02', 'MSC03');

-- PHYSICAL FCE services (0 days valid, $20/$30 pricing, except PFC25 which is 365 days)
UPDATE public.services SET member_price = 20, non_member_price = 30, valid_for_days = 0, status = 'A' 
WHERE service_code IN ('PFC01', 'PFC02', 'PFC03', 'PFC04', 'PFC05', 'PFC06', 'PFC07', 'PFC08', 'PFC09', 'PFC10', 'PFC11', 'PFC12', 'PFC13', 'PFC14', 'PFC15', 'PFC16', 'PFC17', 'PFC18', 'PFC19', 'PFC20', 'PFC21', 'PFC22', 'PFC23', 'PFC24', 'PFC26');

-- PULMONARY FUNCTION TEST W/MEQ (365 days valid)
UPDATE public.services SET member_price = 20, non_member_price = 30, valid_for_days = 365, status = 'A' 
WHERE service_code = 'PFC25';

-- RESPIRATOR FIT services (365 days valid, $20/$30 pricing)
UPDATE public.services SET member_price = 20, non_member_price = 30, valid_for_days = 365, status = 'A' 
WHERE service_code IN ('RF01', 'RF02', 'RF03', 'RF04', 'RF05', 'RF06', 'RF07', 'RF08', 'RF09', 'RF10', 'RF11', 'RF12');

-- VISION services (0 days valid, $20/$30 pricing)
UPDATE public.services SET member_price = 20, non_member_price = 30, valid_for_days = 0, status = 'A' 
WHERE service_code = 'VIS01';