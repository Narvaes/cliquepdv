import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import {
    Users,
    Building2,
    TrendingUp,
    AlertCircle,
    Calendar,
    Globe,
    CheckCircle2,
    Clock,
    BarChart
} from 'lucide-react';
import {
    BarChart as ReBarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell,
    PieChart,
    Pie
} from 'recharts';

const SuperAdminDashboard = () => {
    // 1. Fetch Tenants Stats
    const { data: tenants, isLoading } = useQuery({
        queryKey: ['superadmin-tenants'],
        queryFn: async () => {
            const { data, error } = await supabase.rpc('get_admin_tenants_list');
            if (error) throw error;
            return data;
        }
    });

    if (isLoading) {
        return <div className="animate-pulse space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map(i => <div key={i} className="h-32 bg-neutral-800 rounded-3xl" />)}
            </div>
            <div className="h-96 bg-neutral-800 rounded-3xl" />
        </div>;
    }

    const totalTenants = tenants?.length || 0;
    const activeTenants = tenants?.filter(t => t.status === 'active').length || 0;
    const trialTenants = tenants?.filter(t => t.subscription_status === 'trial').length || 0;
    const nicheDistribution = tenants?.reduce((acc: any, t) => {
        acc[t.niche] = (acc[t.niche] || 0) + 1;
        return acc;
    }, {});

    const chartData = Object.entries(nicheDistribution || {}).map(([name, value]) => ({ name, value }));
    const COLORS = ['#4F46E5', '#10B981', '#3B82F6', '#8B5CF6'];

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
                <div className="bg-neutral-800/50 p-4 md:p-6 rounded-2xl md:rounded-3xl border border-neutral-700/50 flex flex-col justify-between">
                    <div className="w-9 h-9 md:w-12 md:h-12 bg-indigo-500/10 rounded-xl md:rounded-2xl flex items-center justify-center text-indigo-500 mb-3 md:mb-4">
                        <Building2 size={18} />
                    </div>
                    <div>
                        <p className="text-neutral-500 text-[10px] font-bold uppercase tracking-widest">Total de Lojas</p>
                        <h3 className="text-3xl md:text-4xl font-black text-white mt-1">{totalTenants}</h3>
                    </div>
                </div>

                <div className="bg-neutral-800/50 p-4 md:p-6 rounded-2xl md:rounded-3xl border border-neutral-700/50 flex flex-col justify-between">
                    <div className="w-9 h-9 md:w-12 md:h-12 bg-green-500/10 rounded-xl md:rounded-2xl flex items-center justify-center text-green-500 mb-3 md:mb-4">
                        <CheckCircle2 size={18} />
                    </div>
                    <div>
                        <p className="text-neutral-500 text-[10px] font-bold uppercase tracking-widest">Lojas Ativas</p>
                        <h3 className="text-3xl md:text-4xl font-black text-white mt-1">{activeTenants}</h3>
                    </div>
                </div>

                <div className="bg-neutral-800/50 p-4 md:p-6 rounded-2xl md:rounded-3xl border border-neutral-700/50 flex flex-col justify-between">
                    <div className="w-9 h-9 md:w-12 md:h-12 bg-blue-500/10 rounded-xl md:rounded-2xl flex items-center justify-center text-blue-500 mb-3 md:mb-4">
                        <Clock size={18} />
                    </div>
                    <div>
                        <p className="text-neutral-500 text-[10px] font-bold uppercase tracking-widest">Em Teste</p>
                        <h3 className="text-3xl md:text-4xl font-black text-white mt-1">{trialTenants}</h3>
                    </div>
                </div>

                <div className="bg-neutral-800/50 p-4 md:p-6 rounded-2xl md:rounded-3xl border border-neutral-700/50 flex flex-col justify-between">
                    <div className="w-9 h-9 md:w-12 md:h-12 bg-red-500/10 rounded-xl md:rounded-2xl flex items-center justify-center text-red-500 mb-3 md:mb-4">
                        <AlertCircle size={18} />
                    </div>
                    <div>
                        <p className="text-neutral-500 text-[10px] font-bold uppercase tracking-widest">Suspensas</p>
                        <h3 className="text-3xl md:text-4xl font-black text-white mt-1">{totalTenants - activeTenants}</h3>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Niche Distribution Chart */}
                <div className="lg:col-span-2 bg-neutral-800/30 p-8 rounded-3xl border border-neutral-800">
                    <h3 className="text-xl font-black text-white mb-8 border-l-4 border-indigo-500 pl-4 uppercase tracking-tighter italic">
                        Distribuição por Nicho
                    </h3>
                    <div className="h-[300px] w-full">
                        {chartData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <ReBarChart data={chartData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
                                    <XAxis dataKey="name" stroke="#525252" fontSize={12} tickLine={false} />
                                    <YAxis stroke="#525252" fontSize={12} tickLine={false} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#171717', border: '1px solid #404040', borderRadius: '12px' }}
                                        itemStyle={{ color: '#fff' }}
                                    />
                                    <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                                        {chartData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Bar>
                                </ReBarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex items-center justify-center h-full text-neutral-600 text-sm italic">
                                Sem dados suficientes para exibir o gráfico.
                            </div>
                        )}
                    </div>
                </div>

                {/* Recent Tenants */}
                <div className="bg-neutral-800/30 p-8 rounded-3xl border border-neutral-800">
                    <h3 className="text-xl font-black text-white mb-6 border-l-4 border-indigo-500 pl-4 uppercase tracking-tighter italic">
                        Novos Clientes
                    </h3>
                    <div className="space-y-6">
                        {tenants?.slice(0, 5).map(tenant => (
                            <div key={tenant.id} className="flex items-center gap-4 group cursor-pointer p-2 hover:bg-neutral-800 rounded-2xl transition-all">
                                <div className="w-12 h-12 bg-neutral-900 rounded-xl flex items-center justify-center text-neutral-500 group-hover:bg-indigo-500 group-hover:text-white transition-all">
                                    <Globe size={20} />
                                </div>
                                <div className="flex-1 truncate">
                                    <p className="text-sm font-bold text-white leading-none">{tenant.name}</p>
                                    <p className="text-[10px] text-neutral-500 mt-1 uppercase tracking-tight">{tenant.slug}.cliquepdv.com.br</p>
                                </div>
                                <div className="text-right">
                                    <span className={`text-[8px] font-black uppercase px-2 py-1 rounded-full ${tenant.status === 'active' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'
                                        }`}>
                                        {tenant.status}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SuperAdminDashboard;
