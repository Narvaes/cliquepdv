-- FIX: Enable Cascade Deletion for Tenants
-- This script drops existing foreign key constraints that point to 'tenants' 
-- and recreates them with 'ON DELETE CASCADE'.

DO $$
BEGIN
    -- 1. Table: profiles
    ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_tenant_id_fkey;
    ALTER TABLE public.profiles 
        ADD CONSTRAINT profiles_tenant_id_fkey 
        FOREIGN KEY (tenant_id) 
        REFERENCES public.tenants(id) 
        ON DELETE CASCADE;

    -- 2. Table: sales
    ALTER TABLE public.sales DROP CONSTRAINT IF EXISTS sales_tenant_id_fkey;
    ALTER TABLE public.sales 
        ADD CONSTRAINT sales_tenant_id_fkey 
        FOREIGN KEY (tenant_id) 
        REFERENCES public.tenants(id) 
        ON DELETE CASCADE;

    -- 3. Table: sale_items
    ALTER TABLE public.sale_items DROP CONSTRAINT IF EXISTS sale_items_tenant_id_fkey;
    ALTER TABLE public.sale_items 
        ADD CONSTRAINT sale_items_tenant_id_fkey 
        FOREIGN KEY (tenant_id) 
        REFERENCES public.tenants(id) 
        ON DELETE CASCADE;

    -- 4. Table: clients
    ALTER TABLE public.clients DROP CONSTRAINT IF EXISTS clients_tenant_id_fkey;
    ALTER TABLE public.clients 
        ADD CONSTRAINT clients_tenant_id_fkey 
        FOREIGN KEY (tenant_id) 
        REFERENCES public.tenants(id) 
        ON DELETE CASCADE;

    -- 5. Table: products (checking if it exists)
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename  = 'products') THEN
        ALTER TABLE public.products DROP CONSTRAINT IF EXISTS products_tenant_id_fkey;
        ALTER TABLE public.products 
            ADD CONSTRAINT products_tenant_id_fkey 
            FOREIGN KEY (tenant_id) 
            REFERENCES public.tenants(id) 
            ON DELETE CASCADE;
    END IF;

    -- 6. Table: categories
    ALTER TABLE public.categories DROP CONSTRAINT IF EXISTS categories_tenant_id_fkey;
    ALTER TABLE public.categories 
        ADD CONSTRAINT categories_tenant_id_fkey 
        FOREIGN KEY (tenant_id) 
        REFERENCES public.tenants(id) 
        ON DELETE CASCADE;

    -- 7. Table: settings (if exists as a separate table)
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename  = 'settings') THEN
        ALTER TABLE public.settings DROP CONSTRAINT IF EXISTS settings_tenant_id_fkey;
        ALTER TABLE public.settings 
            ADD CONSTRAINT settings_tenant_id_fkey 
            FOREIGN KEY (tenant_id) 
            REFERENCES public.tenants(id) 
            ON DELETE CASCADE;
    END IF;

END $$;

-- Force refresh cache
NOTIFY pgrst, 'reload config';
