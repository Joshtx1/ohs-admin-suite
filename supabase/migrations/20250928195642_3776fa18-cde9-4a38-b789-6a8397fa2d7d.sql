-- Reset master password directly
DO $$
DECLARE
    master_user_id UUID;
BEGIN
    -- Get the master user ID from profiles
    SELECT user_id INTO master_user_id 
    FROM profiles 
    WHERE username = 'master_admin' 
    LIMIT 1;
    
    IF master_user_id IS NOT NULL THEN
        -- Update the password hash for bcrypt('NewMaster123!')
        -- This is the hash for 'NewMaster123!'
        UPDATE auth.users 
        SET encrypted_password = '$2a$10$5eEVQgFPCwRTKqQMvYbOUeJ8CsQUunpwOCpEcXQ6Xt.XoM4Bh8iCq',
            updated_at = now()
        WHERE id = master_user_id;
        
        RAISE NOTICE 'Master password reset to: NewMaster123!';
    ELSE
        RAISE NOTICE 'Master user not found';
    END IF;
END $$;