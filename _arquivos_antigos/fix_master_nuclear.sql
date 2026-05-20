-- NUCLEAR FIX for Master Access
-- 1. Ensure the profile exists and is Super Admin (Upsert)
DO $$
DECLARE
    target_user_id UUID;
BEGIN
    SELECT id INTO target_user_id FROM auth.users WHERE email = 'lucas.narvaes@gmail.com';

    IF target_user_id IS NOT NULL THEN
        INSERT INTO public.profiles (id, email, role, permissions, full_name)
        VALUES (
            target_user_id, 
            'lucas.narvaes@gmail.com', 
            'superadmin', 
            '["read_all", "manage_tenants", "delete_tenants", "manage_financial", "manage_admins"]'::jsonb,
            'Super Admin Lucas'
        )
        ON CONFLICT (id) DO UPDATE
        SET role = 'superadmin',
            permissions = EXCLUDED.permissions;
    END IF;
END $$;

-- 2. Reset RLS Policies (Simplest Working Version)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Drop complex policies that might be failing
DROP POLICY IF EXISTS "SuperAdmins Select All" ON profiles;
DROP POLICY IF EXISTS "profiles_select_owner" ON profiles;
DROP POLICY IF EXISTS "profiles_read_own" ON profiles;

-- Policy A: Everyone can read their own profile (Foundation)
CREATE POLICY "profiles_read_own" ON profiles 
    FOR SELECT 
    TO public 
    USING (auth.uid() = id);

-- Policy B: Super Admins can read everyone
CREATE POLICY "profiles_read_all_superadmin" ON profiles 
    FOR SELECT 
    TO public 
    USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND role = 'superadmin'
        )
    );
