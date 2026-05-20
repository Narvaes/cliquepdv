import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import {
  DollarSign,
  ShoppingBag,
  Users,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';
import { format, startOfDay, endOfDay, subDays } from 'date-fns';
import { useSettings } from '../../hooks/useSettings';
import { ptBR } from 'date-fns/locale';
import { useAuth } from '../../context/AuthContext';
import { useTenant } from '../../context/TenantContext';

const StatCard = ({ title, value, change, trend, icon: Icon, color, isLoading }: any) => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-100">
    <div className="flex justify-between items-start mb-4">
      <div className={`p-3 rounded-xl ${color} bg-opacity-10 text-opacity-100`}>
        <Icon size={24} className={color.replace('bg-', 'text-')} />
      </div>
      {!isLoading && change && (
        <span className={`flex items-center text-sm font-medium ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
          {change}
          {trend === 'up' ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
        </span>
      )}
    </div>
    <h3 className="text-neutral-500 text-sm font-medium">{title}</h3>
    {isLoading ? (
      <div className="h-8 w-24 bg-neutral-100 animate-pulse rounded-lg mt-1" />
    ) : (
      <p className="text-2xl font-bold text-neutral-900 mt-1">{value}</p>
    )}
  </div>
);

const Dashboard = () => {
  const { profile } = useAuth();
  const { tenant } = useTenant();
  const { data: settings } = useSettings();

  // Fetch Sales Data
  const { data: salesData, isLoading: salesLoading } = useQuery({
    queryKey: ['dashboard-sales', tenant?.id],
    enabled: !!tenant?.id,
    queryFn: async () => {
      const today = startOfDay(new Date()).toISOString();
      const { data, error } = await supabase
        .from('sales')
        .select('*, sale_items(*, products(*))')
        .eq('tenant_id', tenant?.id)
        .gte('created_at', today);
      if (error) throw error;
      return data;
    }
  });

  // Fetch Clients Count
  const { data: clientsCount, isLoading: clientsLoading } = useQuery({
    queryKey: ['dashboard-clients', tenant?.id],
    enabled: !!tenant?.id,
    queryFn: async () => {
      const { count, error } = await supabase
        .from('clients')
        .select('*', { count: 'exact', head: true })
        .eq('tenant_id', tenant?.id);
      if (error) throw error;
      return count || 0;
    }
  });

  // Fetch Last 7 Days for Chart
  const { data: chartData, isLoading: chartLoading } = useQuery({
    queryKey: ['dashboard-chart', tenant?.id],
    enabled: !!tenant?.id,
    queryFn: async () => {
      const sevenDaysAgo = startOfDay(subDays(new Date(), 6)).toISOString();
      const { data, error } = await supabase
        .from('sales')
        .select('created_at, total_amount')
        .eq('tenant_id', tenant?.id)
        .gte('created_at', sevenDaysAgo);

      if (error) throw error;

      // Group by day
      const groups: any = {};
      for (let i = 0; i < 7; i++) {
        const date = format(subDays(new Date(), i), 'dd/MM');
        groups[date] = 0;
      }

      data.forEach(sale => {
        const date = format(new Date(sale.created_at), 'dd/MM');
        if (groups[date] !== undefined) groups[date] += sale.total_amount;
      });

      return Object.entries(groups)
        .map(([name, total]) => ({ name, total }))
        .reverse();
    }
  });

  const totalToday = salesData?.reduce((acc, sale) => acc + sale.total_amount, 0) || 0;
  const ordersToday = salesData?.length || 0;
  const avgTicket = ordersToday > 0 ? totalToday / ordersToday : 0;

  const stats = [
    { title: 'Vendas Hoje', value: `R$ ${totalToday.toFixed(2)}`, change: null, trend: 'up', icon: DollarSign, color: 'bg-green-500', isLoading: salesLoading },
    { title: 'Pedidos Hoje', value: ordersToday.toString(), change: null, trend: 'up', icon: ShoppingBag, color: 'bg-blue-500', isLoading: salesLoading },
    { title: 'Total Clientes', value: clientsCount?.toString() || '0', change: null, trend: 'up', icon: Users, color: 'bg-purple-500', isLoading: clientsLoading },
    { title: 'Ticket Médio', value: `R$ ${avgTicket.toFixed(2)}`, change: null, trend: 'up', icon: TrendingUp, color: 'bg-brand-primary', isLoading: salesLoading },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="h-6" /> {/* Spacer */}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-neutral-100 h-96 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-lg">Vendas nos últimos 7 dias</h3>
            <div className="flex items-center gap-2 text-xs font-bold text-neutral-400">
              <div className="w-3 h-3 bg-brand-primary rounded-sm"></div>
              Faturamento (R$)
            </div>
          </div>
          <div className="flex-1">
            {chartLoading ? (
              <div className="w-full h-full flex items-center justify-center text-neutral-300">Carregando gráfico...</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F5F5F5" />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#A3A3A3', fontSize: 12, fontWeight: 600 }}
                    dy={10}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#A3A3A3', fontSize: 12, fontWeight: 600 }}
                  />
                  <Tooltip
                    cursor={{ fill: '#FAFAFA' }}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar dataKey="total" radius={[6, 6, 0, 0]} barSize={40}>
                    {chartData?.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={index === chartData.length - 1 ? 'var(--admin-primary)' : 'var(--admin-primary-10)'}
                        fillOpacity={index === chartData.length - 1 ? 1 : 0.6}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-100 flex flex-col h-96">
          <h3 className="font-bold text-lg mb-4">Vendas por Categoria</h3>
          <div className="flex-1 flex flex-col items-center justify-center text-center p-6 bg-neutral-50 rounded-2xl border border-dashed border-neutral-200">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm mb-4">
              <TrendingUp className="text-brand-primary" size={20} />
            </div>
            <p className="text-sm font-bold text-neutral-900">Novos insights em breve</p>
            <p className="text-xs text-neutral-500 mt-1">Estamos processando seus dados para gerar relatórios mais detalhados.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
