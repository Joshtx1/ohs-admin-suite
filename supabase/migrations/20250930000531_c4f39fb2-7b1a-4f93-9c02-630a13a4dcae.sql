-- Standardize status field casing across all tables

-- Update trainees table: Convert any mixed case to lowercase
UPDATE trainees SET status = LOWER(status) WHERE status != LOWER(status);

-- Update services table: Convert 'A'/'I' to 'active'/'inactive'
UPDATE services SET status = CASE 
  WHEN status = 'A' THEN 'active'
  WHEN status = 'I' THEN 'inactive'
  ELSE LOWER(status)
END;

-- Add check constraints for valid status values
ALTER TABLE clients ADD CONSTRAINT clients_status_check 
  CHECK (status IN ('active', 'inactive', 'suspended'));

ALTER TABLE trainees ADD CONSTRAINT trainees_status_check 
  CHECK (status IN ('active', 'inactive'));

ALTER TABLE orders ADD CONSTRAINT orders_status_check 
  CHECK (status IN ('created', 'pending', 'completed', 'cancelled'));

ALTER TABLE order_items ADD CONSTRAINT order_items_status_check 
  CHECK (status IN ('pending', 'completed', 'cancelled'));

ALTER TABLE profiles ADD CONSTRAINT profiles_status_check 
  CHECK (status IN ('active', 'inactive', 'suspended'));

ALTER TABLE services ADD CONSTRAINT services_status_check 
  CHECK (status IN ('active', 'inactive'));

ALTER TABLE client_trainee_assignments ADD CONSTRAINT client_trainee_assignments_status_check 
  CHECK (status IN ('active', 'inactive', 'completed'));