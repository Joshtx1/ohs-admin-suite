-- Update action_items RLS policies to allow admins to see all items

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own action items" ON public.action_items;

-- Create new policies with admin access
CREATE POLICY "Users can view their own action items"
ON public.action_items
FOR SELECT
TO authenticated
USING (
  auth.uid() = user_id 
  OR has_role(auth.uid(), 'admin'::app_role)
  OR has_role(auth.uid(), 'master'::app_role)
);

-- Also update other policies to allow admin full access
DROP POLICY IF EXISTS "Users can update their own action items" ON public.action_items;
DROP POLICY IF EXISTS "Users can delete their own action items" ON public.action_items;

CREATE POLICY "Users can update their own action items"
ON public.action_items
FOR UPDATE
TO authenticated
USING (
  auth.uid() = user_id 
  OR has_role(auth.uid(), 'admin'::app_role)
  OR has_role(auth.uid(), 'master'::app_role)
);

CREATE POLICY "Users can delete their own action items"
ON public.action_items
FOR DELETE
TO authenticated
USING (
  auth.uid() = user_id 
  OR has_role(auth.uid(), 'admin'::app_role)
  OR has_role(auth.uid(), 'master'::app_role)
);