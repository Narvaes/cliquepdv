-- ============================================
-- FIX: RLS Infinite Recursion + Signup Issues
-- ============================================
-- This script fixes the "infinite recursion detected in policy for relation 'profiles'" error
-- and ensures smooth signup flow for new stores.

-- Step 1: Drop all existing problematic policies on profiles
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "profiles_read_own" ON profiles;
DROP POLICY IF EXISTS "profiles_read_all_superadmin" ON profiles;
DROP POLICY IF EXISTS "SuperAdmins Select All" ON profiles;
DROP POLICY IF EXISTS "SuperAdmins Update All" ON profiles;
DROP POLICY IF EXISTS "SuperAdmins All Profiles" ON profiles;
DROP POLICY IF EXISTS "superadmin_manage_all_profiles" ON profiles;
DROP POLICY IF EXISTS "Allow insert own profile during signup" ON profiles;
DROP POLICY IF EXISTS "Users can view profiles in same tenant" ON profiles;

-- Step 2: Create safe helper function for super admin check (bypasses RLS)
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER -- Runs as owner, bypasses RLS
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role = 'superadmin'
  );
$$;

-- Step 3: Create NEW simplified policies for profiles

-- Allow users to INSERT their own profile during signup (no recursion)
CREATE POLICY "signup_insert_own_profile"
ON profiles FOR INSERT
TO public
WITH CHECK (auth.uid() = id);

-- Allow users to SELECT their own profile (no tenant check to avoid recursion)
CREATE POLICY "select_own_profile"
ON profiles FOR SELECT
TO public
USING (auth.uid() = id);

-- Allow users to UPDATE their own profile
CREATE POLICY "update_own_profile"
ON profiles FOR UPDATE
TO public
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Super admins can do EVERYTHING (using safe function)
CREATE POLICY "superadmin_all_profiles"
ON profiles FOR ALL
TO public
USING (is_super_admin())
WITH CHECK (is_super_admin());

-- Step 4: Fix tenants policies
DROP POLICY IF EXISTS "SuperAdmins All Tenants" ON tenants;
DROP POLICY IF EXISTS "superadmin_manage_all_tenants" ON tenants;
DROP POLICY IF EXISTS "Users can view own tenant" ON tenants;
DROP POLICY IF EXISTS "Users can insert tenant during signup" ON tenants;

-- Allow authenticated users to INSERT tenants (for signup)
CREATE POLICY "signup_insert_tenant"
ON tenants FOR INSERT
TO public
WITH CHECK (auth.role() = 'authenticated');

-- Allow users to SELECT their own tenant
CREATE POLICY "select_own_tenant"
ON tenants FOR SELECT
TO public
USING (
    id IN (
        SELECT tenant_id FROM profiles WHERE id = auth.uid()
    )
);

-- Super admins can manage all tenants
CREATE POLICY "superadmin_all_tenants"
ON tenants FOR ALL
TO public
USING (is_super_admin())
WITH CHECK (is_super_admin());

-- Step 5: Ensure RLS is enabled
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;

-- Step 6: Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- Step 7: Refresh schema cache
NOTIFY pgrst, 'reload config';

-- Verification queries (run these to check):
-- SELECT * FROM pg_policies WHERE tablename = 'profiles';
-- SELECT * FROM pg_policies WHERE tablename = 'tenants';
