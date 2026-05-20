import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import {
    Plus,
    Search,
    Edit2,
    Trash2,
    Users,
    Phone,
    Mail,
    MoreVertical,
    Loader2,
    AlertCircle,
    History,
    ExternalLink,
    Download
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { format } from 'date-fns';
import { useAuth } from '../../context/AuthContext';
import { useTenant } from '../../context/TenantContext';
import { useNavigate } from 'react-router-dom';
import ClientModal from '../../components/admin/ClientModal';

const ClientList = () => {
    const { profile } = useAuth();
    const { tenant } = useTenant();
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingClient, setEditingClient] = useState<any>(null);
    const queryClient = useQueryClient();

    const { data: clients, isLoading, error } = useQuery({
        queryKey: ['clients', tenant?.id],
        enabled: !!tenant?.id,
        queryFn: async () => {
            const { data, error } = await supabase
                .from('clients')
                .select('*')
                .eq('tenant_id', tenant?.id)
                .order('name', { ascending: true });
            if (error) throw error;
            return data;
        },
    });

    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
            const { error } = await supabase.from('clients').delete().eq('id', id);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['clients'] });
        },
    });

    const handleEdit = (client: any) => {
        setEditingClient(client);
        setIsModalOpen(true);
    };

    const handleAdd = () => {
        setEditingClient(null);
        setIsModalOpen(true);
    };

    const handleExport = () => {
        if (!clients || clients.length === 0) return;

        const headers = ['Nome', 'Email', 'Telefone', 'Documento', 'Endereço', 'Cadastro'];
        const csvContent = [
            headers.join(','),
            ...clients.map(c => [
                `"${c.name}"`,
                `"${c.email || ''}"`,
                `"${c.phone || ''}"`,
                `"${c.document || ''}"`,
                `"${c.address || ''}"`,
                `"${format(new Date(c.created_at), 'dd/MM/yyyy')}"`
            ].join(','))
        ].join('\n');

        const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', 'clientes_elite_padaria.csv');
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const filteredClients = clients?.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.phone?.includes(searchTerm) ||
        c.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.document?.includes(searchTerm)
    );

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-end gap-3">
                <button
                    onClick={handleExport}
                    className="px-6 py-2.5 bg-white border border-neutral-200 rounded-xl text-neutral-600 font-bold text-sm hover:bg-neutral-50 transition-all flex items-center justify-center gap-2"
                >
                    <Download size={18} />
                    Exportar CSV
                </button>
                <button
                    onClick={handleAdd}
                    className="bg-brand-primary hover:opacity-90 text-white px-6 py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-brand-primary/20 active:scale-95"
                >
                    <Plus size={20} />
                    Novo Cliente
                </button>
            </div>

            {/* Toolbar */}
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-neutral-100 flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={18} />
                    <input
                        type="text"
                        placeholder="Buscar por nome, CPF/CNPJ, telefone ou email..."
                        className="w-full pl-10 pr-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Client List Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 overflow-hidden">
                {isLoading ? (
                    <div className="p-20 flex flex-col items-center justify-center text-neutral-400 gap-4">
                        <Loader2 className="animate-spin text-brand-primary" size={40} />
                        <p>Carregando clientes...</p>
                    </div>
                ) : error ? (
                    <div className="p-20 text-center text-red-500 flex flex-col items-center gap-2">
                        <AlertCircle size={40} />
                        <p>Ocorreu um erro ao carregar os clientes.</p>
                    </div>
                ) : filteredClients?.length === 0 ? (
                    <div className="p-20 text-center text-neutral-400">
                        <Users size={48} className="mx-auto mb-4 opacity-20" />
                        <p>Nenhum cliente encontrado.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-neutral-50 border-b border-neutral-100">
                                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-neutral-500">Cliente</th>
                                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-neutral-500">Documento</th>
                                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-neutral-500 text-center">Cadastro</th>
                                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-neutral-500 text-right">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-100">
                                {filteredClients?.map((client) => (
                                    <tr key={client.id} className="hover:bg-neutral-50/50 transition-all group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-brand-primary-light flex items-center justify-center text-brand-primary font-bold text-sm shrink-0 border border-brand-primary/20">
                                                    {client.name.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-neutral-900 leading-tight">{client.name}</p>
                                                    <p className="text-xs text-neutral-400 mt-0.5">{client.email || client.phone || 'Sem contato'}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-sm font-medium text-neutral-600 font-mono">
                                                {client.document || '--'}
                                            </p>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <p className="text-xs font-bold text-neutral-500">
                                                {format(new Date(client.created_at), "dd/MM/yyyy")}
                                            </p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex justify-end gap-1">
                                                <button
                                                    onClick={() => navigate(`/admin/sales?client_id=${client.id}`)}
                                                    className="p-2 hover:bg-white hover:shadow-sm rounded-lg text-neutral-400 hover:text-blue-600 border border-transparent hover:border-neutral-100 transition-all flex items-center gap-2"
                                                    title="Ver Histórico de Vendas"
                                                >
                                                    <History size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleEdit(client)}
                                                    className="p-2 hover:bg-white hover:shadow-sm rounded-lg text-neutral-400 hover:text-brand-primary border border-transparent hover:border-neutral-100 transition-all"
                                                    title="Editar"
                                                >
                                                    <Edit2 size={18} />
                                                </button>
                                                <button
                                                    onClick={() => { if (window.confirm('Excluir cliente?')) deleteMutation.mutate(client.id) }}
                                                    className="p-2 hover:bg-white hover:shadow-sm rounded-lg text-neutral-400 hover:text-red-600 border border-transparent hover:border-neutral-100 transition-all"
                                                    title="Excluir"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <ClientModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                client={editingClient}
                onSuccess={() => queryClient.invalidateQueries({ queryKey: ['clients'] })}
            />
        </div>
    );
};


export default ClientList;
