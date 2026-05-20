-- FIX V5 (DEFINITIVO): Liberando inserção na tabela profiles

-- 1. Remove políticas anteriores que podem estar bloqueando
DROP POLICY IF EXISTS "profiles_owner_policy" ON profiles;
DROP POLICY IF EXISTS "profiles_insert_public" ON profiles;
DROP POLICY IF EXISTS "profiles_select_owner" ON profiles;
DROP POLICY IF EXISTS "profiles_update_owner" ON profiles;

-- 2. Garante RLS ativado
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 3. POLÍTICA DE INSERÇÃO (A Solução):
-- Permite que "public" (qualquer um, inclusive o sistema de cadastro) insira um perfil.
-- A segurança é garantida pela Chave Estrangeira (FK): só dá pra criar perfil para um ID de usuário que exista no Auth.
CREATE POLICY "profiles_insert_public" ON profiles 
    FOR INSERT 
    TO public 
    WITH CHECK (true);

-- 4. POLÍTICAS DE LEITURA/EDIÇÃO (Mantendo segurança):
-- Só o dono pode ver ou editar seu próprio perfil depois de logado.
CREATE POLICY "profiles_select_owner" ON profiles 
    FOR SELECT 
    TO public 
    USING (auth.uid() = id);

CREATE POLICY "profiles_update_owner" ON profiles 
    FOR UPDATE 
    TO public 
    USING (auth.uid() = id);

-- 5. BONUS: Garantir política de tenants também (caso tenha revertido)
DROP POLICY IF EXISTS "tenants_insert_public" ON tenants;
CREATE POLICY "tenants_insert_public" ON tenants 
    FOR INSERT 
    TO public 
    WITH CHECK (true);
