-- Complete user cleanup - keep only "nope" user
-- Step 1: Delete all data created by users to be deleted

-- Delete clients created by users to be deleted
DELETE FROM public.clients 
WHERE created_by IN ('81e465d4-c8fe-4017-bfe2-2a4a5d01fe15', 'ee742c92-9d26-41bb-bccf-671420e404f2');

-- Delete services created by users to be deleted
DELETE FROM public.services 
WHERE created_by IN ('81e465d4-c8fe-4017-bfe2-2a4a5d01fe15', 'ee742c92-9d26-41bb-bccf-671420e404f2');

-- Delete trainees created by users to be deleted
DELETE FROM public.trainees 
WHERE created_by IN ('81e465d4-c8fe-4017-bfe2-2a4a5d01fe15', 'ee742c92-9d26-41bb-bccf-671420e404f2');

-- Delete pricing created by users to be deleted
DELETE FROM public.pricing 
WHERE created_by IN ('81e465d4-c8fe-4017-bfe2-2a4a5d01fe15', 'ee742c92-9d26-41bb-bccf-671420e404f2');

-- Delete client_trainee_assignments created by users to be deleted
DELETE FROM public.client_trainee_assignments 
WHERE created_by IN ('81e465d4-c8fe-4017-bfe2-2a4a5d01fe15', 'ee742c92-9d26-41bb-bccf-671420e404f2');

-- Delete trainee_assignment_services created by users to be deleted
DELETE FROM public.trainee_assignment_services 
WHERE created_by IN ('81e465d4-c8fe-4017-bfe2-2a4a5d01fe15', 'ee742c92-9d26-41bb-bccf-671420e404f2');

-- Step 2: Delete profiles for users other than "nope"
DELETE FROM public.profiles 
WHERE email != 'nope@noemail.com';

-- Step 3: Delete user roles for users other than "nope" 
DELETE FROM public.user_roles 
WHERE user_id NOT IN ('c9bff6c4-55a7-4d48-9369-80c91de5e4db');

-- Step 4: Delete auth users other than "nope"
DELETE FROM auth.users 
WHERE email != 'nope@noemail.com';