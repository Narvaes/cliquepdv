-- FIX: Row Level Security for Signup Flow

-- 1. Tenants Table
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;

-- Allow public to view tenants (needed for resolution)
CREATE POLICY "Public can view tenants" ON tenants
    FOR SELECT USING (true);

-- Allow authenticated users to insert tenants
-- Note: During signup, the user is authenticated after signUp()
CREATE POLICY "Users can insert their own tenant" ON tenants
    FOR INSERT TO authenticated
    WITH CHECK (true);

-- 2. Profiles Table
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Allow users to view their own profile
CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT TO authenticated
    USING (auth.uid() = id);

-- Allow users to insert their own profile
CREATE POLICY "Users can insert own profile" ON profiles
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = id);

-- Allow users to update their own profile
CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE TO authenticated
    USING (auth.uid() = id);
