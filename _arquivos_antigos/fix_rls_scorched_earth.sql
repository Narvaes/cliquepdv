-- SCORCHED EARTH RLS FIX
-- Dynamic script to drop ALL policies on 'profiles' and 'tenants' regardless of name.
-- This ensures no "Zombie Policies" remain to cause recursion.

DO $$
DECLARE
    pol RECORD;
BEGIN
    -- 1. Drop ALL policies on PROFILES
    FOR pol IN SELECT policyname FROM pg_policies WHERE tablename = 'profiles' LOOP
        EXECUTE format('DROP POLICY IF EXISTS "%s" ON profiles', pol.policyname);
    END LOOP;

    -- 2. Drop ALL policies on TENANTS
    FOR pol IN SELECT policyname FROM pg_policies WHERE tablename = 'tenants' LOOP
        EXECUTE format('DROP POLICY IF EXISTS "%s" ON tenants', pol.policyname);
    END LOOP;
END $$;

-- 3. Ensure Helper is Security Definer (and verify Owner)
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

ALTER FUNCTION public.is_super_admin() OWNER TO postgres;

-- 4. Re-Create Clean Policies (Bare Minimum Safe Set)

-- A: SIGNUP / INSERT
CREATE POLICY "profiles_insert_public" ON profiles 
    FOR INSERT 
    TO public 
    WITH CHECK (auth.uid() = id);

-- B: READ OWN
CREATE POLICY "profiles_read_own" ON profiles 
    FOR SELECT 
    TO public 
    USING (auth.uid() = id);

-- C: UPDATE OWN
CREATE POLICY "profiles_update_own" ON profiles 
    FOR UPDATE 
    TO public 
    USING (auth.uid() = id);

-- D: SUPER ADMIN (Via Secure RPC)
CREATE POLICY "superadmin_manage_all_profiles" ON profiles 
    FOR ALL 
    TO public 
    USING (is_super_admin());

-- E: TENANTS (Super Admin)
CREATE POLICY "superadmin_manage_all_tenants" ON tenants
    FOR ALL 
    TO public 
    USING (is_super_admin());

-- F: TENANTS (Owner)
CREATE POLICY "owners_manage_own_tenant" ON tenants
    FOR ALL
    TO public
    USING (owner_id = auth.uid());
