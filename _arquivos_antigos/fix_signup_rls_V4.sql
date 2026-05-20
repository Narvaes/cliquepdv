-- FIX V4: Permitindo Inserção para Usuários Anon/Auth durante o Cadastro

-- 1. Limpeza total de segurança na tabela 'tenants'
DROP POLICY IF EXISTS "tenants_read_public" ON tenants;
DROP POLICY IF EXISTS "tenants_insert_auth" ON tenants;
DROP POLICY IF EXISTS "tenants_update_auth" ON tenants;
DROP POLICY IF EXISTS "Public can view tenants" ON tenants;
DROP POLICY IF EXISTS "Users can insert their own tenant" ON tenants;

-- 2. Configurações para 'tenants'
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;

-- Leitura: Qualquer um pode ver as lojas (necessário para o site carregar)
CREATE POLICY "tenants_read_all" ON tenants FOR SELECT USING (true);

-- Inserção: Permitir tanto 'authenticated' quanto 'anon' (importante para quando o email confirmation está ativado)
CREATE POLICY "tenants_insert_public" ON tenants 
    FOR INSERT 
    TO public 
    WITH CHECK (true);

-- 3. Configurações para 'profiles' (mantendo a segurança)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "profiles_owner_policy" ON profiles;

CREATE POLICY "profiles_owner_policy" ON profiles
    FOR ALL 
    TO public
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- NOTA: Como você está no início, liberar o INSERT para 'public' na tabela tenants 
-- resolve o bloqueio do cadastro agora.
