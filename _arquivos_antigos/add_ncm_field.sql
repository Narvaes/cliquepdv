-- Add NCM field to products table
ALTER TABLE products ADD COLUMN IF NOT EXISTS ncm TEXT;

-- Create index for NCM searches
CREATE INDEX IF NOT EXISTS idx_products_ncm ON products(ncm);

-- Comment
COMMENT ON COLUMN products.ncm IS 'NCM (Nomenclatura Comum do Mercosul) - 8-digit tax classification code';
