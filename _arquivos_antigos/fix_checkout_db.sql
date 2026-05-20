-- Migration: Fix Checkout Tables
-- This SQL adds missing columns to sales, sale_items and clients tables
-- To resolve the "Could not find tenant_id column" and related errors.

-- 1. Ensure sales table has all required columns
ALTER TABLE public.sales ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES public.tenants(id);
ALTER TABLE public.sales ADD COLUMN IF NOT EXISTS client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL;
ALTER TABLE public.sales ADD COLUMN IF NOT EXISTS delivery_fee NUMERIC(10,2) DEFAULT 0;
ALTER TABLE public.sales ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'waiting_payment';
ALTER TABLE public.sales ADD COLUMN IF NOT EXISTS total_amount NUMERIC(10,2) DEFAULT 0;
ALTER TABLE public.sales ADD COLUMN IF NOT EXISTS delivery_method TEXT DEFAULT 'entrega';
ALTER TABLE public.sales ADD COLUMN IF NOT EXISTS change_for NUMERIC(10,2) DEFAULT 0;

-- 2. Ensure sale_items table has all required columns
ALTER TABLE public.sale_items ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES public.tenants(id);
ALTER TABLE public.sale_items ADD COLUMN IF NOT EXISTS unit_price NUMERIC(10,2) DEFAULT 0;
ALTER TABLE public.sale_items ADD COLUMN IF NOT EXISTS total_price NUMERIC(10,2) DEFAULT 0;

-- 3. Ensure clients table has all required columns
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES public.tenants(id);
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS address TEXT;

-- 4. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_sales_tenant_id ON public.sales(tenant_id);
CREATE INDEX IF NOT EXISTS idx_sale_items_tenant_id ON public.sale_items(tenant_id);
CREATE INDEX IF NOT EXISTS idx_clients_tenant_id ON public.clients(tenant_id);

-- 5. Add unique constraint for clients (Tenant + Phone)
-- This allows the UPSERT logic in the code to work correctly
ALTER TABLE public.clients DROP CONSTRAINT IF EXISTS clients_tenant_phone_key;
ALTER TABLE public.clients ADD CONSTRAINT clients_tenant_phone_key UNIQUE (tenant_id, phone);

-- IMPORTANT: If your tables are in a schema other than 'public' (e.g., a schema named 'sales'), 
-- you may need to run these commands replacing 'public.' with your schema name.

-- 6. Force Supabase to refresh the schema cache
NOTIFY pgrst, 'reload config';
