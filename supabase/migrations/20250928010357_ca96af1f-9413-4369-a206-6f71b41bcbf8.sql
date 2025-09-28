-- Insert services from Excel data with generated service codes (max 6 characters)

-- AUDIO services
INSERT INTO public.services (service_code, name, description, category, duration_minutes, created_by, is_active) VALUES
('AUD01', 'AUDIOMETRIC TEST - BASELINE', 'Baseline audiometric testing', 'AUDIO', 21900, auth.uid(), true); -- 365 days = 525600 minutes, using 60 for default

-- DRUG AND ALCOHOL services  
INSERT INTO public.services (service_code, name, description, category, duration_minutes, created_by, is_active) VALUES
('DA01', 'BREATH ALCOHOL - FORMFOX (DISA, ASAP, TPA)', 'Breath alcohol test via FormFox', 'DRUG AND ALCOHOL', 60, auth.uid(), true),
('DA02', 'BREATH ALCOHOL - IN HOUSE - DOT', 'In-house DOT breath alcohol test', 'DRUG AND ALCOHOL', 60, auth.uid(), true),
('DA03', 'BREATH ALCOHOL - IN HOUSE - NONDOT', 'In-house non-DOT breath alcohol test', 'DRUG AND ALCOHOL', 60, auth.uid(), true),
('DA04', 'BREATH ALCOHOL - PAPER TPA - DOT - PROVIDE REASON', 'Paper TPA DOT breath alcohol test', 'DRUG AND ALCOHOL', 60, auth.uid(), true),
('DA05', 'BREATH ALCOHOL - PAPER TPA -NON DOT - PROVIDE REASON', 'Paper TPA non-DOT breath alcohol test', 'DRUG AND ALCOHOL', 60, auth.uid(), true),
('DA06', 'HAIR FOLLICLE - FORMFOX (DISA, ASAP, TPA)', 'Hair follicle test via FormFox', 'DRUG AND ALCOHOL', 60, auth.uid(), true),
('DA07', 'HAIR FOLLICLE - IN HOUSE NON DOT', 'In-house non-DOT hair follicle test', 'DRUG AND ALCOHOL', 60, auth.uid(), true),
('DA08', 'HAIR FOLLICLE - PAPER TPA -NON DOT - PROVIDE REASON', 'Paper TPA non-DOT hair follicle test', 'DRUG AND ALCOHOL', 60, auth.uid(), true),
('DA09', 'ORAL FLUID - FORMFOX (DISA, ASAP, TPA)', 'Oral fluid test via FormFox', 'DRUG AND ALCOHOL', 60, auth.uid(), true),
('DA10', 'ORAL FLUID - INHOUSE - DOT', 'In-house DOT oral fluid test', 'DRUG AND ALCOHOL', 60, auth.uid(), true),
('DA11', 'ORAL FLUID - INHOUSE - NONDOT', 'In-house non-DOT oral fluid test', 'DRUG AND ALCOHOL', 60, auth.uid(), true),
('DA12', 'ORAL FLUID - PAPER TPA - DOT - PROVIDE REASON', 'Paper TPA DOT oral fluid test', 'DRUG AND ALCOHOL', 60, auth.uid(), true),
('DA13', 'ORAL FLUID - PAPER TPA -NON DOT - PROVIDE REASON', 'Paper TPA non-DOT oral fluid test', 'DRUG AND ALCOHOL', 60, auth.uid(), true),
('DA14', 'URINE ANALYIS - IN HOUSE - DOT - PROVIDE REASON', 'In-house DOT urine analysis', 'DRUG AND ALCOHOL', 60, auth.uid(), true),
('DA15', 'URINE ANALYIS - IN HOUSE - NONDOT - PROVIDE REASON', 'In-house non-DOT urine analysis', 'DRUG AND ALCOHOL', 60, auth.uid(), true),
('DA16', 'URINE ANALYIS - IN HOUSE RAPID 10 - PROVIDE REASON', 'In-house rapid 10-panel urine analysis', 'DRUG AND ALCOHOL', 60, auth.uid(), true),
('DA17', 'URINE ANALYIS - IN HOUSE RAPID 5 - PROVIDE REASON', 'In-house rapid 5-panel urine analysis', 'DRUG AND ALCOHOL', 60, auth.uid(), true),
('DA18', 'URINE ANALYIS - PAPER CCF TPA - DOT - PROVIDE REASON', 'Paper CCF TPA DOT urine analysis', 'DRUG AND ALCOHOL', 60, auth.uid(), true),
('DA19', 'URINE ANALYIS - PAPER CCF TPA - NONDOT - PROVIDE REASON', 'Paper CCF TPA non-DOT urine analysis', 'DRUG AND ALCOHOL', 60, auth.uid(), true),
('DA20', 'URINE ANALYSIS - FORMFOX (DISA, ASAP, TPA)', 'Urine analysis via FormFox', 'DRUG AND ALCOHOL', 60, auth.uid(), true);

