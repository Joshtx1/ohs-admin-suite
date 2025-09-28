-- Create permissions table
CREATE TABLE public.permissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  category TEXT NOT NULL DEFAULT 'page',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create role_permissions junction table
CREATE TABLE public.role_permissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  role app_role NOT NULL,
  permission_id UUID NOT NULL REFERENCES public.permissions(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(role, permission_id)
);

-- Add new fields to profiles table
ALTER TABLE public.profiles 
ADD COLUMN user_code TEXT UNIQUE,
ADD COLUMN username TEXT UNIQUE,
ADD COLUMN status TEXT NOT NULL DEFAULT 'active';

-- Create function to generate 4-digit user code
CREATE OR REPLACE FUNCTION public.generate_user_code()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_code TEXT;
  code_exists BOOLEAN := TRUE;
BEGIN
  WHILE code_exists LOOP
    -- Generate a random 4-digit code
    new_code := LPAD(floor(random() * 9999 + 1)::TEXT, 4, '0');
    
    -- Check if this code already exists
    SELECT EXISTS(SELECT 1 FROM public.profiles WHERE user_code = new_code) INTO code_exists;
  END LOOP;
  
  RETURN new_code;
END;
$$;

-- Create trigger to auto-generate user codes
CREATE OR REPLACE FUNCTION public.set_user_code()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.user_code IS NULL THEN
    NEW.user_code := generate_user_code();
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_set_user_code
  BEFORE INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.set_user_code();

-- Enable RLS on new tables
ALTER TABLE public.permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for permissions
CREATE POLICY "Authenticated users can view permissions"
ON public.permissions
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Admins and masters can manage permissions"
ON public.permissions
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'master'::app_role));

-- Create RLS policies for role_permissions
CREATE POLICY "Authenticated users can view role permissions"
ON public.role_permissions
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Admins and masters can manage role permissions"
ON public.role_permissions
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'master'::app_role));

-- Insert default permissions
INSERT INTO public.permissions (name, description, category) VALUES
('dashboard.view', 'View Dashboard', 'page'),
('users.view', 'View Users Management', 'page'),
('users.edit', 'Edit Users', 'action'),
('users.delete', 'Delete Users', 'action'),
('clients.view', 'View Clients', 'page'),
('clients.edit', 'Edit Clients', 'action'),
('clients.delete', 'Delete Clients', 'action'),
('trainees.view', 'View Trainees', 'page'),
('trainees.edit', 'Edit Trainees', 'action'),
('trainees.delete', 'Delete Trainees', 'action'),
('services.view', 'View Services', 'page'),
('services.edit', 'Edit Services', 'action'),
('services.delete', 'Delete Services', 'action'),
('pricing.view', 'View Pricing', 'page'),
('pricing.edit', 'Edit Pricing', 'action'),
('roles.manage', 'Manage Roles and Permissions', 'action');

-- Assign permissions to roles
-- Master role gets all permissions
INSERT INTO public.role_permissions (role, permission_id)
SELECT 'admin'::app_role, id FROM public.permissions;

-- Admin role gets most permissions except role management
INSERT INTO public.role_permissions (role, permission_id)
SELECT 'staff'::app_role, id FROM public.permissions 
WHERE name NOT IN ('roles.manage', 'users.delete');

-- User role gets basic view permissions
INSERT INTO public.role_permissions (role, permission_id)
SELECT 'user'::app_role, id FROM public.permissions 
WHERE category = 'page' AND name IN ('dashboard.view', 'clients.view', 'trainees.view', 'services.view');