-- Create master user and update existing user to master role
-- First, let's create a master user if one doesn't exist
DO $$
DECLARE
    master_user_id uuid;
BEGIN
    -- Check if we already have a master user
    IF NOT EXISTS (SELECT 1 FROM user_roles WHERE role = 'master') THEN
        -- Get the first user (likely the admin) and promote them to master
        SELECT user_id INTO master_user_id 
        FROM profiles 
        ORDER BY created_at ASC 
        LIMIT 1;
        
        -- If we found a user, update their role to master
        IF master_user_id IS NOT NULL THEN
            -- Remove existing role
            DELETE FROM user_roles WHERE user_id = master_user_id;
            
            -- Add master role
            INSERT INTO user_roles (user_id, role) 
            VALUES (master_user_id, 'master');
            
            -- Update their profile with master details
            UPDATE profiles 
            SET 
                first_name = 'Master',
                last_name = 'Admin',
                username = 'master_admin',
                status = 'active'
            WHERE user_id = master_user_id;
        END IF;
    END IF;
END $$;