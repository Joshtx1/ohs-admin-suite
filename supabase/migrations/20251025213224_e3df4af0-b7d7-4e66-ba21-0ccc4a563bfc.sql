-- Fix Security Issue #1: Remove overly permissive email lookup policy
DROP POLICY IF EXISTS "Allow email lookup for login" ON public.profiles;

-- Fix Security Issue #2: Ensure trainees table requires authentication
-- (Already has policy but ensuring RLS is enabled and policy is correct)
ALTER TABLE public.trainees ENABLE ROW LEVEL SECURITY;

-- Fix Security Issue #3: Restrict conversations and messages to owners
DROP POLICY IF EXISTS "Anyone can view conversations" ON public.conversations;
DROP POLICY IF EXISTS "Anyone can create conversations" ON public.conversations;
DROP POLICY IF EXISTS "Anyone can update conversations" ON public.conversations;
DROP POLICY IF EXISTS "Anyone can delete conversations" ON public.conversations;

CREATE POLICY "Users can view their own conversations"
ON public.conversations FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own conversations"
ON public.conversations FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own conversations"
ON public.conversations FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own conversations"
ON public.conversations FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Restrict messages to conversation owners
DROP POLICY IF EXISTS "Anyone can view messages" ON public.messages;
DROP POLICY IF EXISTS "Anyone can create messages" ON public.messages;

CREATE POLICY "Users can view messages in their conversations"
ON public.messages FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.conversations
    WHERE conversations.id = messages.conversation_id
    AND conversations.user_id = auth.uid()
  )
);

CREATE POLICY "Users can create messages in their conversations"
ON public.messages FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.conversations
    WHERE conversations.id = messages.conversation_id
    AND conversations.user_id = auth.uid()
  )
);

-- Fix Security Issue #4: Restrict file uploads to conversation owners
DROP POLICY IF EXISTS "Anyone can view file uploads" ON public.file_uploads;
DROP POLICY IF EXISTS "Anyone can upload files" ON public.file_uploads;

CREATE POLICY "Users can view their conversation file uploads"
ON public.file_uploads FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.conversations
    WHERE conversations.id = file_uploads.conversation_id
    AND conversations.user_id = auth.uid()
  )
);

CREATE POLICY "Users can upload to their conversations"
ON public.file_uploads FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.conversations
    WHERE conversations.id = file_uploads.conversation_id
    AND conversations.user_id = auth.uid()
  )
);