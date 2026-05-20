-- ==============================================================================
-- CORREÇÃO DO LOOP INFINITO (ERRO 500) NO FETCH DE PROFILES
-- ==============================================================================

-- 1. DROP da política que estava causando a recursão infinita no Supabase
-- Exclusivo para public.profiles (as outras tabelas funcionam 100% com o is_superadmin)
DROP POLICY IF EXISTS "Superadmin can view all profiles" ON public.profiles;

-- Nota: Para que superadmins possam ver os perfis uns dos outros na tela "Administradores", 
-- criaremos funções RPC específicas com SECURITY DEFINER. (Fazer bypass de RLS seguro).

-- 2. Criar RPC para buscar todos os Administradores (Substitui o .from('profiles').select())
CREATE OR REPLACE FUNCTION public.get_all_superadmins()
RETURNS JSON AS $$
DECLARE
  v_result JSON;
BEGIN
  -- Segurança: Somente quem é Super Admin pode rodar isso
  IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'superadmin') THEN
    RAISE EXCEPTION 'Access Denied';
  END IF;

  SELECT json_agg(p) INTO v_result 
  FROM public.profiles p 
  WHERE p.role = 'superadmin'
  ORDER BY p.created_at ASC;

  RETURN coalesce(v_result, '[]'::json);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- 3. Criar RPC para atualizar permissões de Admins (Substitui o .from('profiles').update())
CREATE OR REPLACE FUNCTION public.update_superadmin_permissions(p_admin_id UUID, p_permissions JSONB, p_role TEXT DEFAULT 'superadmin')
RETURNS JSON AS $$
BEGIN
  -- Segurança: Somente quem é Super Admin pode rodar isso
  IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'superadmin') THEN
    RAISE EXCEPTION 'Access Denied';
  END IF;

  -- Segurança Adicional: Evitar que retire seu próprio acesso Master 
  -- (se quiser tirar de você mesmo, tem que ser outro dev)
  IF p_admin_id = auth.uid() AND p_role != 'superadmin' THEN
      RAISE EXCEPTION 'You cannot revoke your own superadmin access.';
  END IF;

  UPDATE public.profiles 
  SET permissions = p_permissions,
      role = p_role,
      updated_at = NOW()
  WHERE id = p_admin_id;

  RETURN json_build_object('status', 'success', 'message', 'Permissions updated');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
