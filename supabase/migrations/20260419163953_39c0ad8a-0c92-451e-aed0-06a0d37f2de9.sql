
-- 1. Add status workflow + on-chain sim columns to signals
ALTER TABLE public.signals
  ADD COLUMN IF NOT EXISTS approved_by uuid,
  ADD COLUMN IF NOT EXISTS approved_at timestamptz,
  ADD COLUMN IF NOT EXISTS funded_by uuid,
  ADD COLUMN IF NOT EXISTS funded_at timestamptz,
  ADD COLUMN IF NOT EXISTS tx_hash text;

-- Constrain status to known values
DO $$ BEGIN
  ALTER TABLE public.signals
    ADD CONSTRAINT signals_status_check
    CHECK (status IN ('pending','approved','funded','rejected'));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 2. Roles enum + user_roles table (avoids recursive RLS)
DO $$ BEGIN
  CREATE TYPE public.app_role AS ENUM ('ngo_member', 'admin');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 3. SECURITY DEFINER role check
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- 4. RLS on user_roles
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- 5. NGO members can update signals (status transitions)
DROP POLICY IF EXISTS "NGO members can update signals" ON public.signals;
CREATE POLICY "NGO members can update signals"
  ON public.signals FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'ngo_member'))
  WITH CHECK (public.has_role(auth.uid(), 'ngo_member'));

-- 6. Profiles table to capture display name (optional but useful)
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name text,
  organization text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Profiles are viewable by everyone"
  ON public.profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- 7. Auto-create profile + grant ngo_member role on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, organization)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'organization'
  );

  -- Auto-grant ngo_member role for the prototype.
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'ngo_member')
  ON CONFLICT DO NOTHING;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
