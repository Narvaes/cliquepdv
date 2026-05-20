import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { X, Loader2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useTenant } from '../../context/TenantContext';

const categorySchema = z.object({
    name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
    description: z.string().optional(),
    display_order: z.number().int().min(0, 'Ordem deve ser um número positivo').optional(),
    code: z.string().optional(), // Auto-generated, read-only
    active: z.boolean().optional(),
});

type CategoryFormValues = z.infer<typeof categorySchema>;

interface CategoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    category?: any;
    onSuccess: () => void;
}

const CategoryModal: React.FC<CategoryModalProps> = ({ isOpen, onClose, category, onSuccess }) => {
    const { tenant } = useTenant();
    const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<CategoryFormValues>({
        resolver: zodResolver(categorySchema),
        defaultValues: {
            name: '',
            description: '',
            display_order: 0,
            active: true,
        }
    });

    useEffect(() => {
        if (category) {
            reset(category);
        } else {
            reset({
                name: '',
                description: '',
                display_order: 0,
                active: true,
            });
        }
    }, [category, reset]);

    const onSubmit = async (data: CategoryFormValues) => {
        try {
            if (!tenant?.id) {
                console.error('[CategoryModal] Tenant ID not available:', { tenant });
                alert('Erro: Loja não identificada. Recarregue a página e tente novamente.');
                return;
            }

            console.log('[CategoryModal] Saving category with tenant_id:', tenant.id);

            if (category?.id) {
                const { error } = await supabase
                    .from('categories')
                    .update(data)
                    .eq('id', category.id);
                if (error) throw error;
            } else {
                const { error } = await supabase
                    .from('categories')
                    .insert([{ ...data, tenant_id: tenant.id }]);
                if (error) throw error;
            }
            onSuccess();
            onClose();
        } catch (error: any) {
            console.error('[CategoryModal] Error saving category:', error);
            const errorMsg = error?.message || 'Erro desconhecido';
            alert(`Erro ao salvar categoria: ${errorMsg}`);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl animate-in zoom-in duration-300">
                <div className="p-6 border-b border-neutral-100 flex items-center justify-between">
                    <h2 className="text-xl font-bold text-neutral-900">
                        {category ? 'Editar Categoria' : 'Nova Categoria'}
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-neutral-100 rounded-full transition-all">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-neutral-700">Nome da Categoria</label>
                            <input
                                {...register('name')}
                                placeholder="Ex: Salgados Fritos"
                                className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary outline-none transition-all"
                            />
                            {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-neutral-700">Descrição (Opcional)</label>
                            <textarea
                                {...register('description')}
                                rows={3}
                                placeholder="Descreva esta categoria..."
                                className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary outline-none transition-all resize-none"
                            />
                        </div>

                        {category?.code && (
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-neutral-700">Código Interno</label>
                                <input
                                    {...register('code')}
                                    readOnly
                                    className="w-full px-4 py-2.5 bg-neutral-100 border border-neutral-200 rounded-xl outline-none cursor-not-allowed text-neutral-500"
                                />
                                <p className="text-xs text-neutral-400">Gerado automaticamente</p>
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-neutral-700">Ordem de Exibição</label>
                                <input
                                    type="number"
                                    {...register('display_order', { valueAsNumber: true })}
                                    className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary outline-none transition-all"
                                />
                                {errors.display_order && <p className="text-xs text-red-500">{errors.display_order.message}</p>}
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-neutral-700">Status</label>
                                <div className="flex items-center gap-3 h-[42px]">
                                    <input
                                        type="checkbox"
                                        {...register('active')}
                                        className="w-5 h-5 rounded border-neutral-300 text-brand-primary focus:ring-brand-primary"
                                    />
                                    <span className="text-sm text-neutral-600">Categoria ativa</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-2.5 rounded-xl font-bold text-neutral-600 hover:bg-neutral-100 transition-all"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="px-8 py-2.5 bg-brand-primary hover:opacity-90 text-white rounded-xl font-bold transition-all shadow-lg shadow-brand-primary/20 flex items-center gap-2 active:scale-95 disabled:opacity-50"
                        >
                            {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : 'Salvar Categoria'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CategoryModal;
