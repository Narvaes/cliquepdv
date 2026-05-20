import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { X, Loader2, Camera } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useTenant } from '../../context/TenantContext';
import { useQuery } from '@tanstack/react-query';


const productSchema = z.object({
    name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
    description: z.string().optional(),
    price: z.number().min(0.01, 'Preço deve ser maior que zero'),
    cost_price: z.number().optional(),
    stock_quantity: z.number().int().min(0, 'Estoque não pode ser negativo'),
    category: z.string().min(1, 'Selecione uma categoria'),
    unit: z.string().min(1, 'Unidade é obrigatória'),
    sku: z.string().optional(), // Auto-generated, read-only
    gtin_ean: z.string().optional(),
    ncm: z.string().optional(),
    infinite_stock: z.boolean().optional(),
    image_url: z.string().optional(),
});

type ProductFormValues = z.infer<typeof productSchema>;

interface ProductModalProps {
    isOpen: boolean;
    onClose: () => void;
    product?: any;
    onSuccess: () => void;
}

const ProductModal: React.FC<ProductModalProps> = ({ isOpen, onClose, product, onSuccess }) => {
    const { tenant } = useTenant();

    // Fetch categories for the current tenant
    const { data: categories } = useQuery({
        queryKey: ['categories', tenant?.id],
        enabled: !!tenant?.id && isOpen,
        queryFn: async () => {
            const { data, error } = await supabase
                .from('categories')
                .select('*')
                .eq('tenant_id', tenant?.id)
                .eq('active', true)
                .order('display_order', { ascending: true });
            if (error) throw error;
            return data;
        },
    });

    const [uploading, setUploading] = React.useState(false);
    const { register, handleSubmit, formState: { errors, isSubmitting }, reset, setValue, watch } = useForm<ProductFormValues>({
        resolver: zodResolver(productSchema),
        defaultValues: {
            name: '',
            description: '',
            price: 0,
            cost_price: 0,
            stock_quantity: 0,
            category: '',
            unit: '/unid',
            sku: '',
            gtin_ean: '',
            ncm: '',
            infinite_stock: false,
            image_url: '',
        }
    });

    useEffect(() => {
        if (product) {
            reset(product);
        } else {
            reset({
                name: '',
                description: '',
                price: 0,
                cost_price: 0,
                stock_quantity: 0,
                category: '',
                unit: '/unid',
                sku: '',
                gtin_ean: '',
                ncm: '',
                infinite_stock: false,
                image_url: '',
            });
        }
    }, [product, reset]);

    const imageUrl = watch('image_url');

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // 300KB limit check
        const MAX_SIZE = 300 * 1024; // 300KB
        if (file.size > MAX_SIZE) {
            alert('A imagem é muito pesada! O limite é de 300KB para garantir um carregamento rápido do seu site.');
            return;
        }

        setUploading(true);
        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
            const filePath = `product-images/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('products')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('products')
                .getPublicUrl(filePath);

            setValue('image_url', publicUrl);
        } catch (error) {
            console.error('Error uploading image:', error);
            alert('Erro ao fazer upload da imagem');
        } finally {
            setUploading(false);
        }
    };

    const onSubmit = async (data: ProductFormValues) => {
        try {
            if (!tenant?.id) {
                console.error('[ProductModal] Tenant ID not available:', { tenant });
                alert('Erro: Loja não identificada. Recarregue a página e tente novamente.');
                return;
            }

            console.log('[ProductModal] Saving product with tenant_id:', tenant.id);

            if (product?.id) {
                const { error } = await supabase
                    .from('products')
                    .update(data)
                    .eq('id', product.id);
                if (error) throw error;
            } else {
                const { error } = await supabase
                    .from('products')
                    .insert([{ ...data, tenant_id: tenant.id }]);
                if (error) throw error;
            }
            onSuccess();
            onClose();
        } catch (error: any) {
            console.error('[ProductModal] Error saving product:', error);
            const errorMsg = error?.message || 'Erro desconhecido';
            alert(`Erro ao salvar produto: ${errorMsg}`);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl animate-in zoom-in duration-300">
                <div className="p-6 border-b border-neutral-100 flex items-center justify-between">
                    <h2 className="text-xl font-bold text-neutral-900">
                        {product ? 'Editar Produto' : 'Novo Produto'}
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-neutral-100 rounded-full transition-all">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="p-8 space-y-8 overflow-y-auto max-h-[calc(100vh-200px)]">
                    {/* Informações Básicas */}
                    <section className="space-y-6">
                        <h3 className="text-xs font-black uppercase tracking-widest text-neutral-400 flex items-center gap-2">
                            <span className="w-8 h-px bg-neutral-100"></span>
                            Informações Básicas
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-neutral-700">Nome do Produto</label>
                                <input
                                    {...register('name')}
                                    placeholder="Ex: Pão Francês"
                                    className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-2xl focus:ring-4 focus:ring-brand-primary/10 focus:border-brand-primary outline-none transition-all"
                                />
                                {errors.name && <p className="text-xs text-red-500 font-medium">{errors.name.message}</p>}
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-neutral-700">Categoria</label>
                                <select
                                    {...register('category')}
                                    className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-2xl focus:ring-4 focus:ring-brand-primary/10 focus:border-brand-primary outline-none transition-all appearance-none"
                                >
                                    <option value="">Selecionar...</option>
                                    {categories?.map((cat: any) => (
                                        <option key={cat.id} value={cat.name}>{cat.name}</option>
                                    ))}
                                </select>
                                {errors.category && <p className="text-xs text-red-500 font-medium">{errors.category.message}</p>}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-neutral-700">Descrição</label>
                            <textarea
                                {...register('description')}
                                rows={2}
                                placeholder="Descreva o produto para seus clientes..."
                                className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-2xl focus:ring-4 focus:ring-brand-primary/10 focus:border-brand-primary outline-none transition-all resize-none"
                            />
                        </div>
                    </section>

                    {/* Preços e Unidade */}
                    <section className="space-y-6">
                        <h3 className="text-xs font-black uppercase tracking-widest text-neutral-400 flex items-center gap-2">
                            <span className="w-8 h-px bg-neutral-100"></span>
                            Preços e Unidade
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-neutral-700">Preço Venda</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 font-bold">R$</span>
                                    <input
                                        type="number"
                                        step="0.01"
                                        {...register('price', { valueAsNumber: true })}
                                        className="w-full pl-12 pr-4 py-3 bg-neutral-50 border border-neutral-200 rounded-2xl focus:ring-4 focus:ring-brand-primary/10 focus:border-brand-primary outline-none transition-all font-bold text-brand-primary"
                                    />
                                </div>
                                {errors.price && <p className="text-xs text-red-500 font-medium">{errors.price.message}</p>}
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-neutral-700">Preço Custo</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 font-bold">R$</span>
                                    <input
                                        type="number"
                                        step="0.01"
                                        {...register('cost_price', { valueAsNumber: true })}
                                        className="w-full pl-12 pr-4 py-3 bg-neutral-50 border border-neutral-200 rounded-2xl focus:ring-4 focus:ring-brand-primary/10 focus:border-brand-primary outline-none transition-all"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-neutral-700">Unidade</label>
                                <input
                                    {...register('unit')}
                                    placeholder="/unid"
                                    className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-2xl focus:ring-4 focus:ring-brand-primary/10 focus:border-brand-primary outline-none transition-all"
                                />
                            </div>
                        </div>
                    </section>

                    {/* Estoque e Identificação */}
                    <section className="space-y-6">
                        <h3 className="text-xs font-black uppercase tracking-widest text-neutral-400 flex items-center gap-2">
                            <span className="w-8 h-px bg-neutral-100"></span>
                            Estoque e Códigos
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-neutral-700">Estoque Inicial</label>
                                    <input
                                        type="number"
                                        {...register('stock_quantity', { valueAsNumber: true })}
                                        disabled={watch('infinite_stock')}
                                        className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-2xl focus:ring-4 focus:ring-brand-primary/10 focus:border-brand-primary outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                    />
                                </div>
                                <label className="flex items-center gap-3 cursor-pointer p-4 bg-neutral-50 rounded-2xl hover:bg-neutral-100 transition-all">
                                    <input
                                        type="checkbox"
                                        {...register('infinite_stock')}
                                        className="w-5 h-5 rounded-lg border-neutral-300 text-brand-primary focus:ring-brand-primary transition-all"
                                    />
                                    <div>
                                        <span className="text-sm font-bold text-neutral-700">Estoque Infinito</span>
                                        <p className="text-[10px] text-neutral-500">Não controlar quantidade</p>
                                    </div>
                                </label>
                            </div>

                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-neutral-700">GTIN/EAN (Cód. Barras)</label>
                                    <input
                                        {...register('gtin_ean')}
                                        placeholder="789..."
                                        maxLength={13}
                                        className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-2xl focus:ring-4 focus:ring-brand-primary/10 focus:border-brand-primary outline-none transition-all"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-neutral-700">SKU</label>
                                        <input
                                            {...register('sku')}
                                            readOnly
                                            className="w-full px-4 py-3 bg-neutral-100 border border-neutral-200 rounded-2xl text-neutral-500 text-xs font-mono cursor-not-allowed"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-neutral-700">NCM</label>
                                        <input
                                            {...register('ncm')}
                                            placeholder="8 dígitos"
                                            maxLength={8}
                                            className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-2xl focus:ring-4 focus:ring-brand-primary/10 focus:border-brand-primary outline-none transition-all"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Mídia */}
                    <section className="space-y-6">
                        <h3 className="text-xs font-black uppercase tracking-widest text-neutral-400 flex items-center gap-2">
                            <span className="w-8 h-px bg-neutral-100"></span>
                            Imagem do Produto
                        </h3>

                        <div className="flex flex-col md:flex-row gap-6">
                            <div className="relative w-40 h-40 bg-neutral-100 rounded-3xl flex items-center justify-center overflow-hidden border-2 border-dashed border-neutral-200 group hover:border-brand-primary transition-all shrink-0">
                                {imageUrl ? (
                                    <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
                                ) : (
                                    <Camera className="text-neutral-400 group-hover:text-brand-primary transition-colors" size={32} />
                                )}
                                {uploading && (
                                    <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                                        <Loader2 className="animate-spin text-brand-primary" size={24} />
                                    </div>
                                )}
                            </div>

                            <div className="flex-1 space-y-4">
                                <div className="flex flex-wrap gap-2">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleFileUpload}
                                        disabled={uploading}
                                        className="hidden"
                                        id="product-image-upload"
                                    />
                                    <label
                                        htmlFor="product-image-upload"
                                        className="inline-flex items-center gap-2 px-6 py-3 bg-white border border-neutral-200 rounded-2xl text-sm font-bold text-neutral-700 hover:bg-neutral-50 cursor-pointer transition-all shadow-sm active:scale-95"
                                    >
                                        <Camera size={18} />
                                        {uploading ? 'Enviando...' : 'Selecionar Arquivo'}
                                    </label>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Ou use uma URL direta</label>
                                    <input
                                        {...register('image_url')}
                                        placeholder="https://exemplo.com/imagem.png"
                                        className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-2xl focus:ring-4 focus:ring-brand-primary/10 focus:border-brand-primary outline-none transition-all text-xs"
                                    />
                                </div>
                            </div>
                        </div>
                    </section>

                    <div className="flex justify-end gap-3 pt-8 border-t border-neutral-100">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-8 py-3.5 rounded-2xl font-bold text-neutral-600 hover:bg-neutral-100 transition-all"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="px-10 py-3.5 bg-brand-primary hover:opacity-90 text-white rounded-2xl font-bold transition-all shadow-xl shadow-brand-primary/20 flex items-center gap-3 active:scale-95 disabled:opacity-50"
                        >
                            {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : 'Salvar Produto'}
                        </button>
                    </div>
                </form>

            </div>
        </div>
    );
};

export default ProductModal;
