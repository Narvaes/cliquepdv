import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Loader2, ShieldX } from 'lucide-react';

export const SuperAdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { session, profile, loading, signOut } = useAuth();
    const location = useLocation();

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-neutral-900 text-white gap-4">
                <Loader2 className="animate-spin text-amber-500" size={40} />
                <p className="text-neutral-400 font-medium">Autenticando Super Admin...</p>
            </div>
        );
    }

    if (!session) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (profile?.role !== 'superadmin') {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-neutral-900 p-6 text-center text-white">
                <div className="w-20 h-20 bg-red-500/10 rounded-3xl flex items-center justify-center text-red-500 mb-6 font-bold uppercase tracking-widest border border-red-500/20">
                    <ShieldX size={40} />
                </div>
                <h1 className="text-2xl font-black mb-2">Acesso Restrito</h1>
                <p className="text-neutral-400 max-w-sm mb-4 italic">
                    Esta área é exclusiva para administradores da plataforma **Clique PDV**.
                </p>
                <div className="bg-neutral-800 p-4 rounded-2xl mb-8 border border-neutral-700 text-left">
                    <p className="text-[10px] uppercase tracking-widest text-neutral-500 mb-1 font-black">Diagnóstico da Sessão:</p>
                    <p className="text-sm font-mono text-amber-500">{session?.user?.email || 'Não autenticado'}</p>
                    <p className="text-xs text-neutral-400 mt-1">Cargo no banco: <span className="text-white font-bold">{profile?.role || 'Nenhum'}</span></p>
                    <p className="text-xs text-neutral-500 mt-2 italic">Super Admins não precisam de vínculo com lojas.</p>
                </div>
                <div className="flex gap-4">
                    <button
                        onClick={() => {
                            // Tenta encontrar o tenant no banco se o perfil tiver tenant_id
                            if (profile?.tenant_id) {
                                window.location.href = `/admin`;
                            } else {
                                window.location.href = '/admin';
                            }
                        }}
                        className="px-8 py-3 bg-neutral-800 text-white rounded-2xl font-bold hover:bg-neutral-700 transition-all font-sans text-sm"
                    >
                        Voltar ao Painel da Loja
                    </button>
                    <button
                        onClick={async () => {
                            await signOut();
                            window.location.href = '/login';
                        }}
                        className="px-8 py-3 bg-red-600 text-white rounded-2xl font-bold hover:bg-red-700 transition-all font-sans text-sm"
                    >
                        Sair e Logar Novamente
                    </button>
                </div>
            </div>
        );
    }

    return <>{children}</>;
};
