-- Add comprehensive trainee fields based on the form image
ALTER TABLE public.trainees 
ADD COLUMN first_name text,
ADD COLUMN middle_name text,
ADD COLUMN last_name text,
ADD COLUMN license_number text,
ADD COLUMN license_type text,
ADD COLUMN street text,
ADD COLUMN city text,
ADD COLUMN state text,
ADD COLUMN zip text,
ADD COLUMN country text,
ADD COLUMN mobile_number text,
ADD COLUMN occupation_craft text,
ADD COLUMN height text,
ADD COLUMN hair text,
ADD COLUMN eyes text,
ADD COLUMN age integer,
ADD COLUMN council_id text,
ADD COLUMN gender text,
ADD COLUMN language text,
ADD COLUMN notes text,
ADD COLUMN photo_url text,
ADD COLUMN signature_url text;

-- Create storage bucket for trainee photos and signatures
INSERT INTO storage.buckets (id, name, public) 
VALUES ('trainee-photos', 'trainee-photos', true);

INSERT INTO storage.buckets (id, name, public) 
VALUES ('trainee-signatures', 'trainee-signatures', true);

-- Create storage policies for trainee photos
CREATE POLICY "Trainee photos are publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'trainee-photos');

CREATE POLICY "Users can upload trainee photos" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'trainee-photos' AND auth.uid() IS NOT NULL);

CREATE POLICY "Users can update trainee photos" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'trainee-photos' AND auth.uid() IS NOT NULL);

-- Create storage policies for trainee signatures
CREATE POLICY "Trainee signatures are publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'trainee-signatures');

CREATE POLICY "Users can upload trainee signatures" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'trainee-signatures' AND auth.uid() IS NOT NULL);

CREATE POLICY "Users can update trainee signatures" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'trainee-signatures' AND auth.uid() IS NOT NULL);

-- Insert mock data for two trainees using data from the image
INSERT INTO public.trainees (
  name, first_name, middle_name, last_name, email, phone, mobile_number,
  date_of_birth, license_number, license_type, street, city, state, zip, country,
  height, hair, eyes, age, council_id, gender, language, occupation_craft,
  status, created_by
) VALUES 
(
  'MIKE TEST', 'MIKE', '', 'TEST', 'accountmanagement@hasc.com', '956-999-9292', '956-999-9292',
  '1974-01-14', '123456789', 'Drivers License', '7721 SPENCERS', 'PASADENA', 'Ohio', '77505', 'N/A',
  '5'' 7"', 'BRO', 'BRO', 51, '0055555555', 'Male', 'English', 'Boilermaker',
  'active', (SELECT id FROM auth.users LIMIT 1)
),
(
  'JOHN DOE', 'JOHN', 'A', 'DOE', 'john.doe@example.com', '555-123-4567', '555-123-4567',
  '1985-06-15', '987654321', 'Drivers License', '123 MAIN ST', 'HOUSTON', 'Texas', '77001', 'USA',
  '6'' 0"', 'BLACK', 'BROWN', 39, '1122334455', 'Male', 'English', 'Electrician',
  'active', (SELECT id FROM auth.users LIMIT 1)
);