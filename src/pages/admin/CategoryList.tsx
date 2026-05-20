import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import {
    Plus,
    Search,
    Edit2,
    Trash2,
    Tag,
    Loader2,
    AlertCircle,
    GripVertical,
    Copy
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useTenant } from '../../context/TenantContext';
import CategoryModal from '../../components/admin/CategoryModal';

const CategoryList = () => {
    const { tenant } = useTenant();
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<any>(null);
    const queryClient = useQueryClient();

    const { data: categories, isLoading, error } = useQuery({
        queryKey: ['categories', tenant?.id],
        enabled: !!tenant?.id,
        queryFn: async () => {
            const { data, error } = await supabase
                .from('categories')
                .select('*')
                .eq('tenant_id', tenant?.id)
                .order('display_order', { ascending: true });
            if (error) throw error;
            return data;
        },
    });

    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
            const { error } = await supabase.from('categories').delete().eq('id', id);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['categories'] });
        },
    });

    const handleEdit = (category: any) => {
        setEditingCategory(category);
        setIsModalOpen(true);
    };

    const handleAdd = () => {
        setEditingCategory(null);
        setIsModalOpen(true);
    };

    const handleDuplicate = async (category: any) => {
        try {
            const { id, created_at, updated_at, code, ...categoryData } = category;

            // Clean up name
            const baseName = category.name.replace(/\s\(Cópia\)$/, '');
            const duplicatedCategory = {
                ...categoryData,
                name: `${baseName} (Cópia)`,
                code: null // Let database generate new code
            };

            const { error } = await supabase
                .from('categories')
                .insert([duplicatedCategory]);

            if (error) throw error;
            queryClient.invalidateQueries({ queryKey: ['categories'] });
        } catch (error: any) {
            console.error('[CategoryList] Error duplicating category:', error);
            alert(`Erro ao duplicar categoria: ${error?.message || 'Erro desconhecido'}`);
        }
    };

    const filteredCategories = categories?.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-end gap-4">
                <button
                    onClick={handleAdd}
                    className="bg-brand-primary hover:opacity-90 text-white px-4 py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-brand-primary/20 active:scale-95"
                >
                    <Plus size={20} />
                    Nova Categoria
                </button>
            </div>

            {/* Toolbar */}
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-neutral-100">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={18} />
                    <input
                        type="text"
                        placeholder="Buscar categoria..."
                        className="w-full pl-10 pr-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Category List */}
            <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 overflow-hidden">
                {isLoading ? (
                    <div className="p-20 flex flex-col items-center justify-center text-neutral-400 gap-4">
                        <Loader2 className="animate-spin text-brand-primary" size={40} />
                        <p>Carregando categorias...</p>
                    </div>
                ) : error ? (
                    <div className="p-20 text-center text-red-500 flex flex-col items-center gap-2">
                        <AlertCircle size={40} />
                        <p>Ocorreu um erro ao carregar as categorias.</p>
                    </div>
                ) : filteredCategories?.length === 0 ? (
                    <div className="p-20 text-center text-neutral-400">
                        <Tag size={48} className="mx-auto mb-4 opacity-20" />
                        <p>Nenhuma categoria encontrada.</p>
                        <p className="text-sm mt-2">Crie sua primeira categoria para organizar seus produtos!</p>
                    </div>
                ) : (
                    <div className="divide-y divide-neutral-100">
                        {filteredCategories?.map((category) => (
                            <div key={category.id} className="p-6 hover:bg-neutral-50/50 transition-all group flex items-center gap-4">
                                <div className="text-neutral-300 cursor-move">
                                    <GripVertical size={20} />
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-1">
                                        <h3 className="font-bold text-neutral-900 text-lg">{category.name}</h3>
                                        {!category.active && (
                                            <span className="px-2 py-0.5 bg-red-100 text-red-600 text-xs font-bold rounded-full">
                                                Inativa
                                            </span>
                                        )}
                                    </div>
                                    {category.description && (
                                        <p className="text-sm text-neutral-500">{category.description}</p>
                                    )}
                                </div>
                                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => handleDuplicate(category)}
                                        className="p-2 hover:bg-white hover:shadow-sm rounded-lg text-neutral-600 hover:text-purple-600 border border-transparent hover:border-neutral-100 transition-all"
                                        title="Duplicar Categoria"
                                    >
                                        <Copy size={16} />
                                    </button>
                                    <button
                                        onClick={() => handleEdit(category)}
                                        className="p-2 hover:bg-white hover:shadow-sm rounded-lg text-neutral-600 hover:text-brand-primary border border-transparent hover:border-neutral-100 transition-all"
                                    >
                                        <Edit2 size={16} />
                                    </button>
                                    <button
                                        onClick={() => { if (window.confirm('Excluir esta categoria?')) deleteMutation.mutate(category.id) }}
                                        className="p-2 hover:bg-white hover:shadow-sm rounded-lg text-neutral-600 hover:text-red-600 border border-transparent hover:border-neutral-100 transition-all"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <CategoryModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                category={editingCategory}
                onSuccess={() => queryClient.invalidateQueries({ queryKey: ['categories'] })}
            />
        </div>
    );
};

export default CategoryList;
