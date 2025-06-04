import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { supabase } from '@/integrations/supabase/client';
import { Session, User } from '@supabase/supabase-js';

import AuthPage from './components/auth/AuthPage';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import Dashboard from './components/dashboard/Dashboard';
import CustomersPage from './pages/CustomersPage';
import ContactsPage from './pages/ContactsPage';
import ProductsPage from './pages/ProductsPage';
import PredictionsPage from './pages/PredictionsPage';
import SegmentsPage from './pages/SegmentsPage';
import SalesActivitiesPage from './pages/SalesActivitiesPage';
import EngagementsPage from './pages/EngagementsPage';
import OrdersPage from './pages/OrdersPage';
import IssuesPage from './pages/IssuesPage';
import ClaimsPage from './pages/ClaimsPage';
import SalesForecastPage from './pages/SalesForecastPage';
import ProfitGradePage from './pages/ProfitGradePage';
import OrderForecastPage from './pages/OrderForecastPage';

const queryClient = new QueryClient();

const AppContent = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    // 인증 상태 변화 감지
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    // 현재 세션 확인
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!session) {
    return <AuthPage />;
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar 
        isOpen={sidebarOpen} 
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        isCollapsed={sidebarCollapsed}
        onCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />
      
      <div className="flex-1 flex flex-col min-w-0">
        <Header 
          onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
          user={user}
        />
        
        <main className="flex-1 overflow-auto p-6">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/customers" element={<CustomersPage />} />
            <Route path="/contacts" element={<ContactsPage />} />
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/predictions" element={<PredictionsPage />} />
            <Route path="/segments" element={<SegmentsPage />} />
            <Route path="/sales-activities" element={<SalesActivitiesPage />} />
            <Route path="/engagements" element={<EngagementsPage />} />
            <Route path="/orders" element={<OrdersPage />} />
            <Route path="/issues" element={<IssuesPage />} />
            <Route path="/claims" element={<ClaimsPage />} />
            <Route path="/sales-forecast" element={<SalesForecastPage />} />
            <Route path="/profit-grade" element={<ProfitGradePage />} />
            <Route path="/order-forecast" element={<OrderForecastPage />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <TooltipProvider>
          <AppContent />
          <Toaster />
        </TooltipProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;
