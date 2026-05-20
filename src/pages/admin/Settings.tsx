import React, { useState, useEffect } from 'react';
import { useTenant } from '../../context/TenantContext';
import { useAuth } from '../../context/AuthContext';
import { useSettings } from '../../hooks/useSettings';
import { supabase } from '../../lib/supabase';
import {
    Save,
    Building2,
    Printer,
    Palette,
    Globe,
    DollarSign,
    FileText,
    MessageSquare,
    Users,
    LayoutDashboard,
    Star,
    Image as ImageIcon,
    Loader2,
    BarChart3,
    ShoppingBag,
    Trash2,
    Lock,
    CreditCard,
    AlertTriangle,
    Package,
    Tag,
    ShoppingCart,
    X,
    ShieldCheck,
    LogOut,
    Check,
    Settings as SettingsIcon
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useNavigate } from 'react-router-dom';

// Helper: Upsert setting
const updateSetting = async (tenantId: string, key: string, value: any) => {
    const { error } = await supabase.from('settings').upsert({ tenant_id: tenantId, key, value: String(value) }, { onConflict: 'tenant_id,key' });
    if (error) throw error;
};

const Settings = () => {
    const { tenant } = useTenant();
    const { user, signOut, profile } = useAuth();
    const navigate = useNavigate();
    const { data: layoutSettings, refetch: refetchLayout } = useSettings();
    const [isLoading, setIsLoading] = useState(false);
    const [activeTab, setActiveTab] = useState(() => localStorage.getItem('admin_active_tab') || 'store');

    // Delete Store States
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deletePassword, setDeletePassword] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);

    // Plan States
    const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);

    const handleDeleteStore = async () => {
        if (!deletePassword) return alert('Digite sua senha para confirmar.');
        setIsDeleting(true);

        try {
            // 1. Verify Password
            const { error: authError } = await supabase.auth.signInWithPassword({
                email: user?.email || '',
                password: deletePassword
            });

            if (authError) throw new Error('Senha incorreta. Solicitação cancelada.');

            // 2. Request Deletion (LGPD Compliance)
            // Instead of deleting, we update status to 'deletion_requested'
            const { error: updateError } = await supabase
                .from('tenants')
                .update({ status: 'deletion_requested' })
                .eq('id', tenant?.id);

            if (updateError) throw updateError;

            alert('Solicitação enviada com sucesso. Seus dados serão analisados para exclusão em até 72h conforme LGPD.');
            window.location.reload();

        } catch (error: any) {
            console.error('Erro ao solicitar exclusão:', error);
            alert(error.message || 'Erro ao solicitar exclusão.');
        } finally {
            setIsDeleting(false);
            setDeletePassword('');
            setIsDeleteModalOpen(false);
        }
    };

    const handleUpdatePlan = async (plan: string) => {
        if (!confirm(`Deseja alterar seu plano para ${plan}?`)) return;

        try {
            const { error } = await supabase
                .from('tenants')
                .update({ subscription_plan: plan })
                .eq('id', tenant?.id);

            if (error) throw error;
            alert('Plano atualizado com sucesso!');
            window.location.reload();
        } catch (error) {
            console.error('Erro ao atualizar plano:', error);
            alert('Erro ao atualizar plano.');
        }
    };

    // Update localStorage when tab changes
    useEffect(() => {
        localStorage.setItem('admin_active_tab', activeTab);
    }, [activeTab]);

    // Tenant Data (Store Identity)
    const [storeData, setStoreData] = useState({
        name: '', corporate_name: '', cnpj: '', address: '', show_cnpj_footer: true, show_address_footer: true, printer_width: '80mm'
    });

    // Layout/Settings Data (Dynamic)
    const [layoutData, setLayoutData] = useState<any>({});

    useEffect(() => {
        if (tenant) {
            setStoreData(prev => ({
                ...prev,
                name: tenant.name || '',
                corporate_name: tenant.corporate_name || '',
                // These will be complemented by layoutSettings useEffect
                printer_width: tenant.printer_settings?.paper_width || '80mm'
            }));
        }
    }, [tenant]);

    useEffect(() => {
        if (layoutSettings) {
            setLayoutData(layoutSettings);
            // Also update storeData with settings values if they exist
            setStoreData(prev => ({
                ...prev,
                address: layoutSettings.address || prev.address,
                cnpj: layoutSettings.cnpj || prev.cnpj,
                show_cnpj_footer: layoutSettings.show_cnpj_footer !== undefined ? layoutSettings.show_cnpj_footer : prev.show_cnpj_footer,
                show_address_footer: layoutSettings.show_address_footer !== undefined ? layoutSettings.show_address_footer : prev.show_address_footer,
            }));
        }
    }, [layoutSettings]);

    const handleSave = async () => {
        if (!tenant) return;
        setIsLoading(true);
        console.log('=== SAVING SETTINGS ===');
        console.log('Tenant ID:', tenant.id);
        console.log('Store Data:', storeData);
        console.log('Layout Data:', layoutData);

        try {
            // Update Tenant Table (Store Identity)
            const tenantUpdate: any = {
                name: storeData.name,
                corporate_name: storeData.corporate_name,
                cnpj: storeData.cnpj,
                address: storeData.address,
                show_cnpj_footer: storeData.show_cnpj_footer,
                printer_settings: { paper_width: storeData.printer_width }
            };
            console.log('Updating tenant with:', tenantUpdate);
            const { error: tenantError } = await supabase.from('tenants').update(tenantUpdate).eq('id', tenant.id);
            if (tenantError) {
                console.error('Tenant update error:', tenantError);
                throw tenantError;
            }

            // Save address, CNPJ and toggles in settings instead of tenant
            await updateSetting(tenant.id, 'address', storeData.address || '');
            await updateSetting(tenant.id, 'cnpj', storeData.cnpj || '');
            await updateSetting(tenant.id, 'bakery_name', storeData.name || '');
            await updateSetting(tenant.id, 'corporate_name', storeData.corporate_name || '');
            await updateSetting(tenant.id, 'show_address_footer', String(storeData.show_address_footer));
            await updateSetting(tenant.id, 'show_cnpj_footer', String(storeData.show_cnpj_footer));

            // Update All Settings Keys found in layoutData (excluding manually handled ones)
            if (layoutData) {
                const excludedKeys = ['address', 'cnpj', 'bakery_name', 'corporate_name', 'show_address_footer', 'show_cnpj_footer'];
                const keysToUpdate = Object.keys(layoutData).filter(k => !excludedKeys.includes(k));

                console.log('Updating settings keys:', keysToUpdate);
                await Promise.all(keysToUpdate.map(async key => {
                    console.log(`Saving ${key}: `, layoutData[key]);
                    return updateSetting(tenant.id, key, layoutData[key] ?? '');
                }));
            }

            await refetchLayout();

            // Force reload to refresh tenant context
            console.log('=== SAVE SUCCESSFUL - Reloading page ===');
            alert('Configurações salvas com sucesso! A página será recarregada.');
            window.location.reload();
        } catch (error) {
            console.error('=== SAVE ERROR ===', error);
            alert('Erro ao salvar: ' + (error as any).message);
        } finally {
            setIsLoading(false);
        }
    };

    const tabs = [
        { id: 'store', label: 'Dados', icon: Building2 },
        { id: 'visual', label: 'Visual', icon: Palette },
        { id: 'institutional', label: 'Sobre', icon: LayoutDashboard },
        { id: 'testimonials', label: 'Depoimentos', icon: Star },
        { id: 'contact', label: 'Contato', icon: Globe },
        { id: 'marketing', label: 'Marketing/SEO', icon: BarChart3 },
        { id: 'system', label: 'Sistema', icon: DollarSign },
        { id: 'printer', label: 'Impressão', icon: Printer },
    ];

    // Account States
    const [accountEmail, setAccountEmail] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isUpdatingAccount, setIsUpdatingAccount] = useState(false);

    // Initial Load of Account Email
    useEffect(() => {
        const loadAccountEmail = async () => {
            // Se for Super Admin vendo loja de outro, busca o email do dono da loja via RPC
            if (profile?.role === 'superadmin' && tenant?.slug !== 'master' && tenant?.id) {
                try {
                    const { data, error } = await supabase.rpc('get_tenant_admin_profile', { p_tenant_id: tenant.id });
                    if (!error && data?.data) {
                        setAccountEmail(data.data.email);
                    }
                } catch (err) {
                    console.error('Erro ao buscar email do admin da loja:', err);
                }
            } else {
                // Comportamento padrão: usa o email do usuário logado
                setAccountEmail(user?.email || '');
            }
        };
        loadAccountEmail();
    }, [user, tenant, profile]);


    // Team States
    const [teamMembers, setTeamMembers] = useState<any[]>([]);
    const [isUserModalOpen, setIsUserModalOpen] = useState(false);
    const [editingMember, setEditingMember] = useState<any>(null);
    const [newUserEmail, setNewUserEmail] = useState('');
    const [newUserPassword, setNewUserPassword] = useState('');
    const [newUserFullName, setNewUserFullName] = useState('');
    const [newUserPermissions, setNewUserPermissions] = useState<string[]>(['dashboard', 'pdv']);
    const [isCreatingUser, setIsCreatingUser] = useState(false);

    const availableModules = [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'products', label: 'Produtos', icon: Package },
        { id: 'categories', label: 'Categorias', icon: Tag },
        { id: 'clients', label: 'Clientes', icon: Users },
        { id: 'pdv', label: 'PDV', icon: ShoppingCart },
        { id: 'sales', label: 'Vendas', icon: ShoppingBag },
        { id: 'reports', label: 'Relatórios', icon: BarChart3 },
        { id: 'settings', label: 'Configurações', icon: SettingsIcon },
    ];

    useEffect(() => {
        if (activeTab === 'system' && tenant) {
            fetchTeamMembers();
        }
    }, [activeTab, tenant]);

    const fetchTeamMembers = async () => {
        if (!tenant) return;

        // Se for Super Admin, usa RPC direto para evitar bloqueio de RLS
        if (profile?.role === 'superadmin') {
            const { data, error } = await supabase.rpc('get_tenant_team_members', { p_tenant_id: tenant.id });
            if (!error && data) {
                setTeamMembers(data);
                return;
            }
        }

        // Fallback padrão
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('tenant_id', tenant.id);
        if (!error && data) setTeamMembers(data);
    };

    const handleUpdateAccount = async () => {
        setIsUpdatingAccount(true);
        try {
            const isSuperAdminMode = profile?.role === 'superadmin' && tenant?.slug !== 'master';

            if (isSuperAdminMode) {
                // Lógica Super Admin (Via RPC)
                if (accountEmail && accountEmail !== user?.email) { // Comparação simplificada, idealmente compararia com o fetched
                    // Tenta atualizar email
                    const { data, error } = await supabase.rpc('master_update_user_email', {
                        p_old_email: editingMember?.email || accountEmail, // Fallback meio arriscado, mas ok pra MVP
                        p_new_email: accountEmail
                    });
                    if (error) throw error;
                    if (data?.status === 'error') throw new Error(data.message);
                }

                if (newPassword) {
                    if (newPassword !== confirmPassword) throw new Error('As senhas não coincidem.');
                    const { data, error } = await supabase.rpc('master_reset_user_password', {
                        p_target_email: accountEmail,
                        p_new_password: newPassword
                    });
                    if (error) throw error;
                    if (data?.status === 'error') throw new Error(data.message);
                    alert('Senha do cliente resetada com sucesso!');
                    setNewPassword('');
                    setConfirmPassword('');
                } else if (accountEmail) {
                    alert('E-mail atualizado com sucesso via Master!');
                }

            } else {
                // Lógica Padrão (Próprio Usuário via Auth API)
                if (accountEmail !== user?.email) {
                    const { error } = await supabase.auth.updateUser({ email: accountEmail });
                    if (error) throw error;
                    alert('E-mail de login atualizado! Verifique sua caixa de entrada para confirmar.');
                }

                if (newPassword) {
                    if (newPassword !== confirmPassword) throw new Error('As senhas não coincidem.');
                    const { error } = await supabase.auth.updateUser({ password: newPassword });
                    if (error) throw error;
                    alert('Senha atualizada com sucesso!');
                    setNewPassword('');
                    setConfirmPassword('');
                }
            }
        } catch (error: any) {
            alert('Erro ao atualizar: ' + error.message);
        } finally {
            setIsUpdatingAccount(false);
        }
    };

    const handleSaveTeamMember = async () => {
        if (!newUserEmail || (!editingMember && !newUserPassword) || !newUserFullName) {
            return alert('Preencha os campos obrigatórios (E-mail, Nome e Senha).');
        }
        setIsCreatingUser(true);
        try {
            const { error } = await supabase.rpc('manage_tenant_user', {
                p_email: newUserEmail,
                p_password: newUserPassword || null,
                p_full_name: newUserFullName,
                p_role: newUserPermissions.includes('settings') ? 'admin' : 'cashier',
                p_permissions: newUserPermissions,
                p_tenant_id: tenant?.id,
                p_action: editingMember ? 'update' : 'create'
            });

            if (error) throw error;

            alert(editingMember ? 'Membro atualizado!' : 'Membro adicionado com sucesso!');
            setIsUserModalOpen(false);
            setEditingMember(null);
            setNewUserEmail('');
            setNewUserPassword('');
            setNewUserFullName('');
            setNewUserPermissions(['dashboard', 'pdv']);
            fetchTeamMembers();
        } catch (error: any) {
            alert('Erro: ' + error.message);
        } finally {
            setIsCreatingUser(false);
        }
    };

    const handleEditClick = (member: any) => {
        setEditingMember(member);
        setNewUserEmail(member.email);
        setNewUserFullName(member.full_name);
        setNewUserPassword('');
        setNewUserPermissions(member.permissions || ['dashboard', 'pdv']);
        setIsUserModalOpen(true);
    };

    const handleDeleteTeamMember = async (email: string) => {
        if (!confirm('Deseja realmente remover este usuário da equipe?')) return;
        try {
            const { error } = await supabase.rpc('manage_tenant_user', {
                p_email: email,
                p_tenant_id: tenant?.id,
                p_action: 'delete'
            });
            if (error) throw error;
            alert('Usuário removido!');
            fetchTeamMembers();
        } catch (error: any) {
            alert('Erro ao remover: ' + error.message);
        }
    };

    return (
        <div className="max-w-6xl mx-auto pb-20 animate-in fade-in">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-black text-neutral-900">Configurações Completa</h1>
                <button onClick={handleSave} disabled={isLoading} className="flex items-center gap-2 px-6 py-3 bg-brand-primary hover:opacity-90 text-white font-bold rounded-xl shadow-lg transition-all">
                    {isLoading ? <Loader2 className="animate-spin" /> : <Save />} Salvar Tudo
                </button>
            </div>

            {profile?.role === 'superadmin' && (
                <div className="bg-amber-50 border-l-4 border-amber-500 p-4 mb-6 rounded-r-lg shadow-sm">
                    <div className="flex items-center gap-3">
                        <ShieldCheck className="text-amber-600" />
                        <div>
                            <p className="font-bold text-amber-800 text-sm">Modo Super Admin Ativo</p>
                            <p className="text-xs text-amber-700">
                                Você está visualizando as configurações desta loja com permissões administrativas globais.
                                A seção <strong>Dados de Acesso</strong> exibe sua conta atual (Master), não a do cliente.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            <div className="flex overflow-x-auto gap-2 mb-6 border-b pb-2">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={cn(
                            "flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-widest border-b-2 transition-all whitespace-nowrap",
                            activeTab === tab.id
                                ? "tab-active"
                                : "border-transparent text-neutral-400 hover:text-neutral-600 hover:border-neutral-200"
                        )}
                    >
                        <tab.icon size={16} />
                        {tab.label}
                    </button>
                ))}
            </div>

            <div className="bg-white p-8 rounded-3xl shadow-sm border border-neutral-100 min-h-[500px]">
                {/* STORE DATA */}
                {activeTab === 'store' && (
                    <div className="space-y-6 max-w-4xl mx-auto">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input label="Nome Fantasia" value={storeData.name} onChange={v => setStoreData({ ...storeData, name: v })} />
                            <Input label="Razão Social" value={storeData.corporate_name} onChange={v => setStoreData({ ...storeData, corporate_name: v })} />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input label="CNPJ" value={storeData.cnpj} onChange={v => setStoreData({ ...storeData, cnpj: v })} />
                            <TextArea label="Endereço" value={storeData.address} onChange={v => setStoreData({ ...storeData, address: v })} />
                        </div>
                        <div className="flex flex-wrap gap-6 bg-neutral-50 p-4 rounded-xl border border-neutral-100">
                            <Checkbox label="Mostrar CNPJ no Rodapé" checked={storeData.show_cnpj_footer} onChange={c => setStoreData({ ...storeData, show_cnpj_footer: c })} />
                            <Checkbox label="Mostrar Endereço no Rodapé" checked={storeData.show_address_footer} onChange={c => setStoreData({ ...storeData, show_address_footer: c })} />
                        </div>
                    </div>
                )}

                {/* VISUAL & HERO */}
                {activeTab === 'visual' && (
                    <div className="space-y-8 max-w-4xl mx-auto">

                        <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-100 mb-6">
                            <label className="text-xs font-bold text-neutral-500 uppercase mb-3 block">Temas Prontos (Presets)</label>
                            <div className="flex gap-3 flex-wrap">
                                {[
                                    { name: 'Elite Gold', primary: '#F59E0B', secondary: '#FCD34D', contrast: '#78350F', header: '#001b44', footer: '#001b44', sections: '#0F172A', about_bg: '#0F172A', catalog_bg: '#f8fafc', testimonials_bg: '#ffffff' },
                                    { name: 'Midnight', primary: '#3B82F6', secondary: '#60A5FA', contrast: '#0F172A', header: '#0F172A', footer: '#1E293B', sections: '#0F172A', about_bg: '#0F172A', catalog_bg: '#ffffff', testimonials_bg: '#0F172A' },
                                    { name: 'Forest', primary: '#10B981', secondary: '#34D399', contrast: '#064E3B', header: '#064E3B', footer: '#065F46', sections: '#064E3B', about_bg: '#064E3B', catalog_bg: '#ffffff', testimonials_bg: '#064E3B' },
                                    { name: 'Crimson', primary: '#EF4444', secondary: '#F87171', contrast: '#7F1D1D', header: '#7F1D1D', footer: '#991B1B', sections: '#7F1D1D', about_bg: '#7F1D1D', catalog_bg: '#ffffff', testimonials_bg: '#7F1D1D' },
                                    { name: 'Dark Mode', primary: '#FFFFFF', secondary: '#E5E7EB', contrast: '#111827', header: '#000000', footer: '#111827', sections: '#1F2937', about_bg: '#1F2937', catalog_bg: '#111827', testimonials_bg: '#1F2937' },
                                ].map(theme => {
                                    const isActive = layoutData.brand_primary_color === theme.primary && layoutData.header_bg_color === theme.header;
                                    return (
                                        <button
                                            key={theme.name}
                                            onClick={() => {
                                                console.log('Applying complete theme:', theme.name, theme);
                                                setLayoutData({
                                                    ...layoutData,
                                                    brand_primary_color: theme.primary,
                                                    brand_secondary_color: theme.secondary,
                                                    brand_contrast_color: (theme as any).contrast,
                                                    header_bg_color: theme.header,
                                                    footer_bg_color: theme.footer,
                                                    sections_bg_color: theme.sections,
                                                    about_bg_color: (theme as any).about_bg,
                                                    catalog_bg_color: (theme as any).catalog_bg,
                                                    testimonials_bg_color: (theme as any).testimonials_bg
                                                });
                                            }}
                                            className={cn(
                                                "flex flex-col items-center gap-2 group relative",
                                                isActive && "ring-2 ring-brand-primary ring-offset-2 rounded-lg p-1"
                                            )}
                                        >
                                            <div className="w-12 h-12 rounded-full shadow-sm border-2 border-white ring-1 ring-neutral-200 flex overflow-hidden group-hover:scale-110 transition-transform">
                                                <div className="w-1/2 h-full" style={{ backgroundColor: theme.primary }} />
                                                <div className="w-1/2 h-full" style={{ backgroundColor: theme.header }} />
                                            </div>
                                            <span className={cn(
                                                "text-[10px] font-bold uppercase",
                                                isActive ? "text-brand-primary" : "text-neutral-500"
                                            )}>{theme.name}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <ColorInput label="Cor Primária" value={layoutData.brand_primary_color} onChange={v => setLayoutData({ ...layoutData, brand_primary_color: v })} />
                            <ColorInput label="Cor Secundária" value={layoutData.brand_secondary_color} onChange={v => setLayoutData({ ...layoutData, brand_secondary_color: v })} />
                            <ColorInput label="Cor de Contraste (Títulos/Preços)" value={layoutData.brand_contrast_color} onChange={v => setLayoutData({ ...layoutData, brand_contrast_color: v })} />
                        </div>

                        <div className="border-t border-neutral-100 pt-4 mt-2">
                            <label className="text-xs font-bold text-neutral-400 uppercase mb-3 block">Cores de Fundo do Template</label>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <ColorInput label="Cabeçalho (Header)" value={layoutData.header_bg_color} onChange={v => setLayoutData({ ...layoutData, header_bg_color: v })} />
                                <ColorInput label="Rodapé (Footer)" value={layoutData.footer_bg_color} onChange={v => setLayoutData({ ...layoutData, footer_bg_color: v })} />
                                <ColorInput label="Seções Globais" value={layoutData.sections_bg_color} onChange={v => setLayoutData({ ...layoutData, sections_bg_color: v })} />
                            </div>
                        </div>

                        <div className="border-t border-neutral-100 pt-4 mt-2">
                            <label className="text-xs font-bold text-neutral-400 uppercase mb-3 block">Fundos Personalizados por Seção</label>
                            <div className="space-y-4">
                                <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-100">
                                    <h4 className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-3">Seção Sobre Nós</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <ColorInput label="Cor de Fundo" value={layoutData.about_bg_color} onChange={v => setLayoutData({ ...layoutData, about_bg_color: v })} />
                                        <Input label="URL Imagem de Fundo" value={layoutData.about_bg_image} onChange={v => setLayoutData({ ...layoutData, about_bg_image: v })} />
                                    </div>
                                </div>
                                <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-100">
                                    <h4 className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-3">Seção de Catálogo</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <ColorInput label="Cor de Fundo" value={layoutData.catalog_bg_color} onChange={v => setLayoutData({ ...layoutData, catalog_bg_color: v })} />
                                        <Input label="URL Imagem de Fundo" value={layoutData.catalog_bg_image} onChange={v => setLayoutData({ ...layoutData, catalog_bg_image: v })} />
                                    </div>
                                </div>
                                <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-100">
                                    <h4 className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-3">Seção de Depoimentos</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <ColorInput label="Cor de Fundo" value={layoutData.testimonials_bg_color} onChange={v => setLayoutData({ ...layoutData, testimonials_bg_color: v })} />
                                        <Input label="URL Imagem de Fundo" value={layoutData.testimonials_bg_image} onChange={v => setLayoutData({ ...layoutData, testimonials_bg_image: v })} />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="border-t border-neutral-100 pt-6 mt-4">
                            <h3 className="text-sm font-bold text-neutral-900 mb-4 flex items-center gap-2">
                                <LayoutDashboard size={18} className="text-brand-primary" />
                                Layout da Landing Page
                            </h3>

                            <label className="text-xs font-bold text-neutral-500 uppercase mb-3 block">Modo de Visualização</label>
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
                                {[
                                    { id: 'complete', label: 'Completo', desc: 'Hero + Sobre + Catálogo' },
                                    { id: 'simple', label: 'Catálogo', desc: 'Focado em vendas' },
                                    { id: 'landing_only', label: 'Institucional', desc: 'Sem vendas online' },
                                    { id: 'maintenance', label: 'Manutenção', desc: 'Site bloqueado' },
                                ].map(mode => (
                                    <button
                                        key={mode.id}
                                        onClick={() => {
                                            console.log('Setting layout_mode to:', mode.id);
                                            let updates: any = { layout_mode: mode.id };

                                            // Apply Presets logic (checking the boxes automatically)
                                            if (mode.id === 'complete') {
                                                updates = { ...updates, show_about: true, show_testimonials: true, show_cart: true, show_categories: true };
                                            } else if (mode.id === 'simple') {
                                                updates = { ...updates, show_about: false, show_testimonials: false, show_cart: true, show_categories: true };
                                            } else if (mode.id === 'landing_only') {
                                                updates = { ...updates, show_about: true, show_testimonials: true, show_cart: false, show_categories: false };
                                            }
                                            // Maintenance doesn't change flags, just the mode

                                            setLayoutData({ ...layoutData, ...updates });
                                        }}
                                        className={cn(
                                            "p-3 rounded-xl border-2 text-left transition-all relative overflow-hidden flex flex-col justify-between h-24",
                                            layoutData.layout_mode === mode.id || (!layoutData.layout_mode && mode.id === 'complete')
                                                ? "border-brand-primary bg-brand-primary-light shadow-sm"
                                                : "border-neutral-100 hover:border-neutral-200 bg-white"
                                        )}
                                    >
                                        <div className="flex items-center gap-2">
                                            <div className={cn("w-3 h-3 rounded-full border-2 flex items-center justify-center shrink-0", (layoutData.layout_mode === mode.id || (!layoutData.layout_mode && mode.id === 'complete')) ? "border-brand-primary" : "border-neutral-300")}>
                                                {(layoutData.layout_mode === mode.id || (!layoutData.layout_mode && mode.id === 'complete')) && <div className="w-1.5 h-1.5 rounded-full bg-brand-primary" />}
                                            </div>
                                            <span className="font-bold text-neutral-900 text-sm leading-none">{mode.label}</span>
                                        </div>
                                        <p className="text-[10px] text-neutral-500 leading-tight">{mode.desc}</p>
                                    </button>
                                ))}
                            </div>

                            <label className="text-xs font-bold text-neutral-500 uppercase mb-3 block">Tamanho dos Produtos (Catálogo)</label>
                            <div className="flex gap-3 mb-6 bg-neutral-50 p-1 rounded-xl border border-neutral-100 w-fit">
                                {[
                                    { id: 'large', label: 'Grande (Padrão)', width: '100%' },
                                    { id: 'medium', label: 'Médio', width: '50%' },
                                    { id: 'small', label: 'Pequeno', width: '25%' },
                                    { id: 'mini', label: 'Mini', width: '16%' },
                                ].map(size => (
                                    <button
                                        key={size.id}
                                        onClick={() => setLayoutData({ ...layoutData, catalog_card_size: size.id })}
                                        className={cn(
                                            "px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all",
                                            (layoutData.catalog_card_size === size.id || (!layoutData.catalog_card_size && size.id === 'large'))
                                                ? "bg-white text-brand-primary shadow-sm"
                                                : "text-neutral-400 hover:text-neutral-600"
                                        )}
                                    >
                                        {size.label}
                                    </button>
                                ))}
                            </div>

                            <label className="text-xs font-bold text-neutral-500 uppercase mb-3 block">Funcionalidades Visíveis</label>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-neutral-50 p-4 rounded-xl border border-neutral-100">
                                <div className="space-y-4">
                                    <div className="flex items-center gap-4 py-2 border-b border-neutral-200">
                                        <Checkbox
                                            checked={layoutData.show_about !== false}
                                            onChange={(e) => setLayoutData({ ...layoutData, show_about: e })}
                                        />
                                        <div>
                                            <p className="font-bold text-neutral-900 text-sm leading-none">Mostrar "Sobre Nós"</p>
                                            <p className="text-[10px] text-neutral-500 mt-1">Seção de história e apresentação</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4 py-2 border-b border-neutral-200">
                                        <Checkbox
                                            checked={layoutData.show_categories !== false}
                                            onChange={(e) => setLayoutData({ ...layoutData, show_categories: e })}
                                        />
                                        <div>
                                            <p className="font-bold text-neutral-900 text-sm leading-none">Mostrar Categorias</p>
                                            <p className="text-[10px] text-neutral-500 mt-1">Filtro de categorias no topo do catálogo</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div className="flex items-center gap-4 py-2 border-b border-neutral-200">
                                        <Checkbox
                                            checked={layoutData.show_cart !== false}
                                            onChange={(e) => setLayoutData({ ...layoutData, show_cart: e })}
                                        />
                                        <div>
                                            <p className="font-bold text-neutral-900 text-sm leading-none">Mostrar Carrinho</p>
                                            <p className="text-[10px] text-neutral-500 mt-1">Carrinho de compras lateral</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4 py-2 border-b md:border-none border-neutral-200">
                                        <Checkbox
                                            checked={layoutData.show_testimonials !== false}
                                            onChange={(e) => setLayoutData({ ...layoutData, show_testimonials: e })}
                                        />
                                        <div>
                                            <p className="font-bold text-neutral-900 text-sm leading-none">Mostrar Depoimentos</p>
                                            <p className="text-[10px] text-neutral-500 mt-1">Seção de depoimentos de clientes</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="border-t border-neutral-100 pt-6 mt-6">
                                <h3 className="text-sm font-bold text-neutral-900 mb-4">Customização do Modo Manutenção</h3>
                                <div className="space-y-4">
                                    <Input
                                        label="Título da Manutenção"
                                        value={layoutData.maintenance_title}
                                        onChange={v => setLayoutData({ ...layoutData, maintenance_title: v })}
                                        placeholder="Em Manutenção"
                                    />
                                    <TextArea
                                        label="Mensagem da Manutenção"
                                        value={layoutData.maintenance_message}
                                        onChange={v => setLayoutData({ ...layoutData, maintenance_message: v })}
                                        placeholder="Estamos realizando melhorias em nossa loja. Voltaremos em breve!"
                                    />
                                    <Input
                                        label="WhatsApp Alternativo (Opcional)"
                                        value={layoutData.maintenance_whatsapp}
                                        onChange={v => setLayoutData({ ...layoutData, maintenance_whatsapp: v })}
                                        placeholder="Deixe vazio para usar o principal"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="border-t border-neutral-100 pt-6 mt-4">
                            <h3 className="font-bold text-brand-primary mb-4 flex items-center gap-2">
                                <Palette size={18} />
                                Ordem das Seções e Mensagens
                            </h3>
                            <div className="space-y-4 bg-neutral-50 p-4 rounded-xl border border-neutral-100">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="font-bold text-neutral-900 text-sm">Posição do "Sobre Nós"</p>
                                        <p className="text-xs text-neutral-500">Escolha onde a seção sobre aparecerá</p>
                                    </div>
                                    <select
                                        value={layoutData.about_section_position || 'before_catalog'}
                                        onChange={e => setLayoutData({ ...layoutData, about_section_position: e.target.value })}
                                        className="p-2 border rounded-lg bg-white text-xs font-bold min-w-[150px]"
                                    >
                                        <option value="before_catalog">Antes do Catálogo</option>
                                        <option value="after_catalog">Depois do Catálogo</option>
                                    </select>
                                </div>
                                <div className="h-px bg-neutral-200" />
                                <div className="space-y-4">
                                    <Input
                                        label="Checkout WhatsApp"
                                        value={layoutData.whatsapp_checkout_message}
                                        onChange={v => setLayoutData({ ...layoutData, whatsapp_checkout_message: v })}
                                        placeholder="Vim pelo site e gostaria de confirmar meu pedido!"
                                    />
                                    <Input
                                        label="Mensagem Carrinho Vazio"
                                        value={layoutData.cart_empty_message}
                                        onChange={v => setLayoutData({ ...layoutData, cart_empty_message: v })}
                                        placeholder="Explore nosso catálogo e adicione os melhores itens!"
                                    />
                                    <Input
                                        label="Mensagem Encomendas (Rodapé)"
                                        value={layoutData.online_orders_message}
                                        onChange={v => setLayoutData({ ...layoutData, online_orders_message: v })}
                                        placeholder="Aceitamos encomendas com antecedência pelo WhatsApp."
                                    />
                                    <TextArea
                                        label="Descrição Rodapé (Lado Esquerdo)"
                                        value={layoutData.footer_description}
                                        onChange={v => setLayoutData({ ...layoutData, footer_description: v })}
                                        placeholder="Aceitamos encomendas com antecedência pelo WhatsApp."
                                    />
                                    <div className="h-px bg-neutral-200" />
                                    <h4 className="font-bold text-neutral-400 text-[10px] uppercase tracking-widest mt-2">Rótulos e Info do Rodapé</h4>
                                    <div className="grid grid-cols-2 gap-4">
                                        <Input
                                            label="Título do Rodapé"
                                            value={layoutData.footer_working_title}
                                            onChange={v => setLayoutData({ ...layoutData, footer_working_title: v })}
                                            placeholder="Funcionamento"
                                        />
                                        <Input
                                            label="Rótulo Horário"
                                            value={layoutData.footer_working_label}
                                            onChange={v => setLayoutData({ ...layoutData, footer_working_label: v })}
                                            placeholder="Horário de Atendimento"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <Input
                                            label="Rótulo Pedidos"
                                            value={layoutData.footer_orders_label}
                                            onChange={v => setLayoutData({ ...layoutData, footer_orders_label: v })}
                                            placeholder="Pedidos Online"
                                        />
                                        <Input
                                            label="Horário de Funcionamento"
                                            value={layoutData.working_hours}
                                            onChange={v => setLayoutData({ ...layoutData, working_hours: v })}
                                            placeholder="Segunda a Sábado: 08h às 18h"
                                        />
                                    </div>
                                    <div className="h-px bg-neutral-200" />
                                    <h4 className="font-bold text-neutral-400 text-[10px] uppercase tracking-widest mt-2">Rótulos da Navegação</h4>
                                    <div className="grid grid-cols-2 gap-4">
                                        <Input
                                            label="Rótulo Início"
                                            value={layoutData.nav_home_label}
                                            onChange={v => setLayoutData({ ...layoutData, nav_home_label: v })}
                                            placeholder="Início"
                                        />
                                        <Input
                                            label="Rótulo Sobre"
                                            value={layoutData.nav_about_label}
                                            onChange={v => setLayoutData({ ...layoutData, nav_about_label: v })}
                                            placeholder="Sobre"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <Input
                                            label="Rótulo Contato"
                                            value={layoutData.nav_contact_label}
                                            onChange={v => setLayoutData({ ...layoutData, nav_contact_label: v })}
                                            placeholder="Contato"
                                        />
                                        <Input
                                            label="Botão Finalizar Pedido"
                                            value={layoutData.nav_checkout_label}
                                            onChange={v => setLayoutData({ ...layoutData, nav_checkout_label: v })}
                                            placeholder="Finalizar Pedido"
                                        />
                                    </div>
                                    <Input
                                        label="Botão Encomendar"
                                        value={layoutData.nav_order_label}
                                        onChange={v => setLayoutData({ ...layoutData, nav_order_label: v })}
                                        placeholder="Encomendar"
                                    />
                                    <div className="h-px bg-neutral-200" />
                                    <h4 className="font-bold text-neutral-400 text-[10px] uppercase tracking-widest mt-2">Localização no Rodapé</h4>
                                    <div className="grid grid-cols-2 gap-4">
                                        <Input
                                            label="Título 'Onde Estamos'"
                                            value={layoutData.footer_location_title}
                                            onChange={v => setLayoutData({ ...layoutData, footer_location_title: v })}
                                            placeholder="Onde Estamos"
                                        />
                                        <Input
                                            label="Botão Google Maps"
                                            value={layoutData.footer_maps_label}
                                            onChange={v => setLayoutData({ ...layoutData, footer_maps_label: v })}
                                            placeholder="Abrir no Google Maps"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="border-t border-neutral-100 pt-6 mt-4">
                            <h3 className="font-bold text-brand-primary mb-4 flex items-center gap-2">
                                <ShoppingBag size={18} />
                                Cabeçalho e Estilo do Catálogo
                            </h3>
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <Input
                                        label="Tagline do Catálogo"
                                        value={layoutData.catalog_tagline}
                                        onChange={v => setLayoutData({ ...layoutData, catalog_tagline: v })}
                                        placeholder="Menu de Experiências"
                                    />
                                    <Input
                                        label="Título do Catálogo"
                                        value={layoutData.catalog_title}
                                        onChange={v => setLayoutData({ ...layoutData, catalog_title: v })}
                                        placeholder={`Catálogo ${storeData.name || "Sua Empresa"} `}
                                    />
                                </div>
                                <TextArea
                                    label="Descrição do Catálogo"
                                    value={layoutData.catalog_description}
                                    onChange={v => setLayoutData({ ...layoutData, catalog_description: v })}
                                    placeholder="Selecione seus itens favoritos abaixo. Montamos seu orçamento em tempo real para envio direto ao nosso WhatsApp."
                                />
                            </div>
                        </div>

                        <div className="border-t border-neutral-100 pt-6 mt-4">
                            <h3 className="font-bold text-brand-primary mb-4">Hero Section</h3>
                            <div className="space-y-4">
                                <Input label="Título Hero" value={layoutData.hero_title} onChange={v => setLayoutData({ ...layoutData, hero_title: v })} />
                                <Input
                                    label="Tagline (ex: Sua Empresa • Experiência Premium)"
                                    value={layoutData.hero_tagline}
                                    onChange={v => setLayoutData({ ...layoutData, hero_tagline: v })}
                                    placeholder={`${storeData.name || "Sua Empresa"} • Experiência Premium`}
                                />
                                <TextArea
                                    label="Subtítulo Hero"
                                    value={layoutData.hero_subtitle}
                                    onChange={v => setLayoutData({ ...layoutData, hero_subtitle: v })}
                                    placeholder="O melhor em qualidade e atendimento para você."
                                />
                                <Input label="URL Imagem Hero" value={layoutData.hero_image_url} onChange={v => setLayoutData({ ...layoutData, hero_image_url: v })} />
                                <Input label="URL do Logo" value={layoutData.logo_url} onChange={v => setLayoutData({ ...layoutData, logo_url: v })} />
                                <div className="border-t pt-4 mt-4">
                                    <Input
                                        label="Texto do Botão Hero"
                                        value={layoutData.hero_button_text}
                                        onChange={v => setLayoutData({ ...layoutData, hero_button_text: v })}
                                        placeholder="Ver Catálogo"
                                    />
                                    <div className="mt-3">
                                        <Checkbox
                                            label="Mostrar Botão no Hero"
                                            checked={layoutData.show_hero_button !== false}
                                            onChange={c => setLayoutData({ ...layoutData, show_hero_button: c })}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* INSTITUTIONAL / ABOUT */}
                {activeTab === 'institutional' && (
                    <div className="space-y-6 max-w-4xl mx-auto">
                        <h3 className="font-bold border-b pb-2 text-neutral-900 flex items-center gap-2">
                            <LayoutDashboard size={18} className="text-brand-primary" /> Seção Sobre Nós
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input label="Título Sobre" value={layoutData.about_title} onChange={v => setLayoutData({ ...layoutData, about_title: v })} />
                            <Input label="URL Imagem Destaque" value={layoutData.about_image_url} onChange={v => setLayoutData({ ...layoutData, about_image_url: v })} />
                        </div>
                        <TextArea label="Descrição" value={layoutData.about_description} onChange={v => setLayoutData({ ...layoutData, about_description: v })} />

                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 bg-neutral-50 p-4 rounded-xl border border-neutral-100">
                            <div className="space-y-4 col-span-2">
                                <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Indicadores</label>
                                <div className="grid grid-cols-2 gap-4">
                                    <Input label="Anos de Experiência" value={layoutData.about_years} onChange={v => setLayoutData({ ...layoutData, about_years: v })} />
                                    <Input label="Rótulo Anos" value={layoutData.about_years_label} onChange={v => setLayoutData({ ...layoutData, about_years_label: v })} />
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-100 space-y-4">
                                <h4 className="font-bold text-sm text-neutral-900">Destaque 1</h4>
                                <Input label="Título" value={layoutData.about_f1_title} onChange={v => setLayoutData({ ...layoutData, about_f1_title: v })} />
                                <TextArea label="Descrição" value={layoutData.about_f1_desc} onChange={v => setLayoutData({ ...layoutData, about_f1_desc: v })} />
                            </div>
                            <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-100 space-y-4">
                                <h4 className="font-bold text-sm text-neutral-900">Destaque 2</h4>
                                <Input label="Título" value={layoutData.about_f2_title} onChange={v => setLayoutData({ ...layoutData, about_f2_title: v })} />
                                <TextArea label="Descrição" value={layoutData.about_f2_desc} onChange={v => setLayoutData({ ...layoutData, about_f2_desc: v })} />
                            </div>
                        </div>
                    </div>
                )}

                {/* TESTIMONIALS */}
                {activeTab === 'testimonials' && (
                    <div className="space-y-8 max-w-4xl mx-auto">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {[1, 2, 3, 4].map(num => (
                                <div key={num} className="p-4 bg-neutral-50 rounded-xl border border-neutral-100 shadow-sm">
                                    <h4 className="font-bold mb-4 text-brand-primary flex items-center gap-2">
                                        <Star size={16} /> Depoimento {num}
                                    </h4>
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-2 gap-3">
                                            <Input label="Nome" value={layoutData[`testimonial${num} _name`]} onChange={v => setLayoutData({ ...layoutData, [`testimonial${num} _name`]: v })} />
                                            <Input label="Cargo/Role" value={layoutData[`testimonial${num} _role`]} onChange={v => setLayoutData({ ...layoutData, [`testimonial${num} _role`]: v })} />
                                        </div>
                                        <TextArea label="Texto do Depoimento" value={layoutData[`testimonial${num} _content`]} onChange={v => setLayoutData({ ...layoutData, [`testimonial${num} _content`]: v })} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* CONTACT & SOCIAL */}
                {activeTab === 'contact' && (
                    <div className="space-y-6 max-w-4xl mx-auto">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-4">
                                <h3 className="font-bold border-b pb-2 text-neutral-900 flex items-center gap-2">
                                    <Globe size={18} className="text-brand-primary" /> Redes Sociais
                                </h3>
                                <Input label="WhatsApp (Núm com DDD)" value={layoutData.whatsapp_number} onChange={v => setLayoutData({ ...layoutData, whatsapp_number: v })} placeholder="5511999999999" />
                                <Input label="Instagram URL" value={layoutData.instagram_url} onChange={v => setLayoutData({ ...layoutData, instagram_url: v })} placeholder="https://instagram.com/sualoja" />
                                <Input label="Facebook URL" value={layoutData.facebook_url} onChange={v => setLayoutData({ ...layoutData, facebook_url: v })} />
                                <Input label="TikTok URL" value={layoutData.tiktok_url} onChange={v => setLayoutData({ ...layoutData, tiktok_url: v })} />
                            </div>
                            <div className="space-y-4">
                                <h3 className="font-bold border-b pb-2 text-neutral-900 flex items-center gap-2">
                                    <Star size={18} className="text-brand-primary" /> Canais Diretos
                                </h3>
                                <Input label="Telefone Fixo / Celular (Opcional)" value={layoutData.contact_phone} onChange={v => setLayoutData({ ...layoutData, contact_phone: v })} placeholder="(11) 99999-9999" />
                                <Input label="Email para Exibição" value={layoutData.footer_email} onChange={v => setLayoutData({ ...layoutData, footer_email: v })} />

                                <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-100 mt-6">
                                    <h4 className="font-bold mb-3 text-neutral-900 flex items-center gap-2">
                                        <Globe size={16} className="text-brand-primary" /> Google Maps
                                    </h4>
                                    <Input label="Link da Localização (URL)" value={layoutData.google_maps_url} onChange={v => setLayoutData({ ...layoutData, google_maps_url: v })} placeholder="https://goo.gl/maps/..." />
                                    <div className="mt-3">
                                        <Checkbox label="Exibir link no rodapé" checked={layoutData.show_map_link !== false} onChange={c => setLayoutData({ ...layoutData, show_map_link: c })} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* MARKETING & SEO */}
                {activeTab === 'marketing' && (
                    <div className="space-y-8 max-w-4xl mx-auto">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-4">
                                <h3 className="font-bold border-b pb-2 text-brand-primary flex items-center gap-2">
                                    <BarChart3 size={18} /> Otimização (SEO)
                                </h3>
                                <Input label="Título da Página (Meta Title)" value={layoutData.seo_title} onChange={v => setLayoutData({ ...layoutData, seo_title: v })} />
                                <TextArea label="Descrição (Meta Description)" value={layoutData.seo_description} onChange={v => setLayoutData({ ...layoutData, seo_description: v })} />
                                <Input label="Palavras-chave (separadas por vírgula)" value={layoutData.seo_keywords} onChange={v => setLayoutData({ ...layoutData, seo_keywords: v })} />
                                <Input label="URL do Favicon" value={layoutData.favicon_url} onChange={v => setLayoutData({ ...layoutData, favicon_url: v })} placeholder="https://exemplo.com/favicon.ico" />
                            </div>
                            <div className="space-y-4">
                                <h3 className="font-bold border-b pb-2 text-brand-primary flex items-center gap-2">
                                    <Globe size={18} /> Rastreamento & Pixels
                                </h3>
                                <Input label="Meta Pixel ID (Facebook)" value={layoutData.meta_pixel_id} onChange={v => setLayoutData({ ...layoutData, meta_pixel_id: v })} />
                                <Input label="TikTok Pixel ID" value={layoutData.tiktok_pixel_id} onChange={v => setLayoutData({ ...layoutData, tiktok_pixel_id: v })} />
                                <Input label="Google Analytics ID" value={layoutData.google_analytics_id} onChange={v => setLayoutData({ ...layoutData, google_analytics_id: v })} />
                                <Input label="Google Tag Manager ID" value={layoutData.google_tag_manager_id} onChange={v => setLayoutData({ ...layoutData, google_tag_manager_id: v })} />
                            </div>
                        </div>
                    </div>
                )}


                {/* SYSTEM / MESSAGES */}
                {activeTab === 'system' && (
                    <div className="space-y-12 max-w-4xl mx-auto">
                        <section>
                            <h3 className="font-bold border-b pb-2 text-neutral-900 flex items-center gap-2 mb-6">
                                <CreditCard size={18} className="text-brand-primary" /> Assinatura e Plano
                            </h3>
                            <div className="bg-neutral-50 p-6 rounded-xl border border-neutral-200 flex flex-col md:flex-row items-center justify-between gap-6">
                                <div>
                                    <p className="text-xs font-bold text-neutral-500 uppercase tracking-widest mb-1">Plano Atual</p>
                                    <h2 className="text-2xl font-black text-brand-primary uppercase italic">
                                        {(tenant?.subscription_plan || 'Grátis').toUpperCase()}
                                    </h2>
                                    <p className="text-sm text-neutral-600 mt-1">
                                        Status: <span className={cn("font-bold", tenant?.subscription_status === 'active' ? "text-green-600" : "text-brand-primary")}>
                                            {tenant?.subscription_status === 'active' ? 'Ativo' : 'Período de Testes'}
                                        </span>
                                    </p>
                                </div>
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => alert('Funcionalidade de upgrade em desenvolvimento.')}
                                        className="px-6 py-3 bg-neutral-900 text-white font-bold rounded-xl hover:bg-neutral-800 transition-all flex items-center gap-2"
                                    >
                                        <Star size={18} className="text-brand-primary" fill="currentColor" />
                                        Gerenciar Plano
                                    </button>
                                </div>
                            </div>
                        </section>

                        <section>
                            <div className="flex justify-between items-center mb-6 border-b pb-2">
                                <h3 className="font-bold text-neutral-900 flex items-center gap-2">
                                    <Users size={18} className="text-brand-primary" /> Equipe da Loja
                                </h3>
                                <button
                                    onClick={() => setIsUserModalOpen(true)}
                                    className="px-4 py-2 bg-brand-primary text-white text-xs font-bold uppercase rounded-lg hover:opacity-90 transition-all flex items-center gap-2"
                                >
                                    <Users size={14} /> Adicionar Membro
                                </button>
                            </div>

                            <div className="bg-white border border-neutral-100 rounded-2xl overflow-hidden shadow-sm">
                                <table className="w-full text-left border-collapse">
                                    <thead className="bg-neutral-50 border-b border-neutral-100">
                                        <tr>
                                            <th className="px-6 py-4 text-[10px] font-black text-neutral-400 uppercase tracking-widest">Nome</th>
                                            <th className="px-6 py-4 text-[10px] font-black text-neutral-400 uppercase tracking-widest">Cargo</th>
                                            <th className="px-6 py-4 text-[10px] font-black text-neutral-400 uppercase tracking-widest text-right">Ações</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {teamMembers.map((member) => (
                                            <tr key={member.id} className="border-b border-neutral-50 last:border-0 hover:bg-neutral-50/50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="font-bold text-neutral-900">{member.full_name}</div>
                                                    <div className="text-xs text-neutral-400">{member.email}</div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={cn(
                                                        "px-2 py-1 rounded text-[10px] font-bold uppercase",
                                                        member.role === 'admin' ? "bg-brand-primary-light text-brand-primary" : "bg-neutral-100 text-neutral-500"
                                                    )}>
                                                        {member.role === 'admin' ? 'Gerente' : 'Caixa'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right flex justify-end gap-2">
                                                    <button
                                                        onClick={() => handleEditClick(member)}
                                                        className="p-2 text-indigo-500 hover:bg-indigo-50 rounded-lg transition-all"
                                                        title="Editar"
                                                    >
                                                        <SettingsIcon size={16} />
                                                    </button>
                                                    {member.email !== user?.email && (
                                                        <button
                                                            onClick={() => handleDeleteTeamMember(member.email)}
                                                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                                            title="Remover"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                        {teamMembers.length === 0 && (
                                            <tr>
                                                <td colSpan={3} className="px-6 py-12 text-center text-neutral-400 italic">
                                                    Nenhum membro encontrado além de você.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </section>

                        <section>
                            <h3 className="font-bold border-b pb-2 text-neutral-900 flex items-center gap-2 mb-6">
                                <Lock size={18} className="text-brand-primary" /> Dados de Acesso (Conta)
                            </h3>
                            <div className="p-6 bg-neutral-50 rounded-2xl border border-neutral-100 space-y-4">
                                <Input
                                    label="E-mail de Login"
                                    value={accountEmail}
                                    onChange={setAccountEmail}
                                    placeholder="seu@email.com"
                                />
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <Input
                                        label="Nova Senha"
                                        type="password"
                                        value={newPassword}
                                        onChange={setNewPassword}
                                        placeholder="No mínimo 6 caracteres"
                                    />
                                    <Input
                                        label="Confirmar Nova Senha"
                                        type="password"
                                        value={confirmPassword}
                                        onChange={setConfirmPassword}
                                    />
                                </div>
                                <div className="mt-4 flex justify-end">
                                    <button
                                        onClick={handleUpdateAccount}
                                        disabled={isUpdatingAccount}
                                        className="px-6 py-3 bg-neutral-900 text-white font-bold rounded-xl hover:bg-neutral-800 transition-all flex items-center gap-2"
                                    >
                                        {isUpdatingAccount ? <Loader2 className="animate-spin" /> : <Save size={18} />}
                                        Atualizar Dados de Acesso
                                    </button>
                                </div>
                            </div>
                        </section>

                        <section>
                            <h3 className="font-bold border-b pb-2 text-neutral-900 flex items-center gap-2 mb-6">
                                <DollarSign size={18} className="text-brand-primary" /> Pagamentos e Taxas
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Input label="Chave PIX para Recebimento" value={layoutData.pix_key} onChange={v => setLayoutData({ ...layoutData, pix_key: v })} placeholder="Sua chave aqui" />
                                <Input label="Taxa de Entrega Padrão (R$)" type="number" value={layoutData.default_delivery_fee} onChange={v => setLayoutData({ ...layoutData, default_delivery_fee: v })} />
                            </div>
                        </section>

                        <section>
                            <div className="pt-8 border-t border-red-100">
                                <h3 className="font-bold pb-2 text-red-600 flex items-center gap-2 mb-4">
                                    <AlertTriangle size={18} /> Zona de Perigo
                                </h3>
                                <div className="bg-red-50 p-6 rounded-xl border border-red-100 flex flex-col md:flex-row items-center justify-between gap-6">
                                    <div>
                                        <h4 className="font-bold text-red-900">Solicitar Exclusão de Dados (LGPD)</h4>
                                        <p className="text-sm text-red-700 mt-1 max-w-md">
                                            Você pode solicitar a exclusão completa da sua loja e dados de clientes. Nossa equipe processará o pedido sob os termos da lei.
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => setIsDeleteModalOpen(true)}
                                        className="px-6 py-3 bg-white border-2 border-red-100 text-red-600 font-bold rounded-xl hover:bg-red-600 hover:text-white hover:border-red-600 transition-all flex items-center gap-2"
                                    >
                                        <Trash2 size={18} />
                                        Solicitar Exclusão
                                    </button>
                                </div>
                            </div>
                        </section>
                    </div>
                )}

                {/* PRINTER */}
                {activeTab === 'printer' && (
                    <div className="space-y-6 max-w-4xl mx-auto">
                        <h3 className="font-bold border-b pb-2 text-neutral-900 flex items-center gap-2">
                            <Printer size={18} className="text-brand-primary" /> Configuração de Impressão
                        </h3>
                        <div className="p-4 bg-brand-primary-light rounded-xl border border-brand-primary/20 text-neutral-700 text-sm leading-relaxed">
                            A impressora física é gerenciada pelo sistema operacional. Aqui você define o <strong>formato do papel</strong> para que o cupom seja gerado com o layout correto (80mm é o padrão para térmicas grandes, 58mm para portáteis).
                        </div>
                        <div className="flex flex-wrap gap-4">
                            {['80mm', '58mm', 'a4'].map(size => (
                                <button
                                    key={size}
                                    onClick={() => setStoreData({ ...storeData, printer_width: size })}
                                    className={cn(
                                        "px-8 py-6 border-2 rounded-2xl font-black uppercase tracking-widest transition-all",
                                        storeData.printer_width === size
                                            ? "border-brand-primary bg-brand-primary-light text-brand-primary shadow-md scale-105"
                                            : "border-neutral-100 bg-white text-neutral-400 hover:border-neutral-200"
                                    )}
                                >
                                    {size}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Team Member Modal */}
            {isUserModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-white rounded-3xl shadow-2xl animate-in zoom-in-95 max-h-[90vh] w-full max-w-lg overflow-hidden flex flex-col">
                        <div className="flex justify-between items-center p-8 border-b border-neutral-100 bg-white">
                            <h2 className="text-xl font-black text-neutral-900 uppercase">
                                {editingMember ? 'Editar Membro' : 'Novo Membro'}
                            </h2>
                            <button onClick={() => { setIsUserModalOpen(false); setEditingMember(null); }} className="p-2 hover:bg-neutral-100 rounded-full transition-all text-neutral-400 hover:text-neutral-900">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="p-8 overflow-y-auto space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Input label="Nome Completo" value={newUserFullName} onChange={setNewUserFullName} placeholder="Ex: João Silva" />
                                <Input label="E-mail" value={newUserEmail} onChange={setNewUserEmail} placeholder="joao@email.com" />
                            </div>

                            <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-100">
                                <Input
                                    label={editingMember ? "Trocar Senha (deixe vazio para manter)" : "Senha Temporária"}
                                    type="password"
                                    value={newUserPassword}
                                    onChange={setNewUserPassword}
                                />
                            </div>

                            <div>
                                <label className="text-xs font-bold text-neutral-500 uppercase tracking-widest block mb-3">
                                    Permissões de Acesso
                                </label>
                                <div className="grid grid-cols-2 gap-2">
                                    {availableModules.map(module => (
                                        <button
                                            key={module.id}
                                            onClick={() => {
                                                if (newUserPermissions.includes(module.id)) {
                                                    setNewUserPermissions(newUserPermissions.filter(p => p !== module.id));
                                                } else {
                                                    setNewUserPermissions([...newUserPermissions, module.id]);
                                                }
                                            }}
                                            className={cn(
                                                "flex items-center gap-2 p-3 rounded-xl border-2 transition-all text-left",
                                                newUserPermissions.includes(module.id)
                                                    ? "bg-brand-primary border-brand-primary text-white"
                                                    : "bg-neutral-50 border-neutral-100 text-neutral-500 hover:border-neutral-200"
                                            )}
                                        >
                                            <div className={cn(
                                                "w-4 h-4 rounded border flex items-center justify-center",
                                                newUserPermissions.includes(module.id) ? "border-white bg-white/20" : "border-neutral-300 bg-white"
                                            )}>
                                                {newUserPermissions.includes(module.id) && <Check size={10} />}
                                            </div>
                                            <span className="text-xs font-bold uppercase">{module.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <button
                                onClick={handleSaveTeamMember}
                                disabled={isCreatingUser}
                                className="w-full py-4 bg-brand-primary text-white font-bold rounded-xl shadow-lg shadow-brand-primary/20 hover:opacity-90 transition-all flex items-center justify-center gap-2 mt-4"
                            >
                                {isCreatingUser ? <Loader2 className="animate-spin" /> : <Save size={18} />}
                                {editingMember ? 'Salvar Alterações' : 'Adicionar à Equipe'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {isDeleteModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl border-4 border-red-100 animate-in zoom-in-95">
                        <div className="flex flex-col items-center text-center mb-6">
                            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center text-red-600 mb-4">
                                <Trash2 size={32} />
                            </div>
                            <h2 className="text-xl font-black text-neutral-900 uppercase">Solicitar Exclusão?</h2>
                            <p className="text-neutral-500 mt-2 text-sm leading-relaxed">
                                Você está solicitando a remoção da loja <span className="font-bold text-neutral-900">{tenant?.name}</span>. <br />
                                Para confirmar a solicitação, digite sua senha:
                            </p>
                        </div>

                        <div className="space-y-4">
                            <Input
                                type="password"
                                label="Sua Senha Atual"
                                value={deletePassword}
                                onChange={setDeletePassword}
                            />

                            <div className="grid grid-cols-2 gap-3 pt-2">
                                <button
                                    onClick={() => { setIsDeleteModalOpen(false); setDeletePassword(''); }}
                                    className="py-3 font-bold text-neutral-500 hover:bg-neutral-100 rounded-xl transition-all"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={handleDeleteStore}
                                    disabled={isDeleting || !deletePassword}
                                    className="py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-lg shadow-red-600/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {isDeleting ? <Loader2 className="animate-spin" size={18} /> : <Trash2 size={18} />}
                                    Solicitar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// Simple UI Components to reduce clutter
const Input = ({ label, value, onChange, type = 'text', placeholder }: any) => (
    <div>
        <label className="text-xs font-bold text-neutral-500 uppercase mb-1 block">{label}</label>
        <input
            type={type}
            value={value || ''}
            onChange={e => onChange(e.target.value)}
            placeholder={placeholder}
            className="w-full p-2 border rounded-lg bg-neutral-50 focus:ring-2 focus:ring-brand-primary outline-none transition-all"
        />
    </div>
);

const TextArea = ({ label, value, onChange, placeholder }: any) => (
    <div>
        <label className="text-xs font-bold text-neutral-500 uppercase mb-1 block">{label}</label>
        <textarea
            value={value || ''}
            onChange={e => onChange(e.target.value)}
            placeholder={placeholder}
            className="w-full p-2 border rounded-lg bg-neutral-50 h-20 focus:ring-2 focus:ring-brand-primary outline-none transition-all"
        />
    </div>
);

const ColorInput = ({ label, value, onChange }: any) => (
    <div>
        <label className="text-xs font-bold text-neutral-500 uppercase mb-1 block">{label}</label>
        <div className="flex gap-2">
            <input type="color" value={value || '#000000'} onChange={e => onChange(e.target.value)} className="h-10 w-10 cursor-pointer rounded overflow-hidden p-0 border-0" />
            <input type="text" value={value || ''} onChange={e => onChange(e.target.value)} className="flex-1 p-2 border rounded-lg bg-neutral-50 uppercase text-xs font-mono" />
        </div>
    </div>
);

const Checkbox = ({ label, checked, onChange }: any) => (
    <div className="flex items-center gap-3 cursor-pointer group" onClick={() => onChange(!checked)}>
        <div className={cn(
            "w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all",
            checked ? "bg-brand-primary border-brand-primary text-white" : "border-neutral-200 bg-white group-hover:border-neutral-300"
        )}>
            {checked && <Save size={14} className="animate-in zoom-in-50 duration-200" />}
        </div>
        {label && <label className="text-sm font-bold text-neutral-700 cursor-pointer">{label}</label>}
    </div>
);

export default Settings;
