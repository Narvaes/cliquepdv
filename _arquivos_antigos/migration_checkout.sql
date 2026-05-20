-- Migration: Advanced Checkout Support

-- Add delivery_fee and status to sales
ALTER TABLE sales ADD COLUMN IF NOT EXISTS delivery_fee NUMERIC(10,2) DEFAULT 0;
ALTER TABLE sales ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'completed';

-- Ensure clients has phone and address (checking again)
ALTER TABLE clients ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS address TEXT;

-- Create index for status if useful
CREATE INDEX IF NOT EXISTS idx_sales_status ON sales(status);

COMMENT ON COLUMN sales.delivery_fee IS 'Taxa de entrega cobrada no pedido';
COMMENT ON COLUMN sales.status IS 'Status do pedido (ex: completed, waiting_payment)';

-- Add unique constraint for clients upsert (Name/Phone match per tenant)
ALTER TABLE clients DROP CONSTRAINT IF EXISTS clients_tenant_phone_key;
ALTER TABLE clients ADD CONSTRAINT clients_tenant_phone_key UNIQUE (tenant_id, phone);
