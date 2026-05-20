-- Add client_id to sales table
ALTER TABLE sales ADD COLUMN IF NOT EXISTS client_id UUID REFERENCES clients(id) ON DELETE SET NULL;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_sales_client_id ON sales(client_id);

-- Add comment
COMMENT ON COLUMN sales.client_id IS 'Relationship with the client who made the purchase';
