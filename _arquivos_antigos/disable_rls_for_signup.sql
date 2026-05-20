-- ============================================
-- SOLUÇÃO EXTREMA: Desabilitar RLS Completamente para Signup
-- ============================================
-- Esta é a solução mais direta - desabilita RLS nas tabelas críticas
-- para permitir signup funcionar. Depois podemos reabilitar com policies corretas.

-- ATENÇÃO: Isso remove a segurança RLS. Use apenas em desenvolvimento/teste!

-- Desabilitar RLS em tenants (temporariamente)
ALTER TABLE tenants DISABLE ROW LEVEL SECURITY;

-- Desabilitar RLS em profiles (temporariamente)
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- Desabilitar RLS em settings (se existir)
ALTER TABLE settings DISABLE ROW LEVEL SECURITY;

-- Desabilitar RLS em categories
ALTER TABLE categories DISABLE ROW LEVEL SECURITY;

-- Desabilitar RLS em products
ALTER TABLE products DISABLE ROW LEVEL SECURITY;

-- Refresh
NOTIFY pgrst, 'reload config';

-- NOTA: Depois que o signup funcionar, podemos reabilitar RLS com policies corretas
-- Para reabilitar depois:
-- ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
-- etc...
