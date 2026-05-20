import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTenant } from '../../context/TenantContext';
import { Loader2, ShieldAlert } from 'lucide-react';

export const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { session, profile, loading: authLoading, signOut } = useAuth();
    const { tenant, isLoading: tenantLoading } = useTenant();
    const location = useLocation();

    if (authLoading || tenantLoading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-neutral-50 gap-4">
                <Loader2 className="animate-spin text-amber-500" size={40} />
                <p className="text-neutral-500 font-medium">Verificando autorização...</p>
            </div>
        );
    }

    if (!session) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // Tenant Verification: Admins and Cashiers must belong to the tenant.
    // Super Admins bypass this to allow managing any store panel.
    const isSuperAdmin = profile?.role === 'superadmin';
    const belongsToTenant = profile?.tenant_id === tenant?.id;

    // AUTO-REDIRECT: If Logged in as Admin/User but NO Tenant Context (Platform Mode)
    // We should redirect them to their tenant's scope
    if (session && !isSuperAdmin && !tenant && profile?.tenant_id) {
        return <TenantRedirectLoader profile={profile} signOut={signOut} />;
    }

    if (profile && tenant && !isSuperAdmin && !belongsToTenant) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-red-50 p-6 text-center">
                <div className="w-20 h-20 bg-red-100 rounded-3xl flex items-center justify-center text-red-600 mb-6 font-bold uppercase tracking-widest group">
                    <ShieldAlert size={40} />
                </div>
                <h1 className="text-2xl font-black text-neutral-900 mb-2">Acesso Negado</h1>
                <p className="text-neutral-600 max-w-md mb-8">
                    Sua conta não tem permissão para acessar o painel desta loja (**{tenant.name}**).
                </p>
                <div className="flex gap-4">
                    <button
                        onClick={() => window.location.href = '/'}
                        className="px-8 py-3 bg-neutral-200 text-neutral-700 rounded-2xl font-bold hover:bg-neutral-300 transition-all font-sans text-sm"
                    >
                        Voltar ao Início
                    </button>
                    <button
                        onClick={() => signOut()}
                        className="px-8 py-3 bg-neutral-900 text-white rounded-2xl font-bold hover:bg-black transition-all font-sans text-sm"
                    >
                        Sair e Trocar de Conta
                    </button>
                </div>
            </div>
        );
    }

    return <>{children}</>;
};

const TenantRedirectLoader: React.FC<{ profile: any, signOut: () => void }> = ({ profile, signOut }) => {
    const [hasError, setHasError] = React.useState(false);

    React.useEffect(() => {
        let isMounted = true;

        if (profile.tenant_slug) {
            const currentParams = new URLSearchParams(window.location.search);
            if (currentParams.get('tenant_override') === profile.tenant_slug) {
                // Already here. Stop redirection and show error because tenant couldn't load.
                if (isMounted) setHasError(true);
                return;
            }
            window.location.href = `/admin?tenant_override=${profile.tenant_slug}`;
        } else {
            const resolveAndRedirect = async () => {
                try {
                    const { supabase } = await import('../../lib/supabase');
                    const { data } = await supabase.from('tenants').select('slug').eq('id', profile.tenant_id).single();
                    
                    if (!isMounted) return;

                    if (data?.slug) {
                        const currentParams = new URLSearchParams(window.location.search);
                        if (currentParams.get('tenant_override') === data.slug) {
                            console.warn('[ProtectedRoute] Already on correct tenant scope, but tenant context failed to load.');
                            setHasError(true);
                            return;
                        }
                        window.location.href = `/admin?tenant_override=${data.slug}`;
                    } else {
                        setHasError(true);
                    }
                } catch (err) {
                    console.error('[TenantRedirectLoader] Error resolving tenant slug:', err);
                    if (isMounted) setHasError(true);
                }
            };
            resolveAndRedirect();
        }

        return () => { isMounted = false; };
    }, [profile.tenant_id, profile.tenant_slug]);

    if (hasError) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-red-50 p-6 text-center">
                <div className="w-20 h-20 bg-red-100 rounded-3xl flex items-center justify-center text-red-600 mb-6 font-bold uppercase tracking-widest group">
                    <ShieldAlert size={40} />
                </div>
                <h1 className="text-2xl font-black text-neutral-900 mb-2">Erro de Carregamento</h1>
                <p className="text-neutral-600 max-w-md mb-8">
                    Não foi possível carregar os dados da sua loja corretamente. Tente fazer login novamente.
                </p>
                <div className="flex gap-4">
                    <button
                        onClick={() => signOut()}
                        className="px-8 py-3 bg-neutral-900 text-white rounded-2xl font-bold hover:bg-black transition-all font-sans text-sm"
                    >
                        Sair da Conta
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-neutral-50 gap-4">
            <Loader2 className="animate-spin text-indigo-500" size={40} />
            <p className="text-neutral-500 font-medium">Redirecionando para sua loja...</p>
        </div>
    );
};
