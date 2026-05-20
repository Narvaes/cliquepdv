-- ========================================================
-- CORREÇÃO FINAL: LIBERAÇÃO DE PERMISSÕES PARA SUPER ADMIN
-- ========================================================

-- Este script garante que o Super Admin (role='superadmin') possa visualizar
-- dados de TODAS as tabelas essenciais (tenants, sales, clients, products).

-- 1. Garante que a função de verificação segura existe (caso o user não tenha rodado o anterior)
CREATE OR REPLACE FUNCTION public.is_superadmin()
RETURNS BOOLEAN AS $$
DECLARE
  v_role TEXT;
BEGIN
  -- Security Definer permite ler a tabela profiles sem restrição de RLS do caller
  SELECT role INTO v_role
  FROM public.profiles
  WHERE id = auth.uid();
  
  RETURN v_role = 'superadmin';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- 2. Atualiza políticas da tabela TENANTS
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;

-- Política para Super Admin ver TODAS as lojas
DROP POLICY IF EXISTS "Superadmin view all tenants" ON public.tenants;
CREATE POLICY "Superadmin view all tenants"
ON public.tenants FOR SELECT
TO authenticated
USING (is_superadmin());

-- (Opcional) Política padrão existente: usuários veem seu próprio tenant (se houver link)
-- Mas o foco aqui é destrava o Super Admin.


-- 3. Atualiza políticas da tabela SALES (Vendas)
ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Superadmin view all sales" ON public.sales;
CREATE POLICY "Superadmin view all sales"
ON public.sales FOR SELECT
TO authenticated
USING (is_superadmin());


-- 4. Atualiza políticas da tabela CLIENTS (Clientes)
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Superadmin view all clients" ON public.clients;
CREATE POLICY "Superadmin view all clients"
ON public.clients FOR SELECT
TO authenticated
USING (is_superadmin());


-- 5. Atualiza políticas da tabela PRODUCTS (Produtos)
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Superadmin view all products" ON public.products;
CREATE POLICY "Superadmin view all products"
ON public.products FOR SELECT
TO authenticated
USING (is_superadmin());


-- 6. Atualiza políticas da tabela CATEGORIES (Categorias)
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Superadmin view all categories" ON public.categories;
CREATE POLICY "Superadmin view all categories"
ON public.categories FOR SELECT
TO authenticated
USING (is_superadmin());

-- ========================================================
-- FIM DA CORREÇÃO
-- ========================================================
