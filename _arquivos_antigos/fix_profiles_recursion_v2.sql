-- ==========================================
-- FINAL FIX FOR INFINITE RECURSION ON PROFILES
-- ==========================================

-- 1. Create a bulletproof SECURITY DEFINER function to bypass RLS
-- Using PL/pgSQL prevents the optimizer from inlining the function and breaking the security definer context.
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  is_admin BOOLEAN;
BEGIN
  SELECT (role = 'superadmin') INTO is_admin
  FROM profiles
  WHERE id = auth.uid();
  
  RETURN COALESCE(is_admin, false);
END;
$$;

-- IMPORTANT: Ensure the function is owned by postgres to guarantee it bypasses RLS
ALTER FUNCTION public.is_super_admin() OWNER TO postgres;

-- 2. Drop all known existing policies on profiles that might cause recursion
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profiles_read_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_delete_own" ON public.profiles;
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

-- 3. Recreate safe, NON-RECURSIVE policies
-- A) Any authenticated user can read their OWN profile
CREATE POLICY "profiles_read_own" ON public.profiles
    FOR SELECT TO authenticated
    USING (auth.uid() = id);

-- B) Any authenticated user can update their OWN profile
CREATE POLICY "profiles_update_own" ON public.profiles
    FOR UPDATE TO authenticated
    USING (auth.uid() = id);

-- C) Any user can delete their OWN profile (needed for cascade tests or if users delete their account)
CREATE POLICY "profiles_delete_own" ON public.profiles
    FOR DELETE TO authenticated
    USING (auth.uid() = id);

-- D) Allow insertion during signup (service role / unauthenticated sometimes needs it, but usually authenticated)
CREATE POLICY "profiles_insert" ON public.profiles
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = id);

-- E) A Super Admin can do EVERYTHING (Select, Insert, Update, Delete)
--    We use the SAFE function public.is_super_admin()
CREATE POLICY "superadmin_all_profiles" ON public.profiles
    FOR ALL TO authenticated
    USING (public.is_super_admin());

-- 4. Reload the schema cache just in case
NOTIFY pgrst, 'reload config';
