import React, { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import {
    Plus,
    Search,
    MoreVertical,
    Globe,
    Calendar,
    CheckCircle2,
    XCircle,
    Loader2,
    Building2,
    ShieldAlert,
    Settings,
    Eye,
    Save,
    UserCheck,
    KeyRound,
    Mail,
    AlertTriangle
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

type Toast = { id: number; type: 'success' | 'error'; message: string };

const TenantsPage = () => {
    const queryClient = useQueryClient();
    const [toasts, setToasts] = useState<Toast[]>([]);

    const showToast = useCallback((message: string, type: 'success' | 'error' = 'success') => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, type, message }]);
        setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
    }, []);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newTenantData, setNewTenantData] = useState({
        name: '',
        slug: '',
        niche: 'bakery',
        custom_domain: '',
        whatsapp: ''
    });

    // 1. Fetch Tenants
    const { data: tenants, isLoading, isError } = useQuery({
        queryKey: ['superadmin-tenants'],
        queryFn: async () => {
            try {
                // 1. Tenta via RPC (Mais seguro para Super Admin)
                const { data: rpcData, error: rpcError } = await supabase.rpc('get_admin_tenants_list');

                if (!rpcError && rpcData) {
                    return rpcData;
                }

                console.warn('[TenantsPage] RPC falhou ou não existe, tentando SELECT normal...', rpcError);

                // 2. Fallback para SELECT normal (Depende de RLS 'fix_superadmin_perms.sql')
                const { data: selectData, error: selectError } = await supabase
                    .from('tenants')
                    .select('*')
                    .order('created_at', { ascending: false });

                if (selectError) {
                    throw selectError;
                }

                return selectData;
            } catch (err: any) {
                console.error('[TenantsPage] Erro fatal ao buscar tenants:', err);
                throw err;
            }
        },
        retry: 1
    });

    // 1b. Fetch User for selected tenant (Admin Email lookup)
    const [selectedTenantUsers, setSelectedTenantUsers] = useState<any[]>([]);

    // 2. Mutation for status toggle
    const toggleStatusMutation = useMutation({
        mutationFn: async ({ id, status }: { id: string, status: string }) => {
            const newStatus = status === 'active' ? 'suspended' : 'active';
            const { error } = await supabase
                .from('tenants')
                .update({ status: newStatus })
                .eq('id', id);
            if (error) throw error;
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['superadmin-tenants'] })
    });

    // Edit Tenant State
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingTenant, setEditingTenant] = useState<any>(null);

    // 4. Mutation for creating tenant
    const createTenantMutation = useMutation({
        mutationFn: async (newTenant: typeof newTenantData) => {
            const cleanData = {
                ...newTenant,
                custom_domain: newTenant.custom_domain.trim() || null,
                status: 'active',
                subscription_status: 'trial',
                trial_ends_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString()
            };

            const { data, error } = await supabase
                .from('tenants')
                .insert([cleanData])
                .select()
                .single();
            if (error) throw error;

            // 5. Aplica os dados do template com base no nicho selecionado
            try {
                const { applyDefaultTemplate } = await import('../../lib/tenantTemplate');
                await applyDefaultTemplate(data.id, newTenantData.niche, data.name, newTenant.whatsapp);
            } catch (templateErr) {
                console.error('[TenantsPage] Error applying template:', templateErr);
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['superadmin-tenants'] });
            setIsModalOpen(false);
            setNewTenantData({ name: '', slug: '', niche: 'bakery', custom_domain: '', whatsapp: '' });
            alert('Loja criada com sucesso!');
        },
        onError: (err: any) => {
            console.error('Erro ao criar loja:', err);
            alert(`Erro ao criar loja: ${err.message || 'Verifique se o slug já existe.'}`);
        }
    });

    // 5. Mutation for Updating Tenant
    const updateTenantMutation = useMutation({
        mutationFn: async (updatedData: any) => {
            const { id, ...dataToUpdate } = updatedData;

            // Clean empty strings to null for optional fields like custom_domain
            if (dataToUpdate.custom_domain && dataToUpdate.custom_domain.trim() === '') {
                dataToUpdate.custom_domain = null;
            }

            const { error } = await supabase
                .from('tenants')
                .update(dataToUpdate)
                .eq('id', id);

            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['superadmin-tenants'] });
            setIsEditModalOpen(false);
            setEditingTenant(null);
            showToast('Loja atualizada com sucesso!');
        },
        onError: (err: any) => {
            console.error('Erro ao atualizar loja:', err);
            showToast(`Erro ao atualizar loja: ${err.message}`, 'error');
        }
    });

    // 4. Mutation for DELETING tenant (Super Admin Force Delete)
    const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
    const [tenantToDelete, setTenantToDelete] = useState<any>(null);
    const [deleteConfirmationText, setDeleteConfirmationText] = useState('');

    const deleteTenantMutation = useMutation({
        mutationFn: async (id: string) => {
            const { data, error } = await supabase.rpc('force_delete_tenant', { target_tenant_id: id });
            if (error) throw error;
            if (data?.status === 'error') throw new Error(data.message);
            return data;
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['superadmin-tenants'] });
            setIsDeleteConfirmOpen(false);
            setTenantToDelete(null);
            setDeleteConfirmationText('');
            showToast(data?.message || 'Loja removida permanentemente!');
        },
        onError: (err: any) => showToast('Erro ao deletar loja: ' + err.message, 'error')
    });

    // --- NEW MASTER ADMIN ACTIONS ---

    // A. Confirm Email Mutation
    const confirmEmailMutation = useMutation({
        mutationFn: async (email: string) => {
            const { data, error } = await supabase.rpc('master_confirm_user_email', { p_target_email: email });
            if (error) throw error;
            if (data.status === 'error') throw new Error(data.message);
            return data;
        },
        onSuccess: () => showToast('Email confirmado com sucesso! O usuário já pode logar.'),
        onError: (err: any) => showToast('Erro ao confirmar email: ' + err.message, 'error')
    });

    // B. Update Email Mutation
    const updateEmailMutation = useMutation({
        mutationFn: async ({ oldEmail, newEmail }: { oldEmail: string, newEmail: string }) => {
            const { data, error } = await supabase.rpc('master_update_user_email', { p_old_email: oldEmail, p_new_email: newEmail });
            if (error) throw error;
            if (data.status === 'error') throw new Error(data.message);
            return data;
        },
        onSuccess: () => {
            showToast('Email atualizado com sucesso!');
            setIsUserActionsOpen(false);
        },
        onError: (err: any) => showToast('Erro ao atualizar email: ' + err.message, 'error')
    });

    // C. Reset Password Mutation
    const resetPasswordMutation = useMutation({
        mutationFn: async ({ email, newPassword }: { email: string, newPassword: string }) => {
            const { data, error } = await supabase.rpc('master_reset_user_password', { p_target_email: email, p_new_password: newPassword });
            if (error) throw error;
            if (data.status === 'error') throw new Error(data.message);
            return data;
        },
        onSuccess: () => {
            showToast('Senha redefinida com sucesso!');
            setIsUserActionsOpen(false);
        },
        onError: (err: any) => showToast('Erro ao redefinir senha: ' + err.message, 'error')
    });

    // User Management Modal State
    const [isUserActionsOpen, setIsUserActionsOpen] = useState(false);
    const [selectedTenantForUserAction, setSelectedTenantForUserAction] = useState<any>(null);
    const [adminUser, setAdminUser] = useState<any>(null); // The admin user of the selected tenant

    // Actions Inputs
    const [actionNewEmail, setActionNewEmail] = useState('');
    const [actionNewPassword, setActionNewPassword] = useState('');

    const openUserActions = async (tenant: any) => {
        setSelectedTenantForUserAction(tenant);
        // Find the admin user for this tenant
        // We'll query the public.profiles table for the 'admin' of this tenant
        // Find the admin user for this tenant safely using RPC (bypassing RLS)
        const { data, error } = await supabase.rpc('get_tenant_admin_profile', { p_tenant_id: tenant.id });

        if (error) {
            console.error('Error fetching admin:', error);
            alert('Erro ao buscar admin: ' + error.message);
            return;
        }

        if (data.status === 'success' && data.data) {
            setAdminUser(data.data);
            setActionNewEmail(data.data.email);
            setActionNewPassword('');
            setIsUserActionsOpen(true);
        } else {
            console.warn('Admin not found response:', data);
            showToast('Admin não encontrado para esta loja.', 'error');
        }
    };

    const handleCreateTenant = (e: React.FormEvent) => {
        e.preventDefault();
        console.log('[TenantsPage] Submitting form with:', newTenantData);
        createTenantMutation.mutate(newTenantData);
    };

    const filteredTenants = tenants?.filter(t =>
    (t.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.slug?.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <>
            <div className="space-y-8 animate-in fade-in duration-500">
                {/* Header Actions */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    <div className="relative flex-1 max-w-md w-full">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500" size={20} />
                        <input
                            type="text"
                            placeholder="Buscar por nome ou slug..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 py-4 bg-neutral-800/50 border border-neutral-700 rounded-3xl text-white outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
                        />
                    </div>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-3xl font-black uppercase tracking-widest transition-all shadow-xl shadow-indigo-600/20 active:scale-95 whitespace-nowrap"
                    >
                        <Plus size={20} /> Nova Loja
                    </button>
                </div>

                {/* Error State */}
                {isError && (
                    <div className="bg-red-500/10 border border-red-500/50 p-6 rounded-3xl mb-8 flex items-center gap-4 animate-in fade-in slide-in-from-top-4">
                        <ShieldAlert size={32} className="text-red-500" />
                        <div>
                            <h3 className="text-red-500 font-black uppercase tracking-widest mb-1">Erro de Carregamento</h3>
                            <p className="text-red-400 text-sm">
                                Não foi possível carregar a lista de lojas. Isso geralmente ocorre se as permissões de banco de dados (RLS) não foram atualizadas.
                                <br />
                                <strong>Solução:</strong> Rode o script <code>fix_full_system.sql</code> no Supabase.
                            </p>
                        </div>
                    </div>
                )}

                {/* Tenants List — Card Layout (sem scroll horizontal) */}
                <div className="space-y-3">
                    {isLoading ? (
                        [1, 2, 3].map(i => (
                            <div key={i} className="animate-pulse bg-neutral-800/30 rounded-3xl border border-neutral-800 p-6 h-28" />
                        ))
                    ) : filteredTenants?.length === 0 ? (
                        <div className="text-center py-20 text-neutral-600 italic">Nenhuma loja encontrada.</div>
                    ) : filteredTenants?.map((tenant) => (
                        <div key={tenant.id} className="bg-neutral-800/30 hover:bg-neutral-800/50 transition-colors rounded-3xl border border-neutral-800 p-5 group">
                            {/* Linha principal: ícone + nome + badges */}
                            <div className="flex flex-wrap items-center gap-3">
                                <div className="w-11 h-11 flex-shrink-0 bg-neutral-800 rounded-2xl flex items-center justify-center text-indigo-500 group-hover:bg-indigo-500 group-hover:text-white transition-all">
                                    <Building2 size={20} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-bold text-white leading-none truncate">{tenant.name}</p>
                                    <p className="text-[10px] text-neutral-500 mt-1 uppercase tracking-tighter truncate">
                                        {tenant.slug}.cliquepdv.com.br &nbsp;·&nbsp; Criada em {tenant.created_at ? format(new Date(tenant.created_at), "dd/MM/yyyy") : '—'}
                                    </p>
                                </div>
                                <div className="flex flex-wrap items-center gap-2 flex-shrink-0">
                                    {/* Status badge */}
                                    <span className={cn(
                                        "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
                                        tenant.status === 'active'
                                            ? "bg-green-500/10 text-green-500 border border-green-500/20"
                                            : "bg-red-500/10 text-red-500 border border-red-500/20"
                                    )}>
                                        <div className={cn("w-1.5 h-1.5 rounded-full", tenant.status === 'active' ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" : "bg-red-500")} />
                                        {tenant.status === 'active' ? 'Ativo' : 'Suspenso'}
                                    </span>
                                    {/* Nicho badge */}
                                    <span className="bg-neutral-800 px-2.5 py-1 rounded-full text-[10px] text-neutral-400 uppercase tracking-widest border border-neutral-700">
                                        {({ 'bakery': 'Padaria', 'snack_bar': 'Lanchonete', 'pizzeria': 'Pizzaria', 'market': 'Mercado', 'confectionery': 'Confeitaria', 'other': 'Outro' } as Record<string, string>)[tenant.niche] || tenant.niche}
                                    </span>
                                    {/* Assinatura badge */}
                                    <span className="bg-neutral-800/80 px-2.5 py-1 rounded-full text-[10px] text-neutral-500 uppercase tracking-widest border border-neutral-700 flex items-center gap-1.5">
                                        <Calendar size={11} />
                                        {({ 'trial': 'Teste', 'active': 'Ativo', 'past_due': 'Pendente', 'canceled': 'Cancelado' } as Record<string, string>)[tenant.subscription_status] || tenant.subscription_status}
                                        {tenant.trial_ends_at ? <>&nbsp;até {format(new Date(tenant.trial_ends_at), "dd/MM/yy")}</> : null}
                                    </span>
                                </div>
                            </div>

                            {/* Ações */}
                            <div className="mt-4 pt-4 border-t border-neutral-800/60 flex flex-wrap items-center gap-2">
                                <button
                                    onClick={() => window.open(`/?test_slug=${tenant.slug}`, '_blank')}
                                    className="px-3 py-2 bg-neutral-700 hover:bg-neutral-600 text-white rounded-xl transition-all font-bold text-[10px] uppercase tracking-widest flex items-center gap-1.5"
                                    title="Visualizar loja"
                                >
                                    <Eye size={14} /> Ver
                                </button>
                                <button
                                    onClick={() => { setEditingTenant({ id: tenant.id, name: tenant.name, slug: tenant.slug, custom_domain: tenant.custom_domain || '', niche: tenant.niche, subscription_plan: tenant.subscription_plan || 'free', status: tenant.status }); setIsEditModalOpen(true); }}
                                    className="px-3 py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded-xl transition-all font-bold text-[10px] uppercase tracking-widest flex items-center gap-1.5 border border-neutral-700"
                                    title="Editar"
                                >
                                    <Settings size={14} /> Editar
                                </button>
                                <button
                                    onClick={() => window.open(`/admin?tenant_override=${tenant.slug}`, '_blank')}
                                    className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-all font-bold text-[10px] uppercase tracking-widest flex items-center gap-1.5 shadow-md shadow-indigo-600/20"
                                    title="Painel admin"
                                >
                                    <Settings size={14} /> Admin
                                </button>
                                <button
                                    onClick={() => openUserActions(tenant)}
                                    className="px-3 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl transition-all font-bold text-[10px] uppercase tracking-widest flex items-center gap-1.5 shadow-md shadow-amber-600/20"
                                    title="Acessos"
                                >
                                    <UserCheck size={14} /> Acessos
                                </button>
                                <div className="flex-1" />
                                <button
                                    onClick={() => toggleStatusMutation.mutate({ id: tenant.id, status: tenant.status })}
                                    className={cn("p-2 rounded-xl transition-all text-sm", tenant.status === 'active' ? "text-neutral-500 hover:text-indigo-400 hover:bg-indigo-500/10" : "text-neutral-500 hover:text-green-400 hover:bg-green-500/10")}
                                    title={tenant.status === 'active' ? 'Suspender Loja' : 'Ativar Loja'}
                                >
                                    <ShieldAlert size={16} />
                                </button>
                                <button
                                    onClick={() => { setTenantToDelete(tenant); setDeleteConfirmationText(''); setIsDeleteConfirmOpen(true); }}
                                    className="p-2 rounded-xl text-neutral-500 hover:text-red-500 hover:bg-red-500/10 transition-all"
                                    title="Excluir"
                                >
                                    <XCircle size={16} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>


                {/* Modal de Criação */}
                {
                    isModalOpen && (
                        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
                            <form
                                onSubmit={handleCreateTenant}
                                className="bg-neutral-900 rounded-[32px] w-full max-w-xl border border-neutral-800 p-10 space-y-6 animate-in zoom-in duration-300 shadow-2xl overflow-y-auto max-h-[90vh]"
                            >
                                <div className="flex justify-between items-center">
                                    <h2 className="text-2xl font-black text-white uppercase tracking-tighter italic">Nova Loja na Plataforma</h2>
                                    <button type="button" onClick={() => setIsModalOpen(false)} className="text-neutral-500 hover:text-white transition-colors">
                                        <XCircle size={24} />
                                    </button>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-[10px] font-black uppercase tracking-widest text-neutral-500 mb-2 ml-1">Nome da Empresa</label>
                                        <input
                                            required
                                            type="text"
                                            placeholder="Ex: Padaria do João"
                                            className="w-full bg-neutral-800 border border-neutral-700 rounded-2xl px-5 py-4 text-white placeholder:text-neutral-600 outline-none focus:border-indigo-500 transition-all font-medium"
                                            value={newTenantData.name}
                                            onChange={(e) => setNewTenantData({ ...newTenantData, name: e.target.value })}
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-[10px] font-black uppercase tracking-widest text-neutral-500 mb-2 ml-1">Slug (URL)</label>
                                            <input
                                                required
                                                type="text"
                                                placeholder="ex: joao-padaria"
                                                className="w-full bg-neutral-800 border border-neutral-700 rounded-2xl px-5 py-4 text-white placeholder:text-neutral-600 outline-none focus:border-indigo-500 transition-all font-mono text-sm"
                                                value={newTenantData.slug}
                                                onChange={(e) => setNewTenantData({ ...newTenantData, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-black uppercase tracking-widest text-neutral-500 mb-2 ml-1">Nicho</label>
                                            <select
                                                className="w-full bg-neutral-800 border border-neutral-700 rounded-2xl px-5 py-4 text-white outline-none focus:border-indigo-500 transition-all font-medium appearance-none"
                                                value={newTenantData.niche}
                                                onChange={(e) => setNewTenantData({ ...newTenantData, niche: e.target.value })}
                                            >
                                                <option value="bakery">Padaria</option>
                                                <option value="snack_bar">Lanchonete</option>
                                                <option value="pizzeria">Pizzaria</option>
                                                <option value="market">Mercado</option>
                                                <option value="confectionery">Confeitaria</option>
                                                <option value="other">Outro</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-[10px] font-black uppercase tracking-widest text-neutral-500 mb-2 ml-1">Domínio Próprio (Opcional)</label>
                                        <input
                                            type="text"
                                            placeholder="Ex: www.padariadojoao.com.br"
                                            className="w-full bg-neutral-800 border border-neutral-700 rounded-2xl px-5 py-4 text-white placeholder:text-neutral-600 outline-none focus:border-amber-500 transition-all font-mono text-sm"
                                            value={newTenantData.custom_domain}
                                            onChange={(e) => setNewTenantData({ ...newTenantData, custom_domain: e.target.value })}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-[10px] font-black uppercase tracking-widest text-neutral-500 mb-2 ml-1">WhatsApp de Contato</label>
                                        <input
                                            type="text"
                                            placeholder="Ex: 16999999999"
                                            className="w-full bg-neutral-800 border border-neutral-700 rounded-2xl px-5 py-4 text-white placeholder:text-neutral-600 outline-none focus:border-amber-500 transition-all font-mono text-sm"
                                            value={newTenantData.whatsapp}
                                            onChange={(e) => setNewTenantData({ ...newTenantData, whatsapp: e.target.value.replace(/\D/g, '') })}
                                        />
                                    </div>
                                </div>

                                <div className="pt-4">
                                    <button
                                        type="submit"
                                        disabled={createTenantMutation.isPending}
                                        className="w-full py-5 bg-amber-600 hover:bg-amber-700 disabled:bg-neutral-800 text-white rounded-2xl font-black uppercase tracking-widest transition-all shadow-xl shadow-amber-600/10 flex items-center justify-center gap-3"
                                    >
                                        {createTenantMutation.isPending ? <Loader2 className="animate-spin" size={20} /> : <Plus size={20} />}
                                        Criar Nova Instância
                                    </button>
                                </div>
                            </form>
                        </div>
                    )
                }
                {/* Delete Confirmation Modal (Super Admin) */}
                {
                    isDeleteConfirmOpen && (
                        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in">
                            <div className="bg-neutral-900 border border-red-900/50 rounded-3xl p-8 max-w-md w-full shadow-2xl animate-in zoom-in-95 overflow-y-auto max-h-[90vh]">
                                <div className="flex flex-col items-center text-center mb-6">
                                    <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center text-red-500 mb-4 border border-red-500/20">
                                        <XCircle size={32} />
                                    </div>
                                    <h2 className="text-xl font-black text-white uppercase tracking-tight">Zona de Perigo</h2>
                                    <p className="text-neutral-400 mt-2 text-sm leading-relaxed">
                                        Você vai excluir a loja <span className="text-white font-bold">{tenantToDelete?.name}</span> e todos os seus dados. <br />
                                        <span className="text-red-400 font-bold block mt-2">ESSA AÇÃO NÃO PODE SER DESFEITA.</span>
                                    </p>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-[10px] font-black uppercase tracking-widest text-neutral-500 mb-2 text-center">
                                            Digite <span className="text-white">DELETAR</span> para confirmar
                                        </label>
                                        <input
                                            type="text"
                                            className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-center text-white font-mono tracking-widest uppercase focus:border-red-500 outline-none transition-all"
                                            value={deleteConfirmationText}
                                            onChange={(e) => setDeleteConfirmationText(e.target.value.toUpperCase())}
                                            placeholder="DELETAR"
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-3 pt-2">
                                        <button
                                            onClick={() => { setIsDeleteConfirmOpen(false); setTenantToDelete(null); }}
                                            className="py-3 font-bold text-neutral-400 hover:bg-neutral-800 rounded-xl transition-all uppercase text-xs tracking-widest"
                                        >
                                            Cancelar
                                        </button>
                                        <button
                                            onClick={() => deleteTenantMutation.mutate(tenantToDelete?.id)}
                                            disabled={deleteConfirmationText !== 'DELETAR'}
                                            className="py-3 bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-black rounded-xl shadow-lg shadow-red-600/20 uppercase text-xs tracking-widest flex items-center justify-center gap-2"
                                        >
                                            Excluir Tudo
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )
                }
                {/* Modal de Edição */}
                {
                    isEditModalOpen && editingTenant && (
                        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
                            <form
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    updateTenantMutation.mutate(editingTenant);
                                }}
                                className="bg-neutral-900 rounded-[32px] w-full max-w-xl border border-neutral-800 p-10 space-y-6 animate-in zoom-in duration-300 shadow-2xl overflow-y-auto max-h-[90vh]"
                            >
                                <div className="flex justify-between items-center">
                                    <h2 className="text-2xl font-black text-white uppercase tracking-tighter italic">Editar Loja</h2>
                                    <button type="button" onClick={() => setIsEditModalOpen(false)} className="text-neutral-500 hover:text-white transition-colors">
                                        <XCircle size={24} />
                                    </button>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-[10px] font-black uppercase tracking-widest text-neutral-500 mb-2 ml-1">Nome da Empresa</label>
                                        <input
                                            required
                                            type="text"
                                            className="w-full bg-neutral-800 border border-neutral-700 rounded-2xl px-5 py-4 text-white placeholder:text-neutral-600 outline-none focus:border-indigo-500 transition-all font-medium"
                                            value={editingTenant.name}
                                            onChange={(e) => setEditingTenant({ ...editingTenant, name: e.target.value })}
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-[10px] font-black uppercase tracking-widest text-neutral-500 mb-2 ml-1">Slug (URL)</label>
                                            <input
                                                required
                                                type="text"
                                                className="w-full bg-neutral-800 border border-neutral-700 rounded-2xl px-5 py-4 text-white placeholder:text-neutral-600 outline-none focus:border-indigo-500 transition-all font-mono text-sm"
                                                value={editingTenant.slug}
                                                onChange={(e) => setEditingTenant({ ...editingTenant, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-black uppercase tracking-widest text-neutral-500 mb-2 ml-1">Domínio Próprio</label>
                                            <input
                                                type="text"
                                                className="w-full bg-neutral-800 border border-neutral-700 rounded-2xl px-5 py-4 text-white placeholder:text-neutral-600 outline-none focus:border-indigo-500 transition-all font-mono text-sm"
                                                value={editingTenant.custom_domain}
                                                onChange={(e) => setEditingTenant({ ...editingTenant, custom_domain: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-[10px] font-black uppercase tracking-widest text-neutral-500 mb-2 ml-1">Nicho</label>
                                            <select
                                                className="w-full bg-neutral-800 border border-neutral-700 rounded-2xl px-5 py-4 text-white outline-none focus:border-indigo-500 transition-all font-medium appearance-none"
                                                value={editingTenant.niche}
                                                onChange={(e) => setEditingTenant({ ...editingTenant, niche: e.target.value })}
                                            >
                                                <option value="bakery">Padaria</option>
                                                <option value="snack_bar">Lanchonete</option>
                                                <option value="pizzeria">Pizzaria</option>
                                                <option value="market">Mercado</option>
                                                <option value="confectionery">Confeitaria</option>
                                                <option value="other">Outro</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-black uppercase tracking-widest text-neutral-500 mb-2 ml-1">Plano</label>
                                            <select
                                                className="w-full bg-neutral-800 border border-neutral-700 rounded-2xl px-5 py-4 text-white outline-none focus:border-indigo-500 transition-all font-medium appearance-none"
                                                value={editingTenant.subscription_plan}
                                                onChange={(e) => setEditingTenant({ ...editingTenant, subscription_plan: e.target.value })}
                                            >
                                                <option value="free">Grátis</option>
                                                <option value="basic">Básico</option>
                                                <option value="premium">Premium</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-[10px] font-black uppercase tracking-widest text-neutral-500 mb-2 ml-1">Status da Conta</label>
                                        <select
                                            className="w-full bg-neutral-800 border border-neutral-700 rounded-2xl px-5 py-4 text-white outline-none focus:border-indigo-500 transition-all font-medium appearance-none"
                                            value={editingTenant.status}
                                            onChange={(e) => setEditingTenant({ ...editingTenant, status: e.target.value })}
                                        >
                                            <option value="active">Ativa</option>
                                            <option value="suspended">Suspensa</option>
                                            <option value="deletion_requested">Exclusão Solicitada</option>
                                            <option value="deleted">Deletada (Soft)</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="pt-4 grid grid-cols-2 gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setIsEditModalOpen(false)}
                                        className="w-full py-5 bg-neutral-800 hover:bg-neutral-700 text-neutral-400 font-bold rounded-2xl transition-all"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={updateTenantMutation.isPending}
                                        className="w-full py-5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-neutral-800 text-white rounded-2xl font-black uppercase tracking-widest transition-all shadow-xl shadow-indigo-600/10 flex items-center justify-center gap-3"
                                    >
                                        {updateTenantMutation.isPending ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                                        Salvar Alterações
                                    </button>
                                </div>
                            </form>
                        </div>
                    )
                }
                {/* User Actions Modal */}
                {
                    isUserActionsOpen && adminUser && (
                        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
                            <div className="bg-neutral-900 border border-neutral-700 rounded-3xl p-8 max-w-lg w-full shadow-2xl animate-in zoom-in-95 space-y-6 overflow-y-auto max-h-[90vh]">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h2 className="text-xl font-black text-white uppercase tracking-tight">Gerenciar Acesso</h2>
                                        <p className="text-neutral-400 text-sm mt-1">Loja: <span className="text-indigo-400">{selectedTenantForUserAction?.name}</span></p>
                                        <p className="text-neutral-500 text-xs font-mono mt-1">Admin ID: {adminUser.id}</p>
                                    </div>
                                    <button onClick={() => setIsUserActionsOpen(false)} className="text-neutral-500 hover:text-white"><XCircle size={24} /></button>
                                </div>

                                {/* 1. Confirm Email */}
                                <div className="bg-neutral-800/50 p-4 rounded-2xl border border-neutral-700/50">
                                    <h3 className="text-xs font-black text-green-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                                        <CheckCircle2 size={14} /> Validação
                                    </h3>
                                    <p className="text-neutral-300 text-sm mb-3">
                                        Email atual: <span className="text-white font-mono">{adminUser.email}</span>
                                    </p>
                                    <button
                                        onClick={() => confirmEmailMutation.mutate(adminUser.email)}
                                        className="w-full py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold text-xs uppercase tracking-widest transition-all"
                                    >
                                        Forçar Confirmação de Email
                                    </button>
                                </div>

                                {/* 2. Change Email */}
                                <div className="bg-neutral-800/50 p-4 rounded-2xl border border-neutral-700/50">
                                    <h3 className="text-xs font-black text-amber-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                                        <Mail size={14} /> Alterar Email
                                    </h3>
                                    <div className="flex gap-2">
                                        <input
                                            type="email"
                                            value={actionNewEmail}
                                            onChange={(e) => setActionNewEmail(e.target.value)}
                                            className="flex-1 bg-neutral-900 border border-neutral-700 rounded-xl px-3 py-2 text-white text-sm"
                                            placeholder="Novo email..."
                                        />
                                        <button
                                            onClick={() => updateEmailMutation.mutate({ oldEmail: adminUser.email, newEmail: actionNewEmail })}
                                            className="px-4 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold text-xs uppercase tracking-widest"
                                            disabled={!actionNewEmail || actionNewEmail === adminUser.email}
                                        >
                                            Salvar
                                        </button>
                                    </div>
                                </div>

                                {/* 3. Reset Password */}
                                <div className="bg-neutral-800/50 p-4 rounded-2xl border border-neutral-700/50">
                                    <h3 className="text-xs font-black text-red-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                                        <KeyRound size={14} /> Redefinir Senha
                                    </h3>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={actionNewPassword}
                                            onChange={(e) => setActionNewPassword(e.target.value)}
                                            className="flex-1 bg-neutral-900 border border-neutral-700 rounded-xl px-3 py-2 text-white text-sm"
                                            placeholder="Nova senha..."
                                        />
                                        <button
                                            onClick={() => resetPasswordMutation.mutate({ email: adminUser.email, newPassword: actionNewPassword })}
                                            className="px-4 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-xs uppercase tracking-widest"
                                            disabled={!actionNewPassword}
                                        >
                                            Redefinir
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )
                }
            </div >

            {/* Toast Notifications */}
            <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 items-end pointer-events-none">
                {toasts.map(toast => (
                    <div
                        key={toast.id}
                        className={cn(
                            "flex items-center gap-3 px-5 py-4 rounded-2xl shadow-2xl border animate-in slide-in-from-right-8 duration-300 max-w-sm pointer-events-auto",
                            toast.type === 'success'
                                ? "bg-neutral-900 border-green-500/30 text-green-400"
                                : "bg-neutral-900 border-red-500/30 text-red-400"
                        )}
                    >
                        {toast.type === 'success'
                            ? <CheckCircle2 size={20} className="flex-shrink-0 text-green-500" />
                            : <AlertTriangle size={20} className="flex-shrink-0 text-red-500" />
                        }
                        <p className="text-sm font-medium text-white leading-tight">{toast.message}</p>
                    </div>
                ))}
            </div>
        </>
    );
};

export default TenantsPage;
