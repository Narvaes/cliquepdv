-- ============================================
-- SOLUÇÃO DEFINITIVA: Desabilitar RLS Temporariamente para Signup
-- ============================================
-- Esta é uma solução mais simples que permite o signup funcionar
-- enquanto mantém segurança para outras operações

-- Passo 1: Remover TODAS as policies existentes
DO $$ 
DECLARE
    r RECORD;
BEGIN
    -- Remove todas as policies de profiles
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'profiles') LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON profiles';
    END LOOP;
    
    -- Remove todas as policies de tenants
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'tenants') LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON tenants';
    END LOOP;
END $$;

-- Passo 2: Criar função helper segura
CREATE OR REPLACE FUNCTION public.get_user_tenant_id()
RETURNS UUID
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT tenant_id FROM profiles WHERE id = auth.uid() LIMIT 1;
$$;

-- Passo 3: Policies SUPER SIMPLES para profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Qualquer usuário autenticado pode inserir seu próprio perfil
CREATE POLICY "allow_insert_own_profile"
ON profiles FOR INSERT
TO authenticated
WITH CHECK (id = auth.uid());

-- Usuários podem ver seu próprio perfil
CREATE POLICY "allow_select_own_profile"
ON profiles FOR SELECT
TO authenticated
USING (id = auth.uid());

-- Usuários podem atualizar seu próprio perfil
CREATE POLICY "allow_update_own_profile"
ON profiles FOR UPDATE
TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

-- Passo 4: Policies SUPER SIMPLES para tenants
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;

-- Qualquer usuário autenticado pode criar tenant (para signup)
CREATE POLICY "allow_insert_tenant_on_signup"
ON tenants FOR INSERT
TO authenticated
WITH CHECK (true);

-- Usuários podem ver tenants onde têm perfil
CREATE POLICY "allow_select_own_tenant"
ON tenants FOR SELECT
TO authenticated
USING (
    id = get_user_tenant_id()
);

-- Usuários podem atualizar seu próprio tenant
CREATE POLICY "allow_update_own_tenant"
ON tenants FOR UPDATE
TO authenticated
USING (id = get_user_tenant_id())
WITH CHECK (id = get_user_tenant_id());

-- Passo 5: Garantir permissões
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Passo 6: Refresh
NOTIFY pgrst, 'reload config';

-- Verificação (execute depois):
-- SELECT tablename, policyname, cmd FROM pg_policies WHERE tablename IN ('profiles', 'tenants');
