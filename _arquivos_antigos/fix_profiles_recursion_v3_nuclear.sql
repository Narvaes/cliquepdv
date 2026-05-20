-- ==========================================
-- NUCLEAR FIX FOR INFINITE RECURSION ON PROFILES - REVISION 2
-- ==========================================

-- 1. Drop ALL existing policies on profiles (Ensuring we catch the new ones we just tried to make)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profiles_read_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_delete_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_superadmin_all" ON public.profiles;
DROP POLICY IF EXISTS "profiles_read_all_superadmin" ON public.profiles;
DROP POLICY IF EXISTS "SuperAdmins Select All" ON public.profiles;
DROP POLICY IF EXISTS "SuperAdmins Update All" ON public.profiles;
DROP POLICY IF EXISTS "SuperAdmins All Profiles" ON public.profiles;
DROP POLICY IF EXISTS "superadmin_manage_all_profiles" ON public.profiles;
DROP POLICY IF EXISTS "Allow users to update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Allow users to delete own profile" ON public.profiles;
DROP POLICY IF EXISTS "Allow public insert" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert" ON public.profiles;
DROP POLICY IF EXISTS "superadmin_all_profiles" ON public.profiles;

-- 2. Recreate DIRECT, NON-RECURSIVE policies

CREATE POLICY "profiles_read_own" ON public.profiles
    FOR SELECT TO authenticated
    USING (auth.uid() = id);

CREATE POLICY "profiles_update_own" ON public.profiles
    FOR UPDATE TO authenticated
    USING (auth.uid() = id);

CREATE POLICY "profiles_delete_own" ON public.profiles
    FOR DELETE TO authenticated
    USING (auth.uid() = id);

CREATE POLICY "profiles_insert_own" ON public.profiles
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = id);

-- 3. Super Admin logic using safe PL/pgSQL function

CREATE OR REPLACE FUNCTION public.check_is_super_admin_no_loop()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER 
SET search_path = public
AS $$
DECLARE
  v_is_super BOOLEAN;
BEGIN
  -- Because it's SECURITY DEFINER, it bypasses RLS for this specific query.
  SELECT (role = 'superadmin') INTO v_is_super
  FROM public.profiles
  WHERE id = auth.uid();
  
  RETURN COALESCE(v_is_super, false);
END;
$$;

ALTER FUNCTION public.check_is_super_admin_no_loop() OWNER TO postgres;

-- Now apply it to profiles for Super Admins
CREATE POLICY "profiles_superadmin_all" ON public.profiles
    FOR ALL TO authenticated
    USING (public.check_is_super_admin_no_loop());

-- 4. Reload cache
NOTIFY pgrst, 'reload config';
