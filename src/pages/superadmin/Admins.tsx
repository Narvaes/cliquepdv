import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import {
    Users,
    ShieldCheck,
    Plus,
    Trash2,
    Edit2,
    XCircle,
    Save,
    Loader2,
    Check
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { format } from 'date-fns';

const AdminsPage = () => {
    const { user: currentUser } = useAuth();
    const queryClient = useQueryClient();
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    // Create/Promote Form
    const [emailToPromote, setEmailToPromote] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [selectedLevel, setSelectedLevel] = useState<'master' | 'support'>('support');

    // Editing State
    const [editingAdmin, setEditingAdmin] = useState<any>(null);

    const availablePermissions = [
        { id: 'manage_tenants', label: 'Gerenciar Lojas (Criar/Editar)' },
        { id: 'delete_tenants', label: 'Deletar Lojas (Permissão Crítica)' },
        { id: 'manage_financial', label: 'Gestão Financeira' },
        { id: 'manage_admins', label: 'Gerenciar Outros Admins' }
    ];

    // Helper to determine Check Level
    const getAdminLevel = (perms: string[]) => {
        if (perms.includes('delete_tenants') && perms.includes('manage_admins')) return 'master';
        return 'support';
    };

    // 1. Fetch Super Admins
    const { data: admins, isLoading } = useQuery({
        queryKey: ['superadmins'],
        queryFn: async () => {
            const { data, error } = await supabase.rpc('get_all_superadmins');
            if (error) throw error;
            return data;
        }
    });

    // 2. Add/Promote User (Using Intelligent RPC)
    const promoteMutation = useMutation({
        mutationFn: async ({ email, password, level }: { email: string, password?: string, level: 'master' | 'support' }) => {
            // Define permissions based on level
            const permissions = level === 'master'
                ? ['read_all', 'manage_tenants', 'delete_tenants', 'manage_financial', 'manage_admins']
                : ['read_all', 'manage_tenants'];

            // Use the Intelligent RPC to Create OR Update
            const { data, error } = await supabase.rpc('create_new_admin_user', {
                new_email: email,
                new_password: password || '12345678', // Default Temporary password if empty, or enforce validation logic
                new_role: 'superadmin',
                new_permissions: permissions
            });

            if (error) throw error;
            return data;
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['superadmins'] });
            setIsCreateModalOpen(false);
            setEmailToPromote('');
            setNewPassword('');
            setSelectedLevel('support');

            if (data.status === 'created') {
                alert(`Usuário criado com sucesso!\nSenha temporária: ${newPassword || '12345678'}`);
            } else {
                alert('Usuário existente atualizado para a equipe admin!');
            }
        },
        onError: (err: any) => alert('Erro: ' + err.message)
    });

    // 3. Update Permissions
    const updatePermissionsMutation = useMutation({
        mutationFn: async ({ id, permissions, role }: { id: string, permissions: string[], role?: string }) => {
            const { error } = await supabase.rpc('update_superadmin_permissions', {
                p_admin_id: id,
                p_permissions: permissions,
                p_role: role || 'superadmin'
            });
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['superadmins'] });
            setEditingAdmin(null);
        },
        onError: (err: any) => alert('Erro ao atualizar permissões: ' + err.message)
    });

    const handleTogglePermission = (perm: string) => {
        if (!editingAdmin) return;
        const currentPerms = editingAdmin.permissions || [];
        const newPerms = currentPerms.includes(perm)
            ? currentPerms.filter((p: string) => p !== perm)
            : [...currentPerms, perm];

        setEditingAdmin({ ...editingAdmin, permissions: newPerms });
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h2 className="text-xl font-black text-neutral-100 uppercase tracking-tight flex items-center gap-2">
                        <ShieldCheck className="text-indigo-500" />
                        Equipe Administrativa
                    </h2>
                    <p className="text-neutral-500 text-sm">Gerencie quem tem acesso ao Painel Master</p>
                </div>
                <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-2xl font-bold uppercase text-xs tracking-widest transition-all shadow-xl shadow-indigo-600/20 active:scale-95"
                >
                    <Plus size={18} /> Adicionar Membro
                </button>
            </div>

            {/* List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {admins?.map(admin => {
                    const level = getAdminLevel(admin.permissions || []);
                    return (
                        <div key={admin.id} className="bg-neutral-900 border border-neutral-800 p-6 rounded-3xl group hover:border-indigo-500/50 transition-colors relative overflow-hidden">
                            {/* Level Badge */}
                            <div className={cn(
                                "absolute top-0 right-0 px-4 py-1 rounded-bl-2xl text-[10px] uppercase font-black tracking-widest",
                                level === 'master' ? "bg-red-500 text-white" : "bg-neutral-800 text-neutral-400"
                            )}>
                                {level === 'master' ? 'Master' : 'Suporte'}
                            </div>

                            <div className="flex items-start justify-between mb-4 mt-2">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-full bg-neutral-800 flex items-center justify-center text-indigo-500 font-black text-lg border border-neutral-700">
                                        {(admin.full_name || 'U').charAt(0).toUpperCase()}
                                    </div>
                                    <div className="overflow-hidden">
                                        <h3 className="font-bold text-white truncate">{admin.full_name || 'Sem Nome'}</h3>
                                        <div className="flex items-center gap-2 text-xs text-neutral-500 font-mono bg-neutral-950 px-2 py-1 rounded-lg w-fit mt-1">
                                            {admin.email}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-between items-end mt-4 pt-4 border-t border-neutral-800">
                                <div className="space-y-1">
                                    <p className="text-[10px] font-bold text-neutral-600 uppercase tracking-widest">Permissões</p>
                                    <p className="text-xs text-white font-bold">
                                        {(admin.permissions || []).length} acesso(s)
                                    </p>
                                </div>
                                <button
                                    onClick={() => setEditingAdmin(admin)}
                                    className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded-xl transition-all text-xs font-bold uppercase tracking-wider flex items-center gap-2"
                                >
                                    <Edit2 size={14} /> Editar
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Promote/Add Modal */}
            {isCreateModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
                    <div className="bg-neutral-900 rounded-3xl p-8 max-w-md w-full border border-neutral-800 animate-in zoom-in-95">
                        <h3 className="text-xl font-bold text-white mb-2">Adicionar à Equipe</h3>
                        <p className="text-neutral-500 text-sm mb-6">
                            Adicione um usuário existente para gerenciar a plataforma.
                        </p>

                        <div className="space-y-4 mb-6">
                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-widest text-neutral-500 mb-2 ml-1">E-mail do Usuário</label>
                                <input
                                    type="email"
                                    placeholder="email@exemplo.com"
                                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-white outline-none focus:border-indigo-500 transition-colors"
                                    value={emailToPromote}
                                    onChange={e => setEmailToPromote(e.target.value)}
                                />
                            </div>

                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-widest text-neutral-500 mb-2 ml-1">Senha (Para novos Usuários)</label>
                                <input
                                    type="text"
                                    placeholder="Definir senha inicial..."
                                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-white outline-none focus:border-indigo-500 transition-colors"
                                    value={newPassword}
                                    onChange={e => setNewPassword(e.target.value)}
                                />
                                <p className="text-[10px] text-neutral-600 mt-1 ml-1">Se o usuário já existir, a senha não será alterada.</p>
                            </div>

                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-widest text-neutral-500 mb-2 ml-1">Nível de Acesso</label>
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        onClick={() => setSelectedLevel('support')}
                                        className={cn(
                                            "p-4 rounded-xl border text-left transition-all",
                                            selectedLevel === 'support'
                                                ? "bg-indigo-500/10 border-indigo-500 text-white"
                                                : "bg-neutral-950 border-neutral-800 text-neutral-500 hover:border-neutral-700"
                                        )}
                                    >
                                        <span className="block font-bold text-xs uppercase tracking-wider mb-1">Suporte</span>
                                        <span className="block text-[10px] opacity-70">Gerencia lojas, sem acesso financeiro ou delete.</span>
                                    </button>

                                    <button
                                        onClick={() => setSelectedLevel('master')}
                                        className={cn(
                                            "p-4 rounded-xl border text-left transition-all",
                                            selectedLevel === 'master'
                                                ? "bg-red-500/10 border-red-500 text-white"
                                                : "bg-neutral-950 border-neutral-800 text-neutral-500 hover:border-neutral-700"
                                        )}
                                    >
                                        <span className="block font-bold text-xs uppercase tracking-wider mb-1">Master</span>
                                        <span className="block text-[10px] opacity-70">Acesso TOTAL. Cuidado.</span>
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button onClick={() => setIsCreateModalOpen(false)} className="flex-1 py-3 text-neutral-500 hover:text-white font-bold rounded-xl hover:bg-neutral-800 transition-all">Cancelar</button>
                            <button
                                onClick={() => promoteMutation.mutate({ email: emailToPromote, password: newPassword, level: selectedLevel })}
                                disabled={promoteMutation.isPending || !emailToPromote}
                                className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-lg shadow-indigo-600/20"
                            >
                                {promoteMutation.isPending ? 'Processando...' : 'Confirmar'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Permissions Modal */}
            {editingAdmin && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
                    <div className="bg-neutral-900 rounded-3xl p-8 max-w-lg w-full border border-neutral-800 animate-in zoom-in-95">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                    <ShieldCheck size={20} className="text-indigo-500" />
                                    Permissões Avançadas
                                </h3>
                                <p className="text-neutral-500 text-sm mt-1">Editando: <span className="text-white font-bold">{editingAdmin.full_name}</span></p>
                            </div>
                            <button onClick={() => setEditingAdmin(null)} className="text-neutral-500 hover:text-white"><XCircle /></button>
                        </div>

                        <div className="space-y-3 mb-8">
                            {availablePermissions.map(perm => {
                                const isGranted = (editingAdmin.permissions || []).includes(perm.id);
                                return (
                                    <button
                                        key={perm.id}
                                        onClick={() => handleTogglePermission(perm.id)}
                                        className={cn(
                                            "w-full flex items-center justify-between p-4 rounded-xl border transition-all group",
                                            isGranted
                                                ? "bg-indigo-500/10 border-indigo-500 text-white"
                                                : "bg-neutral-800 border-neutral-800 text-neutral-400 hover:border-neutral-700"
                                        )}
                                    >
                                        <div className="flex flex-col items-start text-left">
                                            <span className="font-bold text-xs tracking-wide uppercase group-hover:text-white transition-colors">{perm.label}</span>
                                            <span className="text-[10px] opacity-40 font-mono mt-1">{perm.id}</span>
                                        </div>
                                        {isGranted && <Check size={18} className="text-indigo-500" />}
                                    </button>
                                );
                            })}
                        </div>

                        <div className="flex gap-3 pt-4 border-t border-neutral-800">
                            <button
                                onClick={() => {
                                    if (confirm('Isso removerá o acesso de Super Admin deste usuário. Continuar?')) {
                                        updatePermissionsMutation.mutate({ id: editingAdmin.id, permissions: [], role: 'admin' });
                                    }
                                }}
                                className="px-4 py-3 bg-red-500/10 hover:bg-red-500 hover:text-white text-red-500 rounded-xl font-bold transition-all flex items-center gap-2"
                            >
                                <Trash2 size={18} />
                                <span className="hidden sm:inline">Revogar Acesso</span>
                            </button>
                            <div className="flex-1 flex gap-3 justify-end items-center">
                                <span className="text-xs text-neutral-500 italic mr-2">Alterações são imediatas</span>
                                <button
                                    onClick={() => updatePermissionsMutation.mutate({ id: editingAdmin.id, permissions: editingAdmin.permissions })}
                                    className="px-8 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-green-600/20"
                                >
                                    <Save size={18} /> Salvar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminsPage;
