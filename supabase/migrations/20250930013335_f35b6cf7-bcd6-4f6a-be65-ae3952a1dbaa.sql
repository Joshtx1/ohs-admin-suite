-- Add foreign key constraints where they don't exist yet
-- Using DO block to check for existing constraints

DO $$ 
BEGIN
  -- Orders table constraints
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_orders_client') THEN
    ALTER TABLE public.orders ADD CONSTRAINT fk_orders_client 
      FOREIGN KEY (client_id) REFERENCES public.clients(id) ON DELETE SET NULL;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_orders_trainee') THEN
    ALTER TABLE public.orders ADD CONSTRAINT fk_orders_trainee 
      FOREIGN KEY (trainee_id) REFERENCES public.trainees(id) ON DELETE RESTRICT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_orders_created_by') THEN
    ALTER TABLE public.orders ADD CONSTRAINT fk_orders_created_by 
      FOREIGN KEY (created_by) REFERENCES public.profiles(user_id) ON DELETE SET NULL;
  END IF;

  -- Order items table constraints
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_order_items_order') THEN
    ALTER TABLE public.order_items ADD CONSTRAINT fk_order_items_order 
      FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE CASCADE;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_order_items_service') THEN
    ALTER TABLE public.order_items ADD CONSTRAINT fk_order_items_service 
      FOREIGN KEY (service_id) REFERENCES public.services(id) ON DELETE RESTRICT;
  END IF;

  -- Client trainee assignments constraints
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_assignments_client') THEN
    ALTER TABLE public.client_trainee_assignments ADD CONSTRAINT fk_assignments_client 
      FOREIGN KEY (client_id) REFERENCES public.clients(id) ON DELETE CASCADE;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_assignments_trainee') THEN
    ALTER TABLE public.client_trainee_assignments ADD CONSTRAINT fk_assignments_trainee 
      FOREIGN KEY (trainee_id) REFERENCES public.trainees(id) ON DELETE CASCADE;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_assignments_created_by') THEN
    ALTER TABLE public.client_trainee_assignments ADD CONSTRAINT fk_assignments_created_by 
      FOREIGN KEY (created_by) REFERENCES public.profiles(user_id) ON DELETE SET NULL;
  END IF;

  -- Trainee assignment services constraints
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_assignment_services_assignment') THEN
    ALTER TABLE public.trainee_assignment_services ADD CONSTRAINT fk_assignment_services_assignment 
      FOREIGN KEY (assignment_id) REFERENCES public.client_trainee_assignments(id) ON DELETE CASCADE;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_assignment_services_service') THEN
    ALTER TABLE public.trainee_assignment_services ADD CONSTRAINT fk_assignment_services_service 
      FOREIGN KEY (service_id) REFERENCES public.services(id) ON DELETE RESTRICT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_assignment_services_created_by') THEN
    ALTER TABLE public.trainee_assignment_services ADD CONSTRAINT fk_assignment_services_created_by 
      FOREIGN KEY (created_by) REFERENCES public.profiles(user_id) ON DELETE SET NULL;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_assignment_services_authorized_by') THEN
    ALTER TABLE public.trainee_assignment_services ADD CONSTRAINT fk_assignment_services_authorized_by 
      FOREIGN KEY (authorized_by) REFERENCES public.profiles(user_id) ON DELETE SET NULL;
  END IF;

  -- Pricing table constraints
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_pricing_service') THEN
    ALTER TABLE public.pricing ADD CONSTRAINT fk_pricing_service 
      FOREIGN KEY (service_id) REFERENCES public.services(id) ON DELETE CASCADE;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_pricing_client') THEN
    ALTER TABLE public.pricing ADD CONSTRAINT fk_pricing_client 
      FOREIGN KEY (client_id) REFERENCES public.clients(id) ON DELETE CASCADE;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_pricing_created_by') THEN
    ALTER TABLE public.pricing ADD CONSTRAINT fk_pricing_created_by 
      FOREIGN KEY (created_by) REFERENCES public.profiles(user_id) ON DELETE SET NULL;
  END IF;

  -- Services table constraints
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_services_created_by') THEN
    ALTER TABLE public.services ADD CONSTRAINT fk_services_created_by 
      FOREIGN KEY (created_by) REFERENCES public.profiles(user_id) ON DELETE SET NULL;
  END IF;

  -- Clients table constraints
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_clients_created_by') THEN
    ALTER TABLE public.clients ADD CONSTRAINT fk_clients_created_by 
      FOREIGN KEY (created_by) REFERENCES public.profiles(user_id) ON DELETE SET NULL;
  END IF;

  -- Trainees table constraints
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_trainees_created_by') THEN
    ALTER TABLE public.trainees ADD CONSTRAINT fk_trainees_created_by 
      FOREIGN KEY (created_by) REFERENCES public.profiles(user_id) ON DELETE SET NULL;
  END IF;
END $$;