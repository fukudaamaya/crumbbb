
-- Allow anyone to check if a username is taken (no sensitive data exposed)
CREATE OR REPLACE FUNCTION public.is_username_taken(_username TEXT)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles WHERE username = _username
  )
$$;
