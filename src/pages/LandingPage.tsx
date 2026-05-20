import React, { useState, useEffect, useMemo } from 'react';
import {
    ShoppingCart, Menu, X, Phone, MapPin, Instagram,
    Facebook, Mail, Plus, Minus, Send, MessageCircle,
    ChevronDown, Award, Clock, Star, Trash2, Heart, Quote, ShoppingBasket, ShoppingBag, Loader2, ShieldAlert, Building2, Music, Share2, ChevronRight, FileText
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { MenuItem, CartItem, Category } from '../../types';
import * as constants from '../../constants';
import { useSettings } from '../hooks/useSettings';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useTenant } from '../context/TenantContext';
import { cn } from '../lib/utils';

const TiktokIcon = ({ size = 20 }: { size?: number }) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
    </svg>
);

const AboutSection = ({ settings }: { settings: any }) => (
    <section
        id="sobre"
        className="pt-12 pb-24 text-white overflow-hidden relative"
        style={{
            backgroundColor: settings?.about_bg_color || 'var(--sections-bg)',
            backgroundImage: settings?.about_bg_image ? `url(${settings.about_bg_image})` : 'none',
            backgroundSize: 'cover',
            backgroundPosition: 'center'
        }}
    >
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-elite-gold/5 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="container mx-auto px-6 relative z-10">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
                <motion.div
                    initial={{ opacity: 0, x: -50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    className="relative"
                >
                    <div className="absolute -top-10 -left-10 w-40 h-40 bg-elite-gold/10 rounded-full blur-3xl"></div>
                    <img
                        src={settings?.about_image_url || "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80"}
                        className="rounded-3xl shadow-2xl relative z-10 border border-white/10"
                        alt="Apresentação da Empresa"
                    />
                    <div className="absolute -bottom-6 -right-6 bg-elite-gold p-8 rounded-2xl z-20 hidden md:block shadow-xl shadow-black/20">
                        <p className="text-4xl font-display font-bold">{settings?.about_years || '12+'}</p>
                        <p className="text-[10px] uppercase tracking-widest font-bold">{settings?.about_years_label || 'Anos de Tradição'}</p>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, x: 50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    className="space-y-8"
                >
                    <h2 className="font-display text-4xl md:text-5xl font-bold">
                        {settings?.about_title || 'A Excelência da Panificação'}
                    </h2>
                    <p className="text-white/70 leading-relaxed text-lg">
                        {settings?.about_description || `Somos apaixonados por oferecer qualidade premium em cada detalhe. Nossa missão é criar memórias através do sabor, oferecendo produtos frescos e selecionados para garantir a melhor experiência para você.`}
                    </p>

                    <div className="grid sm:grid-cols-2 gap-6">
                        {[
                            { icon: <Award className="text-elite-gold" />, title: settings?.about_f1_title || "Qualidade Premium", desc: settings?.about_f1_desc || "Ingredientes selecionados e frescos." },
                            { icon: <Clock className="text-elite-gold" />, title: settings?.about_f2_title || "Sempre Fresco", desc: settings?.about_f2_desc || "Produção diária com carinho." },
                            { icon: <Star className="text-elite-gold" />, title: settings?.about_f3_title || "Experiência Única", desc: settings?.about_f3_desc || "Referência em atendimento e qualidade." },
                            { icon: <Phone className="text-elite-gold" />, title: settings?.about_f4_title || "Atendimento", desc: settings?.about_f4_desc || "Suporte total via WhatsApp." },
                        ].map((item, i) => (
                            <div key={i} className="flex gap-4 p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                                <div className="shrink-0">{item.icon}</div>
                                <div>
                                    <h4 className="font-bold text-sm text-elite-gold">{item.title}</h4>
                                    <p className="text-xs text-white/50">{item.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>
        </div>
    </section>
);

const CatalogSection = ({ settings, categories, activeCategory, setActiveCategory, filteredItems, getItemQuantity, updateCartQuantity }: any) => (
    <section
        id="catalogo"
        className="py-32 bg-slate-50 wheat-pattern relative"
        style={{
            backgroundColor: settings?.catalog_bg_color || '#f8fafc',
            backgroundImage: settings?.catalog_bg_image ? `url(${settings.catalog_bg_image})` : undefined,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
        }}
    >
        <div className="container mx-auto px-6 relative z-10">
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-center mb-20"
            >
                <span className="font-bold tracking-[0.3em] uppercase text-xs" style={{ color: 'var(--elite-gold)' }}>
                    {settings?.catalog_tagline || 'Menu de Experiências'}
                </span>
                <h2 className="font-display text-4xl md:text-6xl font-bold mt-4 text-[var(--elite-contrast)]">
                    {settings?.catalog_title || `Catálogo ${settings?.bakery_name && typeof settings.bakery_name === 'string' ? settings.bakery_name.split(' ').pop() : 'Completo'}`}
                </h2>
                <div className="h-1 w-24 mx-auto mt-6 rounded-full" style={{ backgroundColor: 'var(--elite-gold)' }}></div>
                <p className="text-slate-500 max-w-2xl mx-auto mt-8 text-lg">
                    {settings?.catalog_description || 'Selecione seus itens favoritos abaixo. Montamos seu orçamento em tempo real para envio direto ao nosso WhatsApp.'}
                </p>
            </motion.div>

            {/* Filtros de Categoria */}
            {settings?.show_categories && (
                <div className="flex flex-wrap justify-center gap-3 mb-16 px-4">
                    {categories.map((cat: string) => (
                        <button
                            key={cat}
                            onClick={() => setActiveCategory(cat)}
                            className={`px-6 py-3 rounded-full text-xs font-bold uppercase tracking-widest transition-all duration-300 border ${activeCategory === cat
                                ? 'bg-[var(--elite-contrast)] text-white border-[var(--elite-contrast)] shadow-xl shadow-[var(--elite-contrast)]/20 scale-105'
                                : 'bg-white text-slate-400 border-slate-200 hover:border-[var(--elite-contrast)] hover:text-[var(--elite-contrast)]'
                                }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            )}


            {/* Grid de Produtos Premium */}
            <motion.div
                layout
                className={cn(
                    "grid gap-8",
                    (!settings?.catalog_card_size || settings.catalog_card_size === 'large') && "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
                    settings?.catalog_card_size === 'medium' && "grid-cols-2 md:grid-cols-3 lg:grid-cols-4",
                    settings?.catalog_card_size === 'small' && "grid-cols-2 md:grid-cols-4 lg:grid-cols-5",
                    settings?.catalog_card_size === 'mini' && "grid-cols-2 md:grid-cols-5 lg:grid-cols-6",
                )}
            >
                <AnimatePresence mode="popLayout">
                    {filteredItems.map((item: any) => {
                        const qty = getItemQuantity(item.id);
                        return (
                            <motion.div
                                layout
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ duration: 0.3 }}
                                key={item.id}
                                className="menu-card bg-white p-5 rounded-3xl border border-slate-100 flex flex-col group hover:border-[var(--elite-contrast)]/10 transition-colors"
                            >
                                <div className="relative w-full aspect-square rounded-2xl overflow-hidden mb-6 bg-slate-100 flex items-center justify-center">
                                    {(item.image_url || item.image) ? (
                                        <img
                                            src={item.image_url || item.image}
                                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                            alt={item.name}
                                            loading="lazy"
                                        />
                                    ) : (
                                        <ShoppingBasket size={48} className="text-slate-200" />
                                    )}
                                    <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-md px-4 py-2 rounded-full shadow-lg border border-slate-100">
                                        <span className="text-[var(--elite-contrast)] font-black text-sm">R$ {item.price.toFixed(2)}</span>
                                        <span className="text-slate-400 text-[10px] ml-1">{item.unit}</span>
                                    </div>
                                </div>

                                <div className="flex-1 flex flex-col">
                                    <h3 className="font-display text-xl font-bold text-[var(--elite-contrast)] mb-2">{item.name}</h3>
                                    <p className="text-sm text-slate-400 mb-6 leading-relaxed flex-1">{item.description}</p>

                                    <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                                        <div className="flex items-center gap-4 bg-slate-50 p-1.5 rounded-2xl border border-slate-100">
                                            <button
                                                onClick={() => updateCartQuantity(item, -1)}
                                                className="w-10 h-10 flex items-center justify-center hover:bg-white rounded-xl transition-all text-slate-400 hover:text-red-500 shadow-sm hover:shadow"
                                            >
                                                <Minus size={18} />
                                            </button>
                                            <span className="font-bold text-lg min-w-[30px] text-center text-[var(--elite-contrast)]">{qty}</span>
                                            <button
                                                onClick={() => updateCartQuantity(item, 1)}
                                                className="w-10 h-10 flex items-center justify-center hover:bg-white rounded-xl transition-all shadow-sm hover:shadow"
                                                style={{ color: 'var(--elite-gold)' }}
                                            >
                                                <Plus size={18} />
                                            </button>
                                        </div>

                                        {qty === 0 ? (
                                            <button
                                                onClick={() => updateCartQuantity(item, 1)}
                                                className="bg-[var(--elite-contrast)] text-white p-3.5 rounded-2xl hover:bg-elite-gold transition-colors shadow-lg shadow-[var(--elite-contrast)]/10 group-hover:scale-105 active:scale-95"
                                            >
                                                <ShoppingCart size={20} />
                                            </button>
                                        ) : (
                                            <div className="text-right">
                                                <p className="text-[10px] text-slate-400 uppercase font-bold">Subtotal</p>
                                                <p className="font-black" style={{ color: 'var(--elite-gold)' }}>R$ {(item.price * qty).toFixed(2)}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
            </motion.div>
        </div>
    </section>
);

const LandingPage: React.FC = () => {
    const [activeCategory, setActiveCategory] = useState<Category>('');
    const [cart, setCart] = useState<CartItem[]>([]);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const [customerName, setCustomerName] = useState('');
    const [customerPhone, setCustomerPhone] = useState('');
    const [customerAddress, setCustomerAddress] = useState('');
    const [observation, setObservation] = useState('');
    const [paymentMethod, setPaymentMethod] = useState<'pix' | 'cartao' | 'dinheiro' | ''>('');
    const [deliveryMethod, setDeliveryMethod] = useState<'entrega' | 'retirada'>('entrega');
    const [checkoutStep, setCheckoutStep] = useState<1 | 2 | 3>(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { tenant, isLoading: tenantLoading } = useTenant();
    const { data: settings } = useSettings();

    const { data: products, isLoading: productsLoading, error: productsError } = useQuery({
        queryKey: ['landing-products', tenant?.id],
        enabled: !!tenant?.id,
        retry: 1,
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

    const categories = useMemo(() => {
        const dbProducts = products || [];
        const staticProducts = constants.MENU_ITEMS || [];
        const allProducts = dbProducts.length > 0 ? dbProducts : staticProducts;

        const cats = Array.from(new Set(allProducts.map(p => p.category))).filter(Boolean);
        return cats.sort();
    }, [products]);

    useEffect(() => {
        if (categories.length > 0 && !activeCategory) {
            setActiveCategory(categories[0] as Category);
        } else if (categories.length > 0 && !categories.includes(activeCategory as string)) {
            setActiveCategory(categories[0] as Category);
        }
    }, [categories]);

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 50);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const updateCartQuantity = (product: MenuItem, delta: number) => {
        setCart(prev => {
            const existing = prev.find(item => item.id === product.id);
            if (existing) {
                const newQty = existing.quantity + delta;
                if (newQty <= 0) return prev.filter(item => item.id !== product.id);

                // Track AddToCart only when increasing
                if (delta > 0) {
                    if ((window as any).fbq) {
                        (window as any).fbq('track', 'AddToCart', {
                            content_name: product.name,
                            content_ids: [product.id],
                            content_type: 'product',
                            value: product.price,
                            currency: 'BRL'
                        });
                    }
                    if ((window as any).gtag) {
                        (window as any).gtag('event', 'add_to_cart', {
                            currency: 'BRL',
                            value: product.price,
                            items: [{
                                item_id: product.id,
                                item_name: product.name,
                                price: product.price,
                                quantity: 1
                            }]
                        });
                    }
                }

                return prev.map(item => item.id === product.id ? { ...item, quantity: newQty } : item);
            }
            if (delta > 0) {
                // Track AddToCart for new item
                if ((window as any).fbq) {
                    (window as any).fbq('track', 'AddToCart', {
                        content_name: product.name,
                        content_ids: [product.id],
                        content_type: 'product',
                        value: product.price,
                        currency: 'BRL'
                    });
                }
                return [...prev, { ...product, quantity: delta }];
            }
            return prev;
        });
    };

    const removeFromCart = (id: string) => {
        setCart(prev => prev.filter(item => item.id !== id));
    };

    const getItemQuantity = (id: string) => {
        return cart.find(item => item.id === id)?.quantity || 0;
    };

    const cartTotal = useMemo(() => cart.reduce((acc, item) => acc + (item.price * item.quantity), 0), [cart]);
    const cartCount = useMemo(() => cart.reduce((acc, item) => acc + item.quantity, 0), [cart]);

    const handleCheckout = async () => {
        if (checkoutStep < 3) {
            setCheckoutStep((prev: any) => prev + 1);
            return;
        }

        if (!customerName || !customerPhone || (deliveryMethod === 'entrega' && !customerAddress) || !paymentMethod) return;

        setIsSubmitting(true);
        try {
            const deliveryFee = Number(settings?.default_delivery_fee || 0);
            const totalWithDelivery = cartTotal + deliveryFee;

            // 1. Save/Update Client
            const { data: clientData, error: clientError } = await supabase
                .from('clients')
                .upsert({
                    tenant_id: tenant?.id,
                    name: customerName,
                    phone: customerPhone,
                    address: customerAddress
                }, { onConflict: 'tenant_id,phone' })
                .select()
                .single();

            if (clientError) throw clientError;

            // 2. Save Sale
            const { data: saleData, error: saleError } = await supabase
                .from('sales')
                .insert({
                    tenant_id: tenant?.id,
                    client_id: clientData.id,
                    total_amount: totalWithDelivery,
                    total: totalWithDelivery, // Support for legacy column
                    payment_method: paymentMethod,
                    delivery_method: deliveryMethod,
                    delivery_fee: deliveryMethod === 'entrega' ? deliveryFee : 0,
                    observation: observation,
                    status: 'waiting_payment',
                    created_at: new Date().toISOString()
                })
                .select()
                .single();

            if (saleError) throw saleError;

            // 3. Save Sale Items
            const saleItems = cart.map(item => ({
                sale_id: saleData.id,
                product_id: item.id,
                quantity: item.quantity,
                unit_price: item.price,
                total_price: item.price * item.quantity,
                subtotal: item.price * item.quantity, // Support for legacy column
                tenant_id: tenant?.id
            }));

            const { error: itemsError } = await supabase
                .from('sale_items')
                .insert(saleItems);

            if (itemsError) throw itemsError;

            // 4. Construct WhatsApp Message
            let message = `🛒 *PEDIDO #${saleData.display_id || 'NOVO'} - ${settings?.bakery_name?.toUpperCase() || 'LOJA'}* 🛒\n`;
            message += `──────────────────────\n\n`;

            cart.forEach(item => {
                const itemSubtotal = (item.price * item.quantity).toFixed(2);
                message += `📦 *${item.quantity}x ${item.name}*\n`;
                message += `   └ R$ ${item.price.toFixed(2)} ${item.unit} = *R$ ${itemSubtotal}*\n\n`;
            });

            message += `──────────────────────\n`;
            message += `💰 *PRODUTOS: R$ ${cartTotal.toFixed(2)}*\n`;
            if (deliveryFee > 0) {
                message += `🚚 *ENTREGA: R$ ${deliveryFee.toFixed(2)}*\n`;
            }
            message += `⭐ *TOTAL: R$ ${totalWithDelivery.toFixed(2)}*\n\n`;

            message += `👤 *CLIENTE:* ${customerName}\n`;
            message += `📞 *TELEFONE:* ${customerPhone}\n`;
            message += `📍 *ENTREGA/RETIRADA:* ${deliveryMethod === 'entrega' ? 'ENTREGA À DOMICÍLIO' : 'RETIRADA NO LOCAL'}\n`;
            if (deliveryMethod === 'entrega') {
                message += `🏠 *ENDEREÇO:* ${customerAddress}\n`;
            }
            message += `💳 *PAGAMENTO:* ${paymentMethod === 'pix' ? 'PIX' :
                paymentMethod === 'cartao' ? 'Cartão' : 'Dinheiro'
                }\n`;

            if (observation) {
                message += `📝 *OBSERVAÇÃO:* ${observation}\n`;
            }

            if (paymentMethod === 'pix' && settings?.pix_key) {
                message += `🔑 *CHAVE PIX:* ${settings.pix_key}\n`;
            }

            message += `\n💬 _${settings?.whatsapp_checkout_message || 'Vim pelo site e gostaria de confirmar meu pedido!'} _`;

            const url = `https://wa.me/${settings?.whatsapp_number}?text=${encodeURIComponent(message)}`;
            window.open(url, '_blank');

            // Success: Clean cart and reset
            setCart([]);
            setIsCartOpen(false);
            setCheckoutStep(1);
            setCustomerName('');
            setCustomerPhone('');
            setCustomerAddress('');
            setObservation('');
            setPaymentMethod('');
        } catch (err: any) {
            console.error('Error during checkout:', err);
            // More specific error for the user to understand if it's a DB issue
            const errorMessage = err.message || 'Erro desconhecido';
            alert(`Ocorreu um erro ao processar seu pedido: ${errorMessage}. Verifique se as migrações SQL foram aplicadas.`);
        } finally {
            setIsSubmitting(false);
        }
    };

    // Style Engine: Inject CSS Variables for dynamic branding
    // Helper to determine if a color is light or dark
    const isLightColor = (hex: string) => {
        if (!hex || hex.length < 6) return false;
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        const luma = 0.2126 * r + 0.7152 * g + 0.0722 * b; // ITU-R BT.709
        return luma > 160;
    };

    // Helper to lighten a color
    const lightenColor = (hex: string, percent: number): string => {
        if (!hex || hex.length < 6) return hex;
        const num = parseInt(hex.replace('#', ''), 16);
        const amt = Math.round(2.55 * percent);
        const R = Math.min(255, (num >> 16) + amt);
        const G = Math.min(255, ((num >> 8) & 0x00FF) + amt);
        const B = Math.min(255, (num & 0x0000FF) + amt);
        return `#${(0x1000000 + (R * 0x10000) + (G * 0x100) + B).toString(16).slice(1)}`;
    };

    // Helper to darken a color
    const darkenColor = (hex: string, percent: number): string => {
        if (!hex || hex.length < 6) return hex;
        const num = parseInt(hex.replace('#', ''), 16);
        const amt = Math.round(2.55 * percent);
        const R = Math.max(0, (num >> 16) - amt);
        const G = Math.max(0, ((num >> 8) & 0x00FF) - amt);
        const B = Math.max(0, (num & 0x0000FF) - amt);
        return `#${(0x1000000 + (R * 0x10000) + (G * 0x100) + B).toString(16).slice(1)}`;
    };

    const brandStyles = useMemo(() => {
        const primary = settings?.brand_primary_color || '#F59E0B';
        const secondary = settings?.brand_secondary_color || '#10B981';
        const headerBg = settings?.header_bg_color || '#001b44';
        const footerBg = settings?.footer_bg_color || '#001b44';
        const sectionsBg = settings?.sections_bg_color || '#001b44';
        const contrast = settings?.brand_contrast_color || '#001b44';

        // Calculate color variations
        const primaryLight = lightenColor(primary, 20);
        const primaryDark = darkenColor(primary, 20);

        // Dynamic button text color (fix for white buttons)
        const btnTextColor = isLightColor(primary) ? contrast : '#ffffff';

        return `
            :root {
                --elite-gold: ${primary} !important;
                --elite-gold-light: ${primaryLight} !important;
                --elite-gold-dark: ${primaryDark} !important;
                --secondary-color: ${secondary} !important;
                --header-bg: ${headerBg} !important;
                --footer-bg: ${footerBg} !important;
                --sections-bg: ${sectionsBg} !important;
                --elite-contrast: ${contrast} !important;
                --elite-navy: ${contrast} !important;
                --primary-btn-text: ${btnTextColor} !important;
            }
            .selection\\:bg-elite-gold { background-color: ${primary} !important; }
            .bg-elite-gold { 
                background-color: ${primary} !important;
                color: ${btnTextColor} !important; 
            }
            .text-elite-gold { color: ${primary} !important; }
            .border-elite-gold { border-color: ${primary} !important; }
            .btn-gold-shine::after { background: linear-gradient(to right, transparent, rgba(255,255,255,0.3), transparent) !important; }
            .custom-scrollbar::-webkit-scrollbar { width: 4px; }
            .custom-scrollbar::-webkit-scrollbar-track { background: rgba(0,0,0,0.05); }
            .custom-scrollbar::-webkit-scrollbar-thumb { background: ${primary}; border-radius: 10px; }
            ::-webkit-scrollbar { width: 8px; }
            ::-webkit-scrollbar-track { background: #f1f1f1; }
            ::-webkit-scrollbar-thumb { background: ${primary}; border-radius: 10px; }
        `;
    }, [settings]);

    // Analytics Injection logic
    useEffect(() => {
        if (!settings) return;

        // Meta Pixel
        if (settings.meta_pixel_id) {
            const fbScript = document.createElement('script');
            fbScript.innerHTML = `
                !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
                n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
                n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
                t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,
                document,'script','https://connect.facebook.net/en_US/fbevents.js');
                fbq('init', '${settings.meta_pixel_id}');
                fbq('track', 'PageView');
            `;
            document.head.appendChild(fbScript);
        }

        // TikTok Pixel
        if (settings.tiktok_pixel_id) {
            const tiktokScript = document.createElement('script');
            tiktokScript.innerHTML = `
                !function (w, d, t) {
                    w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie"],ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e},ttq.load=function(e,n){var i="https://analytics.tiktok.com/i18n/pixel/events.js";ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=i,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};var o=document.createElement("script");o.type="text/javascript",o.async=!0,o.src=i+"?sdkid="+e+"&lib="+t;var a=document.getElementsByTagName("script")[0];a.parentNode.insertBefore(o,a)};
                    ttq.load('${settings.tiktok_pixel_id}');
                    ttq.page();
                }(window, document, 'ttq');
            `;
            document.head.appendChild(tiktokScript);
        }

        // Google Analytics (GA4)
        if (settings.google_analytics_id) {
            const gaScript = document.createElement('script');
            gaScript.async = true;
            gaScript.src = `https://www.googletagmanager.com/gtag/js?id=${settings.google_analytics_id}`;
            document.head.appendChild(gaScript);

            const gaInit = document.createElement('script');
            gaInit.innerHTML = `
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${settings.google_analytics_id}');
            `;
            document.head.appendChild(gaInit);
        }

        // Google Tag Manager (GTM)
        if (settings.google_tag_manager_id) {
            const gtmScript = document.createElement('script');
            gtmScript.innerHTML = `
                (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
                new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
                j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
                'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
                })(window,document,'script','dataLayer','${settings.google_tag_manager_id}');
            `;
            document.head.appendChild(gtmScript);
        }

        // --- DYNAMIC SEO & FAVICON ---
        // Prioritize settings.seo_title, then bakery_name, then default.
        const title = settings.seo_title || settings.bakery_name || 'Clique PDV';
        const description = settings.seo_description || settings.hero_subtitle || 'O melhor em qualidade e atendimento para você.';
        const keywords = settings.seo_keywords || 'padaria, pão quente, encomendas';

        document.title = title;

        // Meta Description
        let metaDesc = document.querySelector('meta[name="description"]');
        if (!metaDesc) {
            metaDesc = document.createElement('meta');
            metaDesc.setAttribute('name', 'description');
            document.head.appendChild(metaDesc);
        }
        metaDesc.setAttribute('content', description);

        // Meta Keywords
        let metaKeywords = document.querySelector('meta[name="keywords"]');
        if (!metaKeywords) {
            metaKeywords = document.createElement('meta');
            metaKeywords.setAttribute('name', 'keywords');
            document.head.appendChild(metaKeywords);
        }
        metaKeywords.setAttribute('content', keywords);

        // Favicon (Transparent Logo)
        if (settings.logo_url) {
            let favicon = document.querySelector('link[rel="icon"]') as HTMLLinkElement;
            if (!favicon) {
                favicon = document.createElement('link');
                favicon.rel = 'icon';
                document.head.appendChild(favicon);
            }
            favicon.href = settings.logo_url;

            // Also update apple-touch-icon
            let appleIcon = document.querySelector('link[rel="apple-touch-icon"]') as HTMLLinkElement;
            if (!appleIcon) {
                appleIcon = document.createElement('link');
                appleIcon.rel = 'apple-touch-icon';
                document.head.appendChild(appleIcon);
            }
            appleIcon.href = settings.logo_url;
        }
    }, [settings]);

    useEffect(() => {
        // Update page title
        if (settings?.seo_title) {
            document.title = settings.seo_title;
        } else if (settings?.bakery_name) {
            document.title = settings.bakery_name;
        }

        // Update favicon
        if (settings?.favicon_url) {
            let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
            if (!link) {
                link = document.createElement('link');
                link.rel = 'icon';
                document.getElementsByTagName('head')[0].appendChild(link);
            }
            link.href = settings.favicon_url;
        }
    }, [settings?.seo_title, settings?.bakery_name, settings?.favicon_url]);

    const [showSafeLoad, setShowSafeLoad] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setShowSafeLoad(true), 5000);
        return () => clearTimeout(timer);
    }, [tenantLoading]);

    const filteredItems = useMemo(() => {
        const dbProducts = products || [];
        const staticProducts = constants.MENU_ITEMS || [];
        const sourceProducts = dbProducts.length > 0 ? dbProducts : staticProducts;

        return sourceProducts.filter(item => item.category === activeCategory) || [];
    }, [products, activeCategory]);

    if (tenantLoading || (productsLoading && !!tenant)) {
        return (
            <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center p-6 text-center gap-8">
                {settings?.logo_url ? (
                    <img src={settings.logo_url} className="h-16 animate-pulse" alt="Carregando..." />
                ) : (
                    <div className="w-16 h-16 bg-elite-gold rounded-xl animate-pulse flex items-center justify-center text-white font-black text-2xl">
                        {(settings?.bakery_name || "L")[0].toUpperCase()}
                    </div>
                )}
                <div className="flex flex-col items-center gap-4">
                    <div className="flex items-center gap-3 text-elite-gold">
                        <Loader2 className="animate-spin" size={24} />
                        <span className="font-bold uppercase tracking-[4px] text-xs">Aguarde, Carregando Loja...</span>
                    </div>
                    {showSafeLoad && (
                        <div className="flex flex-col items-center gap-2">
                            <button
                                onClick={() => window.location.reload()}
                                className="text-[10px] text-white/30 hover:text-white uppercase tracking-widest transition-colors py-2 px-4 border border-white/10 rounded-full"
                            >
                                Demorando demais? Clique para recarregar
                            </button>
                            <button
                                onClick={() => window.location.href = '/login'}
                                className="text-[10px] text-elite-gold hover:text-elite-gold-dark uppercase tracking-widest transition-colors"
                            >
                                Ir para o Painel Administrativo
                            </button>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    if (productsError) {
        return (
            <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center text-white p-6 text-center">
                <ShieldAlert className="text-amber-500 mb-6" size={64} />
                <h1 className="text-4xl font-bold mb-4 uppercase tracking-tighter italic">Erro de Conexão</h1>
                <p className="text-white/60 mb-8 max-w-md">Não foi possível carregar os produtos. Verifique sua conexão ou tente novamente.</p>
                <button onClick={() => window.location.reload()} className="bg-amber-600 text-white px-8 py-4 rounded-full font-bold uppercase tracking-widest">
                    Recarregar Página
                </button>
            </div>
        );
    }

    if (!tenant && !tenantLoading) {
        return (
            <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center text-white p-6 text-center">
                <Building2 className="text-amber-500 mb-6" size={64} />
                <h1 className="text-4xl font-bold mb-4 uppercase tracking-tighter italic">Loja não encontrada</h1>
                <p className="text-white/60 mb-8 max-w-md">O endereço que você acessou não corresponde a nenhuma loja ativa no momento.</p>
                <div className="flex gap-4">
                    <button
                        onClick={() => window.location.href = '/login'}
                        className="bg-elite-gold text-white px-8 py-4 rounded-full font-bold uppercase tracking-widest hover:scale-105 transition-transform"
                    >
                        Acessar Painel
                    </button>
                    <button
                        onClick={() => window.location.href = '/'}
                        className="bg-white/10 text-white px-8 py-4 rounded-full font-bold uppercase tracking-widest hover:bg-white/20 transition-all"
                    >
                        Voltar ao Início
                    </button>
                </div>
            </div>
        );
    }

    if (tenant?.status === 'suspended') {
        return (
            <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center text-white p-6 text-center">
                <ShieldAlert className="text-red-500 mb-6" size={64} />
                <h1 className="text-4xl font-bold mb-4 uppercase tracking-tighter italic">Serviço Suspenso</h1>
                <p className="text-white/60 mb-8 max-w-md">Esta loja está temporariamente indisponível. Por favor, tente novamente mais tarde ou entre em contato com o suporte.</p>
                <div className="text-[10px] text-neutral-600 uppercase tracking-widest border-t border-neutral-900 pt-8 font-bold">
                    Plataforma por Clique PDV
                </div>
            </div>
        );
    }

    if (settings?.layout_mode === 'maintenance') {
        return (
            <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center text-white p-6 text-center">
                <div className="w-20 h-20 bg-amber-500 rounded-2xl flex items-center justify-center text-neutral-900 font-black text-4xl shadow-2xl mb-8 animate-pulse">
                    <Loader2 size={40} className="animate-spin" />
                </div>
                <h1 className="text-4xl font-bold mb-4 uppercase tracking-tighter italic">
                    {settings?.maintenance_title || 'Em Manutenção'}
                </h1>
                <p className="text-white/60 mb-8 max-w-md">
                    {settings?.maintenance_message || 'Estamos realizando melhorias em nossa loja. Voltaremos em breve!'}
                </p>
                <div className="flex gap-4">
                    {/* Phone button removed as requested */}
                    {(settings?.maintenance_whatsapp || settings?.whatsapp_number) && (
                        <a href={`https://wa.me/${settings?.maintenance_whatsapp || settings?.whatsapp_number}`} target="_blank" className="text-amber-500 font-bold uppercase text-xs tracking-widest border border-amber-500/30 px-6 py-3 rounded-full hover:bg-amber-500 hover:text-black transition-all flex items-center gap-2">
                            <MessageCircle size={18} /> WhatsApp
                        </a>
                    )}
                </div>
                <button onClick={() => window.location.href = '/login'} className="fixed bottom-6 right-6 text-white/10 hover:text-white/50 transition-colors">
                    <Building2 size={24} />
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white selection:bg-elite-gold selection:text-white">
            <style dangerouslySetInnerHTML={{ __html: brandStyles }} />
            {/* Header Premium */}
            <header
                className={`fixed top-0 left-0 right-0 z-[60] transition-all duration-500 ${isScrolled ? 'py-3 shadow-xl' : 'bg-transparent py-6'}`}
                style={{ backgroundColor: isScrolled ? 'var(--header-bg)' : 'transparent', backdropFilter: isScrolled ? 'blur(12px)' : 'none' }}
            >
                <div className="container mx-auto px-6 flex items-center justify-between">
                    <a href="#inicio" className="transition-transform duration-300 hover:scale-105 flex items-center gap-2">
                        {settings?.logo_url ? (
                            <img src={settings.logo_url} alt={settings?.bakery_name || "Sua Loja"} className="h-10 md:h-14 w-auto" />
                        ) : (
                            <div className="flex items-center gap-2">
                                <div className="w-10 h-10 bg-elite-gold rounded-lg flex items-center justify-center text-white font-black text-xl shadow-lg">
                                    {(settings?.bakery_name || "S")[0].toUpperCase()}
                                </div>
                                <span className="text-white font-display font-bold text-lg md:text-xl tracking-tight leading-none uppercase">
                                    {settings?.bakery_name?.split(' ')[0] || "Sua Loja"}
                                </span>
                            </div>
                        )}
                    </a>


                    <nav className="hidden lg:flex items-center gap-10">
                        {[
                            { label: settings?.nav_home_label || 'Início', id: 'inicio' },
                            { label: settings?.nav_about_label || 'Sobre', id: 'sobre' },
                            { label: settings?.hero_button_text || 'Catálogo', id: 'catalogo' },
                            { label: settings?.nav_contact_label || 'Contato', id: 'contato' }
                        ].filter(item => !(item.id === 'sobre' && settings?.show_about === false)).map((item) => (
                            <a
                                key={item.id}
                                href={`#${item.id}`}
                                onClick={(e) => {
                                    e.preventDefault();
                                    const element = document.getElementById(item.id);
                                    if (element) {
                                        const offset = 100; // Height of fixed header
                                        const elementPosition = element.getBoundingClientRect().top;
                                        const offsetPosition = elementPosition + window.pageYOffset - offset;
                                        window.scrollTo({
                                            top: offsetPosition,
                                            behavior: "smooth"
                                        });
                                    }
                                }}
                                className="text-white text-[13px] font-bold uppercase tracking-[3px] hover:text-elite-gold transition-colors relative group cursor-pointer"
                            >
                                {item.label}
                                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-elite-gold transition-all duration-300 group-hover:w-full"></span>
                            </a>
                        ))}
                    </nav>

                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setIsCartOpen(true)}
                            className={cn(
                                "relative p-3 text-white hover:text-elite-gold transition-colors bg-white/5 rounded-full",
                                !settings?.show_cart && "hidden"
                            )}
                        >
                            <ShoppingCart size={22} />
                            {cartCount > 0 && (
                                <span className="absolute top-0 right-0 bg-elite-gold text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-[var(--elite-contrast)] animate-pulse">
                                    {cartCount}
                                </span>
                            )}
                        </button>
                        <button
                            onClick={cartCount > 0 ? () => setIsCartOpen(true) : () => window.open(`https://wa.me/${settings?.whatsapp_number || '5516981746181'}?text=${encodeURIComponent(settings?.whatsapp_contact_message || 'Olá! Vim pelo site e gostaria de mais informações.')}`, '_blank')}
                            className={cn(
                                "hidden md:flex items-center gap-2 bg-elite-gold hover:bg-elite-gold-dark text-white px-6 py-2.5 rounded-full font-bold text-xs uppercase tracking-widest transition-all btn-gold-shine shadow-lg shadow-elite-gold/20",
                                !settings?.show_cart && cartCount === 0 && "hidden"
                            )}
                        >
                            {cartCount > 0 ? <><Send size={16} /> {settings?.nav_checkout_label || 'Finalizar Pedido'}</> : <><MessageCircle size={16} /> {settings?.nav_order_label || 'Encomendar'}</>}
                        </button>
                        <button className="lg:hidden text-white p-2 hover:bg-white/10 rounded-full transition-colors" onClick={() => setIsMobileMenuOpen(true)}>
                            <Menu size={28} />
                        </button>
                    </div>
                </div>

                {/* Mobile Menu Overlay */}
                <AnimatePresence>
                    {isMobileMenuOpen && (
                        <>
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="fixed inset-0 bg-[var(--elite-contrast)]/90 backdrop-blur-xl z-[70] lg:hidden"
                            />
                            <motion.div
                                initial={{ x: '100%' }}
                                animate={{ x: 0 }}
                                exit={{ x: '100%' }}
                                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                                className="fixed top-0 right-0 bottom-0 w-[80%] max-w-sm bg-[var(--elite-contrast)] z-[80] lg:hidden p-10 flex flex-col shadow-2xl border-l border-white/5"
                            >
                                <div className="flex justify-between items-center mb-16">
                                    <img src={settings?.logo_url || "/logo.png"} className="h-10" alt="Logo" />
                                    <button
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className="w-10 h-10 flex items-center justify-center bg-white/5 rounded-full text-white hover:bg-white/10 transition-colors"
                                    >
                                        <X size={20} />
                                    </button>
                                </div>

                                <nav className="flex flex-col gap-8">
                                    {[
                                        { label: settings?.nav_home_label || 'Início', id: 'inicio' },
                                        { label: settings?.nav_about_label || 'Sobre', id: 'sobre' },
                                        { label: settings?.hero_button_text || 'Catálogo', id: 'catalogo' },
                                        { label: settings?.nav_contact_label || 'Contato', id: 'contato' }
                                    ].filter(item => !(item.id === 'sobre' && settings?.show_about === false)).map((item, i) => (
                                        <motion.a
                                            key={item.id}
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.1 + (i * 0.1) }}
                                            href={`#${item.id}`}
                                            onClick={() => {
                                                setIsMobileMenuOpen(false);
                                            }}
                                            className="text-white text-2xl font-bold uppercase tracking-widest hover:text-elite-gold transition-colors flex items-center justify-between group"
                                        >
                                            {item.label}
                                            <div className="w-8 h-[1px] bg-elite-gold/30 group-hover:w-12 transition-all"></div>
                                        </motion.a>
                                    ))}
                                </nav>

                                <div className="mt-auto space-y-8">
                                    <div className="h-px bg-white/5 w-full"></div>
                                    <div className="space-y-4">
                                        <p className="text-elite-gold font-bold uppercase tracking-widest text-[10px]">Atendimento</p>
                                        <p className="text-white text-sm font-medium">{settings?.contact_phone}</p>
                                        <p className="text-white/40 text-xs">Aberto todos os dias</p>
                                    </div>
                                    <button
                                        onClick={() => {
                                            setIsMobileMenuOpen(false);
                                            window.open(`https://wa.me/${settings?.whatsapp_number}`, '_blank');
                                        }}
                                        className="w-full bg-elite-gold text-white py-5 rounded-2xl font-black text-xs uppercase tracking-widest btn-gold-shine shadow-xl shadow-elite-gold/20 flex items-center justify-center gap-3"
                                    >
                                        Falar Conosco <MessageCircle size={18} />
                                    </button>
                                </div>
                            </motion.div>
                        </>
                    )}
                </AnimatePresence>
            </header>

            {/* Hero Section Impactante */}
            <section id="inicio" className="relative min-h-[80vh] flex items-center justify-center text-center overflow-hidden pt-32 pb-12">
                <div className="absolute inset-0" style={{ backgroundColor: 'var(--sections-bg)' }}>
                    {settings?.hero_image_url ? (
                        <>
                            <img
                                src={settings.hero_image_url}
                                className="w-full h-full object-cover"
                                alt={settings?.bakery_name || "Hero Background"}
                            />
                            <div
                                className="absolute inset-0 transition-colors duration-700"
                                style={{ background: `linear-gradient(to bottom, var(--sections-bg), rgba(0,0,0,0.4) 50%, var(--sections-bg) 95%)`, opacity: 0.85 }}
                            ></div>
                        </>
                    ) : (
                        <div className="absolute inset-0 wheat-pattern opacity-10"></div>
                    )}
                </div>

                <div className="container relative z-10 px-6">
                    <div className="max-w-4xl mx-auto flex flex-col items-center">
                        {settings?.logo_url ? (
                            <img
                                src={settings.logo_url}
                                className="w-28 md:w-40 lg:w-48 mb-8 animate-slide-up opacity-0"
                                style={{ animationDelay: '0.2s' }}
                                alt={settings?.bakery_name || "Logo"}
                            />
                        ) : (
                            <div className="mb-8 animate-slide-up opacity-0 flex flex-col items-center gap-4" style={{ animationDelay: '0.2s' }}>
                                <div className="w-20 h-20 bg-elite-gold rounded-2xl flex items-center justify-center text-white font-black text-4xl shadow-2xl rotate-3">
                                    {(settings?.bakery_name || "S")[0].toUpperCase()}
                                </div>
                                <div className="h-px w-20 bg-gradient-to-r from-transparent via-elite-gold to-transparent"></div>
                            </div>
                        )}
                        <p className="text-elite-gold font-bold tracking-[0.5em] uppercase text-[10px] md:text-sm mb-6 animate-slide-up opacity-0" style={{ animationDelay: '0.4s' }}>
                            {settings?.hero_tagline || `${settings?.bakery_name || "Sua Empresa"} • Experiência Premium`}
                        </p>
                        <h1 className="font-display text-4xl md:text-6xl lg:text-8xl text-white font-bold mb-8 leading-[1.1] animate-slide-up opacity-0" style={{ animationDelay: '0.6s' }}>
                            {settings?.hero_title && typeof settings.hero_title === 'string' ? (
                                <>
                                    {settings.hero_title.split(' ').slice(0, -2).join(' ')} <br />
                                    <span className="text-gradient-gold">{settings.hero_title.split(' ').slice(-2).join(' ')}</span>
                                </>
                            ) : (
                                <>
                                    Tradição e Sabor <br />
                                    <span className="text-gradient-gold">em Cada Mordida</span>
                                </>
                            )}
                        </h1>
                        <p className="text-white/80 text-base md:text-xl max-w-2xl mb-12 leading-relaxed animate-slide-up opacity-0" style={{ animationDelay: '0.8s' }}>
                            {settings?.hero_subtitle || "O melhor em qualidade e atendimento para você."}
                        </p>

                        {settings?.show_hero_button !== false && (
                            <div className="flex flex-col sm:flex-row gap-5 animate-slide-up opacity-0" style={{ animationDelay: '1s' }}>
                                <a href="#catalogo" className="bg-elite-gold text-white px-12 py-5 rounded-full font-bold text-sm uppercase tracking-widest hover:scale-105 transition-all shadow-xl shadow-elite-gold/30 btn-gold-shine">
                                    {settings?.hero_button_text || "Ver Catálogo"}
                                </a>
                            </div>
                        )}
                    </div>
                </div>


            </section>

            {/* SEÇÕES DINÂMICAS: SOBRE E CARDÁPIO (ORDEM CONFIGURÁVEL) */}
            {settings?.about_section_position === 'after_catalog' ? (
                <>
                    {/* 1. CARDÁPIO */}
                    {settings?.layout_mode !== 'landing_only' && <CatalogSection settings={settings} categories={categories} activeCategory={activeCategory} setActiveCategory={setActiveCategory} filteredItems={filteredItems} getItemQuantity={getItemQuantity} updateCartQuantity={updateCartQuantity} />}
                    {/* 2. SOBRE */}
                    {settings?.show_about !== false && <AboutSection settings={settings} />}
                </>
            ) : (
                <>
                    {/* 1. SOBRE */}
                    {settings?.show_about !== false && <AboutSection settings={settings} />}
                    {/* 2. CARDÁPIO */}
                    {settings?.layout_mode !== 'landing_only' && <CatalogSection settings={settings} categories={categories} activeCategory={activeCategory} setActiveCategory={setActiveCategory} filteredItems={filteredItems} getItemQuantity={getItemQuantity} updateCartQuantity={updateCartQuantity} />}
                </>
            )}

            {/* Testimonials Section */}
            {/* Testimonials */}
            {settings?.show_testimonials !== false && (
                <section
                    className="py-24 relative overflow-hidden"
                    style={{
                        backgroundColor: settings?.testimonials_bg_color || '#ffffff',
                        backgroundImage: settings?.testimonials_bg_image ? `url(${settings.testimonials_bg_image})` : undefined,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center'
                    }}
                >
                    <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent"></div>
                    <div className="container mx-auto px-6">
                        <div className="text-center mb-16">
                            <span className="font-bold tracking-[0.3em] uppercase text-xs" style={{ color: 'var(--elite-gold)' }}>Depoimentos</span>
                            <h2 className="font-display text-4xl md:text-5xl font-bold mt-4 text-[var(--elite-contrast)]">O Que Dizem Nossos Clientes</h2>
                        </div>

                        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                            {[1, 2, 3, 4].map((num) => {
                                const name = (settings as any)?.[`testimonial${num}_name`];
                                const role = (settings as any)?.[`testimonial${num}_role`];
                                const content = (settings as any)?.[`testimonial${num}_content`];
                                const image = (settings as any)?.[`testimonial${num}_image`];

                                // Fallback to constants if name is missing
                                if (!name) {
                                    const fb = constants.TESTIMONIALS[num - 1] || constants.TESTIMONIALS[0];
                                    return (
                                        <motion.div
                                            key={`fb-${num}`}
                                            initial={{ opacity: 0, y: 20 }}
                                            whileInView={{ opacity: 1, y: 0 }}
                                            viewport={{ once: true }}
                                            transition={{ delay: (num - 1) * 0.1 }}
                                            className="bg-slate-50 p-8 rounded-3xl relative border border-slate-100 group hover:-translate-y-2 transition-transform duration-300 shadow-sm hover:shadow-xl"
                                        >
                                            <Quote className="absolute top-8 left-8 transition-colors" style={{ color: 'var(--elite-gold)', opacity: 0.2 }} size={40} />
                                            <div className="relative z-10 pt-6">
                                                <p className="text-slate-600 italic mb-8 leading-relaxed">"{fb.content}"</p>
                                                <div className="flex items-center gap-4">
                                                    <img src={fb.image || "https://images.unsplash.com/photo-1581579438747-1dc8d17bbce4?auto=format&fit=crop&w=400&q=80"} className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-md" alt={fb.name} />
                                                    <div>
                                                        <h4 className="font-bold text-[var(--elite-contrast)] text-sm">{fb.name}</h4>
                                                        <p className="text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--elite-gold)' }}>{fb.role}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    );
                                }

                                return (
                                    <motion.div
                                        key={`dyn-${num}`}
                                        initial={{ opacity: 0, y: 20 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: (num - 1) * 0.1 }}
                                        className="bg-slate-50 p-8 rounded-3xl relative border border-slate-100 group hover:-translate-y-2 transition-transform duration-300 shadow-sm hover:shadow-xl"
                                    >
                                        <Quote className="absolute top-8 left-8 transition-colors" style={{ color: 'var(--elite-gold)', opacity: 0.2 }} size={40} />
                                        <div className="relative z-10 pt-6">
                                            <p className="text-slate-600 italic mb-8 leading-relaxed">"{content}"</p>
                                            <div className="flex items-center gap-4">
                                                <img src={image || "https://images.unsplash.com/photo-1581579438747-1dc8d17bbce4?auto=format&fit=crop&w=400&q=80"} className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-md" alt={name} />
                                                <div>
                                                    <h4 className="font-bold text-[var(--elite-contrast)] text-sm">{name}</h4>
                                                    <p className="text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--elite-gold)' }}>{role}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </div>
                </section>
            )}

            {/* Footer / Contato */}
            <footer id="contato" className="text-white pt-32 pb-12 relative overflow-hidden" style={{ backgroundColor: 'var(--footer-bg)' }}>
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-elite-gold to-transparent"></div>

                <div className="container mx-auto px-6 grid md:grid-cols-2 lg:grid-cols-4 gap-16 relative z-10">
                    <div className="space-y-8">
                        {settings?.logo_url ? (
                            <img src={settings.logo_url} className="h-14 md:h-20 w-auto" alt={settings?.bakery_name || "Logo Footer"} />
                        ) : (
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-elite-gold rounded-xl flex items-center justify-center text-white font-black text-2xl shadow-lg">
                                    {(settings?.bakery_name || "S")[0].toUpperCase()}
                                </div>
                                <span className="text-white font-display font-bold text-xl tracking-tight leading-none uppercase">
                                    {settings?.bakery_name || "Sua Loja"}
                                </span>
                            </div>
                        )}
                        <p className="text-white/60 leading-relaxed italic text-sm">
                            {settings?.footer_description || "Aceitamos encomendas com antecedência pelo WhatsApp."}
                        </p>
                        <div className="flex gap-4">
                            {settings?.instagram_url && (
                                <a href={settings.instagram_url.startsWith('http') ? settings.instagram_url : `https://${settings.instagram_url}`} target="_blank" className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center text-elite-gold hover:bg-elite-gold hover:text-white transition-all ring-1 ring-white/10"><Instagram size={20} /></a>
                            )}
                            {settings?.facebook_url && (
                                <a href={settings.facebook_url.startsWith('http') ? settings.facebook_url : `https://${settings.facebook_url}`} target="_blank" className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center text-elite-gold hover:bg-elite-gold hover:text-white transition-all ring-1 ring-white/10"><Facebook size={20} /></a>
                            )}
                            {settings?.tiktok_url && (
                                <a href={settings.tiktok_url.startsWith('http') ? settings.tiktok_url : `https://${settings.tiktok_url}`} target="_blank" className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center text-elite-gold hover:bg-elite-gold hover:text-white transition-all ring-1 ring-white/10"><TiktokIcon size={20} /></a>
                            )}
                        </div>
                    </div>

                    <div className="space-y-6">
                        <h4 className="font-display text-xl font-bold text-elite-gold">Contatos</h4>
                        <div className="space-y-4">
                            <p className="flex items-center gap-4 text-white/70 hover:text-white transition-colors cursor-pointer group">
                                <span className="w-10 h-10 bg-white/5 rounded-lg flex items-center justify-center text-elite-gold group-hover:bg-elite-gold group-hover:text-white transition-all">
                                    <Phone size={18} />
                                </span>
                                {settings?.contact_phone || settings?.whatsapp_number || '(16) 0000-0000'}
                            </p>
                            <p className="flex items-center gap-4 text-white/70 hover:text-white transition-colors cursor-pointer group">
                                <span className="w-10 h-10 bg-white/5 rounded-lg flex items-center justify-center text-elite-gold group-hover:bg-elite-gold group-hover:text-white transition-all">
                                    <MessageCircle size={18} />
                                </span>
                                {settings?.whatsapp_number || ''}
                            </p>
                            {settings?.footer_email && (
                                <p className="flex items-center gap-4 text-white/70 hover:text-white transition-colors cursor-pointer group">
                                    <span className="w-10 h-10 bg-white/5 rounded-lg flex items-center justify-center text-elite-gold group-hover:bg-elite-gold group-hover:text-white transition-all">
                                        <Mail size={18} />
                                    </span>
                                    {settings.footer_email}
                                </p>
                            )}

                        </div>
                    </div>

                    {((settings?.show_address_footer !== false && !!settings?.address) || (settings?.show_map_link !== false && !!settings?.google_maps_url)) && (
                        <div className="space-y-6">
                            <h4 className="font-display text-xl font-bold text-elite-gold">{settings?.footer_location_title || 'Onde Estamos'}</h4>
                            <div className="space-y-4">
                                {settings?.show_address_footer !== false && !!settings?.address && (
                                    <p className="flex items-start gap-4 text-white/70 leading-relaxed">
                                        <span className="w-10 h-10 bg-white/5 rounded-lg flex items-center justify-center text-elite-gold shrink-0">
                                            <MapPin size={18} />
                                        </span>
                                        {settings.address}
                                    </p>
                                )}
                                {settings?.show_map_link !== false && !!settings?.google_maps_url && (
                                    <a
                                        href={settings.google_maps_url.startsWith('http') ? settings.google_maps_url : `https://${settings.google_maps_url}`}
                                        target="_blank"
                                        className={cn(
                                            "inline-flex items-center gap-2 text-elite-gold font-bold text-[10px] uppercase tracking-widest bg-white/5 px-4 py-2 rounded-full border border-white/10 hover:bg-elite-gold hover:text-white transition-all",
                                            settings?.show_address_footer !== false && !!settings?.address && "ml-14"
                                        )}
                                    >
                                        {settings?.footer_maps_label || 'Abrir no Google Maps'}
                                    </a>
                                )}
                            </div>
                        </div>
                    )}

                    <div className="space-y-6">
                        <h4 className="font-display text-xl font-bold text-elite-gold">{settings?.footer_working_title || 'Funcionamento'}</h4>
                        <div className="text-white/60 text-sm space-y-4">
                            <div className="p-4 bg-white/5 rounded-2xl border border-white/10 space-y-2">
                                <p className="text-[10px] uppercase font-black tracking-widest text-elite-gold">{settings?.footer_working_label || 'Horário de Atendimento'}</p>
                                <p className="text-white font-bold text-base">{settings?.working_hours || 'Segunda a Sábado: 08h às 22h'}</p>
                            </div>
                            <div className="p-4 bg-elite-gold/10 rounded-2xl border border-elite-gold/20">
                                <p className="text-[10px] uppercase font-black tracking-widest text-elite-gold mb-1">{settings?.footer_orders_label || 'Pedidos Online'}</p>
                                <p className="text-xs text-white/80">{settings?.online_orders_message || 'Aceitamos encomendas com antecedência pelo WhatsApp.'}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="container mx-auto px-6 mt-24 pt-8 border-t border-white/5 text-center text-white/30 text-[10px] uppercase tracking-[4px]">
                    {settings?.bakery_name || 'Clique PDV Premium'} © Todos os direitos reservados. {settings?.show_cnpj_footer !== false && settings?.cnpj ? `CNPJ: ${settings.cnpj}` : ''}
                </div>
            </footer >

            {/* Carrinho / Checkout Drawer Lateral */}
            < div className={`fixed inset-0 z-[100] transition-all duration-500 ${isCartOpen ? 'visible pointer-events-auto' : 'invisible pointer-events-none'}`}>
                <div className={`absolute inset-0 bg-[var(--elite-contrast)]/60 backdrop-blur-sm transition-opacity duration-500 ${isCartOpen ? 'opacity-100' : 'opacity-0'}`} onClick={() => setIsCartOpen(false)}></div>

                <div className={`absolute top-0 right-0 h-full w-full max-w-md bg-[var(--elite-contrast)] shadow-2xl transition-transform duration-500 ease-in-out ${isCartOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                    <div className="flex flex-col h-full">
                        <div className="p-8 border-b flex items-center justify-between bg-slate-50">
                            <div>
                                <h2 className="text-2xl font-display font-bold text-[var(--elite-contrast)]">Meu Pedido</h2>
                                <p className="text-xs text-slate-400 mt-1 uppercase tracking-widest">{cartCount} itens selecionados</p>
                            </div>
                            <button onClick={() => setIsCartOpen(false)} className="w-12 h-12 flex items-center justify-center bg-white rounded-full text-slate-400 hover:text-[var(--elite-contrast)] shadow-sm transition-all"><X size={24} /></button>
                        </div>

                        <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
                            {cart.length === 0 ? (
                                <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-white">
                                    <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                                        <ShoppingCart size={40} className="text-slate-200" />
                                    </div>
                                    <h3 className="font-bold text-slate-900 mb-2">Seu carrinho está vazio</h3>
                                    <p className="text-sm text-slate-400 max-w-[200px] mx-auto">
                                        {settings?.cart_empty_message || "Explore nosso cardápio e adicione os melhores itens!"}
                                    </p>
                                    <button
                                        onClick={() => {
                                            setIsCartOpen(false);
                                            const element = document.getElementById('cardapio');
                                            if (element) {
                                                const offset = 100;
                                                const elementPosition = element.getBoundingClientRect().top;
                                                const offsetPosition = elementPosition + window.pageYOffset - offset;
                                                window.scrollTo({
                                                    top: offsetPosition,
                                                    behavior: "smooth"
                                                });
                                            }
                                        }}
                                        className="mt-8 text-elite-gold font-bold uppercase text-xs tracking-widest border-b-2 border-elite-gold"
                                    >
                                        Voltar ao Cardápio
                                    </button>
                                </div>
                            ) : (
                                <div className="flex-1 overflow-y-auto p-8 pr-6 custom-scrollbar space-y-8 bg-white">
                                    {cart.map(item => (
                                        <div key={item.id} className="flex gap-5 group animate-slide-up">
                                            <div className="relative w-20 h-20 shrink-0 bg-slate-50 rounded-2xl flex items-center justify-center overflow-hidden border border-slate-100">
                                                {(item.image_url || item.image) ? (
                                                    <img src={item.image_url || item.image} className="w-full h-full object-cover shadow-md" alt={item.name} />
                                                ) : (
                                                    <ShoppingBasket size={24} className="text-slate-200" />
                                                )}
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex justify-between items-start mb-1">
                                                    <span className="font-bold text-[var(--elite-contrast)] text-sm leading-tight">{item.name}</span>
                                                    <button onClick={() => removeFromCart(item.id)} className="text-slate-300 hover:text-red-500 transition-colors"><Trash2 size={16} /></button>
                                                </div>
                                                <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-3">R$ {item.price.toFixed(2)} {item.unit}</p>

                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-3 bg-slate-50 px-2 py-1 rounded-lg border border-slate-100">
                                                        <button onClick={() => updateCartQuantity(item, -1)} className="p-1 text-slate-400 hover:text-red-500"><Minus size={14} /></button>
                                                        <span className="text-xs font-black text-[var(--elite-contrast)] w-4 text-center">{item.quantity}</span>
                                                        <button onClick={() => updateCartQuantity(item, 1)} className="p-1 text-elite-gold"><Plus size={14} /></button>
                                                    </div>
                                                    <span className="font-black text-sm text-[var(--elite-contrast)]">R$ {(item.price * item.quantity).toFixed(2)}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {cart.length > 0 && (
                                <div className="p-8 bg-[var(--elite-contrast)] text-white mt-auto border-t border-[var(--elite-contrast)]">
                                    <div className="flex justify-between items-end mb-8">
                                        <div>
                                            <p className="text-white/40 text-[10px] uppercase font-black tracking-widest mb-1">Valor Total</p>
                                            <p className="text-3xl font-display font-bold text-elite-gold">R$ {cartTotal.toFixed(2)}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-white/40 text-[10px] uppercase font-black tracking-widest mb-1">Status</p>
                                            <p className="text-xs font-bold text-amber-400 flex items-center gap-1 justify-end"><Clock size={12} /> Em preparo</p>
                                        </div>
                                    </div>

                                    <div className="space-y-4 mb-8">
                                        {/* Step 1: Summary (Item List) */}
                                        {checkoutStep === 1 && (
                                            <div className="space-y-4 animate-in fade-in duration-300">
                                                <p className="text-[10px] uppercase font-black tracking-widest text-elite-gold mb-4 border-b border-white/10 pb-2">Passo 1: Revisão do Pedido</p>
                                            </div>
                                        )}

                                        {/* Step 2: Identification */}
                                        {checkoutStep === 2 && (
                                            <div className="space-y-4 animate-in slide-in-from-right duration-300">
                                                <div className="flex items-center justify-between mb-4 border-b border-white/10 pb-2">
                                                    <p className="text-[10px] uppercase font-black tracking-widest text-elite-gold">Passo 2: Identificação</p>
                                                    <button onClick={() => setCheckoutStep(1)} className="text-[10px] uppercase font-bold text-elite-gold hover:text-elite-gold-dark transition-colors bg-white/5 px-2 py-1 rounded">Voltar</button>
                                                </div>
                                                <div className="space-y-1.5">
                                                    <label className="text-[10px] uppercase font-black tracking-widest text-white/40">Seu Nome</label>
                                                    <input
                                                        type="text"
                                                        value={customerName}
                                                        onChange={(e) => setCustomerName(e.target.value)}
                                                        placeholder="Como podemos te chamar?"
                                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-elite-gold transition-colors placeholder:text-white/20"
                                                    />
                                                </div>
                                                <div className="space-y-1.5">
                                                    <label className="text-[10px] uppercase font-black tracking-widest text-white/40">Telefone com DDD</label>
                                                    <input
                                                        type="tel"
                                                        value={customerPhone}
                                                        onChange={(e) => setCustomerPhone(e.target.value)}
                                                        placeholder="(00) 00000-0000"
                                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-elite-gold transition-colors placeholder:text-white/20"
                                                    />
                                                </div>
                                            </div>
                                        )}

                                        {/* Step 3: Delivery & Payment */}
                                        {checkoutStep === 3 && (
                                            <div className="space-y-4 animate-in slide-in-from-right duration-300">
                                                <div className="flex items-center justify-between mb-4 border-b border-white/10 pb-2">
                                                    <p className="text-[10px] uppercase font-black tracking-widest text-elite-gold">Passo 3: Entrega & Pagamento</p>
                                                    <button onClick={() => setCheckoutStep(2)} className="text-[10px] uppercase font-bold text-elite-gold hover:text-elite-gold-dark transition-colors bg-white/5 px-2 py-1 rounded">Voltar</button>
                                                </div>

                                                <div className="space-y-1.5">
                                                    <label className="text-[10px] uppercase font-black tracking-widest text-white/40">Como prefere receber?</label>
                                                    <div className="grid grid-cols-2 gap-2">
                                                        {[
                                                            { id: 'entrega', label: 'Entrega' },
                                                            { id: 'retirada', label: 'Retirada' }
                                                        ].map((method) => (
                                                            <button
                                                                key={method.id}
                                                                onClick={() => setDeliveryMethod(method.id as any)}
                                                                className={cn(
                                                                    "px-4 py-3 rounded-xl border text-center text-xs font-bold transition-all",
                                                                    deliveryMethod === method.id
                                                                        ? "bg-elite-gold border-elite-gold text-white"
                                                                        : "bg-white/5 border-white/10 text-white/60 hover:bg-white/10"
                                                                )}
                                                            >
                                                                {method.label}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>

                                                {deliveryMethod === 'entrega' && (
                                                    <div className="space-y-1.5 animate-in fade-in slide-in-from-top-2">
                                                        <label className="text-[10px] uppercase font-black tracking-widest text-white/40">Endereço de Entrega</label>
                                                        <textarea
                                                            value={customerAddress}
                                                            onChange={(e) => setCustomerAddress(e.target.value)}
                                                            placeholder="Rua, número, bairro e complemento..."
                                                            rows={2}
                                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-elite-gold transition-colors placeholder:text-white/20 resize-none"
                                                        />
                                                    </div>
                                                )}

                                                <div className="space-y-1.5">
                                                    <label className="text-[10px] uppercase font-black tracking-widest text-white/40">Observações (Opcional)</label>
                                                    <textarea
                                                        value={observation}
                                                        onChange={(e) => setObservation(e.target.value)}
                                                        placeholder="Ex: Tirar cebola, troco para 50, campainha não funciona..."
                                                        rows={2}
                                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-elite-gold transition-colors placeholder:text-white/20 resize-none"
                                                    />
                                                </div>

                                                <div className="space-y-1.5">
                                                    <label className="text-[10px] uppercase font-black tracking-widest text-white/40">Forma de Pagamento</label>
                                                    <div className="grid grid-cols-3 gap-2">
                                                        {[
                                                            { id: 'pix', label: 'PIX' },
                                                            { id: 'cartao', label: 'Cartão' },
                                                            { id: 'dinheiro', label: 'Dinheiro' }
                                                        ].map((method) => (
                                                            <button
                                                                key={method.id}
                                                                onClick={() => setPaymentMethod(method.id as any)}
                                                                className={cn(
                                                                    "px-2 py-3 rounded-xl border text-center text-xs font-bold transition-all",
                                                                    paymentMethod === method.id
                                                                        ? "bg-elite-gold border-elite-gold text-white"
                                                                        : "bg-white/5 border-white/10 text-white/60 hover:bg-white/10"
                                                                )}
                                                            >
                                                                {method.label}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>

                                                {deliveryMethod === 'entrega' && Number(settings?.default_delivery_fee || 0) > 0 && (
                                                    <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                                                        <p className="text-[10px] font-bold text-amber-500 uppercase tracking-wider text-center">
                                                            Taxa de Entrega: R$ {Number(settings.default_delivery_fee).toFixed(2)}
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    <div className="space-y-4">
                                        <button
                                            onClick={handleCheckout}
                                            disabled={
                                                (checkoutStep === 2 && (!customerName || !customerPhone)) ||
                                                (checkoutStep === 3 && ((deliveryMethod === 'entrega' && !customerAddress) || !paymentMethod)) ||
                                                isSubmitting
                                            }
                                            className={cn(
                                                "w-full py-5 rounded-2xl font-black text-sm uppercase tracking-[2px] flex items-center justify-center gap-4 transition-all shadow-2xl",
                                                ((checkoutStep === 2 && (!customerName || !customerPhone)) || (checkoutStep === 3 && ((deliveryMethod === 'entrega' && !customerAddress) || !paymentMethod)) || isSubmitting)
                                                    ? "bg-white/10 text-white/20 cursor-not-allowed"
                                                    : "bg-elite-gold text-white hover:bg-elite-gold-dark btn-gold-shine shadow-elite-gold/20"
                                            )}
                                        >
                                            {isSubmitting ? (
                                                <>Processando... <Loader2 size={20} className="animate-spin" /></>
                                            ) : checkoutStep === 3 ? (
                                                <>Finalizar no WhatsApp <Send size={20} /></>
                                            ) : (
                                                <>Continuar Pedido <ChevronRight size={20} /></>
                                            )}
                                        </button>

                                        {checkoutStep === 3 && settings?.enable_direct_checkout && (
                                            <button
                                                className="w-full bg-white text-[var(--elite-contrast)] py-5 rounded-2xl font-black text-sm uppercase tracking-[2px] flex items-center justify-center gap-4 hover:bg-slate-50 transition-all shadow-2xl shadow-white/10 border-2 border-white/20"
                                            >
                                                Pagar Agora <ShoppingBag size={20} />
                                            </button>
                                        )}
                                    </div>
                                    <p className="text-[10px] text-white/40 text-center mt-6 uppercase tracking-[1px]">
                                        * {paymentMethod === 'pix' ? 'Pagamento PIX deve ser realizado após o envio.' : 'O tempo de preparo pode variar conforme o item.'}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div >

            {/* Floating Action Button Mobile - Carrinho */}
            {
                cartCount > 0 && !isCartOpen && settings?.show_cart && (
                    <button
                        onClick={() => setIsCartOpen(true)}
                        className="fixed bottom-24 right-6 z-50 bg-[var(--elite-contrast)] text-white w-16 h-16 rounded-full shadow-2xl flex items-center justify-center md:hidden border-4 border-white animate-bounce"
                    >
                        <ShoppingCart size={24} />
                        <span className="absolute -top-1 -right-1 bg-elite-gold text-white text-[10px] w-6 h-6 flex items-center justify-center rounded-full font-black border-2 border-[var(--elite-contrast)]">
                            {cartCount}
                        </span>
                    </button>
                )
            }

            {/* Botão WhatsApp Fixo */}
            <a
                href={`https://wa.me/${settings?.whatsapp_number || ''}?text=${encodeURIComponent(settings?.whatsapp_contact_message || 'Olá! Vim pelo site e gostaria de mais informações.')}`}
                target="_blank"
                className={cn(
                    "fixed bottom-6 right-6 z-[70] bg-[#25d366] text-white px-4 py-4 md:px-6 md:py-4 rounded-full font-bold flex items-center gap-3 shadow-2xl hover:scale-110 transition-all active:scale-95 group",
                    isCartOpen ? "opacity-0 pointer-events-none translate-y-10" : "opacity-100"
                )}
            >
                <div className="relative">
                    <MessageCircle size={24} />
                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-white rounded-full animate-ping"></span>
                </div>
                <span className="hidden md:inline">{settings?.whatsapp_floating_label || 'Falar com Atendente'}</span>
            </a>
        </div >

    );
};

export default LandingPage;
