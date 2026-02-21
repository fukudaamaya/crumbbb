
-- 1. App role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

-- 2. Profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  display_name TEXT NOT NULL,
  username TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- 3. Bakes table
CREATE TABLE public.bakes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT '',
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  loaf_count INTEGER NOT NULL DEFAULT 1,
  loaf_weight_g INTEGER NOT NULL DEFAULT 500,
  flours JSONB NOT NULL DEFAULT '[]'::jsonb,
  water_g INTEGER NOT NULL DEFAULT 0,
  starter_g INTEGER NOT NULL DEFAULT 0,
  leaven_g INTEGER NOT NULL DEFAULT 0,
  hydration_pct INTEGER NOT NULL DEFAULT 0,
  starter_pct INTEGER NOT NULL DEFAULT 0,
  leaven_pct INTEGER NOT NULL DEFAULT 0,
  proofing_time_mins INTEGER NOT NULL DEFAULT 0,
  bake_temp_c INTEGER NOT NULL DEFAULT 0,
  bake_time_mins INTEGER NOT NULL DEFAULT 0,
  photo_base64 TEXT NOT NULL DEFAULT '',
  crumb_photo_base64 TEXT NOT NULL DEFAULT '',
  notes TEXT NOT NULL DEFAULT '',
  rating INTEGER NOT NULL DEFAULT 0,
  is_favourite BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.bakes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own bakes"
  ON public.bakes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own bakes"
  ON public.bakes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own bakes"
  ON public.bakes FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own bakes"
  ON public.bakes FOR DELETE
  USING (auth.uid() = user_id);

-- 4. User roles table
CREATE TABLE public.user_roles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

CREATE POLICY "Users can view own roles"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id);

-- 5. Trigger to auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, username)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'display_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'username', '')
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
