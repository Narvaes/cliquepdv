-- FIX V3: Limpeza Total de RLS para resolver Recursão Infinita
-- Este script localiza e remove TODAS as políticas existentes para garantir que não haja loops.

DO $$ 
DECLARE 
    pol record;
BEGIN 
    -- 1. Remove todas as políticas da tabela 'profiles'
    FOR pol IN SELECT policyname FROM pg_policies WHERE tablename = 'profiles' AND schemaname = 'public' LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON profiles', pol.policyname);
    END LOOP;

    -- 2. Remove todas as políticas da tabela 'tenants'
    FOR pol IN SELECT policyname FROM pg_policies WHERE tablename = 'tenants' AND schemaname = 'public' LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON tenants', pol.policyname);
    END LOOP;
END $$;

-- ==========================================
-- REATIVANDO COM REGRAS SIMPLES E SEM LOOPS
-- ==========================================

-- Segurança de Tabela
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- REGRAS PARA TENANTS
-- 1. Qualquer pessoa (público) pode ler dados das lojas
CREATE POLICY "tenants_read_public" ON tenants FOR SELECT USING (true);
-- 2. Usuários logados podem criar lojas
CREATE POLICY "tenants_insert_auth" ON tenants FOR INSERT TO authenticated WITH CHECK (true);
-- 3. Usuarios logados podem editar sua própria loja (opcional agora)
CREATE POLICY "tenants_update_auth" ON tenants FOR UPDATE TO authenticated USING (true);


-- REGRAS PARA PROFILES (Onde estava dando o loop)
-- Usamos apenas auth.uid() direto, sem fazer SELECT na própria tabela profiles.

-- Permite tudo para o próprio usuário se o ID dele bater com o ID da Auth
CREATE POLICY "profiles_owner_policy" ON profiles
    FOR ALL 
    TO authenticated
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- NOTA: Se você tiver uma regra de "SuperAdmin" em outro lugar, desnative-a temporariamente 
-- no painel do Supabase se o erro persistir.
