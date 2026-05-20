import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import {
    Mail,
    Lock,
    User,
    Building2,
    Loader2,
    AlertCircle,
    CheckCircle2,
    Store,
    ArrowRight
} from 'lucide-react';
import { motion } from 'framer-motion';

const Signup = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        password: '',
        confirmPassword: '',
        storeName: '',
        slug: '',
        whatsapp: '',
        niche: 'bakery' as 'bakery' | 'snack_bar' | 'confectionery' | 'restaurant' | 'pizzeria' | 'other'
    });

    // Auto-gera slug quando o nome da loja muda
    const handleStoreNameChange = (value: string) => {
        setFormData(prev => ({
            ...prev,
            storeName: value,
            slug: value
                .toLowerCase()
                .normalize('NFD')
                .replace(/[\u0300-\u036f]/g, '') // Remove acentos
                .replace(/[^a-z0-9]+/g, '-') // Substitui caracteres especiais por -
                .replace(/^-+|-+$/g, '') // Remove - do início e fim
        }));
    };

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            // 1. Validações
            if (formData.password !== formData.confirmPassword) {
                throw new Error('As senhas não coincidem');
            }

            if (formData.password.length < 6) {
                throw new Error('A senha deve ter no mínimo 6 caracteres');
            }

            if (!formData.slug) {
                throw new Error('Por favor, escolha um identificador para sua loja');
            }

            // 2. Cria usuário no Supabase Auth
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email: formData.email,
                password: formData.password,
                options: {
                    emailRedirectTo: window.location.origin + '/login'
                }
            });

            if (authError) throw authError;
            if (!authData.user) throw new Error('Erro ao criar conta');

            console.log('[Signup] User created in Auth. Syncing with database...');

            // 3. Cria o tenant, profile e vínculos via RPC Blindada
            // Ela agora tem validação interna de slug e delay de sincronização
            const { error: rpcError } = await supabase.rpc('signup_new_store', {
                p_user_id: authData.user.id,
                p_email: formData.email,
                p_full_name: formData.fullName,
                p_store_name: formData.storeName,
                p_slug: formData.slug,
                p_niche: formData.niche,
                p_whatsapp: formData.whatsapp
            });

            if (rpcError) {
                // Se a RPC falhar, precisamos dar um feedback claro pro usuário
                // Ex: "Slug já em uso"
                throw new Error(rpcError.message || 'Erro ao configurar sua loja. Tente novamente.');
            }

            // 4. Aplica o template (Opcional, mas mantemos o sucesso no log)
            try {
                const { data: tenant } = await supabase
                    .from('tenants')
                    .select('id')
                    .eq('slug', formData.slug)
                    .single();

                if (tenant) {
                    const { applyDefaultTemplate } = await import('../../lib/tenantTemplate');
                    await applyDefaultTemplate(tenant.id, formData.niche, formData.storeName, formData.whatsapp);
                }
            } catch (tErr) {
                console.warn('[Signup] Template application failed, but store is created:', tErr);
            }

            // 5. Redireciona
            navigate(`/admin?tenant_override=${formData.slug}`);

        } catch (err: any) {
            console.error('[Signup] Error:', err);
            setError(err.message || 'Erro ao criar conta. Tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900 flex items-center justify-center p-6">
            {/* Decorative Orbs */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-amber-600/10 rounded-full blur-[120px]" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-amber-600/10 rounded-full blur-[120px]" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-2xl relative z-10"
            >
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-amber-600 rounded-3xl shadow-xl shadow-amber-600/20 mb-6">
                        <Store size={40} className="text-white" />
                    </div>
                    <h1 className="text-4xl font-black text-white mb-2">
                        Comece seu teste <span className="text-amber-500">grátis</span>
                    </h1>
                    <p className="text-neutral-400 text-lg">
                        60 dias para testar todas as funcionalidades. Sem compromisso.
                    </p>
                </div>

                {/* Form Card */}
                <div className="bg-neutral-800/50 backdrop-blur-xl p-8 md:p-10 rounded-[2.5rem] shadow-2xl border border-neutral-700/50">
                    <form onSubmit={handleSignup} className="space-y-5">
                        {/* Nome Completo */}
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-neutral-300 ml-1">Seu Nome Completo</label>
                            <div className="relative">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500" size={20} />
                                <input
                                    type="text"
                                    required
                                    value={formData.fullName}
                                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                    placeholder="João Silva"
                                    className="w-full pl-12 pr-4 py-4 bg-neutral-900/50 border border-neutral-700 rounded-2xl focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 outline-none transition-all text-white placeholder-neutral-500"
                                />
                            </div>
                        </div>

                        {/* Email */}
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-neutral-300 ml-1">Email</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500" size={20} />
                                <input
                                    type="email"
                                    required
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    placeholder="seu@email.com"
                                    className="w-full pl-12 pr-4 py-4 bg-neutral-900/50 border border-neutral-700 rounded-2xl focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 outline-none transition-all text-white placeholder-neutral-500"
                                />
                            </div>
                        </div>

                        {/* Senha */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-neutral-300 ml-1">Senha</label>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500" size={20} />
                                    <input
                                        type="password"
                                        required
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        placeholder="Mínimo 6 caracteres"
                                        className="w-full pl-12 pr-4 py-4 bg-neutral-900/50 border border-neutral-700 rounded-2xl focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 outline-none transition-all text-white placeholder-neutral-500"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-neutral-300 ml-1">Confirmar Senha</label>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500" size={20} />
                                    <input
                                        type="password"
                                        required
                                        value={formData.confirmPassword}
                                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                        placeholder="Digite novamente"
                                        className="w-full pl-12 pr-4 py-4 bg-neutral-900/50 border border-neutral-700 rounded-2xl focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 outline-none transition-all text-white placeholder-neutral-500"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* WhatsApp da Loja */}
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-neutral-300 ml-1">WhatsApp da Loja (com DDD)</label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 font-bold">+55</span>
                                <input
                                    type="text"
                                    required
                                    value={formData.whatsapp}
                                    onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value.replace(/\D/g, '') })}
                                    placeholder="11999999999"
                                    className="w-full pl-14 pr-4 py-4 bg-neutral-900/50 border border-neutral-700 rounded-2xl focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 outline-none transition-all text-white placeholder-neutral-500"
                                />
                            </div>
                        </div>

                        {/* Nome da Loja */}
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-neutral-300 ml-1">Nome da sua Empresa/Loja</label>
                            <div className="relative">
                                <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500" size={20} />
                                <input
                                    type="text"
                                    required
                                    value={formData.storeName}
                                    onChange={(e) => handleStoreNameChange(e.target.value)}
                                    placeholder="Ex: Padaria do João"
                                    className="w-full pl-12 pr-4 py-4 bg-neutral-900/50 border border-neutral-700 rounded-2xl focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 outline-none transition-all text-white placeholder-neutral-500"
                                />
                            </div>
                        </div>

                        {/* Slug e Nicho */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-neutral-300 ml-1">Identificador (URL)</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.slug}
                                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                                    placeholder="padaria-do-joao"
                                    className="w-full px-4 py-4 bg-neutral-900/50 border border-neutral-700 rounded-2xl focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 outline-none transition-all text-white placeholder-neutral-500 font-mono text-sm"
                                />
                                <p className="text-xs text-neutral-500 ml-1">Será seu link: <span className="text-amber-500">{formData.slug}.cliquepdv.com.br</span></p>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-neutral-300 ml-1">Tipo de Negócio</label>
                                <select
                                    value={formData.niche}
                                    onChange={(e) => setFormData({ ...formData, niche: e.target.value as any })}
                                    className="w-full px-4 py-4 bg-neutral-900/50 border border-neutral-700 rounded-2xl focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 outline-none transition-all text-white"
                                >
                                    <option value="bakery">Padaria</option>
                                    <option value="snack_bar">Lanchonete</option>
                                    <option value="confectionery">Confeitaria</option>
                                    <option value="restaurant">Restaurante</option>
                                    <option value="pizzeria">Pizzaria</option>
                                    <option value="other">Outro</option>
                                </select>
                            </div>
                        </div>

                        {/* Error Message */}
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3 text-red-400 text-sm"
                            >
                                <AlertCircle size={20} className="shrink-0" />
                                {error}
                            </motion.div>
                        )}

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 bg-amber-600 hover:bg-amber-700 text-white rounded-2xl font-black text-lg transition-all shadow-xl shadow-amber-600/20 flex items-center justify-center gap-3 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="animate-spin" size={24} />
                                    Criando sua conta...
                                </>
                            ) : (
                                <>
                                    Criar Minha Conta Grátis
                                    <ArrowRight size={20} />
                                </>
                            )}
                        </button>

                        {/* Benefits */}
                        <div className="pt-6 border-t border-neutral-700/50">
                            <p className="text-neutral-400 text-sm text-center mb-4">O que você ganha:</p>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                                <div className="flex items-center gap-2 text-neutral-300">
                                    <CheckCircle2 size={16} className="text-green-500 shrink-0" />
                                    <span>60 dias grátis</span>
                                </div>
                                <div className="flex items-center gap-2 text-neutral-300">
                                    <CheckCircle2 size={16} className="text-green-500 shrink-0" />
                                    <span>Sem cartão de crédito</span>
                                </div>
                                <div className="flex items-center gap-2 text-neutral-300">
                                    <CheckCircle2 size={16} className="text-green-500 shrink-0" />
                                    <span>Suporte completo</span>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>

                {/* Login Link */}
                <p className="text-center mt-8 text-neutral-400 text-sm">
                    Já tem uma conta?{' '}
                    <button
                        onClick={() => navigate('/login')}
                        className="text-amber-500 font-bold hover:underline"
                    >
                        Faça login
                    </button>
                </p>
            </motion.div>
        </div>
    );
};

export default Signup;
