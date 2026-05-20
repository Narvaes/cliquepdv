-- FIX RLS Visibility for Super Admins
-- Ensure that Super Admins can ALWAYS select from profiles, not just their own
DROP POLICY IF EXISTS "SuperAdmins Select All" ON profiles;
CREATE POLICY "SuperAdmins Select All" ON profiles 
    FOR SELECT 
    TO public 
    USING (
        (select role from profiles where id = auth.uid()) = 'superadmin' 
        OR auth.uid() = id
    );

-- Double check update policy
DROP POLICY IF EXISTS "SuperAdmins Update All" ON profiles;
CREATE POLICY "SuperAdmins Update All" ON profiles 
    FOR UPDATE
    TO public 
    USING (
        (select role from profiles where id = auth.uid()) = 'superadmin' 
        OR auth.uid() = id
    );
