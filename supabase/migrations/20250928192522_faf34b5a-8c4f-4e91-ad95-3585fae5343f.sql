-- Generate user_code for the master user
UPDATE profiles 
SET user_code = generate_user_code() 
WHERE user_code IS NULL;