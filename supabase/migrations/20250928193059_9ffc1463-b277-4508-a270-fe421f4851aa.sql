-- Update the master user to have a username for login
UPDATE profiles 
SET username = 'master_admin' 
WHERE user_id IN (
  SELECT user_id FROM user_roles WHERE role = 'master'
) AND username IS NULL;