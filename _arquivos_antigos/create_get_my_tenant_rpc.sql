-- create_get_my_tenant_rpc.sql

-- Resolve "get_my_tenant is not a function" error and prevent infinite loader loops in Auth.
CREATE OR REPLACE FUNCTION public.get_my_tenant()
RETURNS JSON AS $$
DECLARE
  v_result JSON;
  v_tenant_id UUID;
BEGIN
  -- 1. Find the tenant_id from the user's profile
  SELECT tenant_id INTO v_tenant_id 
  FROM public.profiles 
  WHERE id = auth.uid();
  
  -- 2. If no tenant_id is found, return error format so the frontend can handle it
  IF v_tenant_id IS NULL THEN
    RETURN json_build_object('error', 'User has no associated tenant');
  END IF;

  -- 3. Fetch the tenant details directly overcoming any complex RLS recursion limitations
  SELECT row_to_json(t) INTO v_result 
  FROM public.tenants t 
  WHERE t.id = v_tenant_id;
  
  -- 4. If somehow tenant_id exists but tenant is deleted/missing
  IF v_result IS NULL THEN
    RETURN json_build_object('error', 'Associated tenant not found');
  END IF;

  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
