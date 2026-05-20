import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { X, Loader2, User, Phone, Mail, MapPin, FileText, Fingerprint } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useTenant } from '../../context/TenantContext';

const clientSchema = z.object({
    name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
    email: z.string().email('Email inválido').optional().or(z.literal('')),
    phone: z.string().optional(),
    address: z.string().optional(),
    document: z.string().optional(), // CPF/CNPJ
    notes: z.string().optional(),
});

type ClientFormValues = z.infer<typeof clientSchema>;

interface ClientModalProps {
    isOpen: boolean;
    onClose: () => void;
    client?: any;
    onSuccess: () => void;
}

const ClientModal: React.FC<ClientModalProps> = ({ isOpen, onClose, client, onSuccess }) => {
    const { tenant } = useTenant();
    const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<ClientFormValues>({
        resolver: zodResolver(clientSchema),
        defaultValues: {
            name: '',
            email: '',
            phone: '',
            address: '',
            document: '',
            notes: '',
        }
    });

    useEffect(() => {
        if (client) {
            reset(client);
        } else {
            reset({
                name: '',
                email: '',
                phone: '',
                address: '',
                document: '',
                notes: '',
            });
        }
    }, [client, reset]);

    const onSubmit = async (data: ClientFormValues) => {
        try {
            if (!tenant?.id) {
                console.error('[ClientModal] Tenant ID not available:', { tenant });
                alert('Erro: Loja não identificada. Recarregue a página e tente novamente.');
                return;
            }

            console.log('[ClientModal] Saving client with tenant_id:', tenant.id);

            if (client?.id) {
                const { error } = await supabase
                    .from('clients')
                    .update(data)
                    .eq('id', client.id);
                if (error) throw error;
            } else {
                const { error } = await supabase
                    .from('clients')
                    .insert([{ ...data, tenant_id: tenant.id }]);
                if (error) throw error;
            }
            onSuccess();
            onClose();
        } catch (error: any) {
            console.error('[ClientModal] Error saving client:', error);
            const errorMsg = error?.message || 'Erro desconhecido';
            alert(`Erro ao salvar cliente: ${errorMsg}`);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-[2.5rem] w-full max-w-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
                <div className="p-8 border-b border-neutral-100 flex items-center justify-between bg-neutral-50/50">
                    <div>
                        <h2 className="text-2xl font-black text-neutral-900 leading-tight">
                            {client ? 'Editar Cliente' : 'Novo Cliente'}
                        </h2>
                        <p className="text-neutral-500 text-sm mt-1">Gerencie as informações detalhadas do seu cliente.</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-3 hover:bg-neutral-200/50 text-neutral-400 hover:text-neutral-900 rounded-2xl transition-all active:scale-90"
                    >
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="p-8">
                    <div className="space-y-8 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
                        {/* Basic Information */}
                        <div className="space-y-6">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-8 h-8 rounded-lg bg-brand-primary-light flex items-center justify-center text-brand-primary">
                                    <User size={18} />
                                </div>
                                <h3 className="font-bold text-neutral-900 uppercase text-xs tracking-widest">Informações Básicas</h3>
                            </div>

                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-neutral-700 ml-1">Nome Completo</label>
                                    <input
                                        {...register('name')}
                                        placeholder="Ex: João da Silva Santos"
                                        className="w-full px-5 py-4 bg-neutral-50 border border-neutral-200 rounded-2xl focus:ring-4 focus:ring-brand-primary/10 focus:border-brand-primary outline-none transition-all font-medium"
                                    />
                                    {errors.name && <p className="text-xs text-red-500 font-bold ml-1">{errors.name.message}</p>}
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-neutral-700 ml-1 flex items-center gap-2">
                                            <Fingerprint size={14} className="text-neutral-400" />
                                            CPF / CNPJ
                                        </label>
                                        <input
                                            {...register('document')}
                                            placeholder="000.000.000-00"
                                            className="w-full px-5 py-4 bg-neutral-50 border border-neutral-200 rounded-2xl focus:ring-4 focus:ring-brand-primary/10 focus:border-brand-primary outline-none transition-all font-mono text-sm"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-neutral-700 ml-1 flex items-center gap-2">
                                            <Phone size={14} className="text-neutral-400" />
                                            WhatsApp / Celular
                                        </label>
                                        <input
                                            {...register('phone')}
                                            placeholder="(16) 99999-9999"
                                            className="w-full px-5 py-4 bg-neutral-50 border border-neutral-200 rounded-2xl focus:ring-4 focus:ring-brand-primary/10 focus:border-brand-primary outline-none transition-all font-medium"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Contact & Location */}
                        <div className="space-y-6 pt-2">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600">
                                    <MapPin size={18} />
                                </div>
                                <h3 className="font-bold text-neutral-900 uppercase text-xs tracking-widest">Contato e Localização</h3>
                            </div>

                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-neutral-700 ml-1 flex items-center gap-2">
                                        <Mail size={14} className="text-neutral-400" />
                                        E-mail
                                    </label>
                                    <input
                                        {...register('email')}
                                        placeholder="exemplo@email.com"
                                        className="w-full px-5 py-4 bg-neutral-50 border border-neutral-200 rounded-2xl focus:ring-4 focus:ring-brand-primary/10 focus:border-brand-primary outline-none transition-all font-medium"
                                    />
                                    {errors.email && <p className="text-xs text-red-500 font-bold ml-1">{errors.email.message}</p>}
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-neutral-700 ml-1">Endereço Completo</label>
                                    <input
                                        {...register('address')}
                                        placeholder="Rua, Número, Bairro, Cidade - UF"
                                        className="w-full px-5 py-4 bg-neutral-50 border border-neutral-200 rounded-2xl focus:ring-4 focus:ring-brand-primary/10 focus:border-brand-primary outline-none transition-all font-medium"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Additional Notes */}
                        <div className="space-y-6 pt-2">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-8 h-8 rounded-lg bg-neutral-100 flex items-center justify-center text-neutral-600">
                                    <FileText size={18} />
                                </div>
                                <h3 className="font-bold text-neutral-900 uppercase text-xs tracking-widest">Observações</h3>
                            </div>

                            <div className="space-y-2">
                                <textarea
                                    {...register('notes')}
                                    rows={3}
                                    placeholder="Preferências de compra, restrições ou observações internas..."
                                    className="w-full px-5 py-4 bg-neutral-50 border border-neutral-200 rounded-2xl focus:ring-4 focus:ring-brand-primary/10 focus:border-brand-primary outline-none transition-all resize-none font-medium"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-8 mt-4 border-t border-neutral-100">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-8 py-4 rounded-2xl font-black text-neutral-500 hover:bg-neutral-100 transition-all uppercase tracking-widest text-xs"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="px-10 py-4 bg-brand-primary hover:opacity-90 text-white rounded-2xl font-black transition-all shadow-xl shadow-brand-primary/20 flex items-center gap-3 active:scale-95 disabled:opacity-50 uppercase tracking-widest text-xs"
                        >
                            {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : (
                                <>
                                    <span>Salvar Registro</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ClientModal;
