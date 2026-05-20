import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import {
    Search,
    Calendar,
    ChevronRight,
    Eye,
    ShoppingBag,
    Loader2,
    AlertCircle,
    Banknote,
    CreditCard,
    QrCode,
    User,
    ArrowLeft,
    Pencil,
    Trash,
    Plus,
    X,
    Save,
    Printer
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useAuth } from '../../context/AuthContext';
import { useTenant } from '../../context/TenantContext';

import { useSearchParams } from 'react-router-dom';

const SalesHistory = () => {
    const { profile } = useAuth();
    const { tenant } = useTenant();
    const [searchParams, setSearchParams] = useSearchParams();
    const clientIdFilter = searchParams.get('client_id');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedSale, setSelectedSale] = useState<any>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editSaleData, setEditSaleData] = useState<any>(null);
    const [productSearch, setProductSearch] = useState('');

    const { data: sales, isLoading, error } = useQuery({
        queryKey: ['sales-history', tenant?.id, clientIdFilter],
        enabled: !!tenant?.id,
        queryFn: async () => {
            const { data, error } = await supabase
                .from('sales')
                .select(`
                    *,
                    clients (name),
                    sale_items (
                        *,
                        products (name)
                    )
                `)
                .eq('tenant_id', tenant?.id)
                .order('created_at', { ascending: false });

            if (error) {
                // Fallback to basic query if client join fails
                const { data: fallbackData, error: fallbackError } = await supabase
                    .from('sales')
                    .select('*, sale_items(*, products(*))')
                    .eq('tenant_id', tenant?.id)
                    .order('created_at', { ascending: false });

                if (fallbackError) throw fallbackError;
                return fallbackData;
            }

            return data;
        },
    });

    const { data: products } = useQuery({
        queryKey: ['products'],
        enabled: isEditing,
        queryFn: async () => {
            const { data } = await supabase.from('products').select('*').eq('active', true);
            return data;
        }
    });

    const paymentIcons: any = {
        dinheiro: { icon: Banknote, label: 'Dinheiro', color: 'text-green-600 bg-green-50' },
        cash: { icon: Banknote, label: 'Dinheiro', color: 'text-green-600 bg-green-50' },
        cartao: { icon: CreditCard, label: 'Cartão', color: 'text-blue-600 bg-blue-50' },
        card: { icon: CreditCard, label: 'Cartão', color: 'text-blue-600 bg-blue-50' },
        pix: { icon: QrCode, label: 'PIX', color: 'text-purple-600 bg-purple-50' },
        other: { icon: User, label: 'Conta', color: 'text-neutral-600 bg-neutral-50' },
    };

    const statusOptions = [
        { value: 'waiting_payment', label: 'Aguardando Pagamento', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
        { value: 'open', label: 'Em Aberto', color: 'bg-blue-100 text-blue-800 border-blue-200' },
        { value: 'preparing', label: 'Em Preparo', color: 'bg-orange-100 text-orange-800 border-orange-200' },
        { value: 'delivery', label: 'Saiu para Entrega', color: 'bg-purple-100 text-purple-800 border-purple-200' },
        { value: 'completed', label: 'Finalizado', color: 'bg-green-100 text-green-800 border-green-200' },
        { value: 'cancelled', label: 'Cancelado', color: 'bg-red-100 text-red-800 border-red-200' },
    ];

    const handleStatusUpdate = async (saleId: string, newStatus: string) => {
        try {
            const { error } = await supabase
                .from('sales')
                .update({ status: newStatus })
                .eq('id', saleId);

            if (error) throw error;

            // Refetch or update local state logic would go here, 
            // but react-query's invalidateQueries is cleaner if we had access to queryClient.
            // For now, we rely on the realtime subscription or manual refresh, 
            // or we could force a refetch if we extracted the query function.
            // A simple page reload or refetch trigger is often used:
            window.location.reload();
        } catch (error) {
            console.error('Error updating status:', error);
            alert('Erro ao atualizar status');
        }
    };

    const handleDeliveryTypeUpdate = async (sale: any, newMethod: string) => {
        try {
            const { error } = await supabase
                .from('sales')
                .update({ delivery_method: newMethod })
                .eq('id', sale.id);

            if (error) throw error;
            window.location.reload();
        } catch (error) {
            console.error('Error updating delivery method:', error);
            alert('Erro ao atualizar tipo de entrega');
        }
    };

    const handleEditClick = (sale: any) => {
        // Deep copy and ensure sale_items exists
        const data = JSON.parse(JSON.stringify(sale));
        if (!data.sale_items) data.sale_items = [];
        setEditSaleData(data);
        setIsEditing(true);
    };

    const handleSaveEdit = async () => {
        try {
            const deliveryFee = editSaleData.delivery_method === 'entrega' ? (Number(editSaleData.delivery_fee) || 0) : 0;
            const items = editSaleData.sale_items || [];

            if (items.length === 0) {
                alert('O pedido não pode ficar vazio.');
                return;
            }

            const itemsTotal = items.reduce((acc: number, item: any) => acc + (item.unit_price * item.quantity), 0);
            const totalAmount = itemsTotal + deliveryFee;

            // Update Sale
            const { error: saleError } = await supabase
                .from('sales')
                .update({
                    total_amount: totalAmount,
                    total: totalAmount,
                    delivery_fee: deliveryFee
                })
                .eq('id', editSaleData.id);

            if (saleError) throw saleError;

            // Delete old items
            const { error: deleteError } = await supabase.from('sale_items').delete().eq('sale_id', editSaleData.id);
            if (deleteError) throw deleteError;

            // Insert new items
            const newItems = items.map((item: any) => ({
                sale_id: editSaleData.id,
                product_id: item.products?.id || item.product_id,
                quantity: item.quantity,
                unit_price: item.unit_price,
                total_price: item.unit_price * item.quantity,
                subtotal: item.unit_price * item.quantity,
                tenant_id: tenant?.id
            }));

            const { error: insertError } = await supabase.from('sale_items').insert(newItems);
            if (insertError) throw insertError;

            window.location.reload();

        } catch (error: any) {
            console.error('Error saving:', error);
            alert('Erro ao salvar: ' + (error.message || 'Erro desconhecido'));
        }
    };

    const addItem = (product: any) => {
        const existingInfo = editSaleData.sale_items.find((i: any) => (i.products?.id || i.product_id) === product.id);
        if (existingInfo) {
            const updated = editSaleData.sale_items.map((i: any) =>
                (i.products?.id || i.product_id) === product.id ? { ...i, quantity: i.quantity + 1 } : i
            );
            setEditSaleData({ ...editSaleData, sale_items: updated });
        } else {
            const newItem = {
                product_id: product.id,
                quantity: 1,
                unit_price: product.price,
                total_price: product.price,
                products: product // Keep full product object for display
            };
            setEditSaleData({ ...editSaleData, sale_items: [...editSaleData.sale_items, newItem] });
        }
        setProductSearch(''); // Reset search after adding
    };

    const removeItem = (index: number) => {
        const updated = [...editSaleData.sale_items];
        updated.splice(index, 1);
        setEditSaleData({ ...editSaleData, sale_items: updated });
    };

    const updateQuantity = (index: number, delta: number) => {
        const updated = [...editSaleData.sale_items];
        const newQty = updated[index].quantity + delta;
        if (newQty > 0) {
            updated[index].quantity = newQty;
            setEditSaleData({ ...editSaleData, sale_items: updated });
        }
    };

    const handlePrint = (sale: any) => {
        const printWindow = window.open('', '', 'width=400,height=600');
        if (!printWindow) return;

        const tenantHeight = '80mm'; // Default or from settings
        const companyName = tenant?.name || 'Clique PDV';

        const html = `
            <html>
                <head>
                    <title>Pedido #${sale.display_id}</title>
                    <style>
                        body { font-family: 'Courier New', monospace; padding: 20px; width: 300px; margin: 0 auto; }
                        .header { text-align: center; border-bottom: 1px dashed #000; padding-bottom: 10px; margin-bottom: 10px; }
                        .title { font-size: 16px; font-weight: bold; }
                        .info { font-size: 12px; margin: 2px 0; }
                        .items { width: 100%; border-collapse: collapse; margin: 10px 0; font-size: 12px; }
                        .items th { text-align: left; border-bottom: 1px dashed #000; }
                        .items td { padding: 4px 0; }
                        .totals { margin-top: 10px; border-top: 1px dashed #000; pt: 10px; }
                        .row { display: flex; justify-content: space-between; font-size: 12px; }
                        .total-row { font-weight: bold; font-size: 14px; margin-top: 5px; }
                        .footer { text-align: center; margin-top: 20px; font-size: 10px; }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <div class="title">${tenant?.name || 'Clique PDV'}</div>
                        ${tenant?.corporate_name ? `<div class="info">${tenant.corporate_name}</div>` : ''}
                        ${tenant?.cnpj ? `<div class="info">CNPJ: ${tenant.cnpj}</div>` : ''}
                        ${tenant?.address ? `<div class="info">${tenant.address}</div>` : ''}
                        
                        <div style="margin-top: 10px; border-top: 1px dashed #000; padding-top: 5px;">
                            <div class="info">Pedido #${sale.display_id || sale.id.slice(0, 8)}</div>
                            <div class="info">${format(new Date(sale.created_at), "dd/MM/yyyy HH:mm")}</div>
                            <div class="info">Cliente: <strong>${sale.clients?.name || 'Cliente Casual'}</strong></div>
                            ${sale.clients?.phone ? `<div class="info">Tel: ${sale.clients.phone}</div>` : ''}
                        </div>
                    </div>
                    
                    <div class="info">Tipo: <strong>${sale.delivery_method === 'entrega' ? 'ENTREGA' : 'RETIRADA'}</strong></div>
                    ${sale.delivery_method === 'entrega' ? `<div class="info">Endereço: ${sale.address_street}, ${sale.address_number} - ${sale.address_neighborhood}</div>` : ''}
                    
                    <table class="items">
                        <thead>
                            <tr>
                                <th>Qtd</th>
                                <th>Item</th>
                                <th style="text-align: right">Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${sale.sale_items?.map((item: any) => `
                                <tr>
                                    <td>${item.quantity}x</td>
                                    <td>${item.products?.name}</td>
                                    <td style="text-align: right">R$ ${item.total_price.toFixed(2)}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>

                    <div class="totals">
                        <div class="row">
                            <span>Subtotal</span>
                            <span>R$ ${(sale.total_amount - (sale.delivery_fee || 0)).toFixed(2)}</span>
                        </div>
                        <div class="row">
                            <span>Taxa Entrega</span>
                            <span>R$ ${(Number(sale.delivery_fee) || 0).toFixed(2)}</span>
                        </div>
                        <div class="row total-row">
                            <span>TOTAL</span>
                            <span>R$ ${sale.total_amount.toFixed(2)}</span>
                        </div>
                    </div>

                    <div class="row" style="margin-top: 10px">
                        <span>Pagamento:</span>
                        <span>${sale.payment_method.toUpperCase()}</span>
                    </div>

                    ${sale.observation ? `
                        <div style="margin-top: 10px; border-top: 1px dashed #000; padding-top: 5px;">
                            <strong>Observações:</strong><br/>
                            ${sale.observation}
                        </div>
                    ` : ''}

                    <div class="footer">
                        Obrigado pela preferência!
                    </div>

                    <script>
                        window.print();
                        window.onafterprint = function() { window.close(); }
                    </script>
                </body>
            </html>
        `;

        printWindow.document.write(html);
        printWindow.document.close();
    };

    const filteredSales = sales?.filter(sale =>
        sale.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sale.payment_method.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sale.clients?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (isEditing && editSaleData) {
        const currentItems = editSaleData.sale_items || [];
        const currentSubtotal = currentItems.reduce((acc: number, item: any) => acc + (item.unit_price * item.quantity), 0);
        const currentDelivery = editSaleData.delivery_method === 'entrega' ? (Number(editSaleData.delivery_fee) || 0) : 0;
        const currentTotal = currentSubtotal + currentDelivery;

        return (
            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
                <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl max-h-[90vh] flex flex-col overflow-hidden">
                    <div className="p-6 border-b border-neutral-100 flex justify-between items-center bg-neutral-50">
                        <div>
                            <h2 className="text-xl font-bold text-neutral-900">Editar Pedido #{editSaleData.display_id}</h2>
                            <p className="text-sm text-neutral-500">{editSaleData.clients?.name}</p>
                        </div>
                        <button onClick={() => setIsEditing(false)} className="p-2 hover:bg-neutral-200 rounded-full transition-colors">
                            <X size={20} className="text-neutral-500" />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6 md:flex">
                        <div className="flex-1 pr-6 border-r border-neutral-100">
                            <h3 className="font-bold text-sm uppercase tracking-wide text-neutral-500 mb-4">Itens do Pedido</h3>
                            <div className="space-y-3">
                                {currentItems.map((item: any, index: number) => (
                                    <div key={index} className="flex items-center justify-between p-3 bg-neutral-50 rounded-xl border border-neutral-100">
                                        <div className="flex-1">
                                            <p className="font-bold text-neutral-900 line-clamp-1">{item.products?.name}</p>
                                            <p className="text-xs text-neutral-500">R$ {item.unit_price.toFixed(2)}</p>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="flex items-center bg-white border border-neutral-200 rounded-lg h-8">
                                                <button onClick={() => updateQuantity(index, -1)} className="px-2 h-full hover:bg-neutral-50 text-neutral-500 text-lg leading-none pb-1">-</button>
                                                <span className="w-8 text-center text-xs font-bold">{item.quantity}</span>
                                                <button onClick={() => updateQuantity(index, 1)} className="px-2 h-full hover:bg-neutral-50 text-neutral-500 text-lg leading-none pb-1">+</button>
                                            </div>
                                            <p className="font-bold text-neutral-900 w-20 text-right">R$ {(item.unit_price * item.quantity).toFixed(2)}</p>
                                            <button onClick={() => removeItem(index)} className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                                                <Trash size={16} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                                {currentItems.length === 0 && <p className="text-center text-neutral-400 py-4 italic">Nenhum item no pedido.</p>}
                            </div>

                            <div className="mt-6 pt-6 border-t border-neutral-100 space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-neutral-500">Subtotal</span>
                                    <span className="font-bold text-neutral-900">R$ {currentSubtotal.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-neutral-500">Entrega</span>
                                    <span className="font-bold text-neutral-900">R$ {currentDelivery.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-lg font-black text-brand-primary pt-2">
                                    <span>Total</span>
                                    <span>R$ {currentTotal.toFixed(2)}</span>
                                </div>
                            </div>
                        </div>

                        <div className="w-80 pl-6 flex flex-col pt-6 md:pt-0 border-t md:border-t-0 border-neutral-100">
                            <h3 className="font-bold text-sm uppercase tracking-wide text-neutral-500 mb-4">Adicionar Produto</h3>
                            <div className="relative mb-4">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={16} />
                                <input
                                    type="text"
                                    autoFocus
                                    placeholder="Buscar produto..."
                                    className="w-full pl-9 pr-4 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary"
                                    value={productSearch}
                                    onChange={(e) => setProductSearch(e.target.value)}
                                />
                            </div>
                            <div className="flex-1 overflow-y-auto space-y-2 max-h-[400px]">
                                {products?.filter((p: any) => p.name.toLowerCase().includes(productSearch.toLowerCase())).map((product: any) => (
                                    <button
                                        key={product.id}
                                        onClick={() => addItem(product)}
                                        className="w-full text-left p-3 hover:bg-neutral-50 border border-transparent hover:border-neutral-200 rounded-xl transition-all group"
                                    >
                                        <div className="flex justify-between items-center">
                                            <p className="font-bold text-neutral-700 text-sm line-clamp-1">{product.name}</p>
                                            <Plus size={16} className="text-neutral-300 group-hover:text-brand-primary" />
                                        </div>
                                        <p className="text-xs text-neutral-400">R$ {product.price.toFixed(2)}</p>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="p-6 bg-neutral-50 border-t border-neutral-100 flex justify-end gap-3">
                        <button
                            onClick={() => setIsEditing(false)}
                            className="px-6 py-2.5 font-bold text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100 rounded-xl transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={handleSaveEdit}
                            className="px-8 py-2.5 bg-brand-primary hover:opacity-90 text-white font-bold rounded-xl shadow-lg shadow-brand-primary/20 active:scale-95 transition-all flex items-center gap-2"
                        >
                            <Save size={18} /> Salvar Alterações
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (isEditing && editSaleData) {
        // ... (Edit Modal logic remains the same)
        // I'm using multi_replace, so I don't need to touch the existing edit modal if I don't overlap lines.
        // Wait, I need to make sure I don't delete the edit modal or the View modal logic from where it was.
        // The previous tool output showed lines 350-429 contained the conditional return for selectedSale.
        // I need to REMOVE that full block and re-insert it as a modal in the main return.
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {selectedSale && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl max-h-[90vh] flex flex-col overflow-hidden relative">
                        <div className="p-6 border-b border-neutral-100 flex justify-between items-center bg-neutral-50">
                            <div>
                                <p className="text-xs font-bold text-neutral-400 uppercase tracking-widest mb-1">Venda #{selectedSale.display_id || selectedSale.id.slice(0, 8)}</p>
                                <h1 className="text-xl font-bold text-neutral-900">Detalhes da Venda</h1>
                                <p className="text-sm text-neutral-500 mt-1">
                                    {format(new Date(selectedSale.created_at), "dd 'de' MMMM 'às' HH:mm", { locale: ptBR })}
                                </p>
                            </div>
                            <button onClick={() => setSelectedSale(null)} className="p-2 hover:bg-neutral-200 rounded-full transition-colors">
                                <X size={20} className="text-neutral-500" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6">
                            <div className="flex flex-col md:flex-row justify-between gap-6 mb-8 p-6 bg-neutral-50/50 rounded-2xl border border-neutral-100">
                                <div>
                                    <p className="text-sm font-bold text-neutral-900">{selectedSale.clients?.name || 'Cliente Casual'}</p>
                                    <p className="text-xs text-neutral-500 mt-1">{selectedSale.clients?.phone}</p>
                                </div>
                                <div className="text-right flex flex-col items-end">
                                    <p className="text-xs font-bold text-neutral-400 uppercase tracking-widest mb-1">Total Recebido</p>
                                    <p className="text-3xl font-black text-brand-primary">R$ {selectedSale.total_amount.toFixed(2)}</p>
                                    <div className="flex gap-2 mt-2">
                                        <div className={cn(
                                            "inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold",
                                            paymentIcons[selectedSale.payment_method]?.color || 'text-neutral-600 bg-neutral-50'
                                        )}>
                                            {paymentIcons[selectedSale.payment_method]?.icon && React.createElement(paymentIcons[selectedSale.payment_method].icon, { size: 14 })}
                                            {paymentIcons[selectedSale.payment_method]?.label || 'Outro'}
                                        </div>
                                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-100 text-neutral-600 text-xs font-bold">
                                            {selectedSale.delivery_method === 'entrega' ? 'Entrega' : 'Retirada'}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {selectedSale.observation && (
                                <div className="mb-6 p-4 bg-brand-primary-light border border-brand-primary/20 rounded-xl">
                                    <h4 className="font-bold text-brand-primary text-sm uppercase tracking-wide mb-1 flex items-center gap-2">
                                        <AlertCircle size={14} /> Observações do Cliente
                                    </h4>
                                    <p className="text-neutral-700 text-sm font-medium leading-relaxed">
                                        {selectedSale.observation}
                                    </p>
                                </div>
                            )}

                            <h3 className="font-bold text-neutral-900 mb-4 flex items-center gap-2">
                                <ShoppingBag size={18} className="text-brand-primary" />
                                Itens do Pedido ({selectedSale.sale_items?.length})
                            </h3>
                            <div className="border border-neutral-100 rounded-2xl overflow-hidden">
                                <table className="w-full text-left">
                                    <thead className="bg-neutral-50">
                                        <tr>
                                            <th className="px-6 py-4 text-xs font-bold text-neutral-500 uppercase">Produto</th>
                                            <th className="px-6 py-4 text-xs font-bold text-neutral-500 uppercase text-center">Qtde</th>
                                            <th className="px-6 py-4 text-xs font-bold text-neutral-500 uppercase text-right">Unitário</th>
                                            <th className="px-6 py-4 text-xs font-bold text-neutral-500 uppercase text-right">Subtotal</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-neutral-100">
                                        {selectedSale.sale_items?.map((item: any) => (
                                            <tr key={item.id}>
                                                <td className="px-6 py-4 font-bold text-neutral-900">{item.products?.name}</td>
                                                <td className="px-6 py-4 text-center text-neutral-600">{item.quantity}</td>
                                                <td className="px-6 py-4 text-right text-neutral-600">R$ {item.unit_price.toFixed(2)}</td>
                                                <td className="px-6 py-4 text-right font-bold text-neutral-900">R$ {item.total_price.toFixed(2)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="h-2" />

            {clientIdFilter && (
                <div className="bg-brand-primary-light border border-brand-primary/20 p-6 rounded-3xl flex flex-col md:flex-row md:items-center justify-between gap-4 animate-in slide-in-from-top duration-300">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-brand-primary flex items-center justify-center text-white shadow-lg shadow-brand-primary/20">
                            <History size={24} />
                        </div>
                        <div>
                            <h2 className="text-lg font-black text-neutral-900">Histórico de Vendas</h2>
                            <p className="text-brand-primary font-bold text-sm">Mostrando apenas vendas do cliente selecionado</p>
                        </div>
                    </div>
                    <button
                        onClick={() => {
                            searchParams.delete('client_id');
                            setSearchParams(searchParams);
                        }}
                        className="flex items-center gap-2 px-6 py-3 bg-white hover:bg-neutral-50 border border-neutral-200 rounded-2xl text-neutral-600 font-black text-xs uppercase tracking-widest transition-all active:scale-95 shadow-sm"
                    >
                        <ArrowLeft size={16} /> Ver todas as vendas
                    </button>
                </div>
            )}

            <div className="bg-white p-4 rounded-2xl shadow-sm border border-neutral-100 flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={18} />
                    <input
                        type="text"
                        placeholder="Buscar por ID ou forma de pagamento..."
                        className="w-full pl-10 pr-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <button className="flex items-center gap-2 px-4 py-2.5 border border-neutral-200 rounded-xl text-neutral-600 hover:bg-neutral-50 transition-all font-medium">
                    <Calendar size={18} />
                    Filtrar Data
                </button>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 overflow-hidden">
                {isLoading ? (
                    <div className="p-20 flex flex-col items-center justify-center text-neutral-400 gap-4">
                        <Loader2 className="animate-spin text-brand-primary" size={40} />
                        <p>Carregando vendas...</p>
                    </div>
                ) : error ? (
                    <div className="p-20 text-center text-red-500 flex flex-col items-center gap-2">
                        <AlertCircle size={40} />
                        <p>Erro ao carregar histórico.</p>
                    </div>
                ) : filteredSales?.length === 0 ? (
                    <div className="p-20 text-center text-neutral-400">
                        <ShoppingBag size={48} className="mx-auto mb-4 opacity-20" />
                        <p>Nenhuma venda encontrada.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-neutral-50 border-b border-neutral-100">
                                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-neutral-500">Data & Hora</th>
                                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-neutral-500">ID</th>
                                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-neutral-500">Cliente</th>
                                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-neutral-500">Tipo</th>
                                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-neutral-500">Pagamento</th>
                                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-neutral-500 text-right">Total</th>
                                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-neutral-500">Status</th>
                                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-neutral-500 text-right">Ação</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-100">
                                {filteredSales?.map((sale) => (
                                    <tr key={sale.id} className="hover:bg-neutral-50/50 transition-all">
                                        <td className="px-6 py-4">
                                            <p className="font-bold text-neutral-900">{format(new Date(sale.created_at), "dd/MM/yyyy")}</p>
                                            <p className="text-xs text-neutral-500">{format(new Date(sale.created_at), "HH:mm")}</p>
                                        </td>
                                        <td className="px-6 py-4 font-mono text-sm text-neutral-900 font-black">
                                            #{sale.display_id || sale.id.slice(0, 8)}
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-sm font-bold text-neutral-900">{sale.clients?.name || 'Cliente Casual'}</p>
                                            <p className="text-xs text-neutral-400 font-mono mt-1">{sale.clients?.phone}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <select
                                                value={sale.delivery_method}
                                                onChange={(e) => handleDeliveryTypeUpdate(sale, e.target.value)}
                                                onClick={(e) => e.stopPropagation()}
                                                className={cn(
                                                    "px-2.5 py-1 rounded-full text-[10px] font-bold uppercase border cursor-pointer outline-none appearance-none text-center min-w-[80px]",
                                                    sale.delivery_method === 'entrega'
                                                        ? "bg-blue-50 text-blue-700 border-blue-100"
                                                        : "bg-orange-50 text-orange-700 border-orange-100"
                                                )}
                                            >
                                                <option value="entrega">Entrega</option>
                                                <option value="retirada">Retirada</option>
                                            </select>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className={cn(
                                                "inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase",
                                                paymentIcons[sale.payment_method]?.color || 'text-neutral-600 bg-neutral-50'
                                            )}>
                                                {paymentIcons[sale.payment_method]?.icon && React.createElement(paymentIcons[sale.payment_method].icon, { size: 12 })}
                                                {paymentIcons[sale.payment_method]?.label || 'Outro'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right font-black text-neutral-900">
                                            R$ {sale.total_amount.toFixed(2)}
                                        </td>
                                        <td className="px-6 py-4">
                                            <select
                                                value={sale.status || 'waiting_payment'}
                                                onChange={(e) => handleStatusUpdate(sale.id, e.target.value)}
                                                className={cn(
                                                    "px-3 py-1.5 rounded-lg text-xs font-bold border outline-none cursor-pointer transition-all",
                                                    statusOptions.find(opt => opt.value === (sale.status || 'waiting_payment'))?.color || 'bg-neutral-100 text-neutral-600'
                                                )}
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                {statusOptions.map(option => (
                                                    <option key={option.value} value={option.value}>
                                                        {option.label}
                                                    </option>
                                                ))}
                                            </select>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => setSelectedSale(sale)}
                                                className="p-2 hover:bg-white hover:shadow-sm rounded-lg text-neutral-400 hover:text-brand-primary border border-transparent hover:border-neutral-100 transition-all"
                                                title="Ver Detalhes"
                                            >
                                                <Eye size={18} />
                                            </button>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleEditClick(sale);
                                                }}
                                                className="p-2 hover:bg-white hover:shadow-sm rounded-lg text-neutral-400 hover:text-blue-600 border border-transparent hover:border-neutral-100 transition-all"
                                                title="Editar Pedido"
                                            >
                                                <Pencil size={18} />
                                            </button>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handlePrint(sale);
                                                }}
                                                className="p-2 hover:bg-white hover:shadow-sm rounded-lg text-neutral-400 hover:text-neutral-700 border border-transparent hover:border-neutral-100 transition-all"
                                                title="Imprimir Pedido"
                                            >
                                                <Printer size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SalesHistory;
