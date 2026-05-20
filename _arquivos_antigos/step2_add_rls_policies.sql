-- STEP 2: Add RLS policies (run this AFTER step 1 succeeds)
-- Copy and run this entire block second

-- Enable RLS
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view categories" ON categories;
DROP POLICY IF EXISTS "Users can insert categories" ON categories;
DROP POLICY IF EXISTS "Users can update categories" ON categories;
DROP POLICY IF EXISTS "Users can delete categories" ON categories;

-- Simple policy: Allow all authenticated users to do everything
-- (We'll refine this later once it's working)
CREATE POLICY "Allow all for authenticated users"
    ON categories
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);
