-- ========================================================
-- SCRIPT DE CORREÇÃO DEFINITIVA (V7) - CLIQUE PDV
-- ========================================================
-- Este script faz 3 coisas:
-- 1. Corrige RLS para permitir cadastro sem erros
-- 2. Reconstrói a integridade referencial (FK) entre Auth e Public
-- 3. Implementa a RPC Blindada que resolve Race Conditions

-- 1. Limpeza e Reforço de RLS
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "tenants_public_select" ON tenants;
DROP POLICY IF EXISTS "tenants_insert_public" ON tenants;
CREATE POLICY "tenants_public_select" ON tenants FOR SELECT USING (true);
CREATE POLICY "tenants_insert_public" ON tenants FOR INSERT TO public WITH CHECK (true);

DROP POLICY IF EXISTS "profiles_insert_public" ON profiles;
DROP POLICY IF EXISTS "profiles_select_own" ON profiles;
CREATE POLICY "profiles_insert_public" ON profiles FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "profiles_select_own" ON profiles FOR SELECT TO public USING (auth.uid() = id);

-- 2. Consertar a Chave Estrangeira (O CORAÇÃO DO ERRO)
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- 3. RPC Blindada (signup_new_store)
CREATE OR REPLACE FUNCTION public.signup_new_store(
  p_user_id UUID,
  p_email TEXT,
  p_full_name TEXT,
  p_store_name TEXT,
  p_slug TEXT,
  p_niche TEXT,
  p_whatsapp TEXT
) RETURNS void AS $$
DECLARE
  v_tenant_id UUID;
  v_final_user_id UUID;
BEGIN
  -- A. Validação Interna de Slug (Mais confiável que o frontend)
  IF EXISTS (SELECT 1 FROM public.tenants WHERE slug = p_slug) THEN
    RAISE EXCEPTION 'O identificador "% " já está em uso. Escolha outro.', p_slug;
  END IF;

  -- B. Localizar User ID Real (Race condition fix)
  -- Às vezes o ID passado pelo front ainda não "propagou" pro banco
  SELECT id INTO v_final_user_id FROM auth.users WHERE email = p_email LIMIT 1;
  
  -- Se não achou na primeira, espera 1 segundo (pg_sleep) e tenta de novo
  IF v_final_user_id IS NULL THEN
     PERFORM pg_sleep(1);
     SELECT id INTO v_final_user_id FROM auth.users WHERE email = p_email LIMIT 1;
  END IF;

  -- Se após o delay ainda não achar, usa o ID passado ou o Auth.uid()
  v_final_user_id := COALESCE(v_final_user_id, p_user_id, auth.uid());

  -- Se v_final_user_id for NULL aqui, vai dar erro de FK mas agora com logs melhores
  IF v_final_user_id IS NULL THEN
    RAISE EXCEPTION 'Erro de Sincronização: Usuário não encontrado no sistema de autenticação.';
  END IF;

  -- 4. Inserir Tenant (Loja)
  INSERT INTO public.tenants (name, slug, niche, status, subscription_status)
  VALUES (p_store_name, p_slug, p_niche, 'active', 'trial')
  RETURNING id INTO v_tenant_id;

  -- 5. Inserir Perfil (Dono)
  INSERT INTO public.profiles (id, email, full_name, role, tenant_id, permissions)
  VALUES (
    v_final_user_id, 
    p_email, 
    p_full_name, 
    'admin', 
    v_tenant_id,
    '["read_all", "manage_tenant"]'::jsonb
  )
  ON CONFLICT (id) DO UPDATE SET 
    full_name = p_full_name,
    tenant_id = v_tenant_id;

END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, auth;
