import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import {
    Plus,
    Search,
    Edit2,
    Trash2,
    Package,
    Filter,
    MoreVertical,
    Loader2,
    AlertCircle,
    Copy,
    PackagePlus,
    Download,
    Upload
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { parseCSV, generateProductTemplate, mapCSVToProduct } from '../../lib/importUtils';

import { useAuth } from '../../context/AuthContext';
import { useTenant } from '../../context/TenantContext';
import ProductModal from '../../components/admin/ProductModal';
import StockAdjustmentModal from '../../components/admin/StockAdjustmentModal';

const ProductList = () => {
    const { profile } = useAuth();
    const { tenant } = useTenant();
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<any>(null);
    const [isStockModalOpen, setIsStockModalOpen] = useState(false);
    const [stockProduct, setStockProduct] = useState<any>(null);
    const [isImporting, setIsImporting] = useState(false);
    const queryClient = useQueryClient();
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const { data: products, isLoading, error } = useQuery({
        queryKey: ['products', tenant?.id],
        enabled: !!tenant?.id,
        queryFn: async () => {
            const { data, error } = await supabase
                .from('products')
                .select('*')
                .eq('tenant_id', tenant?.id)
                .order('created_at', { ascending: false });
            if (error) throw error;
            return data;
        },
    });

    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
            const { error } = await supabase.from('products').delete().eq('id', id);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['products'] });
        },
    });

    const handleEdit = (product: any) => {
        setEditingProduct(product);
        setIsModalOpen(true);
    };

    const handleAdd = () => {
        setEditingProduct(null);
        setIsModalOpen(true);
    };

    const handleDuplicate = async (product: any) => {
        try {
            const { id, created_at, updated_at, sku, ...productData } = product;

            // Clean up name to avoid " (Cópia) (Cópia)"
            const baseName = product.name.replace(/\s\(Cópia\)$/, '');
            const duplicatedProduct = {
                ...productData,
                name: `${baseName} (Cópia)`,
                sku: null, // Reset SKU so database trigger generates a new one
            };

            const { error } = await supabase
                .from('products')
                .insert([duplicatedProduct]);

            if (error) throw error;
            queryClient.invalidateQueries({ queryKey: ['products'] });
        } catch (error: any) {
            console.error('[ProductList] Error duplicating product:', error);
            alert(`Erro ao duplicar produto: ${error?.message || 'Erro desconhecido'}`);
        }
    };

    const handleStockAdjustment = (product: any) => {
        setStockProduct(product);
        setIsStockModalOpen(true);
    };

    const handleDownloadTemplate = () => {
        const csvContent = generateProductTemplate();
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', 'modelo_importacao_produtos.csv');
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleImportCSV = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file || !tenant?.id) return;

        setIsImporting(true);
        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                const text = e.target?.result as string;
                const rows = parseCSV(text);

                if (rows.length === 0) {
                    alert('O arquivo está vazio ou em formato inválido.');
                    return;
                }

                // 1. Identify unique categories in CSV
                const csvCategories = Array.from(new Set(rows.map(r => r.categoria).filter(Boolean)));

                // 2. Fetch existing categories
                const { data: existingCats } = await supabase
                    .from('categories')
                    .select('name')
                    .eq('tenant_id', tenant.id);

                const existingCatNames = existingCats?.map(c => c.name) || [];
                const missingCategories = csvCategories.filter(cat => !existingCatNames.includes(cat as string));

                // 3. Create missing categories
                if (missingCategories.length > 0) {
                    const { error: catError } = await supabase
                        .from('categories')
                        .insert(missingCategories.map(name => ({
                            tenant_id: tenant.id,
                            name,
                            active: true
                        })));
                    if (catError) throw catError;
                }

                // 4. Map and Insert products
                const productsToInsert = rows.map(row => mapCSVToProduct(row, tenant.id));
                const { error: prodError } = await supabase
                    .from('products')
                    .insert(productsToInsert);

                if (prodError) throw prodError;

                alert(`${productsToInsert.length} produtos importados com sucesso!`);
                queryClient.invalidateQueries({ queryKey: ['products'] });
                queryClient.invalidateQueries({ queryKey: ['categories'] });
            } catch (err: any) {
                console.error('Error importing CSV:', err);
                alert(`Erro na importação: ${err.message}`);
            } finally {
                setIsImporting(false);
                if (fileInputRef.current) fileInputRef.current.value = '';
            }
        };
        reader.readAsText(file);
    };

    const filteredProducts = products?.filter(p => {
        const search = searchTerm.toLowerCase();
        return (
            p.name.toLowerCase().includes(search) ||
            p.category?.toLowerCase().includes(search) ||
            p.sku?.toLowerCase().includes(search) ||
            p.gtin_ean?.toLowerCase().includes(search) ||
            p.ncm?.toLowerCase().includes(search)
        );
    });

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-end gap-3">
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImportCSV}
                    accept=".csv"
                    className="hidden"
                />
                <button
                    onClick={handleDownloadTemplate}
                    className="flex items-center justify-center gap-2 px-4 py-2.5 border border-neutral-200 rounded-xl text-neutral-600 hover:bg-neutral-50 transition-all font-bold text-sm bg-white"
                >
                    <Download size={18} />
                    Baixar Modelo
                </button>
                <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isImporting}
                    className="flex items-center justify-center gap-2 px-4 py-2.5 border border-neutral-200 rounded-xl text-neutral-600 hover:bg-neutral-50 transition-all font-bold text-sm bg-white disabled:opacity-50"
                >
                    {isImporting ? <Loader2 className="animate-spin" size={18} /> : <Upload size={18} />}
                    Importar CSV
                </button>
                <button
                    onClick={handleAdd}
                    className="bg-brand-primary hover:opacity-90 text-white px-6 py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-brand-primary/20 active:scale-95 text-sm"
                >
                    <Plus size={20} />
                    Novo Produto
                </button>
            </div>

            {/* Toolbar */}
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-neutral-100 flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={18} />
                    <input
                        type="text"
                        placeholder="Buscar por nome, categoria, SKU, EAN ou NCM..."
                        className="w-full pl-10 pr-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <button className="flex items-center gap-2 px-4 py-2.5 border border-neutral-200 rounded-xl text-neutral-600 hover:bg-neutral-50 transition-all font-medium">
                    <Filter size={18} />
                    Filtros
                </button>
            </div>

            {/* Product Grid/Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 overflow-hidden">
                {isLoading ? (
                    <div className="p-20 flex flex-col items-center justify-center text-neutral-400 gap-4">
                        <Loader2 className="animate-spin text-brand-primary" size={40} />
                        <p>Carregando produtos...</p>
                    </div>
                ) : error ? (
                    <div className="p-20 text-center text-red-500 flex flex-col items-center gap-2">
                        <AlertCircle size={40} />
                        <p>Ocorreu um erro ao carregar os produtos.</p>
                    </div>
                ) : filteredProducts?.length === 0 ? (
                    <div className="p-20 text-center text-neutral-400">
                        <Package size={48} className="mx-auto mb-4 opacity-20" />
                        <p>Nenhum produto encontrado.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-neutral-50 border-b border-neutral-100">
                                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-neutral-500">Produto</th>
                                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-neutral-500">Categoria</th>
                                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-neutral-500">Preço</th>
                                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-neutral-500">Estoque</th>
                                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-neutral-500 text-right">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-100">
                                {filteredProducts?.map((product) => (
                                    <tr key={product.id} className="hover:bg-neutral-50/50 transition-all group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-lg bg-neutral-100 overflow-hidden flex items-center justify-center border border-neutral-200">
                                                    {product.image_url ? (
                                                        <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <Package size={20} className="text-neutral-400" />
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-neutral-900">{product.name}</p>
                                                    <p className="text-xs text-neutral-500">SKU: {product.sku || 'Não gerado'}</p>
                                                    {product.gtin_ean && (
                                                        <p className="text-xs text-neutral-400">EAN: {product.gtin_ean}</p>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="px-2.5 py-1 rounded-full bg-neutral-100 text-neutral-600 text-[10px] font-bold uppercase tracking-wider">
                                                {product.category || 'Geral'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="font-bold text-neutral-900">R$ {product.price.toFixed(2)}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <span className={cn(
                                                    "w-2 h-2 rounded-full",
                                                    product.stock_quantity > 10 ? "bg-green-500" : (product.stock_quantity > 0 ? "bg-orange-400" : "bg-red-500")
                                                )}></span>
                                                <span className="font-medium text-neutral-700">{product.stock_quantity} un</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => handleStockAdjustment(product)}
                                                    className="p-2 hover:bg-white hover:shadow-sm rounded-lg text-neutral-600 hover:text-blue-600 border border-transparent hover:border-neutral-100 transition-all"
                                                    title="Ajustar Estoque"
                                                >
                                                    <PackagePlus size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleDuplicate(product)}
                                                    className="p-2 hover:bg-white hover:shadow-sm rounded-lg text-neutral-600 hover:text-purple-600 border border-transparent hover:border-neutral-100 transition-all"
                                                    title="Duplicar Produto"
                                                >
                                                    <Copy size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleEdit(product)}
                                                    className="p-2 hover:bg-white hover:shadow-sm rounded-lg text-neutral-600 hover:text-brand-primary border border-transparent hover:border-neutral-100 transition-all"
                                                >
                                                    <Edit2 size={16} />
                                                </button>
                                                <button
                                                    onClick={() => { if (window.confirm('Excluir este produto?')) deleteMutation.mutate(product.id) }}
                                                    className="p-2 hover:bg-white hover:shadow-sm rounded-lg text-neutral-600 hover:text-red-600 border border-transparent hover:border-neutral-100 transition-all"
                                                >
                                                    <Trash2 size={16} />
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

            <ProductModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                product={editingProduct}
                onSuccess={() => queryClient.invalidateQueries({ queryKey: ['products'] })}
            />

            <StockAdjustmentModal
                isOpen={isStockModalOpen}
                onClose={() => setIsStockModalOpen(false)}
                product={stockProduct}
                onSuccess={() => queryClient.invalidateQueries({ queryKey: ['products'] })}
            />
        </div>
    );
};


export default ProductList;
