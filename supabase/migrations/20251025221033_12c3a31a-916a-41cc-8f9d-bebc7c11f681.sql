-- Update password for user 'nope' directly
-- New password: TestPass123!

UPDATE auth.users
SET 
  encrypted_password = crypt('TestPass123!', gen_salt('bf')),
  updated_at = now()
WHERE id = '289795f8-6649-4b7c-9ecd-c41ac252e491';