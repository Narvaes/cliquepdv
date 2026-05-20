import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
    LayoutDashboard,
    Smartphone,
    Store,
    TrendingUp,
    CheckCircle2,
    ChevronRight,
    Play,
    ShieldCheck,
    Zap,
    Crown,
    Check
} from 'lucide-react';
import { motion } from 'framer-motion';

// Mockup Images (Amber/Gold Theme)
const DASHBOARD_IMG = "/images/dashboard_preview.png";
const MOBILE_APP_IMG = "/images/mobile_app_preview.png";

const PlatformHome: React.FC = () => {
    // Default to 'yearly' as requested
    const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('yearly');

    // Pricing Constants
    const PRICES = {
        basic: {
            monthly: 49.90,
            yearly: 29.90 // Monthly price when billed annually
        },
        premium: {
            monthly: 99.99,
            yearly: 79.00 // Monthly price when billed annually
        }
    };

    // Calculate Savings
    const getSavings = (plan: 'basic' | 'premium') => {
        const monthlyCost = PRICES[plan].monthly * 12;
        const yearlyCost = PRICES[plan].yearly * 12;
        return (monthlyCost - yearlyCost).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    };

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white selection:bg-amber-500 selection:text-black overflow-hidden font-inter">
            {/* Ambient Background Effects */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-amber-600/10 rounded-full blur-[128px]" />
                <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-orange-600/10 rounded-full blur-[128px]" />
                <div className="absolute top-[20%] left-[20%] w-[300px] h-[300px] bg-yellow-600/5 rounded-full blur-[96px]" />
            </div>

            {/* Navbar */}
            <nav className="relative z-50 border-b border-white/5 bg-[#0a0a0a]/80 backdrop-blur-md">
                <div className="container mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/20">
                            <Store className="text-white" size={24} />
                        </div>
                        <span className="font-display font-bold text-xl tracking-tight">
                            Clique <span className="text-amber-500">PDV</span>
                        </span>
                    </div>

                    <div className="hidden md:flex items-center gap-8 text-sm font-medium text-neutral-400">
                        <a href="#features" className="hover:text-white transition-colors">Funcionalidades</a>
                        <a href="#plans" className="hover:text-white transition-colors">Planos</a>
                        <a href="#testimonials" className="hover:text-white transition-colors">Clientes</a>
                    </div>

                    <div className="flex items-center gap-4">

                        <Link
                            to="/signup"
                            className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-black text-sm font-bold rounded-full transition-all shadow-lg shadow-amber-500/25 flex items-center gap-2 group"
                        >
                            Testar Grátis
                            <ChevronRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
                        </Link>
                    </div>
                </div>
            </nav>

            <main className="relative z-10">
                {/* Hero Section */}
                <section className="pt-24 pb-32 px-6">
                    <div className="container mx-auto text-center max-w-5xl">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8 }}
                        >
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-amber-400 text-sm font-medium mb-8">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                                </span>
                                Plataforma de Vendas #1 para Lojas
                            </div>

                            <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-8 leading-[1.1]">
                                Gerencie suas vendas com
                                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-orange-400 to-amber-200">
                                    Facilidade e Inteligência
                                </span>
                            </h1>

                            <p className="text-neutral-400 text-lg md:text-xl max-w-3xl mx-auto mb-12 leading-relaxed">
                                A solução completa para o seu negócio. Catálogo Digital, Pedidos no WhatsApp e Gestão Financeira por um preço que cabe no seu bolso.
                            </p>

                            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20">
                                <Link
                                    to="/signup"
                                    className="w-full sm:w-auto px-8 py-4 bg-amber-500 text-black font-bold rounded-2xl hover:bg-amber-400 transition-all flex items-center justify-center gap-2 shadow-xl shadow-amber-500/20"
                                >
                                    <Zap size={20} className="fill-current" />
                                    Testar 60 Dias Grátis
                                </Link>
                                <button className="w-full sm:w-auto px-8 py-4 bg-white/5 border border-white/10 text-white font-semibold rounded-2xl hover:bg-white/10 transition-all flex items-center justify-center gap-2">
                                    <Play size={20} />
                                    Ver Demonstração
                                </button>
                            </div>

                            {/* Dashboard Showcase */}
                            <div className="relative mx-auto rounded-3xl border border-white/10 bg-black/40 shadow-2xl overflow-hidden max-w-5xl group border-t-amber-500/20 aspect-video flex items-center justify-center">
                                <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent z-10 pointer-events-none"></div>
                                {/* Fallback content if image fails or while loading */}
                                <div className="text-center p-12">
                                    <LayoutDashboard size={64} className="mx-auto text-amber-500/20 mb-4" />

                                </div>
                                <img
                                    src={DASHBOARD_IMG}
                                    alt="Dashboard Preview"
                                    className="absolute inset-0 w-full h-full object-cover opacity-90 group-hover:scale-105 transition-transform duration-1000 ease-out"
                                />
                            </div>

                        </motion.div>

                        {/* Stats / Proof */}
                        <div className="mt-20 pt-10 border-t border-white/5 grid grid-cols-2 md:grid-cols-4 gap-8">
                            {[
                                { label: 'Lojas Ativas', value: '500+' },
                                { label: 'Pedidos/Mês', value: '50k+' },
                                { label: 'Em Vendas', value: 'R$ 2M+' },
                                { label: 'Satisfação', value: '4.9/5' },
                            ].map((stat, i) => (
                                <div key={i}>
                                    <h4 className="text-3xl font-bold text-white mb-1">{stat.value}</h4>
                                    <p className="text-neutral-500 text-sm font-medium uppercase tracking-wider">{stat.label}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Features Grid */}
                <section id="features" className="py-24 bg-white/[0.02]">
                    <div className="container mx-auto px-6">
                        <div className="mb-16 text-center">
                            <h2 className="text-3xl md:text-5xl font-bold mb-6">Tudo que você precisa</h2>
                            <p className="text-neutral-400 text-lg max-w-2xl mx-auto">
                                Ferramentas poderosas desenvolvidas para automatizar sua operação e encantar seus clientes.
                            </p>
                        </div>

                        <div className="grid md:grid-cols-3 gap-6">
                            {[
                                {
                                    icon: <LayoutDashboard size={32} className="text-amber-500" />,
                                    title: "Catálogo Digital Premium",
                                    desc: "Seus produtos apresentados com elegância. Layouts modernos que aumentam a percepção de valor."
                                },
                                {
                                    icon: <Smartphone size={32} className="text-orange-500" />,
                                    title: "Pedidos via WhatsApp com IA",
                                    desc: "Automação inteligente. Receba pedidos formatados diretamente no seu WhatsApp e utilize nossa IA para impulsionar vendas."
                                },
                                {
                                    icon: <TrendingUp size={32} className="text-yellow-500" />,
                                    title: "Gestão Financeira",
                                    desc: "Controle de caixa, relatórios de vendas e análise de desempenho em tempo real."
                                },
                                {
                                    icon: <ShieldCheck size={32} className="text-amber-600" />,
                                    title: "Domínio Personalizado",
                                    desc: "Use seu próprio domínio (ex: sualoja.com.br) para fortalecer sua marca."
                                },
                                {
                                    icon: <Store size={32} className="text-orange-400" />,
                                    title: "Identidade Visual",
                                    desc: "Customize cores, banners e layouts para deixar a loja com a cara da sua marca."
                                },
                                {
                                    icon: <Zap size={32} className="text-yellow-400" />,
                                    title: "Configuração Instantânea",
                                    desc: "Coloque sua loja no ar em menos de 5 minutos. Sem necessidade de conhecimentos técnicos."
                                }
                            ].map((feature, i) => (
                                <div key={i} className="p-8 rounded-3xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-amber-500/30 transition-all group">
                                    <div className="mb-6 bg-white/5 w-16 h-16 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-500 shadow-lg shadow-black/50">
                                        {feature.icon}
                                    </div>
                                    <h3 className="text-xl font-bold mb-3 group-hover:text-amber-400 transition-colors">{feature.title}</h3>
                                    <p className="text-neutral-400 leading-relaxed">
                                        {feature.desc}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Mobile App Section - NEW */}
                <section className="py-24 overflow-hidden relative">
                    <div className="container mx-auto px-6 relative z-10">
                        <div className="grid md:grid-cols-2 gap-16 items-center">
                            <motion.div
                                initial={{ opacity: 0, x: -50 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                className="order-2 md:order-1 relative"
                            >
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-amber-500/20 rounded-full blur-[100px]"></div>
                                <div className="relative z-10 flex justify-center">
                                    <img src={MOBILE_APP_IMG} alt="App Mobile" className="rounded-3xl shadow-2xl border border-white/10 bg-black max-w-sm w-full" />
                                </div>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, x: 50 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                className="order-1 md:order-2"
                            >
                                <h2 className="text-4xl md:text-5xl font-bold mb-6">Seus clientes vão amar sua loja</h2>
                                <p className="text-neutral-400 text-lg mb-8 leading-relaxed">
                                    Uma experiência de compra fluida e moderna, otimizada para qualquer dispositivo. Aumente sua conversão com um catálogo irresistível.
                                </p>
                                <ul className="space-y-4 mb-8">
                                    <li className="flex items-center gap-3 text-neutral-300">
                                        <div className="w-6 h-6 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-500">
                                            <Check size={14} strokeWidth={3} />
                                        </div>
                                        <span>Carregamento instantâneo</span>
                                    </li>
                                    <li className="flex items-center gap-3 text-neutral-300">
                                        <div className="w-6 h-6 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-500">
                                            <Check size={14} strokeWidth={3} />
                                        </div>
                                        <span>Fotos em alta resolução</span>
                                    </li>
                                    <li className="flex items-center gap-3 text-neutral-300">
                                        <div className="w-6 h-6 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-500">
                                            <Check size={14} strokeWidth={3} />
                                        </div>
                                        <span>Checkout simplificado</span>
                                    </li>
                                </ul>
                                <Link to="/signup" className="text-amber-500 font-bold hover:text-amber-400 flex items-center gap-2 group">
                                    Criar Loja Agora <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
                                </Link>
                            </motion.div>
                        </div>
                    </div>
                </section>

                {/* Pricing Section */}
                <section id="plans" className="py-32 relative">
                    <div className="container mx-auto px-6">
                        <div className="text-center mb-16">
                            <h2 className="text-4xl md:text-5xl font-bold mb-6">Escolha seu plano</h2>
                            <p className="text-neutral-400 text-lg max-w-2xl mx-auto mb-8">
                                Comece gratuitamente e evolua conforme seu negócio cresce. Sem contratos de fidelidade.
                            </p>

                            {/* Billing Toggle */}
                            <div className="flex items-center justify-center gap-4">
                                <span className={`text-sm font-bold ${billingCycle === 'monthly' ? 'text-white' : 'text-neutral-500'}`}>Mensal</span>
                                <button
                                    onClick={() => setBillingCycle(prev => prev === 'monthly' ? 'yearly' : 'monthly')}
                                    className="w-16 h-8 bg-neutral-800 rounded-full p-1 relative transition-colors hover:bg-neutral-700 border border-neutral-700"
                                >
                                    <motion.div
                                        animate={{ x: billingCycle === 'monthly' ? 0 : 32 }}
                                        className="w-6 h-6 bg-amber-500 rounded-full shadow-lg"
                                    />
                                </button>
                                <span className={`text-sm font-bold ${billingCycle === 'yearly' ? 'text-white' : 'text-neutral-500'}`}>
                                    Anual <span className="text-amber-500 text-xs ml-1 font-normal">(Economize 20%)</span>
                                </span>
                            </div>
                        </div>

                        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto items-start">
                            {/* Free Tier */}
                            <div className="p-8 rounded-3xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.04] transition-colors relative group">
                                <h3 className="text-xl font-bold text-white mb-2">Teste Grátis</h3>
                                <div className="text-4xl font-bold mb-4">R$ 0<span className="text-lg text-neutral-500 font-normal">/60 dias</span></div>
                                <p className="text-neutral-400 text-sm mb-8 h-10">Para experimentar e validar a plataforma na sua loja.</p>

                                <Link to="/signup" className="w-full py-3 rounded-xl border border-white/20 hover:bg-white/10 text-white font-bold block text-center transition-all bg-transparent">
                                    Começar Agora
                                </Link>

                                <div className="space-y-4 mt-8">
                                    <div className="flex gap-3 text-sm text-neutral-300">
                                        <CheckCircle2 size={18} className="text-amber-500 shrink-0" />
                                        <span>60 dias de acesso total</span>
                                    </div>
                                    <div className="flex gap-3 text-sm text-neutral-300">
                                        <CheckCircle2 size={18} className="text-amber-500 shrink-0" />
                                        <span>Catálogo Digital</span>
                                    </div>
                                    <div className="flex gap-3 text-sm text-neutral-300">
                                        <CheckCircle2 size={18} className="text-amber-500 shrink-0" />
                                        <span>Pedidos via WhatsApp</span>
                                    </div>
                                </div>
                            </div>

                            {/* Basic Tier */}
                            <div className="p-8 rounded-3xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.04] transition-colors relative group">
                                <h3 className="text-xl font-bold text-white mb-2">Básico</h3>
                                <div className="flex items-baseline gap-1 mb-1">
                                    <span className="text-sm align-top text-neutral-400 mt-2">R$</span>
                                    <span className="text-4xl font-bold">{billingCycle === 'monthly' ? PRICES.basic.monthly.toFixed(2).replace('.', ',') : PRICES.basic.yearly.toFixed(2).replace('.', ',')}</span>
                                    <span className="text-lg text-neutral-500 font-normal">/mês</span>
                                </div>

                                {billingCycle === 'yearly' && (
                                    <div className="mb-4 text-sm text-emerald-400 font-medium bg-emerald-400/10 inline-block px-3 py-1 rounded-full border border-emerald-400/20">
                                        Economize {getSavings('basic')} /ano
                                    </div>
                                )}

                                <p className="text-neutral-400 text-sm mb-8 h-10 mt-2">Perfeito para quem está começando a vender online.</p>

                                <Link to="/signup?plan=basic" className="w-full py-3 rounded-xl bg-white text-black hover:bg-neutral-200 font-bold block text-center transition-all">
                                    Assinar Básico
                                </Link>

                                <div className="space-y-4 mt-8">
                                    <div className="flex gap-3 text-sm text-neutral-300">
                                        <Check size={18} className="text-amber-500 shrink-0" />
                                        <span>Painel de Gestão</span>
                                    </div>
                                    <div className="flex gap-3 text-sm text-neutral-300">
                                        <Check size={18} className="text-amber-500 shrink-0" />
                                        <span>Até 50 Produtos</span>
                                    </div>
                                    <div className="flex gap-3 text-sm text-neutral-300">
                                        <Check size={18} className="text-amber-500 shrink-0" />
                                        <span>Layout Padrão</span>
                                    </div>
                                    <div className="flex gap-3 text-sm text-neutral-300">
                                        <Check size={18} className="text-amber-500 shrink-0" />
                                        <span>Subdomínio (sua-loja.clique.pdv)</span>
                                    </div>
                                </div>
                            </div>

                            {/* Premium Tier */}
                            <div className="p-8 rounded-3xl border border-amber-500/50 bg-amber-500/10 relative overflow-hidden group shadow-2xl shadow-amber-500/10">
                                <div className="absolute top-0 right-0 bg-amber-500 text-black text-xs font-bold px-3 py-1 rounded-bl-xl uppercase tracking-widest">
                                    Recomendado
                                </div>

                                <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                                    Premium <Crown size={18} className="text-yellow-400 fill-yellow-400" />
                                </h3>
                                <div className="flex items-baseline gap-1 mb-1">
                                    <span className="text-sm align-top text-amber-300 mt-2">R$</span>
                                    <span className="text-4xl font-bold">{billingCycle === 'monthly' ? PRICES.premium.monthly.toFixed(2).replace('.', ',') : PRICES.premium.yearly.toFixed(2).replace('.', ',')}</span>
                                    <span className="text-lg text-amber-300 font-normal">/mês</span>
                                </div>

                                {billingCycle === 'yearly' && (
                                    <div className="mb-4 text-sm text-amber-300 font-medium bg-amber-400/20 inline-block px-3 py-1 rounded-full border border-amber-400/20">
                                        Economize {getSavings('premium')} /ano
                                    </div>
                                )}

                                <p className="text-amber-200/80 text-sm mb-8 h-10 mt-2">Para quem quer dominar o mercado e crescer rápido.</p>

                                <Link to="/signup?plan=premium" className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold block text-center transition-all shadow-lg shadow-amber-500/25">
                                    Assinar Premium
                                </Link>

                                <div className="space-y-4 mt-8">
                                    <div className="flex gap-3 text-sm text-white font-medium">
                                        <CheckCircle2 size={18} className="text-amber-400 shrink-0" />
                                        <span>Domínio Próprio (.com.br)</span>
                                    </div>
                                    <div className="flex gap-3 text-sm text-amber-100/80">
                                        <CheckCircle2 size={18} className="text-amber-500 shrink-0" />
                                        <span>Produtos Ilimitados</span>
                                    </div>
                                    <div className="flex gap-3 text-sm text-amber-100/80">
                                        <CheckCircle2 size={18} className="text-amber-500 shrink-0" />
                                        <span>Suporte Prioritário WhatsApp</span>
                                    </div>
                                    <div className="flex gap-3 text-sm text-amber-100/80">
                                        <CheckCircle2 size={18} className="text-amber-500 shrink-0" />
                                        <span>Relatórios Avançados</span>
                                    </div>
                                    <div className="flex gap-3 text-sm text-amber-100/80">
                                        <CheckCircle2 size={18} className="text-amber-500 shrink-0" />
                                        <span>Todos Layouts + Customização</span>
                                    </div>
                                </div>

                                <div className="mt-8 pt-6 border-t border-amber-500/20">
                                    <p className="text-xs font-bold text-amber-500 uppercase tracking-widest mb-3">
                                        Ribeirão Preto <span className="text-[10px] opacity-70 ml-1 border border-amber-500/50 px-1 rounded">OPCIONAL</span>
                                    </p>
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-sm text-amber-100/80">
                                            <span>Implantação Presencial</span>
                                            <span className="font-bold text-amber-300">R$ 997,00</span>
                                        </div>
                                        <div className="flex justify-between text-sm text-amber-100/80">
                                            <span>Treinamento de Equipe</span>
                                            <span className="font-bold text-amber-300">R$ 597,00</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Call to Action */}
                <section className="py-24">
                    <div className="container mx-auto px-6">
                        <div className="bg-gradient-to-br from-neutral-900 via-neutral-900 to-[#0a0a0a] rounded-[3rem] p-12 md:p-24 text-center relative overflow-hidden border border-amber-500/20">
                            <div className="absolute top-0 right-0 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 brightness-100 contrast-150"></div>

                            <div className="relative z-10 max-w-3xl mx-auto">
                                <h2 className="text-4xl md:text-6xl font-bold mb-8">Pronto para revolucionar suas vendas?</h2>
                                <p className="text-neutral-400 text-lg md:text-xl mb-12">
                                    Junte-se a centenas de lojistas que já estão faturando mais com o Clique PDV.
                                </p>
                                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                                    <Link
                                        to="/signup"
                                        className="w-full sm:w-auto px-10 py-5 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-2xl transition-all shadow-xl shadow-amber-500/30 text-lg"
                                    >
                                        Começar Teste de 60 Dias
                                    </Link>
                                </div>
                                <div className="mt-8 flex items-center justify-center gap-6 text-sm text-amber-500/80">
                                    <span className="flex items-center gap-2"><CheckCircle2 size={16} /> Sem cartão de crédito</span>
                                    <span className="flex items-center gap-2"><CheckCircle2 size={16} /> 60 dias grátis</span>
                                    <span className="flex items-center gap-2"><CheckCircle2 size={16} /> Cancelamento fácil</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            <footer className="py-12 border-t border-white/5 bg-[#0a0a0a]">
                <div className="container mx-auto px-6 text-center text-neutral-500 text-sm">
                    <p>&copy; {new Date().getFullYear()} Clique PDV. Todos os direitos reservados.</p>
                </div>
            </footer>
        </div>
    );
};

export default PlatformHome;
