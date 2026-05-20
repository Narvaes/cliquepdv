-- FINAL PERMISSION FIX (CLEAN SLATE)
-- 1. Drop ALL known policies to ensure no recursive zombies remain
DROP POLICY IF EXISTS "profiles_owner_policy" ON profiles;
DROP POLICY IF EXISTS "profiles_insert_public" ON profiles;
DROP POLICY IF EXISTS "profiles_select_owner" ON profiles;
DROP POLICY IF EXISTS "profiles_update_owner" ON profiles;
DROP POLICY IF EXISTS "SuperAdmins Select All" ON profiles;
DROP POLICY IF EXISTS "SuperAdmins Update All" ON profiles;
DROP POLICY IF EXISTS "SuperAdmins All Profiles" ON profiles;
DROP POLICY IF EXISTS "profiles_read_all_superadmin" ON profiles;
DROP POLICY IF EXISTS "profiles_read_own" ON profiles;
DROP POLICY IF EXISTS "superadmin_manage_all_profiles" ON profiles;

-- 2. Ensure Helper is Security Definer
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

-- 3. Re-Create Clean Policies

-- A: SIGNUP / INSERT (Public can create their own profile)
CREATE POLICY "profiles_insert_public" ON profiles 
    FOR INSERT 
    TO public 
    WITH CHECK (auth.uid() = id);

-- B: READ OWN (User sees their own profile)
CREATE POLICY "profiles_read_own" ON profiles 
    FOR SELECT 
    TO public 
    USING (auth.uid() = id);

-- C: UPDATE OWN (User edits their own profile)
CREATE POLICY "profiles_update_own" ON profiles 
    FOR UPDATE 
    TO public 
    USING (auth.uid() = id);

-- D: SUPER ADMIN GOD MODE (Use Security Definer function to avoid recursion)
CREATE POLICY "superadmin_manage_all_profiles" ON profiles 
    FOR ALL 
    TO public 
    USING (is_super_admin());

-- 4. Fix Tenants just in case
DROP POLICY IF EXISTS "SuperAdmins All Tenants" ON tenants;
DROP POLICY IF EXISTS "superadmin_manage_all_tenants" ON tenants;

CREATE POLICY "superadmin_manage_all_tenants" ON tenants
    FOR ALL 
    TO public 
    USING (is_super_admin());

-- 5. Standard Permission for Tenants (Owner can do everything on their tenant)
CREATE POLICY "owners_manage_own_tenant" ON tenants
    FOR ALL
    TO public
    USING (owner_id = auth.uid());
