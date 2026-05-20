-- Enable pgcrypto for password hashing
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- RPC to Create a New Admin User (Bypassing Public Signup)
CREATE OR REPLACE FUNCTION create_new_admin_user(
    new_email TEXT,
    new_password TEXT,
    new_role TEXT,
    new_permissions JSONB
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    new_id UUID;
    existing_id UUID;
BEGIN
    -- 1. Check if user already exists
    SELECT id INTO existing_id FROM auth.users WHERE email = new_email;
    
    IF existing_id IS NOT NULL THEN
        -- User exists, update role/perms
        UPDATE public.profiles 
        SET role = new_role, permissions = new_permissions
        WHERE id = existing_id;
        
        RETURN json_build_object('status', 'updated', 'id', existing_id);
    END IF;

    -- 2. Create new Auth User
    new_id := gen_random_uuid();
    
    INSERT INTO auth.users (
        instance_id,
        id,
        aud,
        role,
        email,
        encrypted_password,
        email_confirmed_at,
        created_at,
        updated_at,
        confirmation_token,
        email_change_token_new,
        recovery_token
    ) VALUES (
        '00000000-0000-0000-0000-000000000000', -- Default instance_id
        new_id,
        'authenticated',
        'authenticated',
        new_email,
        crypt(new_password, gen_salt('bf')), -- Hash password
        NOW(), -- Auto confirm
        NOW(),
        NOW(),
        '',
        '',
        ''
    );

    -- 3. Create Profile (Trigger usually does this, but we force it to ensure correct data immediately)
    INSERT INTO public.profiles (id, email, role, permissions, full_name, tenant_id)
    VALUES (
        new_id,
        new_email,
        new_role,
        new_permissions,
        'Novo Admin',
        NULL -- Super Admins have no tenant
    )
    ON CONFLICT (id) DO UPDATE
    SET role = new_role, permissions = new_permissions;

    -- 4. Create Identity (Optional but good for Supabase consistency)
    INSERT INTO auth.identities (
        id,
        user_id,
        identity_data,
        provider,
        last_sign_in_at,
        created_at,
        updated_at
    ) VALUES (
        gen_random_uuid(),
        new_id,
        format('{"sub":"%s","email":"%s"}', new_id, new_email)::jsonb,
        'email',
        NOW(),
        NOW(),
        NOW()
    );

    RETURN json_build_object('status', 'created', 'id', new_id);
END;
$$;
