-- Reativar RLS com políticas corretas para categories
-- Execute este script para adicionar segurança adequada

-- 1. Reativar RLS
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- 2. Remover políticas antigas se existirem
DROP POLICY IF EXISTS "Allow all for authenticated users" ON categories;
DROP POLICY IF EXISTS "Users can view categories" ON categories;
DROP POLICY IF EXISTS "Users can insert categories" ON categories;
DROP POLICY IF EXISTS "Users can update categories" ON categories;
DROP POLICY IF EXISTS "Users can delete categories" ON categories;

-- 3. Criar políticas simples e funcionais

-- Permitir SELECT para usuários autenticados
CREATE POLICY "Enable read access for authenticated users"
ON categories FOR SELECT
TO authenticated
USING (true);

-- Permitir INSERT para usuários autenticados
CREATE POLICY "Enable insert for authenticated users"
ON categories FOR INSERT
TO authenticated
WITH CHECK (true);

-- Permitir UPDATE para usuários autenticados
CREATE POLICY "Enable update for authenticated users"
ON categories FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Permitir DELETE para usuários autenticados
CREATE POLICY "Enable delete for authenticated users"
ON categories FOR DELETE
TO authenticated
USING (true);

-- Comentário explicativo
COMMENT ON TABLE categories IS 'Product categories - RLS enabled with permissive policies for authenticated users';
