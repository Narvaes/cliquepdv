-- ========================================================
-- SOLUÇÃO V2 (FINAL): CORREÇÃO DE RECURSÃO E AMBIGUIDADE
-- ========================================================

-- 1. LIMPEZA GERAL
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Superadmin can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Superadmin permissions" ON public.profiles;
DROP POLICY IF EXISTS "Profiles Access" ON public.profiles;
DROP POLICY IF EXISTS "Unified Profile Access" ON public.profiles;

-- 2. FUNÇÃO SEGURA DE VERIFICAÇÃO (Qualificada)
CREATE OR REPLACE FUNCTION public.check_is_superadmin()
RETURNS BOOLEAN AS $$
DECLARE
  v_role TEXT;
BEGIN
  -- Verifica role diretamente (usando alias para evitar ambiguidade)
  SELECT p.role INTO v_role
  FROM public.profiles p
  WHERE p.id = auth.uid();
  
  RETURN v_role = 'superadmin';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. POLÍTICA UNIFICADA (MATA RECURSÃO)
-- O segredo é o OR. Se for o próprio dono, o primeiro termo é true e NEM CHAMA a função.
CREATE POLICY "Unified Profile Access" ON public.profiles
FOR SELECT TO authenticated
USING (
  id = auth.uid() 
  OR 
  check_is_superadmin()
);

-- 4. LIBERAR OUTRAS TABELAS (Com a nova função)
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Superadmin view all tenants" ON public.tenants;
CREATE POLICY "Superadmin view all tenants" ON public.tenants FOR SELECT TO authenticated USING (check_is_superadmin());

DROP POLICY IF EXISTS "Tenant Members Access" ON public.tenants;
CREATE POLICY "Tenant Members Access" ON public.tenants FOR SELECT TO authenticated USING (
    id IN (
        SELECT tenant_id FROM public.profiles WHERE id = auth.uid()
    )
);

ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Superadmin view all sales" ON public.sales;
CREATE POLICY "Superadmin view all sales" ON public.sales FOR SELECT TO authenticated USING (check_is_superadmin());

ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Superadmin view all settings" ON public.settings;
CREATE POLICY "Superadmin view all settings" ON public.settings FOR SELECT TO authenticated USING (check_is_superadmin());

ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Superadmin view all clients" ON public.clients;
CREATE POLICY "Superadmin view all clients" ON public.clients FOR SELECT TO authenticated USING (check_is_superadmin());

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Superadmin view all products" ON public.products;
CREATE POLICY "Superadmin view all products" ON public.products FOR SELECT TO authenticated USING (check_is_superadmin());


-- 5. RPC DE LISTAGEM (RETORNO JSON CORRIGIDO)
-- Removemos a versão antiga para evitar erro de tipo de retorno
DROP FUNCTION IF EXISTS public.get_admin_tenants_list();

CREATE OR REPLACE FUNCTION public.get_admin_tenants_list()
RETURNS JSON AS $$
DECLARE
  v_result JSON;
BEGIN
  -- Validação de Permissão
  IF NOT check_is_superadmin() THEN
    RAISE EXCEPTION 'Access Denied';
  END IF;

  -- Query explícita convertida para JSON
  SELECT json_agg(row_to_json(t_row)) INTO v_result
  FROM (
      SELECT 
        t.id, 
        t.name, 
        t.slug, 
        t.custom_domain, 
        t.niche, 
        t.status, 
        t.subscription_status, 
        t.trial_ends_at, 
        t.created_at,
        (SELECT p.email FROM public.profiles p WHERE p.tenant_id = t.id AND p.role = 'admin' LIMIT 1) as owner_email
      FROM public.tenants t
      ORDER BY t.created_at DESC
  ) t_row;

  RETURN coalesce(v_result, '[]'::json);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- 5b. RPC DE BUSCA ÚNICA (BYPASS RLS p/ TenantContext) - [IMPORTANTE!]
CREATE OR REPLACE FUNCTION public.get_admin_tenant_by_slug(p_slug TEXT)
RETURNS JSON AS $$
DECLARE
  v_result JSON;
