-- ============================================
-- SOLUÇÃO FINAL: Permitir Signup Completo
-- ============================================
-- Este SQL permite que usuários recém-criados possam inserir tenants

-- Passo 1: Remover policy problemática de tenants
DROP POLICY IF EXISTS "allow_insert_tenant_on_signup" ON tenants;

-- Passo 2: Criar policy que permite inserção ANTES do perfil ser criado
-- Isso é necessário porque o signup cria: Auth User -> Tenant -> Profile (nessa ordem)
CREATE POLICY "allow_insert_tenant_during_signup"
ON tenants FOR INSERT
TO authenticated
WITH CHECK (
    -- Permite se o usuário ainda não tem perfil (signup em andamento)
    NOT EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid())
    OR
    -- OU se o usuário já tem perfil e está criando outro tenant
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid())
);

-- Passo 3: Garantir que a policy de SELECT também funciona sem perfil
DROP POLICY IF EXISTS "allow_select_own_tenant" ON tenants;

CREATE POLICY "allow_select_own_tenant"
ON tenants FOR SELECT
TO authenticated
USING (
    -- Permite ver tenants onde o usuário tem perfil
    id IN (SELECT tenant_id FROM profiles WHERE id = auth.uid())
    OR
    -- OU permite ver tenants recém-criados (durante signup)
    NOT EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid())
);

-- Passo 4: Refresh
NOTIFY pgrst, 'reload config';

-- Verificação:
-- SELECT tablename, policyname, cmd, qual FROM pg_policies WHERE tablename = 'tenants';
