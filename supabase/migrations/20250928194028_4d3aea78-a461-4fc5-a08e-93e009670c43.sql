-- Update existing user codes to be sequential starting from 5001
DO $$
DECLARE
    user_record RECORD;
    counter INTEGER := 5001;
BEGIN
    -- Update all existing users to have sequential codes starting from 5001
    FOR user_record IN 
        SELECT user_id FROM profiles 
        WHERE user_code IS NULL OR user_code !~ '^[5-9][0-9]{3,}$'
        ORDER BY created_at ASC
    LOOP
        UPDATE profiles 
        SET user_code = counter::TEXT 
        WHERE user_id = user_record.user_id;
        
        counter := counter + 1;
    END LOOP;
END $$;