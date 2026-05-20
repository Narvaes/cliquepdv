-- Migration: Create categories table for tenant-specific product categories
-- UPDATED VERSION with fixed RLS policies

-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    display_order INTEGER DEFAULT 0,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Ensure unique category names per tenant
    UNIQUE(tenant_id, name)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_categories_tenant_id ON categories(tenant_id);
CREATE INDEX IF NOT EXISTS idx_categories_active ON categories(active);
CREATE INDEX IF NOT EXISTS idx_categories_display_order ON categories(display_order);

-- Enable RLS
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own tenant categories" ON categories;
DROP POLICY IF EXISTS "Users can insert own tenant categories" ON categories;
DROP POLICY IF EXISTS "Users can update own tenant categories" ON categories;
DROP POLICY IF EXISTS "Users can delete own tenant categories" ON categories;

-- Policy: Users can view categories from their tenant or any tenant they're managing
CREATE POLICY "Users can view categories"
    ON categories FOR SELECT
    USING (
        tenant_id IN (
            SELECT tenant_id FROM profiles WHERE id = auth.uid()
        )
        OR
        -- Allow super admins to view all categories
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND role = 'super_admin'
        )
    );

-- Policy: Users can insert categories for their tenant
CREATE POLICY "Users can insert categories"
    ON categories FOR INSERT
    WITH CHECK (
        -- User must be authenticated
        auth.uid() IS NOT NULL
        AND
        (
            -- Either inserting for their own tenant
            tenant_id IN (
                SELECT tenant_id FROM profiles WHERE id = auth.uid()
            )
            OR
            -- Or they're a super admin
            EXISTS (
                SELECT 1 FROM profiles 
                WHERE id = auth.uid() 
                AND role = 'super_admin'
            )
        )
    );

-- Policy: Users can update categories from their tenant
CREATE POLICY "Users can update categories"
    ON categories FOR UPDATE
    USING (
        tenant_id IN (
            SELECT tenant_id FROM profiles WHERE id = auth.uid()
        )
        OR
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND role = 'super_admin'
        )
    );

-- Policy: Users can delete categories from their tenant
CREATE POLICY "Users can delete categories"
    ON categories FOR DELETE
    USING (
        tenant_id IN (
            SELECT tenant_id FROM profiles WHERE id = auth.uid()
        )
        OR
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND role = 'super_admin'
        )
    );

COMMENT ON TABLE categories IS 'Product categories managed by each tenant';
COMMENT ON COLUMN categories.display_order IS 'Order in which categories appear in the UI';