-- LAB services
INSERT INTO public.services (service_code, name, description, category, duration_minutes, created_by, is_active) VALUES
('LAB01', 'ARSENIC (BLOOD)', 'Blood arsenic test', 'LAB', 60, auth.uid(), true),
('LAB02', 'ARSENIC (HAIR)', 'Hair arsenic test', 'LAB', 60, auth.uid(), true),
('LAB03', 'ARSENIC (URINE)', 'Urine arsenic test', 'LAB', 60, auth.uid(), true),
('LAB04', 'ASBESTOS (BLOOD) W/ INTERPR', 'Blood asbestos test with interpretation', 'LAB', 60, auth.uid(), true),
('LAB05', 'BENZENE PROFILE (BLOOD)', 'Blood benzene profile', 'LAB', 60, auth.uid(), true),
('LAB06', 'BENZENE PROFILE (URINE)', 'Urine benzene profile', 'LAB', 60, auth.uid(), true),
('LAB07', 'BLOOD TYPE', 'Blood type testing', 'LAB', 60, auth.uid(), true),
('LAB08', 'CBC W/ DIFFERENTIALS', 'Complete blood count with differentials', 'LAB', 60, auth.uid(), true),
('LAB09', 'CHROMIUM (BLOOD)', 'Blood chromium test', 'LAB', 60, auth.uid(), true),
('LAB10', 'CHROMIUM (SERUM)', 'Serum chromium test', 'LAB', 60, auth.uid(), true),
('LAB11', 'COMPREHENSIVE METABOLIC PANEL (CMP)', 'Comprehensive metabolic panel', 'LAB', 60, auth.uid(), true),
('LAB12', 'CREATININE (SERUM)', 'Serum creatinine test', 'LAB', 60, auth.uid(), true),
('LAB13', 'CREATININE (URINE) 24 HOUR COLLECTION', '24-hour urine creatinine collection', 'LAB', 60, auth.uid(), true),
('LAB14', 'FECAL CULTURE (BLOOD)', 'Fecal culture blood test', 'LAB', 60, auth.uid(), true),
('LAB15', 'FERRITIN (BLOOD)', 'Blood ferritin test', 'LAB', 60, auth.uid(), true),
('LAB16', 'GLUCOSE FINGER STICK', 'Finger stick glucose test', 'LAB', 60, auth.uid(), true),
('LAB17', 'HEAVY METALS (BLOOD) - ARSENIC, MERCURY, LEAD', 'Blood heavy metals panel', 'LAB', 60, auth.uid(), true),
('LAB18', 'HEAVY METALS (URINE) - ARSENIC, MERCURY, LEAD, CREATINE', 'Urine heavy metals panel', 'LAB', 60, auth.uid(), true),
('LAB19', 'HEMOGLOBIN A1C', 'Hemoglobin A1C test', 'LAB', 60, auth.uid(), true),
('LAB20', 'HEPATITIS A ANTIBODY', 'Hepatitis A antibody test', 'LAB', 60, auth.uid(), true),
('LAB21', 'HEPATITIS B ANTIBODY', 'Hepatitis B antibody test', 'LAB', 60, auth.uid(), true),
('LAB22', 'HEPATITIS C ANTIBODY', 'Hepatitis C antibody test', 'LAB', 60, auth.uid(), true),
('LAB23', 'HEPATITIS PANEL', 'Complete hepatitis panel', 'LAB', 60, auth.uid(), true),
('LAB24', 'HIV SCREEN', 'HIV screening test', 'LAB', 60, auth.uid(), true),
('LAB25', 'LEAD', 'Lead test', 'LAB', 60, auth.uid(), true),
('LAB26', 'LEAD/ZPP (BLOOD)', 'Blood lead/ZPP test', 'LAB', 60, auth.uid(), true),
('LAB27', 'LIPID PANEL', 'Lipid panel test', 'LAB', 60, auth.uid(), true),
('LAB28', 'MERCURY (BLOOD)', 'Blood mercury test', 'LAB', 60, auth.uid(), true),
('LAB29', 'MERCURY (URINE)', 'Urine mercury test', 'LAB', 60, auth.uid(), true),
('LAB30', 'PROSTATE - PSA (BLOOD)', 'Blood PSA test', 'LAB', 60, auth.uid(), true),
('LAB31', 'RENAL FUNCTION PANEL', 'Renal function panel', 'LAB', 60, auth.uid(), true),
('LAB32', 'TB - QUANTIFERON (TB GOLD BLOOD)', 'QuantiFERON TB Gold blood test', 'LAB', 60, auth.uid(), true),
('LAB33', 'TB - TUBERCULOSIS (SKIN)', 'Tuberculosis skin test', 'LAB', 60, auth.uid(), true),
('LAB34', 'TB - TUBERCULOSIS (T-SPOT BLOOD)', 'T-SPOT tuberculosis blood test', 'LAB', 60, auth.uid(), true),
('LAB35', 'THYROID PANEL W/ TSH', 'Thyroid panel with TSH', 'LAB', 60, auth.uid(), true),
('LAB36', 'TSH', 'TSH test', 'LAB', 60, auth.uid(), true),
('LAB37', 'URINALYSIS DIPSTICK', 'Urinalysis dipstick', 'LAB', 60, auth.uid(), true),
('LAB38', 'URINALYSIS MICRO', 'Urinalysis microscopic', 'LAB', 60, auth.uid(), true),
('LAB39', 'ZINC PROTOPORHYRIN (ZPP)', 'Zinc protoporphyrin test', 'LAB', 60, auth.uid(), true);

