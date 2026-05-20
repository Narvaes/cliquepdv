import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Users } from 'lucide-react';

// Pages
import LandingPage from './src/pages/LandingPage';
import AdminLayout from './src/components/layout/AdminLayout';
import Dashboard from './src/pages/admin/Dashboard';
import ProductList from './src/pages/admin/ProductList';
import ClientList from './src/pages/admin/ClientList';
import POSInterface from './src/pages/pdv/POSInterface';
import SalesHistory from './src/pages/admin/Sales';
import Settings from './src/pages/admin/Settings';
import Reports from './src/pages/admin/Reports';
import CategoryList from './src/pages/admin/CategoryList';

// Super Admin Pages
import SuperAdminLayout from './src/components/layout/SuperAdminLayout';
import SuperAdminDashboard from './src/pages/superadmin/Dashboard';
import TenantsPage from './src/pages/superadmin/Tenants';
import AdminsPage from './src/pages/superadmin/Admins';

import { AuthProvider } from './src/context/AuthContext';
import { TenantProvider, useTenant } from './src/context/TenantContext';
import { ProtectedRoute } from './src/components/auth/ProtectedRoute';
import { SuperAdminRoute } from './src/components/auth/SuperAdminRoute';
// Platform
import PlatformHome from './src/pages/PlatformHome';
import Login from './src/pages/admin/Login';
import Signup from './src/pages/public/Signup';
import ForgotPassword from './src/pages/public/ForgotPassword';
import ResetPassword from './src/pages/public/ResetPassword';
import MasterLogin from './src/pages/superadmin/MasterLogin';
import GptChat from './src/components/GptChat';

const AppRoutes: React.FC = () => {
  const { tenant, isLoading } = useTenant();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Conditional Root: LandingPage (Store) or PlatformHome (SaaS) */}
      <Route path="/" element={tenant ? <LandingPage /> : <PlatformHome />} />

      {/* Public Signup Page */}
      <Route path="/signup" element={<Signup />} />

      {/* Login Page */}
      <Route path="/login" element={<Login />} />

      {/* Exclusive Master Login */}
      <Route path="/master" element={<MasterLogin />} />

      {/* Password Recovery Routes */}
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      {/* Admin & POS Routes (Protected) */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="products" element={<ProductList />} />
        <Route path="categories" element={<CategoryList />} />
        <Route path="clients" element={<ClientList />} />
        <Route path="pdv" element={<POSInterface />} />
        <Route path="sales" element={<SalesHistory />} />
        <Route path="reports" element={<Reports />} />
        <Route path="settings" element={<Settings />} />
      </Route>

      {/* Super Admin Routes (Master Panel) */}
      <Route
        path="/superadmin"
        element={
          <SuperAdminRoute>
            <SuperAdminLayout />
          </SuperAdminRoute>
        }
      >
        <Route index element={<SuperAdminDashboard />} />
        <Route path="tenants" element={<TenantsPage />} />
        <Route path="subscriptions" element={<div className="p-8 text-neutral-400 italic bg-neutral-800/10 rounded-3xl border border-dashed border-neutral-700">Módulo de Assinaturas Financeiras em breve...</div>} />
        <Route path="admins" element={<AdminsPage />} />
        <Route path="settings" element={<div className="p-8 text-neutral-400 italic bg-neutral-800/10 rounded-3xl border border-dashed border-neutral-700">Configurações Globais da Plataforma em breve...</div>} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

const queryClient = new QueryClient();

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TenantProvider>
        <AuthProvider>
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </AuthProvider>
      </TenantProvider>
    </QueryClientProvider>
  );
};

export default App;
