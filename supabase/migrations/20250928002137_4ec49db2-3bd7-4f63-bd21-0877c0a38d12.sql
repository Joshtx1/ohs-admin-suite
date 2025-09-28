-- Insert clients RP-00011 to RP-00040 from Excel file
INSERT INTO public.clients (
  profile, client_name, company_name, contact_person, email, phone, 
  bill_to, short_code, mem_status, mem_type, 
  mailing_street_address, mailing_city_state_zip, comments, 
  billing_temp_company_name, payment_status, status
) VALUES 
('RP-00011', 'SPX/Xcel Erectors', 'Xcel Erectors, Inc.', 'Accounts Payable', 'th.us.invoices@SPX.com', '281-661-4910',
 'Xcel Erectors, Inc.
Attn: Accounts Payable
7401 West 129th Street
Overland Park, Kansas 66213', 'XCE', 'M', 'Contractor',
 '7401 West 129th Street', 'Overland Park, Kansas 66213', 'PAID 2024 MBR-SHIP P/APP',
 'RP-00011 SPX/Xcel Erectors', 'Check', 'active'),

('RP-00012', 'Wyatt Field Service', 'Wyatt Field Service', 'Accounts Payable', 'ap@wyattfieldservice.com', '281-675-1400',
 'Wyatt Field Service
Attn: Accounts Payable
15415 Katy Freeway Ste. 800
Houston, Texas 77094', 'WFS', 'M', 'Contractor',
 '15415 Katy Freeway Ste. 800', 'Houston, Texas 77094', 'PAID 2024 MBR-SHIP P/APP',
 'RP-00012 Wyatt Field Service', 'ACH', 'active'),

('RP-00013', 'Petrochem Field Services, Inc.', 'Petrochem Field Services, Inc.', 'Luis Gonzalez', 'luisg@pfs-us.com', '281-441-2550',
 'Petrochem Field Services, Inc.
Attn: Luis Gonzalez
2429 Wilson Road
Humble, Texas 77396', 'PFS', 'M', 'Contractor',
 '2429 Wilson Road', 'Humble, Texas 77396', 'PAID 2024 MBR-SHIP P/APP',
 'RP-00013 Petrochem Field Services, Inc.', '', 'active'),

('RP-00014', 'Matrix Service, Inc.', 'Matrix Service, Inc.', 'Sherry Bolton', 'sbolton@matrixservice.com', '832-448-4361',
 'Matrix Service, Inc.
Attn: Sherry Bolton
7021 Gregdale Rd
Houston, Texas 77049', 'MSH', 'N', 'Contractor',
 '3810 Bakerview Spur', 'Bellingham, Washington 98226', '',
 'RP-00014 Matrix Service, Inc.', 'Credit Card', 'active'),

('RP-00015', 'ParFab Field Service, LLC', 'ParFab Field Service, LLC', 'Angela Brewster', 'fsap@parfabusa.com', '918-543-6310',
 'ParFab Field Service, LLC
Attn: Angela Brewster
15615 East 590 Road
Inola, Oklahoma 74036', 'PRF', 'M', 'Contractor',
 '15615 East 590 Road', 'Inola, Oklahoma 74036', 'PAID 2024 MBR-SHIP P/APP',
 'RP-00015 ParFab Field Service, LLC', 'ACH', 'active'),

('RP-00016', 'Elite Turnaround Specialists c/o Stronghold Specialty', 'Elite Turnaround Specialists c/o Stronghold Specialty', 'Kayla Beard', 'ap@strongholdspecialtyltd.com', '281-402-7870',
 'Elite Turnaround Specialists c/o Stronghold Specialty
Attn: Kayla Beard
13100 Space Center Blvd. Suite 300
Houston, Texas 77059', 'ETS', 'M', 'Contractor',
 '13100 Space Center Blvd. Suite 300', 'Houston, Texas 77059', 'PAID 2024 MBR-SHIP P/APP',
 'RP-00016 Elite Turnaround Specialists c/o Stronghold Specialty', 'Check', 'active'),

('RP-00017', 'Starcon', 'Starcon', 'Lisa Rossi', 'ap.invoices@cinbro.com', '281-478-8000',
 'Starcon
Attn: Lisa Rossi
2100 Ellis Road
New Lenox, Ilinois 60451', 'STA', 'M', 'Contractor',
 '2100 Ellis Road', 'New Lenox, Ilinois 60451', 'PAID 2024 MBR-SHIP P/APP',
 'RP-00017 Starcon', 'ACH', 'active'),

('RP-00018', 'Total Lubrication Management', 'Total Lubrication Management', 'Pam Lovett', 'kathryn.melby@colfaxfluidhandling.com', '330-478-6996',
 'Total Lubrication Management
Attn: Pam Lovett
3713 Progress Street N.E.
Canton, Ohio 44705', 'TLM', 'N', 'Contractor',
 '3713 Progress Street N.E.', 'Canton, Ohio 44705', '',
 'RP-00018 Total Lubrication Management', 'Credit Card', 'active'),

('RP-00019', 'Able Industrial, LLC', 'Able Industrial, LLC', 'Sofia Rivera Gonzalez', 'accountpay@able-industrial.com', '281-946-2218',
 'Able Industrial, LLC
Attn: Sofia Rivera Gonzalez
1600 South Sam Houston Parkway West
Houston, Texas 77047', 'ABL', 'M', 'Contractor',
 '1600 South Sam Houston Parkway West', 'Houston, Texas 77047', '',
 'RP-00019 Able Industrial, LLC', 'CHECK', 'active'),

