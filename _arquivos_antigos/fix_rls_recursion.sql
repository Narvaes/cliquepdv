-- 1. Criar função segura que verifica se é superadmin (Ignorando o RLS / Evitando Loop)
CREATE OR REPLACE FUNCTION public.check_is_superadmin()
RETURNS BOOLEAN AS $$
DECLARE
  v_role text;
BEGIN
  SELECT role INTO v_role FROM public.profiles WHERE id = auth.uid();
  RETURN coalesce(v_role = 'superadmin', false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 2. Criar função segura que pega o tenant_id do usuário (Ignorando o RLS / Evitando Loop)
CREATE OR REPLACE FUNCTION public.get_user_tenant_id()
RETURNS public.profiles.tenant_id%TYPE AS $$
DECLARE
  v_tenant_id public.profiles.tenant_id%TYPE;
BEGIN
  SELECT tenant_id INTO v_tenant_id FROM public.profiles WHERE id = auth.uid();
  RETURN v_tenant_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;


-- 3. DELETAR AS POLÍTICAS QUE ESTÃO CAUSANDO O LOOP INFINITO
DROP POLICY IF EXISTS "profiles_superadmin_all" ON public.profiles;
DROP POLICY IF EXISTS "Store Admin view tenant profiles" ON public.profiles;


-- 4. RECRIAR AS POLÍTICAS USANDO NOSSAS FUNÇÕES SEGURAS
CREATE POLICY "profiles_superadmin_all_fixed" ON public.profiles
  FOR ALL TO authenticated
  USING ( public.check_is_superadmin() );

CREATE POLICY "store_admin_view_tenant_profiles_fixed" ON public.profiles
  FOR SELECT TO authenticated
  USING ( tenant_id = public.get_user_tenant_id() );