-- MEQ services
INSERT INTO public.services (service_code, name, description, category, duration_minutes, created_by, is_active) VALUES
('MEQ01', 'MEDICAL CLEARANCE QUESTIONAIRE', 'Medical clearance questionnaire', 'MEQ', 21900, auth.uid(), true);

-- MISC services
INSERT INTO public.services (service_code, name, description, category, duration_minutes, created_by, is_active) VALUES
('MSC01', 'OMRT', 'OMRT test', 'MISC', 60, auth.uid(), true),
('MSC02', 'ELECTRO CARDIO GRAM', 'Electrocardiogram', 'MISC', 60, auth.uid(), true),
('MSC03', 'XRAY', 'X-ray imaging', 'MISC', 60, auth.uid(), true);

-- PHYSICAL FCE services
INSERT INTO public.services (service_code, name, description, category, duration_minutes, created_by, is_active) VALUES
('PFC01', 'FIT FOR DUTY / RETURN TO WORK', 'Fit for duty/return to work evaluation', 'PHYSICAL FCE', 60, auth.uid(), true),
('PFC02', 'FUNCTIONAL CAPACITY EVALUATION', 'Functional capacity evaluation', 'PHYSICAL FCE', 60, auth.uid(), true),
('PFC03', 'ISOMETRIC TEST (HAND GRIP)', 'Isometric hand grip test', 'PHYSICAL FCE', 60, auth.uid(), true),
('PFC04', 'LIFT TEST - 25 LBS', '25 lb lift test', 'PHYSICAL FCE', 60, auth.uid(), true),
('PFC05', 'LIFT TEST - 50 LBS', '50 lb lift test', 'PHYSICAL FCE', 60, auth.uid(), true),
('PFC06', 'PHYSICAL ACRYLONITRILE <40YRS PLUS', 'Physical acrylonitrile under 40 years plus', 'PHYSICAL FCE', 60, auth.uid(), true),
('PFC07', 'PHYSICAL ACRYLONITRILE <40YRS STANDARD', 'Physical acrylonitrile under 40 years standard', 'PHYSICAL FCE', 60, auth.uid(), true),
('PFC08', 'PHYSICAL ARSENIC', 'Physical arsenic exam', 'PHYSICAL FCE', 60, auth.uid(), true),
('PFC09', 'PHYSICAL ASBESTOS W/ MASK', 'Physical asbestos exam with mask', 'PHYSICAL FCE', 60, auth.uid(), true),
('PFC10', 'PHYSICAL ASBESTOS W/O MASK', 'Physical asbestos exam without mask', 'PHYSICAL FCE', 60, auth.uid(), true),
('PFC11', 'PHYSICAL BENZENE', 'Physical benzene exam', 'PHYSICAL FCE', 60, auth.uid(), true),
('PFC12', 'PHYSICAL BUTADIENE', 'Physical butadiene exam', 'PHYSICAL FCE', 60, auth.uid(), true),
('PFC13', 'PHYSICAL CADMIUM', 'Physical cadmium exam', 'PHYSICAL FCE', 60, auth.uid(), true),
('PFC14', 'PHYSICAL COKE OVEN EMISSIONS (W/PFT, UA, CYTOLOTY, X-RAY, CBC, CMP)', 'Physical coke oven emissions comprehensive', 'PHYSICAL FCE', 60, auth.uid(), true),
('PFC15', 'PHYSICAL DOT', 'DOT physical examination', 'PHYSICAL FCE', 60, auth.uid(), true),
('PFC16', 'PHYSICAL DOT W/ FCE', 'DOT physical with FCE', 'PHYSICAL FCE', 60, auth.uid(), true),
('PFC17', 'PHYSICAL ETHYLENE OXIDE (CBC W/DIFF)', 'Physical ethylene oxide with CBC', 'PHYSICAL FCE', 60, auth.uid(), true),
('PFC18', 'PHYSICAL HAZMAT/ HAZWHOPPER (PFT, AUDIO, CBC, UA, AST/ALT)', 'Physical hazmat/hazwhopper comprehensive', 'PHYSICAL FCE', 60, auth.uid(), true),
('PFC19', 'PHYSICAL HEXAVALENT CHROMIUM (W/PFT, LABS)', 'Physical hexavalent chromium with tests', 'PHYSICAL FCE', 60, auth.uid(), true),
('PFC20', 'PHYSICAL LEAD ABATEMENT (CBC, CMP, ZPP, PFT)', 'Physical lead abatement comprehensive', 'PHYSICAL FCE', 60, auth.uid(), true),
('PFC21', 'PHYSICAL NON-DOT', 'Non-DOT physical examination', 'PHYSICAL FCE', 60, auth.uid(), true),
('PFC22', 'PHYSICAL NON-DOT W/ FCE', 'Non-DOT physical with FCE', 'PHYSICAL FCE', 60, auth.uid(), true),
('PFC23', 'PHYSICAL SILICA W/ TB-GOLD BLOOD', 'Physical silica with TB-Gold blood', 'PHYSICAL FCE', 60, auth.uid(), true),
('PFC24', 'PHYSICAL SILICA W/ TB-SKIN', 'Physical silica with TB skin test', 'PHYSICAL FCE', 60, auth.uid(), true),
('PFC25', 'PULMONARY FUNCTION TEST W/MEQ', 'Pulmonary function test with MEQ', 'PHYSICAL FCE', 21900, auth.uid(), true),
('PFC26', 'SILICA Physical', 'Silica physical examination', 'PHYSICAL FCE', 60, auth.uid(), true);

