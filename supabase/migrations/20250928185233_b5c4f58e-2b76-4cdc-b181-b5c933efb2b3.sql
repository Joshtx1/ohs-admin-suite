-- Add master role to enum type
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'master';