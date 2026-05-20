-- ==========================================
-- FINAL FIX FOR INFINITE RECURSION ON PROFILES
-- ==========================================

-- 1. Create a SECURITY DEFINER function to bypass RLS
-- This prevents the infinite loop when checking if a user is superadmin
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER 
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role = 'superadmin'
  );
$$;

-- 2. Drop ANY existing policies on profiles that might cause recursion
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profiles_read_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_read_all_superadmin" ON public.profiles;
DROP POLICY IF EXISTS "SuperAdmins Select All" ON public.profiles;
DROP POLICY IF EXISTS "SuperAdmins Update All" ON public.profiles;
DROP POLICY IF EXISTS "SuperAdmins All Profiles" ON public.profiles;
DROP POLICY IF EXISTS "superadmin_manage_all_profiles" ON public.profiles;
DROP POLICY IF EXISTS "Allow users to update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Allow users to delete own profile" ON public.profiles;
DROP POLICY IF EXISTS "Allow public insert" ON public.profiles;

-- 3. Recreate safe, NON-RECURSIVE policies

-- A) Any authenticated user can read their OWN profile
CREATE POLICY "profiles_read_own" ON public.profiles
    FOR SELECT TO authenticated
    USING (auth.uid() = id);

-- B) Any authenticated user can update their OWN profile
CREATE POLICY "profiles_update_own" ON public.profiles
    FOR UPDATE TO authenticated
    USING (auth.uid() = id);

-- C) A Super Admin can do EVERYTHING (Select, Insert, Update, Delete) 
--    and we use the SAFE function is_super_admin()
CREATE POLICY "superadmin_all_profiles" ON public.profiles
    FOR ALL TO authenticated
    USING (is_super_admin());

-- D) Allow insertion during signup (service role / unauthenticated sometimes needs it, but usually authenticated handles it)
CREATE POLICY "profiles_insert" ON public.profiles
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = id OR is_super_admin());

-- 4. Reload the schema cache just in case
NOTIFY pgrst, 'reload config';
