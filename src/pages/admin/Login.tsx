import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import {
    Lock,
    Mail,
    Loader2,
    AlertCircle,
    ChevronRight,
    ShieldCheck
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { user, profile, loading: authLoading } = useAuth();
    const navigate = useNavigate();

    // Auto-login redirection (if session exists, e.g. from email confirmation link)
    useEffect(() => {
        if (!authLoading && user && profile) {
            console.log('[Login] 🔄 User already authenticated. Auto-redirecting...');
            handleAutoRedirect(profile);
        }
    }, [user, profile, authLoading, navigate]);

    const handleAutoRedirect = async (userProfile: any) => {
        if (userProfile.role === 'superadmin') {
            navigate('/superadmin');
            return;
        }

        if (userProfile.tenant_slug) {
            window.location.href = `/admin?tenant_override=${userProfile.tenant_slug}`;
        } else {
            navigate('/admin');
        }
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) throw error;

            const { data: { user } } = await supabase.auth.getUser();
            let { data: profile, error: profileError } = await supabase
                .from('profiles')
                .select('role, tenant_id')
                .eq('id', user?.id)
                .single();

            // FALLBACK: Use secure RPC just like AuthContext does
            if (profileError || !profile || !profile.role) {
                console.warn('[Login] Standard profile fetch failed, trying secure RPC fallback...');
                const { data: rpcData, error: rpcError } = await supabase.rpc('get_current_user_role');
                if (!rpcError && rpcData && rpcData.role !== 'none') {
                    profile = {
                        role: rpcData.role,
                        tenant_id: rpcData.tenant_id
                    };
                }
            }

            if (profile?.role === 'superadmin') {
                console.log('[Login] 🚀 Super Admin detected, redirecting to /superadmin');
                navigate('/superadmin');
            } else {
                console.log('[Login] 👤 Standard user detected, redirecting to admin panel...');
                navigate('/admin');
            }
        } catch (err: any) {
            setError(err.message || 'Erro ao realizar login');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-neutral-50 flex flex-col items-center justify-center p-6 relative overflow-hidden">
            {/* Decorative Orbs */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-brand-primary/20 rounded-full blur-[120px]"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-200/20 rounded-full blur-[120px]"></div>

            <div className="w-full max-w-md relative z-10">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-3xl shadow-xl border border-neutral-100 mb-6 text-brand-primary">
                        <ShieldCheck size={40} />
                    </div>
                    <h1 className="text-3xl font-black text-neutral-900">Painel Administrativo</h1>
                    <p className="text-neutral-500 mt-2">Acesse seu painel de gerenciamento</p>
                </div>

                <div className="bg-white p-8 md:p-10 rounded-[2.5rem] shadow-2xl shadow-neutral-200/50 border border-neutral-100">
                    <form onSubmit={handleLogin} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-neutral-700 ml-1">E-mail</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" size={20} />
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="seu@email.com"
                                    className="w-full pl-12 pr-4 py-4 bg-neutral-50 border border-neutral-200 rounded-2xl focus:ring-4 focus:ring-brand-primary/10 focus:border-brand-primary outline-none transition-all font-medium text-neutral-900"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-neutral-700 ml-1">Senha</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" size={20} />
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full pl-12 pr-4 py-4 bg-neutral-50 border border-neutral-200 rounded-2xl focus:ring-4 focus:ring-brand-primary/10 focus:border-brand-primary outline-none transition-all font-medium text-neutral-900"
                                />
                            </div>
                            <div className="flex justify-end pt-2">
                                <button
                                    type="button"
                                    onClick={() => navigate('/forgot-password')}
                                    className="text-sm font-bold text-neutral-500 hover:text-brand-primary transition-colors"
                                >
                                    Esqueci minha senha
                                </button>
                            </div>
                        </div>

                        {error && (
                            <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600 text-sm font-bold animate-shake">
                                <AlertCircle size={20} className="shrink-0" />
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 bg-neutral-900 hover:bg-black text-white rounded-2xl font-black text-lg transition-all shadow-xl shadow-neutral-900/20 flex items-center justify-center gap-3 active:scale-[0.98] disabled:opacity-50"
                        >
                            {loading ? (
                                <Loader2 className="animate-spin" size={24} />
                            ) : (
                                <>
                                    Entrar no Painel
                                    <ChevronRight size={20} />
                                </>
                            )}
                        </button>
                    </form>
                </div>

                <p className="text-center mt-8 text-neutral-400 text-sm">
                    Não tem uma conta?{' '}
                    <button
                        onClick={() => navigate('/signup')}
                        className="text-brand-primary font-bold hover:underline"
                    >
                        Cadastre-se grátis
                    </button>
                </p>
            </div>
        </div>
    );
};

export default Login;
