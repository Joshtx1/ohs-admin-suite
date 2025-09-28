-- Step 1: Add new enum values first
ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'manager';
ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'supervisor'; 
ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'clerk';