import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    Package,
    Users,
    ShoppingCart,
    Settings,
    Menu,
    X,
    LogOut,
    BarChart3,
    ShieldAlert,
    Eye,
    Tag,
    ShoppingBag
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useSettings } from '../../hooks/useSettings';
import { useAuth } from '../../context/AuthContext';
import { useTenant } from '../../context/TenantContext';

const AdminLayout = () => {
    const location = useLocation();
    const { signOut, profile } = useAuth();
    const { data: settings } = useSettings();
    const { tenant } = useTenant();
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    useEffect(() => {
        const title = tenant?.name || settings?.bakery_name || 'Loja';
        document.title = `${title} | CliquePDV`;
    }, [tenant?.name, settings?.bakery_name]);

    const menuItems = [
        { path: '/admin', icon: LayoutDashboard, label: 'Dashboard', permission: 'dashboard' },
        { path: '/admin/products', icon: Package, label: 'Produtos', permission: 'products' },
        { path: '/admin/categories', icon: Tag, label: 'Categorias', permission: 'categories' },
        { path: '/admin/clients', icon: Users, label: 'Clientes', permission: 'clients' },
        { path: '/admin/pdv', icon: ShoppingCart, label: 'PDV', permission: 'pdv' },
        { path: '/admin/sales', icon: ShoppingBag, label: 'Vendas', permission: 'sales' },
        { path: '/admin/reports', icon: BarChart3, label: 'Relatórios', permission: 'reports' },
        { path: '/admin/settings', icon: Settings, label: 'Configurações', permission: 'settings' },
    ];

    const filteredMenuItems = menuItems.filter(item => {
        // Se for superadmin, vê tudo
        if (profile?.role === 'superadmin') return true;

        // Regra 1: Helper para garantir que perms seja um array seguro
        let perms: string[] = [];
        if (Array.isArray(profile?.permissions)) {
            perms = profile.permissions;
        } else if (typeof profile?.permissions === 'string') {
            try {
                perms = JSON.parse(profile.permissions);
                if (!Array.isArray(perms)) perms = [];
            } catch (e) {
                console.warn('Invalid permissions format', profile?.permissions);
            }
        }

        // Regra 2: Se tem permissão explícita de admin (read_all)
        if (perms.includes('read_all')) return true;

        // Regra 3: Fallbacks Históricos. Se o usuário for admin, mas o banco
        // de dados retornou [] (por causa de null no Postgres), ele ainda deve ver a loja.
        if (profile?.role === 'admin' || profile?.role === 'owner') {
            return true;
        }

        // Regra 4: Se tem permissão específica
        if (perms.includes(item.permission)) return true;

        // Regra 5: Restrições de Caixa (Cashier)
        if (profile?.role === 'cashier') {
            // Caixa sempre vê PDV e Vendas. Adicionamos Dashboard para não ficar página vazia.
            return ['dashboard', 'pdv', 'sales'].includes(item.permission);
        }

        return false;
    });


    return (
        <div className="flex h-screen bg-neutral-100 font-sans text-neutral-900">
            <style dangerouslySetInnerHTML={{
                __html: `
                :root {
                    --admin-primary: ${settings?.brand_primary_color || '#f59e0b'};
                    --admin-primary-10: ${settings?.brand_primary_color ? settings?.brand_primary_color + '1a' : '#f59e0b1a'};
                }
                .text-brand-primary { color: var(--admin-primary) !important; }
                .bg-brand-primary { background-color: var(--admin-primary) !important; }
                .border-brand-primary { border-color: var(--admin-primary) !important; }
                .bg-brand-primary-light { background-color: var(--admin-primary-10) !important; }
                .tab-active { 
                    color: var(--admin-primary) !important; 
                    border-color: var(--admin-primary) !important; 
                    background-color: var(--admin-primary-10) !important;
                }
                ::-webkit-scrollbar {
                    width: 8px;
                }
                ::-webkit-scrollbar-track {
                    background: #f1f1f1;
                }
                ::-webkit-scrollbar-thumb {
                    background: var(--admin-primary);
                    border-radius: 10px;
                }
                ::-webkit-scrollbar-thumb:hover {
                    filter: brightness(0.9);
                }
            `}} />
            {/* Sidebar */}
            <aside
                className={cn(
                    "bg-black text-white transition-all duration-300 ease-in-out flex flex-col fixed md:relative z-20 h-full",
                    isSidebarOpen ? "w-64" : "w-20"
                )}
            >
                <div className="p-4 flex items-center justify-between border-b border-neutral-800">
                    <h1 className={cn("font-serif font-bold text-brand-primary truncate", !isSidebarOpen && "hidden")}>
                        {tenant?.name || settings?.bakery_name || 'Clique PDV'}
                    </h1>
                    <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-1 hover:bg-neutral-800 rounded">
                        {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
                    </button>
                </div>

                <nav className="flex-1 p-4 space-y-2">
                    {filteredMenuItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.path;
                        const isSettings = item.permission === 'settings';

                        // Preserva tenant_override se estiver gerenciando uma loja
                        const searchParams = new URLSearchParams(location.search);
                        const tenantOverride = searchParams.get('tenant_override');
                        const linkPath = tenantOverride ? `${item.path}?tenant_override=${tenantOverride}` : item.path;

                        return (
                            <Link
                                key={item.path}
                                to={linkPath}
                                className={cn(
                                    "flex items-center gap-3 p-3 rounded-xl transition-all hover:bg-neutral-800 group relative",
                                    isActive ? "bg-brand-primary text-white hover:opacity-90 shadow-lg shadow-brand-primary/20" : "text-neutral-400 hover:text-white",
                                    isSettings && !isActive && "border border-brand-primary/30 bg-brand-primary/5"
                                )}
                            >
                                <Icon size={20} className={cn("min-w-[20px]", isActive ? "text-white" : "text-neutral-400 group-hover:text-white")} />
                                {isSidebarOpen && (
                                    <div className="flex-1 flex items-center justify-between">
                                        <span>{item.label}</span>
                                        {isSettings && (
                                            <span className="text-[10px] bg-brand-primary/20 text-brand-primary px-2 py-0.5 rounded-lg font-black uppercase tracking-tighter">
                                                Sistema
                                            </span>
                                        )}
                                    </div>
                                )}
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-neutral-800 space-y-2">
                    <a
                        href={(() => {
                            if (tenant?.slug) {
                                return `/?tenant_override=${tenant.slug}`;
                            }
                            const searchParams = new URLSearchParams(location.search);
                            const tenantOverride = searchParams.get('tenant_override');
                            return tenantOverride ? `/?tenant_override=${tenantOverride}` : '/';
                        })()}
                        target="_blank"
                        className="flex items-center gap-3 w-full p-3 rounded-xl hover:bg-neutral-800 text-neutral-400 hover:text-white transition-all font-bold"
                    >
                        <Eye size={20} />
                        {isSidebarOpen && <span>Visualizar Loja</span>}
                    </a>
                    {(profile?.role === 'superadmin') && (
                        <Link
                            to="/superadmin"
                            className="flex items-center gap-3 w-full p-3 rounded-xl bg-brand-primary text-white shadow-lg shadow-brand-primary/20 transition-all font-black text-xs uppercase tracking-widest border border-brand-primary/40"
                        >
                            <ShieldAlert size={20} />
                            {isSidebarOpen && <span>Acessar Painel Master</span>}
                        </Link>
                    )}
                    <button
                        onClick={() => signOut()}
                        className="flex items-center gap-3 w-full p-3 rounded-xl hover:bg-neutral-800 text-red-400 transition-all font-bold"
                    >
                        <LogOut size={20} />
                        {isSidebarOpen && <span>Sair do Sistema</span>}
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-auto">
                <header className="bg-white border-b p-4 flex justify-between items-center sticky top-0 z-10 shadow-sm">
                    <h2 className="text-xl font-bold text-neutral-800">
                        {menuItems.find(i => location.pathname === i.path)?.label || 'Painel'}
                    </h2>
                    <div className="flex items-center gap-4">
                        <div className="w-8 h-8 rounded-full bg-brand-primary-light flex items-center justify-center text-brand-primary font-bold border border-brand-primary/20">
                            {profile?.name?.charAt(0) || 'A'}
                        </div>
                    </div>
                </header>

                <div className="p-6">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default AdminLayout;
