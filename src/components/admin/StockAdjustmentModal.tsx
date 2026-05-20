import React, { useState } from 'react';
import { X, Plus, Minus, Package } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface StockAdjustmentModalProps {
    isOpen: boolean;
    onClose: () => void;
    product: any;
    onSuccess: () => void;
}

const StockAdjustmentModal: React.FC<StockAdjustmentModalProps> = ({ isOpen, onClose, product, onSuccess }) => {
    const [adjustment, setAdjustment] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!isOpen || !product) return null;

    const newStock = Math.max(0, (product.stock_quantity || 0) + adjustment);

    const handleSubmit = async () => {
        setIsSubmitting(true);
        try {
            const { error } = await supabase
                .from('products')
                .update({ stock_quantity: newStock })
                .eq('id', product.id);

            if (error) throw error;

            onSuccess();
            onClose();
            setAdjustment(0);
        } catch (error: any) {
            console.error('[StockAdjustment] Error:', error);
            alert(`Erro ao ajustar estoque: ${error?.message || 'Erro desconhecido'}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in duration-300">
                <div className="p-6 border-b border-neutral-100 flex items-center justify-between">
                    <h2 className="text-xl font-bold text-neutral-900">Ajuste Rápido de Estoque</h2>
                    <button onClick={onClose} className="p-2 hover:bg-neutral-100 rounded-full transition-all">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    <div className="text-center">
                        <div className="inline-flex items-center gap-3 px-4 py-2 bg-neutral-50 rounded-xl mb-4">
                            <Package className="text-neutral-400" size={20} />
                            <span className="font-bold text-neutral-900">{product.name}</span>
                        </div>
                        <p className="text-sm text-neutral-500">Estoque atual: <span className="font-bold text-neutral-900">{product.stock_quantity || 0}</span></p>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center justify-center gap-4">
                            <button
                                onClick={() => setAdjustment(adj => adj - 1)}
                                className="w-12 h-12 flex items-center justify-center bg-red-50 hover:bg-red-100 text-red-600 rounded-xl transition-all active:scale-95"
                            >
                                <Minus size={20} />
                            </button>

                            <div className="text-center min-w-[100px]">
                                <div className="text-3xl font-black text-neutral-900">
                                    {adjustment > 0 ? '+' : ''}{adjustment}
                                </div>
                                <div className="text-xs text-neutral-400 mt-1">Ajuste</div>
                            </div>

                            <button
                                onClick={() => setAdjustment(adj => adj + 1)}
                                className="w-12 h-12 flex items-center justify-center bg-green-50 hover:bg-green-100 text-green-600 rounded-xl transition-all active:scale-95"
                            >
                                <Plus size={20} />
                            </button>
                        </div>

                        <div className="text-center p-4 bg-brand-primary-light rounded-xl border border-brand-primary/20">
                            <p className="text-sm text-neutral-600">Novo estoque:</p>
                            <p className="text-2xl font-black text-brand-primary">{newStock}</p>
                        </div>

                        <div className="grid grid-cols-3 gap-2">
                            <button
                                onClick={() => setAdjustment(adj => adj - 10)}
                                className="px-3 py-2 bg-neutral-100 hover:bg-neutral-200 rounded-lg text-sm font-bold transition-all"
                            >
                                -10
                            </button>
                            <button
                                onClick={() => setAdjustment(0)}
                                className="px-3 py-2 bg-neutral-100 hover:bg-neutral-200 rounded-lg text-sm font-bold transition-all"
                            >
                                Reset
                            </button>
                            <button
                                onClick={() => setAdjustment(adj => adj + 10)}
                                className="px-3 py-2 bg-neutral-100 hover:bg-neutral-200 rounded-lg text-sm font-bold transition-all"
                            >
                                +10
                            </button>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <button
                            onClick={onClose}
                            className="px-6 py-2.5 rounded-xl font-bold text-neutral-600 hover:bg-neutral-100 transition-all"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={isSubmitting || adjustment === 0}
                            className="px-8 py-2.5 bg-brand-primary hover:opacity-90 text-white rounded-xl font-bold transition-all shadow-lg shadow-brand-primary/20 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? 'Salvando...' : 'Confirmar Ajuste'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StockAdjustmentModal;
