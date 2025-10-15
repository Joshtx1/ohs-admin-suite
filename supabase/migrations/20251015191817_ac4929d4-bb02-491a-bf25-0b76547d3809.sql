-- Add foreign key constraint between orders.created_by and profiles.user_id
-- This will allow proper joins for fetching creator information

ALTER TABLE orders
ADD CONSTRAINT orders_created_by_fkey 
FOREIGN KEY (created_by) 
REFERENCES profiles(user_id) 
ON DELETE SET NULL;