

# Fix Signup "Database Error Saving New User"

## Problem

The `handle_new_user` database trigger inserts an empty string (`''`) as the `username` when no username is provided during signup. The `profiles` table has a unique constraint on `username`, so only the very first user can sign up -- every subsequent user fails with a duplicate key violation.

## Solution

Update the `handle_new_user` trigger function to generate a unique default username when none is provided. This way every new user gets a unique profile row without requiring a username at signup.

## Technical Details

**Database migration** -- alter the `handle_new_user` function:

```sql
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
```

This changes the username fallback from an empty string to `user_` + the first 8 characters of the user's UUID, which is unique per user.

**No frontend code changes needed.**

## Files Modified
- Database migration only (update `handle_new_user` function)

