-- Create trainees table
CREATE TABLE public.trainees (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  date_of_birth DATE,
  medical_history TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Create client_trainee_assignments table (junction table)
CREATE TABLE public.client_trainee_assignments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  trainee_id UUID NOT NULL REFERENCES public.trainees(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  assigned_date DATE NOT NULL DEFAULT CURRENT_DATE,
  end_date DATE,
  status TEXT NOT NULL DEFAULT 'active',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  UNIQUE(trainee_id, client_id, assigned_date)
);

-- Create trainee_assignment_services table (services available for specific trainee-client assignment)
CREATE TABLE public.trainee_assignment_services (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  assignment_id UUID NOT NULL REFERENCES public.client_trainee_assignments(id) ON DELETE CASCADE,
  service_id UUID NOT NULL REFERENCES public.services(id) ON DELETE CASCADE,
  authorized_by UUID REFERENCES auth.users(id),
  authorized_date DATE DEFAULT CURRENT_DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  UNIQUE(assignment_id, service_id)
);

-- Enable RLS on all tables
ALTER TABLE public.trainees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_trainee_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trainee_assignment_services ENABLE ROW LEVEL SECURITY;

-- RLS Policies for trainees
CREATE POLICY "Authenticated users can view trainees" 
ON public.trainees 
FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can insert trainees" 
ON public.trainees 
FOR INSERT 
WITH CHECK (created_by = auth.uid());

CREATE POLICY "Authenticated users can update trainees" 
ON public.trainees 
FOR UPDATE 
USING (true);

CREATE POLICY "Admins can delete trainees" 
ON public.trainees 
FOR DELETE 
USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for client_trainee_assignments
CREATE POLICY "Authenticated users can view trainee assignments" 
ON public.client_trainee_assignments 
FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can insert trainee assignments" 
ON public.client_trainee_assignments 
FOR INSERT 
WITH CHECK (created_by = auth.uid());

CREATE POLICY "Authenticated users can update trainee assignments" 
ON public.client_trainee_assignments 
FOR UPDATE 
USING (true);

CREATE POLICY "Admins can delete trainee assignments" 
ON public.client_trainee_assignments 
FOR DELETE 
USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for trainee_assignment_services
CREATE POLICY "Authenticated users can view assignment services" 
ON public.trainee_assignment_services 
FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can insert assignment services" 
ON public.trainee_assignment_services 
FOR INSERT 
WITH CHECK (created_by = auth.uid());

CREATE POLICY "Authenticated users can update assignment services" 
ON public.trainee_assignment_services 
FOR UPDATE 
USING (true);

CREATE POLICY "Admins can delete assignment services" 
ON public.trainee_assignment_services 
FOR DELETE 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Add update triggers for timestamps
CREATE TRIGGER update_trainees_updated_at
BEFORE UPDATE ON public.trainees
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_client_trainee_assignments_updated_at
BEFORE UPDATE ON public.client_trainee_assignments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();