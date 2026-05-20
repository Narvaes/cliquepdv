-- GRANT Full Access to Super Admins on Tenants Table
-- This is necessary for Edit/Delete operations to work

DROP POLICY IF EXISTS "SuperAdmins All Tenants" ON tenants;
CREATE POLICY "SuperAdmins All Tenants" ON tenants
    FOR ALL
    TO public
    USING (
        -- Check if user is superadmin via profiles table
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND role = 'superadmin'
        )
    );

-- Also ensure they can manage profiles (needed for managing admins)
DROP POLICY IF EXISTS "SuperAdmins All Profiles" ON profiles;
CREATE POLICY "SuperAdmins All Profiles" ON profiles
    FOR ALL
    TO public
    USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND role = 'superadmin'
        )
    );
