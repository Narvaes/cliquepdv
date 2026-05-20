-- Migration: Add Sequential Order IDs per Tenant

-- 1. Add display_id column to sales
ALTER TABLE public.sales ADD COLUMN IF NOT EXISTS display_id INTEGER;

-- 2. Create a function to calculate the next ID for a tenant
CREATE OR REPLACE FUNCTION public.set_next_display_id()
RETURNS TRIGGER AS $$
DECLARE
    next_id INTEGER;
BEGIN
    -- Calculate the next ID for this specific tenant
    -- COALESCE(MAX(display_id), 0) + 1 gets the highest existing ID for this tenant and adds 1
    -- If no sales exist for this tenant, it starts at 1
    SELECT COALESCE(MAX(display_id), 0) + 1
    INTO next_id
    FROM public.sales
    WHERE tenant_id = NEW.tenant_id;

    -- Assign the calculated ID to the new row
    NEW.display_id := next_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. Create the trigger to run before insertion
DROP TRIGGER IF EXISTS trigger_set_display_id ON public.sales;
CREATE TRIGGER trigger_set_display_id
BEFORE INSERT ON public.sales
FOR EACH ROW
EXECUTE FUNCTION public.set_next_display_id();

-- 4. Create an index for faster lookups
CREATE INDEX IF NOT EXISTS idx_sales_tenant_display_id ON public.sales(tenant_id, display_id);

-- 5. Force schema cache refresh
NOTIFY pgrst, 'reload config';
