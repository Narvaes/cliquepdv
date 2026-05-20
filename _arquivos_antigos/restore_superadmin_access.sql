-- Emergency Access Restoration
-- This script finds the user by email and forces the role to 'superadmin'

UPDATE profiles
SET role = 'superadmin',
    permissions = '["read_all", "manage_tenants", "delete_tenants", "manage_financial", "manage_admins"]'::jsonb
WHERE email = 'lucas.narvaes@gmail.com';

-- Verify the change
SELECT * FROM profiles WHERE email = 'lucas.narvaes@gmail.com';
