CREATE OR REPLACE FUNCTION public.handle_new_user()
  RETURNS trigger
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (id, display_name, username)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'display_name', ''),
    COALESCE(
      NULLIF(NEW.raw_user_meta_data->>'username', ''),
      'user_' || substr(NEW.id::text, 1, 8)
    )
  );
  RETURN NEW;
END;
$function$;