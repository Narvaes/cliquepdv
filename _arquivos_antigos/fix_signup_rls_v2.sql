-- FIX V2: Resolvendo Recursão Infinita no Profiles e Tenants

-- 1. Limpeza de Políticas Antigas do Profiles (Para evitar conflitos/loops)
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles; -- Geralmente a causa do loop
DROP POLICY IF EXISTS "Allow all for authenticated users" ON profiles;

-- 2. Limpeza de Políticas do Tenants
DROP POLICY IF EXISTS "Public can view tenants" ON tenants;
DROP POLICY IF EXISTS "Users can insert their own tenant" ON tenants;
DROP POLICY IF EXISTS "Authenticated users can view tenants" ON tenants;

-- ==========================================
-- NOVAS POLÍTICAS SEM RECURSÃO
-- ==========================================

-- TENANTS
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;

-- Qualquer um pode ver os tenants (necessário para o site carregar a loja certa)
CREATE POLICY "tenants_public_select" ON tenants
    FOR SELECT USING (true);

-- Usuários autenticados podem criar seu próprio tenant durante o signup
CREATE POLICY "tenants_auth_insert" ON tenants
    FOR INSERT TO authenticated
    WITH CHECK (true);


-- PROFILES
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- O usuário só pode ver/inserir/editar o PRÓPRIO perfil comparando direto com o ID da Auth
-- IMPORTANTE: Não fazemos "SELECT" na própria tabela profiles dentro da regra para não dar loop
CREATE POLICY "profiles_self_all" ON profiles
    FOR ALL TO authenticated
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- Se você precisar que o Admin veja outros perfis futuramente, precisaremos usar 
-- uma função ou verificar o role direto no JWT, mas por enquanto isso resolve o cadastro.
