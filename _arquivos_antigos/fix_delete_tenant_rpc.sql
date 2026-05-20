-- ==========================================
-- FIX: RPC para deletar tenant sem recursão RLS
-- ==========================================
-- COMO USAR: Cole e rode este script no SQL Editor do Supabase.
-- Depois disso, o botão "Deletar" no painel Super Admin vai funcionar.

CREATE OR REPLACE FUNCTION public.force_delete_tenant(target_tenant_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_caller_role TEXT;
    v_tenant_name TEXT;
BEGIN
    -- 1. Verificar se o chamador é superadmin (consulta segura, sem RLS pois é SECURITY DEFINER)
    SELECT role INTO v_caller_role
    FROM public.profiles
    WHERE id = auth.uid();

    IF v_caller_role IS NULL OR v_caller_role != 'superadmin' THEN
        RETURN jsonb_build_object(
            'status', 'error',
            'message', 'Acesso negado. Apenas superadmins podem deletar tenants.'
        );
    END IF;

    -- 2. Verificar se o tenant existe e pegar o nome para o log
    SELECT name INTO v_tenant_name
    FROM public.tenants
    WHERE id = target_tenant_id;

    IF v_tenant_name IS NULL THEN
        RETURN jsonb_build_object(
            'status', 'error',
            'message', 'Tenant não encontrado.'
        );
    END IF;

    -- 3. Deletar o tenant (CASCADE cuida de profiles, products, sales, etc.)
    DELETE FROM public.tenants WHERE id = target_tenant_id;

    RETURN jsonb_build_object(
        'status', 'success',
        'message', format('Tenant "%s" e todos os dados associados foram removidos.', v_tenant_name)
    );

EXCEPTION WHEN OTHERS THEN
    RETURN jsonb_build_object(
        'status', 'error',
        'message', format('Erro ao deletar: %s', SQLERRM)
    );
END;
$$;

-- Garantir que o owner é postgres (para bypass total de RLS)
ALTER FUNCTION public.force_delete_tenant(UUID) OWNER TO postgres;

-- Recarregar cache do PostgREST
NOTIFY pgrst, 'reload config';
