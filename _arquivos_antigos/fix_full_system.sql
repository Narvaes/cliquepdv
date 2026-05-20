-- ========================================================
-- SOLUÇÃO COMPLETA E UNIFICADA DO SISTEMA MASTER ADMIN
-- ========================================================
-- Este script faz TUDO que é necessário.
-- Ele apaga o antigo, recria o novo, e libera as permissões.

-- PARTE 1: GARANTIR QUE OS DADOS SÃO ACESSÍVEIS (Função de Segurança)
CREATE OR REPLACE FUNCTION public.is_superadmin()
RETURNS BOOLEAN AS $$
DECLARE
  v_role TEXT;
BEGIN
  -- Segurança Total: Permite ler o próprio profile sem barreiras
  SELECT role INTO v_role
  FROM public.profiles
  WHERE id = auth.uid();
  
  RETURN v_role = 'superadmin';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- PARTE 2: LIBERAÇÃO DAS TABELAS (RLS)
-- Garante que o Super Admin veja TUDO

-- 2.1 Profiles (Usuários) - Evita tela branca
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Superadmin can view all profiles" ON public.profiles;
CREATE POLICY "Superadmin can view all profiles" ON public.profiles FOR SELECT TO authenticated USING (is_superadmin());
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);

-- 2.2 Tenants (Lojas) - Evita "Nada" na lista
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Superadmin view all tenants" ON public.tenants;
CREATE POLICY "Superadmin view all tenants" ON public.tenants FOR SELECT TO authenticated USING (is_superadmin());

-- 2.3 Sales, Clients, Products (Dados Internos)
ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Superadmin view all sales" ON public.sales;
CREATE POLICY "Superadmin view all sales" ON public.sales FOR SELECT TO authenticated USING (is_superadmin());

ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Superadmin view all clients" ON public.clients;
CREATE POLICY "Superadmin view all clients" ON public.clients FOR SELECT TO authenticated USING (is_superadmin());

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Superadmin view all products" ON public.products;
CREATE POLICY "Superadmin view all products" ON public.products FOR SELECT TO authenticated USING (is_superadmin());


-- PARTE 3: RECRIAR AS FUNÇÕES DE AÇÃO DO MASTER (RPCs)
-- Necessário para o botão "Admin" e criação de lojas funcionarem

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Busca Lista de Tenants (Bypass)
-- Busca Lista de Tenants (Bypass)
CREATE OR REPLACE FUNCTION public.get_admin_tenants_list()
RETURNS JSON AS $$
DECLARE
  v_result JSON;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'superadmin') THEN
    RAISE EXCEPTION 'Access Denied';
  END IF;

  SELECT json_agg(t) INTO v_result FROM (
    SELECT 
      t.id, t.name, t.slug, t.custom_domain, t.niche, t.status, t.subscription_status, t.trial_ends_at, t.created_at,
      (SELECT p.email FROM public.profiles p WHERE p.tenant_id = t.id AND p.role = 'admin' LIMIT 1) as owner_email
    FROM public.tenants t
    ORDER BY t.created_at DESC
  ) t;

  RETURN coalesce(v_result, '[]'::json);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Busca Admin
CREATE OR REPLACE FUNCTION public.get_tenant_admin_profile(p_tenant_id UUID)
RETURNS JSON AS $$
DECLARE
  v_admin_profile JSON;
BEGIN
  SELECT row_to_json(p) INTO v_admin_profile FROM public.profiles p WHERE p.tenant_id = p_tenant_id AND p.role = 'admin' LIMIT 1;
  IF v_admin_profile IS NULL THEN RETURN json_build_object('status', 'error', 'message', 'Admin não encontrado'); END IF;
  RETURN json_build_object('status', 'success', 'data', v_admin_profile);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Reset de Senha (Master)
CREATE OR REPLACE FUNCTION public.master_reset_user_password(p_target_email TEXT, p_new_password TEXT)
RETURNS JSON AS $$
DECLARE v_user_id UUID;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'superadmin') THEN RAISE EXCEPTION 'Access Denied'; END IF;
  SELECT id INTO v_user_id FROM auth.users WHERE email = p_target_email;
  IF v_user_id IS NULL THEN RETURN json_build_object('status', 'error', 'message', 'User not found.'); END IF;
  UPDATE auth.users SET encrypted_password = crypt(p_new_password, gen_salt('bf')) WHERE id = v_user_id;
  RETURN json_build_object('status', 'success', 'message', 'Password reset successfully.');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Confirma Email (Master)
CREATE OR REPLACE FUNCTION public.master_confirm_user_email(p_target_email TEXT)
RETURNS JSON AS $$
DECLARE v_user_id UUID;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'superadmin') THEN RAISE EXCEPTION 'Access Denied'; END IF;
  SELECT id INTO v_user_id FROM auth.users WHERE email = p_target_email;
  IF v_user_id IS NULL THEN RETURN json_build_object('status', 'error', 'message', 'User not found.'); END IF;
  UPDATE auth.users SET email_confirmed_at = NOW() WHERE id = v_user_id;
  RETURN json_build_object('status', 'success', 'message', 'Email confirmed successfully.');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Atualiza Email (Master)
CREATE OR REPLACE FUNCTION public.master_update_user_email(p_old_email TEXT, p_new_email TEXT)
RETURNS JSON AS $$
DECLARE v_user_id UUID;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'superadmin') THEN RAISE EXCEPTION 'Access Denied'; END IF;
  SELECT id INTO v_user_id FROM auth.users WHERE email = p_old_email;
  IF v_user_id IS NULL THEN RETURN json_build_object('status', 'error', 'message', 'User not found.'); END IF;
  IF EXISTS (SELECT 1 FROM auth.users WHERE email = p_new_email) THEN RETURN json_build_object('status', 'error', 'message', 'New email is already in use.'); END IF;
  UPDATE auth.users SET email = p_new_email, email_confirmed_at = NOW() WHERE id = v_user_id;
  UPDATE public.profiles SET email = p_new_email WHERE id = v_user_id;
  RETURN json_build_object('status', 'success', 'message', 'Email updated successfully.');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fallback de Auth (Get Role)
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS JSON AS $$
DECLARE v_result JSON;
BEGIN
  SELECT json_build_object('role', p.role, 'permissions', p.permissions, 'tenant_id', p.tenant_id) INTO v_result
  FROM public.profiles p WHERE p.id = auth.uid();
  IF v_result IS NULL THEN RETURN json_build_object('role', 'none'); END IF;
  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
