import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import {
    Search,
    ShoppingCart,
    Plus,
    Minus,
    Trash2,
    User,
    X,
    ShieldAlert,
    Layout,
    Menu,
    ChevronRight,
    Package,
    Loader2,
    Banknote,
    CreditCard,
    QrCode
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useSettings } from '../../hooks/useSettings';
import { useAuth } from '../../context/AuthContext';
import { useTenant } from '../../context/TenantContext';
import ReceiptModal from '../../components/admin/ReceiptModal';

const POSInterface = () => {
    const { signOut } = useAuth();
    const { tenant, isLoading: tenantLoading } = useTenant();
    const [selectedClient, setSelectedClient] = useState<any>(null);
    const [searchTerm, setSearchTerm] = useState('');

    const { data: clients } = useQuery({
        queryKey: ['clients-pos', tenant?.id],
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
    const [cart, setCart] = useState<any[]>([]);
    const [paymentMethod, setPaymentMethod] = useState('cash');
    const [isProcessing, setIsProcessing] = useState(false);
    const [lastSale, setLastSale] = useState<any>(null);
    const [isReceiptOpen, setIsReceiptOpen] = useState(false);
    const { data: settings } = useSettings();

    const { data: products, isLoading, refetch } = useQuery({
        queryKey: ['products-pos', tenant?.id],
        enabled: !!tenant?.id,
        queryFn: async () => {
            const { data, error } = await supabase
                .from('products')
                .select('*')
                .eq('tenant_id', tenant?.id)
                .eq('active', true)
                .order('name', { ascending: true });
            if (error) throw error;
            return data;
        },
    });

    const addToCart = (product: any) => {
        setCart(prev => {
            const existing = prev.find(item => item.id === product.id);
            if (existing) {
                return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
            }
            return [...prev, { ...product, quantity: 1 }];
        });
    };

    const updateQuantity = (id: string, delta: number) => {
        setCart(prev => prev.map(item => {
            if (item.id === id) {
                const newQty = Math.max(0, item.quantity + delta);
                return { ...item, quantity: newQty };
            }
            return item;
        }).filter(item => item.quantity > 0));
    };

    const total = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);

    const handleCheckout = async () => {
        if (cart.length === 0) return;

        if (!tenant?.id) {
            console.error('[POS] Tenant ID not available:', { tenant });
            alert('Erro: Loja não identificada. Recarregue a página e tente novamente.');
            return;
        }

        setIsProcessing(true);

        try {
            console.log('[POS] Creating sale with tenant_id:', tenant.id);

            // 1. Create the sale
            const { data: saleData, error: saleError } = await supabase
                .from('sales')
                .insert([{
                    tenant_id: tenant.id,
                    client_id: selectedClient?.id || null,
                    total_amount: total,
                    payment_method: paymentMethod,
                    status: 'completed'
                }])
                .select()
                .single();

            if (saleError) throw saleError;

            // 2. Create sale items and update stock
            const saleItems = cart.map(item => ({
                sale_id: saleData.id,
                product_id: item.id,
                quantity: item.quantity,
                unit_price: item.price,
                total_price: item.price * item.quantity
            }));

            const { error: itemsError } = await supabase
                .from('sale_items')
                .insert(saleItems);

            if (itemsError) throw itemsError;

            // 3. Update stock for each product
            for (const item of cart) {
                const { error: stockError } = await supabase.rpc('decrement_stock', {
                    row_id: item.id,
                    amount: item.quantity
                });

                // Fallback if RPC doesn't exist yet
                if (stockError) {
                    const { error: fallbackError } = await supabase
                        .from('products')
                        .update({ stock_quantity: Math.max(0, item.stock_quantity - item.quantity) })
                        .eq('id', item.id);
                    if (fallbackError) console.error('Error updating stock for', item.name, fallbackError);
                }
            }

            setLastSale({
                id: saleData.id,
                total_amount: total,
                payment_method: paymentMethod,
                items: cart.map(item => ({ name: item.name, quantity: item.quantity, price: item.price }))
            });
            setIsReceiptOpen(true);
            setCart([]);
            refetch();
        } catch (error: any) {
            console.error('[POS] Error during checkout:', error);
            const errorMsg = error?.message || 'Erro desconhecido';
            alert(`Erro ao finalizar venda: ${errorMsg}`);
        } finally {
            setIsProcessing(false);
        }
    };

    const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');

    const filteredProducts = products?.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.gtin_ean?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="flex h-[calc(100vh-140px)] gap-6 animate-in fade-in duration-500">
            {/* Product Selection Area */}
            <div className="flex-1 flex flex-col gap-6">
                <div className="bg-white p-4 rounded-2xl shadow-sm border border-neutral-100 flex items-center gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={20} />
                        <input
                            type="text"
                            placeholder="Buscar produto ou bipar código..."
                            className="w-full pl-10 pr-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary outline-none transition-all"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            autoFocus
                        />
                    </div>
                    <div className="flex bg-neutral-100 p-1 rounded-xl">
                        <button
                            onClick={() => setViewMode('grid')}
                            className={cn(
                                "p-2 rounded-lg transition-all",
                                viewMode === 'grid' ? "bg-white shadow-sm text-brand-primary" : "text-neutral-500 hover:text-neutral-700"
                            )}
                        >
                            <Layout size={20} />
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={cn(
                                "p-2 rounded-lg transition-all",
                                viewMode === 'list' ? "bg-white shadow-sm text-brand-primary" : "text-neutral-500 hover:text-neutral-700"
                            )}
                        >
                            <Menu size={20} />
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto pr-2">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center text-neutral-400 gap-4 mt-20">
                            <Loader2 className="animate-spin text-brand-primary" size={40} />
                            <p>Carregando catálogo...</p>
                        </div>
                    ) : filteredProducts?.length === 0 ? (
                        <div className="flex flex-col items-center justify-center text-neutral-400 gap-4 mt-20">
                            <Package size={48} className="opacity-20" />
                            <p>Nenhum produto encontrado.</p>
                        </div>
                    ) : viewMode === 'grid' ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                            {filteredProducts?.map((product) => (
                                <button
                                    key={product.id}
                                    onClick={() => addToCart(product)}
                                    className="bg-white p-4 rounded-2xl shadow-sm border border-neutral-100 hover:border-brand-primary hover:shadow-md transition-all text-left flex flex-col h-full group active:scale-95"
                                >
                                    <div className="aspect-square bg-neutral-50 rounded-xl mb-3 overflow-hidden border border-neutral-100 flex items-center justify-center">
                                        {product.image_url ? (
                                            <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <Package size={24} className="text-neutral-300 group-hover:text-brand-primary transition-colors" />
                                        )}
                                    </div>
                                    <h3 className="font-bold text-neutral-900 text-sm mb-1 line-clamp-2 flex-1">{product.name}</h3>
                                    <div className="flex justify-between items-end">
                                        <p className="text-brand-primary font-black">R$ {product.price.toFixed(2)}</p>
                                        <p className={cn(
                                            "text-[10px] font-bold px-1.5 py-0.5 rounded",
                                            product.stock_quantity > 0 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                                        )}>
                                            Est: {product.stock_quantity}
                                        </p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    ) : (
                        <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 overflow-hidden">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-neutral-50 border-b border-neutral-100">
                                        <th className="px-4 py-3 text-[10px] font-black uppercase tracking-wider text-neutral-400">Produto</th>
                                        <th className="px-4 py-3 text-[10px] font-black uppercase tracking-wider text-neutral-400 text-right">Preço</th>
                                        <th className="px-4 py-3 text-[10px] font-black uppercase tracking-wider text-neutral-400 text-right">Estoque</th>
                                        <th className="px-4 py-3 text-[10px] font-black uppercase tracking-wider text-neutral-400 text-right"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-neutral-50">
                                    {filteredProducts?.map((product) => (
                                        <tr
                                            key={product.id}
                                            className="hover:bg-brand-primary-light transition-colors group cursor-pointer"
                                            onClick={() => addToCart(product)}
                                        >
                                            <td className="px-4 py-2.5">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-neutral-50 rounded-lg overflow-hidden border border-neutral-100 shrink-0 flex items-center justify-center">
                                                        {product.image_url ? (
                                                            <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <Package size={16} className="text-neutral-300" />
                                                        )}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-neutral-900 text-sm leading-tight">{product.name}</p>
                                                        <p className="text-[10px] text-neutral-400 font-mono mt-0.5">
                                                            {product.sku || (product.gtin_ean ? `EAN: ${product.gtin_ean}` : '-')}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-2.5 text-right">
                                                <p className="text-sm font-bold text-neutral-900">R$ {product.price.toFixed(2)}</p>
                                            </td>
                                            <td className="px-4 py-2.5 text-right">
                                                <span className={cn(
                                                    "text-[10px] font-bold px-2 py-0.5 rounded-full",
                                                    product.stock_quantity > 0 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                                                )}>
                                                    {product.stock_quantity}
                                                </span>
                                            </td>
                                            <td className="px-4 py-2.5 text-right">
                                                <div className="p-1.5 bg-brand-primary text-white rounded-lg opacity-0 group-hover:opacity-100 transition-all active:scale-90 inline-flex items-center">
                                                    <Plus size={14} />
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>


            {/* Cart & Checkout Area */}
            <div className="w-96 bg-white rounded-2xl shadow-xl border border-neutral-100 flex flex-col overflow-hidden">
                <div className="p-4 border-b border-neutral-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <ShoppingCart className="text-brand-primary" size={20} />
                        <h2 className="font-bold text-neutral-900">Carrinho</h2>
                    </div>
                    <button
                        onClick={() => {
                            setCart([]);
                            setSelectedClient(null);
                        }}
                        className="text-xs font-bold text-red-500 hover:text-red-600 uppercase tracking-wider"
                    >
                        Limpar
                    </button>
                </div>

                {/* Client Selection */}
                <div className="p-4 border-b border-neutral-100 bg-neutral-50/50">
                    <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={16} />
                        <select
                            className="w-full pl-10 pr-4 py-2 bg-white border border-neutral-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary outline-none appearance-none cursor-pointer font-bold text-neutral-700"
                            value={selectedClient?.id || ''}
                            onChange={(e) => {
                                const client = clients?.find(c => c.id === e.target.value);
                                setSelectedClient(client || null);
                            }}
                        >
                            <option value="">Cliente Casual</option>
                            {clients?.map((client: any) => (
                                <option key={client.id} value={client.id}>{client.name}</option>
                            ))}
                        </select>
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-neutral-400">
                            <ChevronRight size={14} className="rotate-90" />
                        </div>
                    </div>
                    {selectedClient && (
                        <div className="mt-2 flex items-center justify-between px-1">
                            <p className="text-[10px] text-brand-primary font-bold flex items-center gap-1">
                                <ShieldAlert size={10} /> Cliente Identificado
                            </p>
                            <button
                                onClick={() => setSelectedClient(null)}
                                className="text-[10px] text-neutral-400 hover:text-red-500 font-bold underline"
                            >
                                Remover
                            </button>
                        </div>
                    )}
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {cart.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-neutral-300 gap-2">
                            <ShoppingCart size={40} className="opacity-20" />
                            <p className="text-sm">Carrinho vazio</p>
                        </div>
                    ) : (
                        cart.map((item) => (
                            <div key={item.id} className="flex gap-3 animate-in slide-in-from-right duration-200">
                                <div className="flex-1">
                                    <p className="font-bold text-neutral-900 text-sm leading-tight">{item.name}</p>
                                    <p className="text-xs text-neutral-400 mt-1">R$ {item.price.toFixed(2)} un</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="flex items-center bg-neutral-100 rounded-lg p-1">
                                        <button onClick={() => updateQuantity(item.id, -1)} className="p-1 text-neutral-500 hover:text-red-500"><Minus size={14} /></button>
                                        <span className="w-6 text-center text-sm font-bold">{item.quantity}</span>
                                        <button onClick={() => addToCart(item)} className="p-1 text-neutral-500 hover:text-brand-primary"><Plus size={14} /></button>
                                    </div>
                                    <p className="font-bold text-neutral-900 text-sm min-w-[60px] text-right">
                                        R$ {(item.price * item.quantity).toFixed(2)}
                                    </p>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                <div className="p-6 bg-neutral-900 text-white space-y-6">
                    <div className="space-y-2">
                        <div className="flex justify-between text-neutral-400 text-sm">
                            <span>Subtotal</span>
                            <span>R$ {total.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between items-end">
                            <span className="font-bold">Total</span>
                            <span className="text-3xl font-black text-brand-primary">R$ {total.toFixed(2)}</span>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <p className="text-xs font-bold text-neutral-500 uppercase tracking-widest">Forma de Pagamento</p>
                        <div className="grid grid-cols-2 gap-2">
                            {[
                                { id: 'cash', icon: Banknote, label: 'Dinheiro' },
                                { id: 'card', icon: CreditCard, label: 'Cartão' },
                                { id: 'pix', icon: QrCode, label: 'PIX' },
                                { id: 'other', icon: User, label: 'Conta' },
                            ].map((method) => (
                                <button
                                    key={method.id}
                                    onClick={() => setPaymentMethod(method.id)}
                                    className={cn(
                                        "flex items-center gap-2 p-2 rounded-xl border transition-all text-xs font-bold",
                                        paymentMethod === method.id
                                            ? "bg-brand-primary border-brand-primary text-white shadow-lg shadow-brand-primary/20"
                                            : "bg-neutral-800 border-neutral-700 text-neutral-400 hover:border-neutral-600"
                                    )}
                                >
                                    <method.icon size={16} />
                                    {method.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <button
                        onClick={handleCheckout}
                        disabled={cart.length === 0 || isProcessing}
                        className="w-full bg-brand-primary hover:opacity-90 disabled:opacity-50 disabled:hover:opacity-90 text-white py-4 rounded-2xl font-black text-lg uppercase tracking-widest transition-all shadow-xl shadow-brand-primary/40 active:scale-95 flex items-center justify-center gap-3"
                    >
                        {isProcessing ? <Loader2 className="animate-spin" /> : 'Finalizar Venda'}
                    </button>
                </div>
            </div>
        </div>
    );
};


export default POSInterface;