('RP-00020', 'TNT Crane & Rigging, Inc.', 'TNT Crane & Rigging, Inc.', 'Accounts Payable', 'accountspayable@tntcrane.com', '713-644-6113',
 'TNT Crane & Rigging, Inc.
Attn: Accounts Payable
PO Box 300587
Houston, Texas 77230', 'TNT', 'N', 'Contractor',
 'PO Box 300587', 'Houston, Texas 77230', '',
 'RP-00020 TNT Crane & Rigging, Inc.', 'Credit Card', 'active'),

('RP-00021', 'Structural Preservation Systems, LLC', 'Structural Preservation Systems, LLC', 'Accounts Payables', 'houstonpayables@structural.net', '281-478-5300',
 'Structural Preservation Systems, LLC
Attn: Accounts Payables
1003 Clay Court
Deer Park, Texas 77536', 'SPS', 'M', 'Contractor',
 '1003 Clay Court', 'Deer Park, Texas 77536', 'PAID 2024 MBR-SHIP P/APP',
 'RP-00021 Structural Preservation Systems, LLC', 'Credit Card', 'active'),

('RP-00022', 'Critical Path Resources, Inc.', 'Critical Path Resources, Inc.', 'Nekayah Spence', 'Carrie.Morris@cprusa.net', '832-695-3574',
 'Critical Path Resources, Inc.
Attn: Nekayah Spence
410 Schilling
Baytown, Texas 77520', 'CPR', 'INACTIVE', 'Contractor',
 '410 Schilling', 'Baytown, Texas 77520', '',
 'RP-00022 Critical Path Resources, Inc.', 'Credit Card', 'inactive'),

('RP-00023', 'Hoist & Crane Service Group', 'Hoist & Crane Service Group', 'Lynda White', 'whitel@hoistcrane.com', '713-849-2511',
 'Hoist & Crane Service Group
Attn: Lynda White
13519 Sundale Road
Houston, Texas 77038', 'HCS', 'N', 'Contractor',
 '13519 Sundale Road', 'Houston, Texas 77038', '',
 'RP-00023 Hoist & Crane Service Group', 'Credit Card', 'active'),

('RP-00024', 'Udelhoven, Inc.', 'Udelhoven, Inc.', 'Accounts Payable', 'apayables@udelhoven.com', '907-261-2300',
 'Udelhoven, Inc.
Attn: Accounts Payable
184 East 53rd Ave.
Anchorage, Arkansas 99518', 'UDE', 'M', 'Contractor',
 '184 East 53rd Ave.', 'Anchorage, Arkansas 99518', 'PAID 2024 MBR-SHIP P/APP',
 'RP-00024 Udelhoven, Inc.', 'Check', 'active'),

('RP-00025', 'Turnaround Welding Services', 'Turnaround Welding Services', 'Randy Albin', 'ralbin@tws-emcor.net', '225-686-7101',
 'Turnaround Welding Services
Attn: Randy Albin
13207 Airline Highway
Gonzales, Lousiana 70737', 'TWS', 'M', 'Contractor',
 '13207 Airline Highway', 'Gonzales, Lousiana 70737', 'PAID 2024 MBR-SHIP P/APP',
 'RP-00025 Turnaround Welding Services', 'Check', 'active'),

('RP-00026', 'Altair Strickland', 'Altair Strickland', 'Vanessa Martinez', 'ap@altairstrickland.com', '281-478-6200',
 'Altair Strickland
Attn: Vanessa Martinez
1605 South Battleground Road
La Porte, Texas 77571', 'ALT', 'M', 'Contractor',
 '1605 South Battleground Road', 'La Porte, Texas 77571', 'RECD. PMYT P/APP',
 'RP-00026 Altair Strickland', 'ACH', 'active'),

('RP-00027', 'Tray Tec, Inc.', 'Tray Tec, Inc.', 'Sharla Melton', 'mcabezas@traytec.com', '281-441-7314',
 'Tray Tec, Inc.
Attn: Sharla Melton
PO Box 2497
Humble, Texas 77347', 'TTI', 'M', 'Contractor',
 'PO Box 2497', 'Humble, Texas 77347', 'PAID 2024 MBR-SHIP P/APP',
 'RP-00027 Tray Tec, Inc.', 'Check', 'active'),

('RP-00028', 'Tiger Tower Services', 'Tiger Tower Services', 'Chad Cassell', '', '936-271-7861',
 'Tiger Tower Services
Attn: Chad Cassell
8774 Fawn Trail
Conroe, Texas 77385', 'TTS', 'N', 'Contractor',
 '8774 Fawn Trail', 'Conroe, Texas 77385', '',
 'RP-00028 Tiger Tower Services', 'Credit Card', 'active'),

('RP-00029', 'UPS Industrial Services, LLC - 17', 'UPS Industrial Services, LLC - 17', 'Lori Carter', 'AP.Statements@upsindustrial.com', '281-694-6071',
 'UPS Industrial Services, LLC - 17
Attn: Lori Carter
306 Deerwood Glen Drive
Deer Park, Texas 77536', 'UPS', 'M', 'Contractor',
 '306 Deerwood Glen Drive', 'Deer Park, Texas 77536', 'PAID 2024 MBR-SHIP P/APP',
 'RP-00029 UPS Industrial Services, LLC - 17', 'Check', 'active'),

('RP-00030', 'Plant-N-Power Services, LLP', 'Plant-N-Power Services, LLP', 'Janice Hill', 'ap.1800@iss-na.com', '337-269-4699',
 'Plant-N-Power Services, LLP
Attn: Janice Hill
2711 Lilac
Pasadena, Texas 77503', 'PNP', 'M', 'Contractor',
 '2711 Lilac', 'Pasadena, Texas 77503', 'PAID 2024 MBR-SHIP P/APP',
 'RP-00030 Plant-N-Power Services, LLP', 'ACH', 'active')

ON CONFLICT (profile) DO NOTHING;