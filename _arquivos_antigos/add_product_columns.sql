-- Migration: Add missing columns to products table
-- This fixes the "Could not find the 'unit' column" error

-- Add unit column (e.g., "/unid", "/kg", "/cento")
ALTER TABLE products ADD COLUMN IF NOT EXISTS unit TEXT DEFAULT '/unid';

-- Add barcode column for product identification
ALTER TABLE products ADD COLUMN IF NOT EXISTS barcode TEXT;

-- Add active column to enable/disable products
ALTER TABLE products ADD COLUMN IF NOT EXISTS active BOOLEAN DEFAULT true;

-- Add timestamps if not exists
ALTER TABLE products ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE products ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Create index on tenant_id for better query performance
CREATE INDEX IF NOT EXISTS idx_products_tenant_id ON products(tenant_id);

-- Create index on active status
CREATE INDEX IF NOT EXISTS idx_products_active ON products(active);

COMMENT ON COLUMN products.unit IS 'Unit of measurement (e.g., /unid, /kg, /cento)';
COMMENT ON COLUMN products.barcode IS 'Product barcode for scanning';
COMMENT ON COLUMN products.active IS 'Whether the product is active and available for sale';
