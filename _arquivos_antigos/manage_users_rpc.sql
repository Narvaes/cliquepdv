-- ========================================================
-- SISTEMA DE GESTÃO DE EQUIPE (CLIQUE PDV) - v2
-- ========================================================

-- RPC para um Admin de Loja criar/gerenciar funcionários
CREATE OR REPLACE FUNCTION public.manage_tenant_user(
  p_email TEXT,
  p_password TEXT DEFAULT NULL,
  p_full_name TEXT DEFAULT NULL,
  p_role TEXT DEFAULT 'cashier', -- 'admin' ou 'cashier'
  p_permissions JSONB DEFAULT '[]'::jsonb,
  p_tenant_id UUID DEFAULT NULL,
  p_action TEXT DEFAULT 'create' -- 'create', 'update', 'delete'
) RETURNS JSON AS $$
DECLARE
  v_user_id UUID;
  v_caller_role TEXT;
  v_caller_tenant UUID;
  v_meta JSONB;
BEGIN
  -- 1. Verificação de Segurança (Quem está chamando?)
  -- Apenas admins do mesmo tenant ou superadmins podem gerenciar usuários
  SELECT role, tenant_id INTO v_caller_role, v_caller_tenant 
  FROM public.profiles WHERE id = auth.uid();

  IF v_caller_role != 'superadmin' AND (v_caller_role != 'admin' OR v_caller_tenant != p_tenant_id) THEN
    RAISE EXCEPTION 'Acesso negado: Você não tem permissão para gerenciar usuários desta loja.';
  END IF;

  -- 2. Ação: DELETE
  IF p_action = 'delete' THEN
    SELECT id INTO v_user_id FROM public.profiles WHERE email = p_email AND tenant_id = p_tenant_id;
    IF v_user_id IS NULL THEN
      RETURN json_build_object('status', 'error', 'message', 'Usuário não encontrado nesta loja.');
    END IF;
    
    DELETE FROM public.profiles WHERE id = v_user_id;
    -- Nota: O usuário continua no Auth, mas perde acesso total ao tenant no public.profiles
    RETURN json_build_object('status', 'success', 'message', 'Usuário removido da equipe.');
  END IF;

  -- 3. Ação: UPDATE
  IF p_action = 'update' THEN
    SELECT id INTO v_user_id FROM public.profiles WHERE email = p_email AND tenant_id = p_tenant_id;
    IF v_user_id IS NULL THEN
      RETURN json_build_object('status', 'error', 'message', 'Usuário não encontrado.');
    END IF;

    UPDATE public.profiles SET 
      full_name = COALESCE(p_full_name, full_name),
      role = p_role,
      permissions = p_permissions
    WHERE id = v_user_id;

    -- Se senha foi fornecida, atualiza no auth.users
    IF p_password IS NOT NULL AND p_password <> '' THEN
      UPDATE auth.users SET encrypted_password = crypt(p_password, gen_salt('bf'))
      WHERE id = v_user_id;
    END IF;

    RETURN json_build_object('status', 'success', 'message', 'Usuário atualizado com sucesso.');
  END IF;

  -- 4. Ação: CREATE
  -- Verifica se já existe no Auth
  SELECT id INTO v_user_id FROM auth.users WHERE email = p_email LIMIT 1;

  IF v_user_id IS NOT NULL THEN
    -- Se já existe, apenas vinculamos/atualizamos no profiles
    INSERT INTO public.profiles (id, email, full_name, role, permissions, tenant_id)
    VALUES (v_user_id, p_email, p_full_name, p_role, p_permissions, p_tenant_id)
    ON CONFLICT (id) DO UPDATE SET 
      full_name = p_full_name,
      role = p_role,
      permissions = p_permissions,
      tenant_id = p_tenant_id;
      
    RETURN json_build_object('status', 'success', 'message', 'Usuário vinculado/atualizado com sucesso.', 'id', v_user_id);
  END IF;

  -- Criar novo usuário no Auth
  v_user_id := gen_random_uuid();
  v_meta := jsonb_build_object('full_name', p_full_name, 'role', p_role);

  INSERT INTO auth.users (
    id, 
    email, 
    encrypted_password, 
    email_confirmed_at, 
    role, 
    aud, 
    raw_user_meta_data, 
    raw_app_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    recovery_token,
    email_change_token_new,
    email_change
  )
  VALUES (
    v_user_id, 
    p_email, 
    crypt(p_password, gen_salt('bf')), 
    NOW(), 
    'authenticated', 
    'authenticated', 
    v_meta, 
    '{"provider": "email", "providers": ["email"]}',
    NOW(),
    NOW(),
    '',
    '',
    '',
    ''
  );

  INSERT INTO public.profiles (id, email, full_name, role, permissions, tenant_id)
  VALUES (v_user_id, p_email, p_full_name, p_role, p_permissions, p_tenant_id);

  RETURN json_build_object('status', 'success', 'message', 'Novo usuário de equipe criado.', 'id', v_user_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, auth;