BEGIN
  IF NOT check_is_superadmin() THEN RAISE EXCEPTION 'Access Denied'; END IF;
  
  SELECT row_to_json(t) INTO v_result FROM public.tenants t WHERE t.slug = p_slug;
  
  IF v_result IS NULL THEN RETURN json_build_object('error', 'Tenant not found'); END IF;
  
  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- 5c. RPC DE LISTAGEM DE EQUIPE (Bypass RLS p/ Settings)
CREATE OR REPLACE FUNCTION public.get_tenant_team_members(p_tenant_id UUID)
RETURNS JSON AS $$
DECLARE
  v_result JSON;
BEGIN
  IF NOT check_is_superadmin() THEN RAISE EXCEPTION 'Access Denied'; END IF;

  SELECT json_agg(row_to_json(p)) INTO v_result
  FROM public.profiles p
  WHERE p.tenant_id = p_tenant_id;

  RETURN coalesce(v_result, '[]'::json);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- 6. OUTRAS RPCS ESSENCIAIS (Atualizadas com nova checagem)
CREATE OR REPLACE FUNCTION public.master_reset_user_password(p_target_email TEXT, p_new_password TEXT)
RETURNS JSON AS $$
DECLARE v_target_id UUID;
BEGIN
  IF NOT check_is_superadmin() THEN RAISE EXCEPTION 'Access Denied'; END IF;
  
  SELECT u.id INTO v_target_id FROM auth.users u WHERE u.email = p_target_email;
  
  IF v_target_id IS NULL THEN RETURN json_build_object('status', 'error', 'message', 'User not found.'); END IF;
  
  UPDATE auth.users SET encrypted_password = crypt(p_new_password, gen_salt('bf')) WHERE id = v_target_id;
  RETURN json_build_object('status', 'success', 'message', 'Password reset successfully.');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.master_confirm_user_email(p_target_email TEXT)
RETURNS JSON AS $$
DECLARE v_target_id UUID;
BEGIN
  IF NOT check_is_superadmin() THEN RAISE EXCEPTION 'Access Denied'; END IF;
  SELECT u.id INTO v_target_id FROM auth.users u WHERE u.email = p_target_email;
  IF v_target_id IS NULL THEN RETURN json_build_object('status', 'error', 'message', 'User not found.'); END IF;
  UPDATE auth.users SET email_confirmed_at = NOW() WHERE id = v_target_id;
  RETURN json_build_object('status', 'success', 'message', 'Email confirmed successfully.');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.master_update_user_email(p_old_email TEXT, p_new_email TEXT)
RETURNS JSON AS $$
DECLARE v_target_id UUID;
BEGIN
  IF NOT check_is_superadmin() THEN RAISE EXCEPTION 'Access Denied'; END IF;
  SELECT u.id INTO v_target_id FROM auth.users u WHERE u.email = p_old_email;
  IF v_target_id IS NULL THEN RETURN json_build_object('status', 'error', 'message', 'User not found.'); END IF;
  IF EXISTS (SELECT 1 FROM auth.users WHERE email = p_new_email) THEN RETURN json_build_object('status', 'error', 'message', 'New email is already in use.'); END IF;
  UPDATE auth.users SET email = p_new_email, email_confirmed_at = NOW() WHERE id = v_target_id;
  UPDATE public.profiles SET email = p_new_email WHERE id = v_target_id;
  RETURN json_build_object('status', 'success', 'message', 'Email updated successfully.');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- 7. RPC DE RECUPERAÇÃO DE ROLE (CURA PARA O LOOP DE LOGIN)
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS JSON AS $$
DECLARE
  v_result JSON;
BEGIN
  SELECT json_build_object(
    'role', p.role,
    'permissions', p.permissions,
    'tenant_id', p.tenant_id,
    'tenant_slug', t.slug
  ) INTO v_result
  FROM public.profiles p
  LEFT JOIN public.tenants t ON p.tenant_id = t.id
  WHERE p.id = auth.uid();

  IF v_result IS NULL THEN
    RETURN json_build_object('role', 'none', 'permissions', '[]'::json, 'tenant_id', null, 'tenant_slug', null);
  END IF;

  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
