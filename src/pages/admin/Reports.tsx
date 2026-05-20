import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell,
    PieChart,
    Pie,
    LineChart,
    Line
} from 'recharts';
import { format, startOfMonth, endOfMonth, subMonths, eachDayOfInterval, isSameDay, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfYear, endOfYear } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
    TrendingUp,
    TrendingDown,
    DollarSign,
    ShoppingBag,
    Filter,
    Calendar,
    ArrowLeft,
    Loader2,
    Download,
    Users
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useAuth } from '../../context/AuthContext';
import { useTenant } from '../../context/TenantContext';

const Reports = () => {
    const { profile } = useAuth();
    const { tenant } = useTenant();
    const [dateRange, setDateRange] = useState('month'); // today, week, month, year

    const { data: reportData, isLoading } = useQuery({
        queryKey: ['financial-reports', dateRange, tenant?.id],
        enabled: !!tenant?.id,
        queryFn: async () => {
            let start = startOfMonth(new Date()).toISOString();
            let end = endOfMonth(new Date()).toISOString();

            if (dateRange === 'today') {
                start = startOfDay(new Date()).toISOString();
                end = endOfDay(new Date()).toISOString();
            } else if (dateRange === 'week') {
                start = startOfWeek(new Date(), { weekStartsOn: 1 }).toISOString();
                end = endOfWeek(new Date(), { weekStartsOn: 1 }).toISOString();
            } else if (dateRange === 'year') {
                start = startOfYear(new Date()).toISOString();
                end = endOfYear(new Date()).toISOString();
            }

            // Fetch Sales
            const { data: sales, error: salesError } = await supabase
                .from('sales')
                .select(`
                    *,
                    clients (name),
                    sale_items (
                        *,
                        products (name)
                    )
                `)
                .eq('tenant_id', tenant?.id)
                .gte('created_at', start)
                .lte('created_at', end);

            if (salesError) {
                // Fallback if client join fails (column might not exist yet)
                const { data: salesFallback, error: fallbackError } = await supabase
                    .from('sales')
                    .select('*, sale_items(*, products(*))')
                    .eq('tenant_id', tenant?.id)
                    .gte('created_at', start)
                    .lte('created_at', end);
                if (fallbackError) throw fallbackError;
                return processReportData(salesFallback, start, end);
            }

            return processReportData(sales, start, end);
        }
    });

    const processReportData = (sales: any[], start: string, end: string) => {
        // Process Stats
        const totalRevenue = sales.reduce((acc, sale) => acc + sale.total_amount, 0);
        const totalOrders = sales.length;
        const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

        // Process Daily/Monthly Sales for Line Chart
        let days = eachDayOfInterval({
            start: new Date(start),
            end: new Date(end)
        });

        // Limit chart points if range is too large (like year)
        const dailyData = days.map(day => {
            const amount = sales
                .filter(sale => isSameDay(new Date(sale.created_at), day))
                .reduce((acc, sale) => acc + sale.total_amount, 0);
            return {
                name: format(day, dateRange === 'year' ? 'MMM' : 'dd', { locale: ptBR }),
                total: amount
            };
        });

        // Process Payment Methods for Pie Chart
        const paymentMethods = sales.reduce((acc: any, sale) => {
            acc[sale.payment_method] = (acc[sale.payment_method] || 0) + sale.total_amount;
            return acc;
        }, {});

        const pieData = Object.entries(paymentMethods).map(([name, value]) => ({
            name: name === 'cash' ? 'Dinheiro' : name === 'card' ? 'Cartão' : name === 'pix' ? 'PIX' : 'Outro',
            value
        }));

        // Top Products
        const productCounts: any = {};
        sales.forEach(sale => {
            sale.sale_items?.forEach((item: any) => {
                const name = item.products?.name || 'Inativo';
                productCounts[name] = (productCounts[name] || 0) + item.quantity;
            });
        });

        const topProducts = Object.entries(productCounts)
            .map(([name, qty]: any) => ({ name, qty }))
            .sort((a, b) => b.qty - a.qty)
            .slice(0, 5);

        // Sales by Client
        const clientSales: any = {};
        sales.forEach(sale => {
            const name = sale.clients?.name || 'Cliente Casual';
            if (!clientSales[name]) {
                clientSales[name] = { name, total: 0, orders: 0 };
            }
            clientSales[name].total += sale.total_amount;
            clientSales[name].orders += 1;
        });

        const topClients = Object.values(clientSales)
            .sort((a: any, b: any) => b.total - a.total)
            .slice(0, 5);

        return {
            totalRevenue,
            totalOrders,
            avgOrderValue,
            dailyData,
            pieData,
            topProducts,
            topClients
        };
    };

    if (isLoading) {
        return (
            <div className="h-full flex flex-col items-center justify-center text-neutral-400 gap-4">
                <Loader2 className="animate-spin text-brand-primary" size={40} />
                <p>Gerando relatórios...</p>
            </div>
        );
    }

    const COLORS = ['#F59E0B', '#3B82F6', '#8B5CF6', '#10B981'];

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex bg-neutral-100 p-1.5 rounded-2xl w-fit">
                    {[
                        { id: 'today', label: 'Hoje' },
                        { id: 'week', label: 'Semana' },
                        { id: 'month', label: 'Mês' },
                        { id: 'year', label: 'Ano' }
                    ].map((period) => (
                        <button
                            key={period.id}
                            onClick={() => setDateRange(period.id)}
                            className={cn(
                                "px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
                                dateRange === period.id
                                    ? "bg-white text-brand-primary shadow-sm"
                                    : "text-neutral-400 hover:text-neutral-600"
                            )}
                        >
                            {period.label}
                        </button>
                    ))}
                </div>
                <div className="flex gap-3">
                    <button className="flex items-center gap-2 px-6 py-2.5 bg-white border border-neutral-200 rounded-xl text-neutral-600 font-bold text-sm hover:bg-neutral-50 transition-all">
                        <Download size={18} /> PDF
                    </button>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-neutral-100">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-green-50 text-green-600 rounded-2xl">
                            <DollarSign size={24} />
                        </div>
                        <div>
                            <p className="text-neutral-500 text-xs font-bold uppercase tracking-wider">Receita Total</p>
                            <h3 className="text-2xl font-black text-neutral-900">R$ {reportData?.totalRevenue.toFixed(2)}</h3>
                        </div>
                    </div>
                    <div className="flex items-center gap-1 text-green-600 text-[10px] font-bold uppercase tracking-widest">
                        Período: {dateRange}
                    </div>
                </div>

                <div className="bg-white p-6 rounded-3xl shadow-sm border border-neutral-100">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
                            <ShoppingBag size={24} />
                        </div>
                        <div>
                            <p className="text-neutral-500 text-xs font-bold uppercase tracking-wider">Total de Pedidos</p>
                            <h3 className="text-2xl font-black text-neutral-900">{reportData?.totalOrders}</h3>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-3xl shadow-sm border border-neutral-100">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-brand-primary-light text-brand-primary rounded-2xl">
                            <TrendingUp size={24} />
                        </div>
                        <div>
                            <p className="text-neutral-500 text-xs font-bold uppercase tracking-wider">Ticket Médio</p>
                            <h3 className="text-2xl font-black text-neutral-900">R$ {reportData?.avgOrderValue.toFixed(2)}</h3>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Sales Chart */}
                <div className="lg:col-span-2 bg-white p-8 rounded-3xl shadow-sm border border-neutral-100 h-[450px] flex flex-col">
                    <h3 className="font-bold text-lg text-neutral-900 mb-8 flex items-center justify-between">
                        Faturamento do Período
                        <span className="text-xs font-bold text-neutral-400 uppercase tracking-widest">Valores em Reais</span>
                    </h3>
                    <div className="flex-1">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={reportData?.dailyData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                                <XAxis
                                    dataKey="name"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#94A3B8', fontSize: 11, fontWeight: 600 }}
                                    dy={10}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#94A3B8', fontSize: 11, fontWeight: 600 }}
                                />
                                <Tooltip
                                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                                    itemStyle={{ fontWeight: 800, color: '#F59E0B' }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="total"
                                    stroke="#F59E0B"
                                    strokeWidth={4}
                                    dot={{ fill: '#F59E0B', strokeWidth: 2, r: 4 }}
                                    activeDot={{ r: 8, strokeWidth: 0 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="space-y-6">
                    {/* Payment Methods Chart */}
                    <div className="bg-white p-8 rounded-3xl shadow-sm border border-neutral-100">
                        <h3 className="font-bold text-lg text-neutral-900 mb-4">Pagamentos</h3>
                        <div className="h-48 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={reportData?.pieData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={50}
                                        outerRadius={70}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {reportData?.pieData.map((_entry: any, index: number) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Top Products */}
                    <div className="bg-white p-8 rounded-3xl shadow-sm border border-neutral-100">
                        <h3 className="font-bold text-lg text-neutral-900 mb-6">Top Produtos</h3>
                        <div className="space-y-4">
                            {reportData?.topProducts.map((p: any, idx: number) => (
                                <div key={idx} className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-neutral-100 rounded-lg flex items-center justify-center font-bold text-neutral-500 text-xs">
                                            {idx + 1}
                                        </div>
                                        <span className="font-bold text-neutral-700 text-sm">{p.name}</span>
                                    </div>
                                    <span className="text-xs font-black text-brand-primary">{p.qty} unid.</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Sales by Client Section */}
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-neutral-100">
                <div className="flex items-center gap-3 mb-8">
                    <div className="p-3 bg-brand-primary-light text-brand-primary rounded-2xl">
                        <Users size={24} />
                    </div>
                    <div>
                        <h3 className="font-bold text-lg text-neutral-900">Vendas por Cliente</h3>
                        <p className="text-neutral-500 text-sm">Maiores compradores no período selecionado</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {reportData?.topClients.map((client: any, idx: number) => (
                        <div key={idx} className="p-6 bg-neutral-50 rounded-2xl border border-neutral-100 flex flex-col gap-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-brand-primary-light flex items-center justify-center text-brand-primary font-bold">
                                    {client.name.charAt(0)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-bold text-neutral-900 truncate">{client.name}</p>
                                    <p className="text-xs text-neutral-500 font-bold">{client.orders} pedidos</p>
                                </div>
                            </div>
                            <div className="flex items-center justify-between pt-2 border-t border-neutral-200">
                                <span className="text-xs font-bold text-neutral-400 uppercase tracking-widest">Total Gasto</span>
                                <span className="text-lg font-black text-emerald-600">R$ {client.total.toFixed(2)}</span>
                            </div>
                        </div>
                    ))}
                    {reportData?.topClients.length === 0 && (
                        <div className="col-span-full py-20 text-center text-neutral-400">
                            Sem dados de clientes para este período.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Reports;
