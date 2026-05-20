import React from 'react';
import { X, Printer, Share2, CheckCircle2, ShoppingBasket } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ReceiptModalProps {
    isOpen: boolean;
    onClose: () => void;
    sale: any;
    bakeryName?: string;
    logoUrl?: string;
}

const ReceiptModal: React.FC<ReceiptModalProps> = ({ isOpen, onClose, sale, bakeryName, logoUrl }) => {
    if (!isOpen || !sale) return null;

    const handlePrint = () => {
        window.print();
    };

    const handleShare = () => {
        const text = `*${bakeryName || 'Sua Empresa'}*\nPedido #${sale.id.slice(0, 8)}\nTotal: R$ ${sale.total_amount.toFixed(2)}`;
        const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
        window.open(url, '_blank');
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in duration-300">
                <div className="p-8 text-center bg-green-50">
                    <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4 text-white shadow-lg shadow-green-500/20">
                        <CheckCircle2 size={32} />
                    </div>
                    <h2 className="text-2xl font-black text-neutral-900">Venda Sucesso!</h2>
                    <p className="text-green-700 font-medium">A transação foi concluída corretamente.</p>
                </div>

                <div className="p-8 space-y-6" id="printable-receipt">
                    {/* Visual Receipt */}
                    <div className="bg-neutral-50 p-6 rounded-2xl border border-dashed border-neutral-200 relative">
                        {/* Decorative half circles for ticket look */}
                        <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-white rounded-full border border-neutral-200"></div>
                        <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-white rounded-full border border-neutral-200"></div>

                        <div className="text-center mb-6">
                            {logoUrl && <img src={logoUrl} alt="Logo" className="h-12 mx-auto mb-2 opacity-80" />}
                            <h3 className="font-bold text-lg text-neutral-900">{bakeryName || 'Sua Empresa'}</h3>
                            <p className="text-[10px] text-neutral-400 uppercase tracking-widest">Cupom Não Fiscal</p>
                            <p className="text-[10px] text-neutral-400 mt-1">
                                {format(new Date(), "dd/MM/yyyy • HH:mm:ss")}
                            </p>
                        </div>

                        <div className="space-y-3 mb-6">
                            {sale.items?.map((item: any, idx: number) => (
                                <div key={idx} className="flex justify-between text-sm">
                                    <span className="text-neutral-600 flex-1">{item.quantity}x {item.name}</span>
                                    <span className="font-bold text-neutral-900">R$ {(item.price * item.quantity).toFixed(2)}</span>
                                </div>
                            ))}
                        </div>

                        <div className="border-t border-dashed border-neutral-200 pt-4 space-y-1">
                            <div className="flex justify-between text-xs text-neutral-500">
                                <span>Subtotal</span>
                                <span>R$ {sale.total_amount.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-lg font-black text-neutral-900 pt-2">
                                <span>TOTAL</span>
                                <span className="text-brand-primary">R$ {sale.total_amount.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-[10px] text-neutral-400 pt-2 uppercase font-bold">
                                <span>Forma de Pagto</span>
                                <span>{sale.payment_method}</span>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <button
                            onClick={handleShare}
                            className="flex items-center justify-center gap-2 py-3 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-xl font-bold transition-all text-sm"
                        >
                            <Share2 size={16} /> WhatsApp
                        </button>
                        <button
                            onClick={handlePrint}
                            className="flex items-center justify-center gap-2 py-3 bg-neutral-900 hover:bg-black text-white rounded-xl font-bold transition-all text-sm"
                        >
                            <Printer size={16} /> Imprimir
                        </button>
                    </div>

                    <button
                        onClick={onClose}
                        className="w-full py-3 border-2 border-neutral-100 hover:bg-neutral-50 text-neutral-400 hover:text-neutral-600 rounded-xl font-bold transition-all text-sm"
                    >
                        Nova Venda
                    </button>
                </div>
            </div>

            <style>{`
        @media print {
          body * { visibility: hidden; }
          #printable-receipt, #printable-receipt * { visibility: visible; }
          #printable-receipt { 
            position: absolute; 
            left: 0; 
            top: 0; 
            width: 100%; 
            padding: 20px;
            background: white !important;
            border: none !important;
          }
          button { display: none !important; }
        }
      `}</style>
        </div>
    );
};

export default ReceiptModal;
