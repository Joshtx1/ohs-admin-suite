-- Create action_items table for tracking notes and tasks
CREATE TABLE public.action_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  page_url TEXT,
  image_url TEXT,
  completed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.action_items ENABLE ROW LEVEL SECURITY;

-- Create policies for authenticated users to manage their own action items
CREATE POLICY "Users can view their own action items" 
ON public.action_items 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own action items" 
ON public.action_items 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own action items" 
ON public.action_items 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own action items" 
ON public.action_items 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_action_items_updated_at
BEFORE UPDATE ON public.action_items
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage bucket for action item images
INSERT INTO storage.buckets (id, name, public)
VALUES ('action-items', 'action-items', true);

-- Create storage policies for action item images
CREATE POLICY "Users can view action item images" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'action-items');

CREATE POLICY "Users can upload their own action item images" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'action-items' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own action item images" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'action-items' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own action item images" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'action-items' AND auth.uid()::text = (storage.foldername(name))[1]);