-- Rename profile column to billing_id in clients table
ALTER TABLE public.clients 
RENAME COLUMN profile TO billing_id;