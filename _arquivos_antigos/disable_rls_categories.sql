-- SOLUÇÃO RÁPIDA: Desabilitar RLS temporariamente para testar
-- Execute este script para permitir que categorias sejam criadas

-- Desabilita RLS na tabela categories
ALTER TABLE categories DISABLE ROW LEVEL SECURITY;

-- Agora você pode criar categorias sem restrições
-- Depois que funcionar, podemos reativar o RLS com policies corretas
