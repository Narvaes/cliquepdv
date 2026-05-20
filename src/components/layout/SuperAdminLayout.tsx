import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    Globe,
    CreditCard,
    Users,
    Settings,
    Menu,
    X,
    LogOut,
    ShieldCheck,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useAuth } from '../../context/AuthContext';

const SuperAdminLayout = () => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const location = useLocation();
    const { signOut } = useAuth();

    useEffect(() => { setIsMobileMenuOpen(false); }, [location.pathname]);
    useEffect(() => { document.title = "CliquePDV | Painel Master"; }, []);

    const menuItems = [
        { icon: LayoutDashboard, label: 'Visão Geral', path: '/superadmin' },
        { icon: Globe, label: 'Gerenciar Tenants', path: '/superadmin/tenants' },
        { icon: CreditCard, label: 'Assinaturas', path: '/superadmin/subscriptions' },
        { icon: Users, label: 'Administradores', path: '/superadmin/admins' },
        { icon: Settings, label: 'Configurações Globais', path: '/superadmin/settings' },
    ];

    return (
        <div className="flex h-screen bg-neutral-900 font-sans text-neutral-100 overflow-hidden">

            {/* ── Desktop Sidebar (md+) ── */}
            <aside className="hidden md:flex w-64 flex-col flex-shrink-0 bg-black border-r border-neutral-800 h-full">
                {/* Logo */}
                <div className="p-6 flex items-center gap-3 border-b border-neutral-800 bg-neutral-900/50 flex-shrink-0">
                    <ShieldCheck className="text-indigo-500 flex-shrink-0" size={24} />
                    <span className="font-black tracking-tighter text-xl uppercase italic text-white">Clique PDV</span>
                </div>
                {/* Nav */}
                <div className="flex-1 px-4 py-6 overflow-y-auto">
                    <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-[4px] mb-4 px-4">PLATAFORMA</p>
                    <nav className="space-y-2">
                        {menuItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = location.pathname === item.path;
                            return (
                                <Link key={item.path} to={item.path}
                                    className={cn("flex items-center gap-3 p-3 rounded-2xl transition-all group",
                                        isActive ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20" : "text-neutral-400 hover:bg-neutral-800 hover:text-white"
                                    )}>
                                    <Icon size={20} className={cn("min-w-[20px]", isActive ? "text-white" : "group-hover:text-white")} />
                                    <span className="font-bold text-sm">{item.label}</span>
                                </Link>
                            );
                        })}
                    </nav>
                </div>
                {/* Footer */}
                <div className="flex-shrink-0 p-4 border-t border-neutral-800 bg-neutral-900/30">
                    <button onClick={() => signOut()}
                        className="flex items-center gap-3 w-full p-3 rounded-2xl hover:bg-red-500/10 text-neutral-500 hover:text-red-400 transition-all font-bold text-xs uppercase tracking-widest">
                        <LogOut size={18} />
                        <span>Sair do Painel Master</span>
                    </button>
                    <div className="mt-3 px-4 py-3 bg-neutral-800/50 rounded-xl border border-neutral-700">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-black text-xs ring-2 ring-indigo-500/30">SA</div>
                            <div className="truncate">
                                <p className="text-xs font-bold text-white leading-none">Super Admin</p>
                                <p className="text-[10px] text-neutral-500 mt-1 uppercase tracking-tighter">Acesso Total</p>
                            </div>
                        </div>
                    </div>
                </div>
            </aside>

            {/* ── Mobile Drawer Overlay ── */}
            {isMobileMenuOpen && (
                <div className="fixed inset-0 z-40 md:hidden flex">
                    <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)} />
                    <div className="relative w-72 max-w-[85vw] bg-black border-r border-neutral-800 flex flex-col h-full z-50 animate-in slide-in-from-left duration-300">
                        {/* Logo + Close */}
                        <div className="p-6 flex items-center justify-between border-b border-neutral-800 bg-neutral-900/50 flex-shrink-0">
                            <div className="flex items-center gap-3">
                                <ShieldCheck className="text-indigo-500" size={22} />
                                <span className="font-black tracking-tighter text-lg uppercase italic text-white">Clique PDV</span>
                            </div>
                            <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 hover:bg-neutral-800 rounded-xl transition-colors text-neutral-400">
                                <X size={20} />
                            </button>
                        </div>
                        {/* Nav */}
                        <div className="flex-1 px-4 py-6 overflow-y-auto">
                            <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-[4px] mb-4 px-4">PLATAFORMA</p>
                            <nav className="space-y-2">
                                {menuItems.map((item) => {
                                    const Icon = item.icon;
                                    const isActive = location.pathname === item.path;
                                    return (
                                        <Link key={item.path} to={item.path}
                                            className={cn("flex items-center gap-3 p-3 rounded-2xl transition-all group",
                                                isActive ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20" : "text-neutral-400 hover:bg-neutral-800 hover:text-white"
                                            )}>
                                            <Icon size={20} className={cn("min-w-[20px]", isActive ? "text-white" : "group-hover:text-white")} />
                                            <span className="font-bold text-sm">{item.label}</span>
                                        </Link>
                                    );
                                })}
                            </nav>
                        </div>
                        {/* Footer */}
                        <div className="flex-shrink-0 p-4 border-t border-neutral-800 bg-neutral-900/30">
                            <button onClick={() => signOut()}
                                className="flex items-center gap-3 w-full p-3 rounded-2xl hover:bg-red-500/10 text-neutral-500 hover:text-red-400 transition-all font-bold text-xs uppercase tracking-widest">
                                <LogOut size={18} />
                                <span>Sair do Painel Master</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Scrollbar styles */}
            <style dangerouslySetInnerHTML={{
                __html: `
                .custom-scrollbar::-webkit-scrollbar { height: 6px; width: 6px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: #171717; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #4f46e5; border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #6366f1; }
            `}} />

            {/* ── Main Content ── */}
            <main className="flex-1 flex flex-col h-screen min-w-0 overflow-hidden">
                <header className="flex-shrink-0 bg-neutral-900 border-b border-neutral-800 px-4 md:px-6 py-4 flex items-center gap-4 z-10">
                    {/* Hamburger — mobile only */}
                    <button className="md:hidden p-2 rounded-xl hover:bg-neutral-800 transition-colors text-neutral-400 flex-shrink-0"
                        onClick={() => setIsMobileMenuOpen(true)}>
                        <Menu size={22} />
                    </button>
                    <div className="flex-1 min-w-0">
                        <h2 className="text-lg md:text-2xl font-black text-white uppercase tracking-tight truncate leading-none">
                            {menuItems.find(i => i.path === location.pathname)?.label || 'Painel Master'}
                        </h2>
                        <p className="text-[10px] text-neutral-500 mt-0.5 uppercase tracking-[3px] font-bold hidden sm:block">Gerenciamento Centralizado</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-neutral-800 rounded-2xl border border-neutral-700">
                            <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-lg shadow-green-500/50 animate-pulse" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400 hidden sm:inline">Online</span>
                        </div>
                    </div>
                </header>
                <div className="flex-1 overflow-y-auto p-4 md:p-8 w-full">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default SuperAdminLayout;