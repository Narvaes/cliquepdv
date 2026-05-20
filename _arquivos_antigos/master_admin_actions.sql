-- ========================================================
-- MASTER ADMIN ACTIONS (Supabase RPCs)
-- ========================================================
-- Enable pg_crypto for password hashing if not already enabled
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 1. Confirm User Email (Force Verify)
CREATE OR REPLACE FUNCTION public.master_confirm_user_email(p_target_email TEXT)
RETURNS JSON AS $$
DECLARE
  v_user_id UUID;
BEGIN
  -- Check permission (only superadmin)
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'superadmin'
  ) THEN
    RAISE EXCEPTION 'Access Denied: Only Super Admins can perform this action.';
  END IF;

  SELECT id INTO v_user_id FROM auth.users WHERE email = p_target_email;
  
  IF v_user_id IS NULL THEN
    RETURN json_build_object('status', 'error', 'message', 'User not found.');
  END IF;

  UPDATE auth.users 
  SET email_confirmed_at = NOW() 
  WHERE id = v_user_id;

  RETURN json_build_object('status', 'success', 'message', 'Email confirmed successfully.');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- 2. Update User Email (Fix Typo / Change Owner)
CREATE OR REPLACE FUNCTION public.master_update_user_email(p_old_email TEXT, p_new_email TEXT)
RETURNS JSON AS $$
DECLARE
  v_user_id UUID;
BEGIN
  -- Check permission
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'superadmin'
  ) THEN
    RAISE EXCEPTION 'Access Denied: Only Super Admins can perform this action.';
  END IF;

  SELECT id INTO v_user_id FROM auth.users WHERE email = p_old_email;

  IF v_user_id IS NULL THEN
    RETURN json_build_object('status', 'error', 'message', 'User not found.');
  END IF;

  -- Verify if new email is taken
  IF EXISTS (SELECT 1 FROM auth.users WHERE email = p_new_email) THEN
    RETURN json_build_object('status', 'error', 'message', 'New email is already in use.');
  END IF;

  -- Update Auth
  UPDATE auth.users 
  SET email = p_new_email, 
      email_confirmed_at = NOW() -- Auto confirm the new one too
  WHERE id = v_user_id;

  -- Update Profile
  UPDATE public.profiles 
  SET email = p_new_email 
  WHERE id = v_user_id;

  RETURN json_build_object('status', 'success', 'message', 'Email updated successfully.');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- 3. Reset User Password (Force Set New Password)
CREATE OR REPLACE FUNCTION public.master_reset_user_password(p_target_email TEXT, p_new_password TEXT)
RETURNS JSON AS $$
DECLARE
  v_user_id UUID;
BEGIN
  -- Check permission
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'superadmin'
  ) THEN
    RAISE EXCEPTION 'Access Denied: Only Super Admins can perform this action.';
  END IF;

  SELECT id INTO v_user_id FROM auth.users WHERE email = p_target_email;

  IF v_user_id IS NULL THEN
    RETURN json_build_object('status', 'error', 'message', 'User not found.');
  END IF;

  -- Update Password
  UPDATE auth.users 
  SET encrypted_password = crypt(p_new_password, gen_salt('bf'))
  WHERE id = v_user_id;

  RETURN json_build_object('status', 'success', 'message', 'Password reset successfully.');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Get Tenant Admin Profile (Bypass RLS for Master Admin UI)
CREATE OR REPLACE FUNCTION public.get_tenant_admin_profile(p_tenant_id UUID)
RETURNS JSON AS $$
DECLARE
  v_admin_profile JSON;
BEGIN
  -- Tenta buscar o primeiro admin da loja
  SELECT row_to_json(p) INTO v_admin_profile
  FROM public.profiles p
  WHERE p.tenant_id = p_tenant_id
  AND p.role = 'admin'
  LIMIT 1;

  IF v_admin_profile IS NULL THEN
     RETURN json_build_object('status', 'error', 'message', 'Admin não encontrado');
  END IF;

  RETURN json_build_object('status', 'success', 'data', v_admin_profile);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Get Current User Role (Safe Fallback for AuthContext)
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS JSON AS $$
DECLARE
  v_result JSON;
BEGIN
  SELECT json_build_object(
    'role', p.role,
    'permissions', p.permissions,
    'tenant_id', p.tenant_id
  ) INTO v_result
  FROM public.profiles p
  WHERE p.id = auth.uid();

  IF v_result IS NULL THEN
     RETURN json_build_object('role', 'none');
  END IF;

  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Get All Tenants (Bypass RLS for Super Admin Dashboard)
CREATE OR REPLACE FUNCTION public.get_admin_tenants_list()
RETURNS TABLE (
  id UUID,
  name TEXT,
  slug TEXT,
  custom_domain TEXT,
  niche TEXT,
  status TEXT,
  subscription_status TEXT,
  trial_ends_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ,
  owner_email TEXT
) AS $$
BEGIN
  -- Check permission
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'superadmin'
  ) THEN
    RAISE EXCEPTION 'Access Denied';
  END IF;

  RETURN QUERY
  SELECT 
    t.id,
    t.name,
    t.slug,
    t.custom_domain,
    t.niche,
    t.status,
    t.subscription_status,
    t.trial_ends_at,
    t.created_at,
    (SELECT p.email FROM public.profiles p WHERE p.tenant_id = t.id AND p.role = 'admin' LIMIT 1) as owner_email
  FROM public.tenants t
  ORDER BY t.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
