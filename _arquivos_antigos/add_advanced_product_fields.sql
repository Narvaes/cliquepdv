-- Migration: Add advanced product and category fields
-- This adds SKU, GTIN/EAN, infinite stock control, and category codes

-- 1. Add fields to products table
ALTER TABLE products ADD COLUMN IF NOT EXISTS sku TEXT UNIQUE;
ALTER TABLE products ADD COLUMN IF NOT EXISTS gtin_ean TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS infinite_stock BOOLEAN DEFAULT false;

-- 2. Add code field to categories table
ALTER TABLE categories ADD COLUMN IF NOT EXISTS code TEXT;

-- 3. Create unique constraint for category code per tenant
ALTER TABLE categories DROP CONSTRAINT IF EXISTS unique_category_code_per_tenant;
ALTER TABLE categories ADD CONSTRAINT unique_category_code_per_tenant UNIQUE(tenant_id, code);

-- 4. Create indexes
CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);
CREATE INDEX IF NOT EXISTS idx_products_gtin_ean ON products(gtin_ean);
CREATE INDEX IF NOT EXISTS idx_categories_code ON categories(code);

-- 5. Create function to generate SKU automatically
CREATE OR REPLACE FUNCTION generate_sku()
RETURNS TEXT AS $$
DECLARE
    new_sku TEXT;
    sku_exists BOOLEAN;
BEGIN
    LOOP
        -- Generate SKU: PRD + 8 random alphanumeric characters
        new_sku := 'PRD' || UPPER(SUBSTRING(MD5(RANDOM()::TEXT || CLOCK_TIMESTAMP()::TEXT) FROM 1 FOR 8));
        
        -- Check if SKU already exists
        SELECT EXISTS(SELECT 1 FROM products WHERE sku = new_sku) INTO sku_exists;
        
        -- If SKU doesn't exist, return it
        IF NOT sku_exists THEN
            RETURN new_sku;
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- 6. Create function to generate category code automatically
CREATE OR REPLACE FUNCTION generate_category_code()
RETURNS TEXT AS $$
DECLARE
    new_code TEXT;
    code_exists BOOLEAN;
BEGIN
    LOOP
        -- Generate Code: CAT + 6 random alphanumeric characters
        new_code := 'CAT' || UPPER(SUBSTRING(MD5(RANDOM()::TEXT || CLOCK_TIMESTAMP()::TEXT) FROM 1 FOR 6));
        
        -- Check if code already exists
        SELECT EXISTS(SELECT 1 FROM categories WHERE code = new_code) INTO code_exists;
        
        -- If code doesn't exist, return it
        IF NOT code_exists THEN
            RETURN new_code;
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- 7. Create trigger to auto-generate SKU for new products
CREATE OR REPLACE FUNCTION auto_generate_sku()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.sku IS NULL OR NEW.sku = '' THEN
        NEW.sku := generate_sku();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_auto_generate_sku ON products;
CREATE TRIGGER trigger_auto_generate_sku
    BEFORE INSERT ON products
    FOR EACH ROW
    EXECUTE FUNCTION auto_generate_sku();

-- 8. Create trigger to auto-generate code for new categories
CREATE OR REPLACE FUNCTION auto_generate_category_code()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.code IS NULL OR NEW.code = '' THEN
        NEW.code := generate_category_code();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_auto_generate_category_code ON categories;
CREATE TRIGGER trigger_auto_generate_category_code
    BEFORE INSERT ON categories
    FOR EACH ROW
    EXECUTE FUNCTION auto_generate_category_code();

-- 9. Generate SKUs for existing products that don't have one
UPDATE products SET sku = generate_sku() WHERE sku IS NULL;

-- 10. Generate codes for existing categories that don't have one
UPDATE categories SET code = generate_category_code() WHERE code IS NULL;

-- Comments
COMMENT ON COLUMN products.sku IS 'Internal SKU code - auto-generated unique identifier';
COMMENT ON COLUMN products.gtin_ean IS 'GTIN/EAN barcode for retail scanning';
COMMENT ON COLUMN products.infinite_stock IS 'If true, product has unlimited stock (no inventory control)';
COMMENT ON COLUMN categories.code IS 'Internal category code - auto-generated unique identifier';
