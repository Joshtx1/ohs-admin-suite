-- Reset master user password for login
DO $$
DECLARE
    master_user_id UUID;
BEGIN
    -- Get the master user ID
    SELECT user_id INTO master_user_id 
    FROM user_roles 
    WHERE role = 'master' 
    LIMIT 1;
    
    IF master_user_id IS NOT NULL THEN
        -- Note: This just confirms the user exists, actual password reset needs service role
        RAISE NOTICE 'Master user found: %', master_user_id;
    ELSE
        RAISE NOTICE 'No master user found';
    END IF;
END $$;