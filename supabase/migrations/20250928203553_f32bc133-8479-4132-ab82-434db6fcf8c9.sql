-- Manually confirm the user's email for neonbelly99@gmail.com
UPDATE auth.users 
SET email_confirmed_at = now()
WHERE email = 'neonbelly99@gmail.com' 
AND email_confirmed_at IS NULL;