import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface Tenant {
    id: string;
    name: string;
    slug: string;
    niche: 'bakery' | 'snack_bar' | 'confectionery' | string;
    subscription_status: string;
    custom_domain?: string;
    status: 'active' | 'suspended';
    address?: string;
    cnpj?: string;
    corporate_name?: string;
    show_cnpj_footer?: boolean;
}

interface TenantContextType {
    tenant: Tenant | null;
    isLoading: boolean;
    error: any;
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

export const TenantProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [tenant, setTenant] = useState<Tenant | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<any>(null);

    useEffect(() => {
        const resolveTenant = async () => {
            try {
                const hostname = window.location.hostname;
                const searchParams = new URLSearchParams(window.location.search);
                const tenantOverrideParam = searchParams.get('tenant_override');
                const forcedSlug = searchParams.get('test_slug');

                // Tenta recuperar o override do sessionStorage se não houver no URL
                const savedOverride = sessionStorage.getItem('tenant_override');
                let tenantOverride = tenantOverrideParam || savedOverride;

                // Limpa o override se estiver na home (/) do localhost/domínio principal sem parâmetros
                if (!forcedSlug && !tenantOverrideParam && window.location.pathname === '/') {
                    if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname.split('.').length < 3) {
                        tenantOverride = null;
                        sessionStorage.removeItem('tenant_override');
                    }
                }

                console.log('[TenantResolver] Hostname:', hostname);

                // 0. PRIORIDADE MÁXIMA: Parâmetro de teste (Visualização do Super Admin)
                if (forcedSlug) {
                    const { data, error } = await supabase.from('tenants').select('*').eq('slug', forcedSlug).single();
                    if (!error && data) {
                        console.log('[TenantResolver] Resolved by test_slug param:', forcedSlug);
                        setTenant(data);
                        return;
                    }
                }

                // 1. Override de Super Admin (Gerenciamento)
                if (tenantOverride) {
                    // Tenta busca direta (RLS)
                    let { data, error } = await supabase.from('tenants').select('*').eq('slug', tenantOverride).single();

                    // Fallback para RPC (Bypass RLS se falhar ou retornar null)
                    if (error || !data) {
                        console.warn('[TenantResolver] Standard override fetch failed, trying Admin RPC...', error);
                        const { data: rpcData, error: rpcError } = await supabase.rpc('get_admin_tenant_by_slug', { p_slug: tenantOverride });

                        if (!rpcError && rpcData && !rpcData.error) {
                            console.log('[TenantResolver] Resolved by Admin RPC:', tenantOverride);
                            data = rpcData;
                            error = null;
                        } else {
                            // LAST RESORT: Try Member RPC (get_my_tenant)
                            console.warn('[TenantResolver] Admin RPC failed, trying Member RPC (get_my_tenant)...');
                            const { data: myData, error: myError } = await supabase.rpc('get_my_tenant');

                            // ACCEPT DB TRUTH: If the database says this is my tenant, trust it.
                            if (!myError && myData) {
                                console.log('[TenantResolver] Resolved by Member RPC (Trusted DB):', myData.slug);
                                data = myData;
                                error = null;

                                // Update override if different to keep things consistent
                                if (tenantOverrideParam && myData.slug !== tenantOverrideParam) {
                                    console.warn('[TenantResolver] URL override mismatch. Correcting to:', myData.slug);
                                    // Optional: replace URL history? For now just use the data.
                                }
                            }
                        }
                    }

                    if (!error && data) {
                        console.log('[TenantResolver] Resolved by Super Admin override:', tenantOverride);
                        // Salva para persistência se veio do parâmetro
                        if (tenantOverrideParam) {
                            sessionStorage.setItem('tenant_override', tenantOverrideParam);
                        }
                        setTenant(data);
                        return;
                    }
                }

                // 2. Pular buscas de domínio/slug em rotas da plataforma (superadmin, master)
                // Funciona tanto em localhost quanto em produção (ex: app.cliquepdv.com.br/superadmin)
                const platformRoutes = ['/superadmin', '/master'];
                const isOnPlatformRoute = platformRoutes.some(r => window.location.pathname.startsWith(r));
                const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1';

                if (isOnPlatformRoute || isLocalhost) {
                    // Nenhum tenant para rotas da plataforma ou localhost sem override
                    console.log('[TenantResolver] Platform route or localhost — skipping domain/slug lookup.');
                    setTenant(null);
                    return;
                }

                // 3. Try to resolve by Custom Domain (apenas em domínios reais de clientes)
                const { data: domainMatch, error: domainError } = await supabase
                    .from('tenants')
                    .select('*')
                    .eq('custom_domain', hostname)
                    .single();

                if (!domainError && domainMatch) {
                    console.log('[TenantResolver] Resolved by domain:', hostname);
                    setTenant(domainMatch);
                    return;
                }

                // 4. Resolve by Subdomain/Slug
                const parts = hostname.split('.');
                const slug = parts.length >= 3 ? parts[0] : '';

                console.log('[TenantResolver] Trying slug:', slug);
                const { data: slugMatch, error: slugError } = await supabase
                    .from('tenants')
                    .select('*')
                    .eq('slug', slug)
                    .single();

                if (slugError) {
                    console.warn('[TenantResolver] No tenant found for slug:', slug);
                    setTenant(null);
                } else {
                    setTenant(slugMatch);
                }
            } catch (err) {
                console.error('[TenantResolver] Unexpected error:', err);
                setError(err);
                setTenant(null);
            } finally {
                console.log('[TenantResolver] Resolution finished, setting isLoading to false');
                setIsLoading(false);
            }
        };

        resolveTenant();
    }, []);

    return (
        <TenantContext.Provider value={{ tenant, isLoading, error }}>
            {children}
        </TenantContext.Provider>
    );
};

export const useTenant = () => {
    const context = useContext(TenantContext);
    if (context === undefined) {
        throw new Error('useTenant must be used within a TenantProvider');
    }
    return context;
};
