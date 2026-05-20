-- Add permissions column to profiles if it doesn't exist
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS permissions jsonb DEFAULT '[]'::jsonb;

-- Update RLS to allow superadmins to manage profiles
DROP POLICY IF EXISTS "SuperAdmins can manage all profiles" ON profiles;
CREATE POLICY "SuperAdmins can manage all profiles"
ON profiles FOR ALL
USING (
  (SELECT role FROM profiles WHERE id = auth.uid()) = 'superadmin'
);
