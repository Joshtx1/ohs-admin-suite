-- Update existing client data to use new Client Type and Status values

-- Update mem_status values to use full words
UPDATE clients 
SET mem_status = CASE 
  WHEN mem_status = 'M' THEN 'member'
  WHEN mem_status = 'N' THEN 'non-member'
  WHEN mem_status = 'INACTIVE' THEN 'non-member'
  ELSE mem_status
END
WHERE mem_status IN ('M', 'N', 'INACTIVE');

-- Ensure status field uses consistent values
UPDATE clients 
SET status = CASE 
  WHEN status IS NULL OR status = '' THEN 'active'
  WHEN LOWER(status) = 'inactive' THEN 'inactive'
  ELSE 'active'
END;