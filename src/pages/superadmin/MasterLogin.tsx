import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import {
    ShieldAlert,
    Loader2,
    AlertCircle,
    ChevronRight,
    SearchCode,
    Terminal
} from 'lucide-react';

const MasterLogin = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    const handleMasterLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            // 1. Authenticate
            const { error: signInError } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (signInError) throw signInError;

            // 2. Check Role Strictness (Using RPC to bypass RLS issues)
            const { data: roleData, error: rpcError } = await supabase.rpc('get_current_user_role');

            if (rpcError) {
                console.error('RPC Error:', rpcError);
                throw new Error('Erro ao validar credenciais Master via sistema seguro.');
            }

            console.log('[MasterLogin] Role Check:', roleData);

            if (roleData?.role !== 'superadmin') {
                await supabase.auth.signOut(); // Kick them out immediately
                throw new Error('ACESSO NEGADO: Esta conta não possui privilégios Master. (' + (roleData?.role || 'null') + ')');
            }

            // 3. Success
            navigate('/superadmin');

        } catch (err: any) {
            console.error(err);
            setError(err.message || 'Falha na autenticação Master.');
            // Ensure session is cleared if failed check
            await supabase.auth.signOut().catch(() => { });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center p-6 relative overflow-hidden font-mono">
            {/* Dark & Tech Background */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-neutral-900 via-neutral-950 to-black"></div>
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-900 via-red-600 to-red-900 opacity-50"></div>

            <div className="w-full max-w-sm relative z-10">
                <div className="text-center mb-10 space-y-4">
                    <div className="inline-flex items-center justify-center w-24 h-24 bg-red-500/5 rounded-full border border-red-500/20 text-red-500 mb-4 shadow-lg shadow-red-900/20 animate-pulse">
                        <Terminal size={48} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black text-white uppercase tracking-[0.2em] glitch-effect">
                            Acesso Master
                        </h1>
                        <p className="text-red-500/60 text-xs uppercase tracking-widest mt-2 border-t border-red-900/30 pt-2 inline-block">
                            Somente Pessoal Autorizado
                        </p>
                    </div>
                </div>

                <div className="bg-neutral-900/50 backdrop-blur-sm p-8 rounded-xl border border-red-900/30 shadow-2xl">
                    <form onSubmit={handleMasterLogin} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest ml-1">ID do Operador</label>
                            <div className="relative group">
                                <SearchCode className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-600 group-focus-within:text-red-500 transition-colors" size={18} />
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full pl-12 pr-4 py-3 bg-black/50 border border-neutral-800 rounded-lg focus:border-red-600/50 focus:ring-1 focus:ring-red-600/50 outline-none transition-all text-neutral-300 placeholder:text-neutral-800 text-sm font-mono"
                                    placeholder="root@cliquepdv.com"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest ml-1">Chave de Acesso</label>
                            <div className="relative group">
                                <ShieldAlert className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-600 group-focus-within:text-red-500 transition-colors" size={18} />
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-12 pr-4 py-3 bg-black/50 border border-neutral-800 rounded-lg focus:border-red-600/50 focus:ring-1 focus:ring-red-600/50 outline-none transition-all text-neutral-300 placeholder:text-neutral-800 text-sm font-mono"
                                    placeholder="••••••••••••"
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="p-3 bg-red-950/30 border border-red-900/50 rounded-lg flex items-start gap-3 text-red-400 text-xs font-mono">
                                <AlertCircle size={16} className="shrink-0 mt-0.5" />
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 bg-red-700 hover:bg-red-600 text-white rounded-lg font-bold text-xs uppercase tracking-[0.2em] transition-all shadow-lg shadow-red-900/20 flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed group"
                        >
                            {loading ? (
                                <Loader2 className="animate-spin" size={16} />
                            ) : (
                                <>
                                    Autenticar
                                    <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>
                </div>

                <div className="text-center mt-8">
                    <p className="text-[10px] text-neutral-700 uppercase tracking-widest">
                        Sistema Clique PDV &copy; 2024
                    </p>
                </div>
            </div>
        </div>
    );
};

export default MasterLogin;
