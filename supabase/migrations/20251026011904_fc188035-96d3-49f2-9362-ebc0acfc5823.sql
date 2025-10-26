-- Create service_templates table to store metadata templates
CREATE TABLE public.service_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  template_key TEXT NOT NULL UNIQUE,
  template_name TEXT NOT NULL,
  description TEXT,
  fields JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.service_templates ENABLE ROW LEVEL SECURITY;

-- Policies for service_templates
CREATE POLICY "Authenticated users can view templates"
  ON public.service_templates
  FOR SELECT
  USING (true);

CREATE POLICY "Admins can insert templates"
  ON public.service_templates
  FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update templates"
  ON public.service_templates
  FOR UPDATE
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete templates"
  ON public.service_templates
  FOR DELETE
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Add trigger for updated_at
CREATE TRIGGER update_service_templates_updated_at
  BEFORE UPDATE ON public.service_templates
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default templates
INSERT INTO public.service_templates (template_key, template_name, description, fields) VALUES
('drug-screen', 'Drug Screen', 'Standard drug screening test template', '[
  {"fieldName": "test_type", "fieldLabel": "Test Type", "fieldType": "select", "required": true, "options": ["5-Panel", "10-Panel", "DOT"]},
  {"fieldName": "chain_of_custody", "fieldLabel": "Chain of Custody Number", "fieldType": "text", "required": true},
  {"fieldName": "collection_site", "fieldLabel": "Collection Site", "fieldType": "text", "required": false},
  {"fieldName": "collector_name", "fieldLabel": "Collector Name", "fieldType": "text", "required": true}
]'::jsonb),
('respirator-fit', 'Respirator Fit Test', 'Respirator fit testing template', '[
  {"fieldName": "respirator_type", "fieldLabel": "Respirator Type", "fieldType": "select", "required": true, "options": ["Half-Face", "Full-Face", "N95"]},
  {"fieldName": "manufacturer", "fieldLabel": "Manufacturer", "fieldType": "text", "required": true},
  {"fieldName": "model", "fieldLabel": "Model Number", "fieldType": "text", "required": true},
  {"fieldName": "test_method", "fieldLabel": "Test Method", "fieldType": "select", "required": true, "options": ["Qualitative", "Quantitative"]},
  {"fieldName": "result", "fieldLabel": "Test Result", "fieldType": "select", "required": true, "options": ["Pass", "Fail"]}
]'::jsonb),
('pft', 'Pulmonary Function Test', 'Pulmonary function testing template', '[
  {"fieldName": "fev1", "fieldLabel": "FEV1 (L)", "fieldType": "number", "required": true},
  {"fieldName": "fvc", "fieldLabel": "FVC (L)", "fieldType": "number", "required": true},
  {"fieldName": "fev1_fvc_ratio", "fieldLabel": "FEV1/FVC Ratio", "fieldType": "number", "required": true},
  {"fieldName": "interpretation", "fieldLabel": "Interpretation", "fieldType": "select", "required": true, "options": ["Normal", "Obstructive", "Restrictive", "Mixed"]}
]'::jsonb);