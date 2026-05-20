-- Create a secure function to check role bypassing RLS
CREATE OR REPLACE FUNCTION get_current_user_role()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER -- Runs with privileges of the creator (postgres/superuser)
SET search_path = public
AS $$
DECLARE
    curr_user_id UUID;
    user_role text;
    user_perms jsonb;
BEGIN
    curr_user_id := auth.uid();
    
    -- 1. Check if user is logged in
    IF curr_user_id IS NULL THEN
        RETURN json_build_object('error', 'Not logged in');
    END IF;

    -- 2. Try to get profile
    SELECT role, permissions INTO user_role, user_perms
    FROM profiles
    WHERE id = curr_user_id;

    -- 3. If no profile, try to create one (Self-Repair for Lucas)
    IF user_role IS NULL THEN
        -- Check if it's the specific superadmin email
        IF (SELECT email FROM auth.users WHERE id = curr_user_id) = 'lucas.narvaes@gmail.com' THEN
            INSERT INTO profiles (id, email, role, permissions, full_name)
            VALUES (
                curr_user_id, 
                'lucas.narvaes@gmail.com', 
                'superadmin', 
                '["read_all", "manage_tenants", "delete_tenants", "manage_financial", "manage_admins"]'::jsonb,
                'Super Admin Lucas'
            )
            ON CONFLICT (id) DO UPDATE 
            SET role = 'superadmin' -- Force update if conflict occurred cleanly
            RETURNING role, permissions INTO user_role, user_perms;
        ELSE
            RETURN json_build_object('role', 'none', 'error', 'Profile not found');
        END IF;
    END IF;

    RETURN json_build_object(
        'role', COALESCE(user_role, 'none'),
        'permissions', COALESCE(user_perms, '[]'::jsonb)
    );
END;
$$;
