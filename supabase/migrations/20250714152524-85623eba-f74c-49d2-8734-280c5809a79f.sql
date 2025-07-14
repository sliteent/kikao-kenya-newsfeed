
-- Create admin profiles table linked to Supabase auth
CREATE TABLE public.admin_profiles (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  email text NOT NULL,
  full_name text,
  role text NOT NULL DEFAULT 'admin',
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id),
  UNIQUE(email)
);

-- Enable RLS on admin_profiles
ALTER TABLE public.admin_profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for admin_profiles
CREATE POLICY "Admins can view their own profile" 
  ON public.admin_profiles 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can update their own profile" 
  ON public.admin_profiles 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Create function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.admin_profiles
    WHERE user_id = auth.uid()
      AND is_active = true
      AND role = 'admin'
  )
$$;

-- Update existing RLS policies to use the new admin function
DROP POLICY IF EXISTS "Admins can manage all articles" ON public.news_articles;
CREATE POLICY "Admins can manage all articles" 
  ON public.news_articles 
  FOR ALL 
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins can manage categories" ON public.news_categories;
CREATE POLICY "Admins can manage categories" 
  ON public.news_categories 
  FOR ALL 
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins can manage RSS sources" ON public.rss_sources;
CREATE POLICY "Admins can manage RSS sources" 
  ON public.rss_sources 
  FOR ALL 
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins can view RSS sources" ON public.rss_sources;

DROP POLICY IF EXISTS "Admins can view audit logs" ON public.audit_logs;
CREATE POLICY "Admins can view audit logs" 
  ON public.audit_logs 
  FOR SELECT 
  USING (public.is_admin());

-- Create trigger to automatically create admin profile
CREATE OR REPLACE FUNCTION public.handle_new_admin_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.admin_profiles (user_id, email, full_name)
  VALUES (
    new.id, 
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', new.email)
  );
  RETURN new;
END;
$$;

-- Create trigger for new admin users (will be activated manually for admin emails)
CREATE OR REPLACE TRIGGER on_auth_admin_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW 
  WHEN (new.email LIKE '%admin%' OR new.email IN ('admin@kikao.co.ke'))
  EXECUTE PROCEDURE public.handle_new_admin_user();