-- RESPIRATOR FIT services
INSERT INTO public.services (service_code, name, description, category, duration_minutes, created_by, is_active) VALUES
('RF01', '3M6000 FF', '3M6000 full face respirator fit test', 'RESPIRATOR FIT', 21900, auth.uid(), true),
('RF02', '3M6000 HF', '3M6000 half face respirator fit test', 'RESPIRATOR FIT', 21900, auth.uid(), true),
('RF03', '3M7800 FF', '3M7800 full face respirator fit test', 'RESPIRATOR FIT', 21900, auth.uid(), true),
('RF04', 'DRAGER PANORAMA NOVA FF', 'Drager Panorama Nova full face fit test', 'RESPIRATOR FIT', 21900, auth.uid(), true),
('RF05', 'MSA ULTRA ELITE FF', 'MSA Ultra Elite full face fit test', 'RESPIRATOR FIT', 21900, auth.uid(), true),
('RF06', 'NORTH 76000 FF', 'North 76000 full face fit test', 'RESPIRATOR FIT', 21900, auth.uid(), true),
('RF07', 'NORTH 7700 HF', 'North 7700 half face fit test', 'RESPIRATOR FIT', 21900, auth.uid(), true),
('RF08', 'SCOTT AV2000 FF', 'Scott AV2000 full face fit test', 'RESPIRATOR FIT', 21900, auth.uid(), true),
('RF09', 'SCOTT AV3000 HT FF', 'Scott AV3000 HT full face fit test', 'RESPIRATOR FIT', 21900, auth.uid(), true),
('RF10', 'SCOTT AV3000 SS FF', 'Scott AV3000 SS full face fit test', 'RESPIRATOR FIT', 21900, auth.uid(), true),
('RF11', 'SCOTT XCEL HF', 'Scott Xcel half face fit test', 'RESPIRATOR FIT', 21900, auth.uid(), true),
('RF12', '5400 FULL FACE', '5400 full face respirator fit test', 'RESPIRATOR FIT', 21900, auth.uid(), true);

-- VISION services
INSERT INTO public.services (service_code, name, description, category, duration_minutes, created_by, is_active) VALUES
('VIS01', 'VISION ACUITY TEST (BASIC)', 'Basic vision acuity test', 'VISION', 60, auth.uid(), true);