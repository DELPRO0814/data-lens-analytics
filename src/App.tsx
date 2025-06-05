/**
 * App.tsx (메인 엔트리)
 * -----------------------------------------------------
 * 주요 동작 요약:
 * - Supabase 인증 기반의 전체 앱 라우팅, 레이아웃, 전역 상태를 관리합니다.
 * - 인증 상태(로그인/로그아웃)에 따라 AuthPage 또는 메인 레이아웃을 분기합니다.
 * - 사이드바, 헤더, 페이지별 Route, Toast/Tooltip/React Query Provider 등
 *   실무형 대시보드 앱의 표준 구조를 제공합니다.
 *
 * 상세 설명:
 * - Supabase onAuthStateChange, getSession으로 인증/세션 상태를 실시간 관리합니다.
 * - 인증이 완료되면 Sidebar, Header, 각종 페이지(Route)로 구성된 메인 레이아웃을 렌더링합니다.
 * - QueryClientProvider, TooltipProvider, Toaster 등 전역 UI/상태 관리 기능이 포함되어 있습니다.
 * - Route는 총 15개 이상(고객/연락처/제품/예측/세그먼트/영업/이슈/클레임 등)으로 확장성 높게 설계되어 있습니다.
 * - 모든 미정의 경로는 "/"(대시보드)로 리다이렉트합니다.
 */

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
import CustomerDetailPage from './pages/CustomerDetailPage';
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
import PriorityDashboardPage from './pages/PriorityDashboardPage';
import OpportunityAnalysisPage from './pages/OpportunityAnalysisPage';

const queryClient = new QueryClient();

const AppContent = () => {
  // 인증/세션 상태 관리
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  // 사이드바 UI 상태
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Supabase 인증 상태 구독 및 초기 세션 확인
  useEffect(() => {
    // 인증 상태 변화 실시간 감지
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );
    // 앱 최초 진입 시 세션 확인
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });
    // 언마운트 시 구독 해제
    return () => subscription.unsubscribe();
  }, []);

  // 로딩 중 스피너
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // 인증 안 된 경우 로그인 페이지로
  if (!session) {
    return <AuthPage />;
  }

  // 인증된 경우 메인 레이아웃
  return (
    <div className="flex h-screen bg-gray-50">
      {/* 좌측 사이드바 */}
      <Sidebar 
        isOpen={sidebarOpen} 
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        isCollapsed={sidebarCollapsed}
        onCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />
      {/* 우측 메인 컨텐츠 */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header 
          onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
          user={user}
        />
        {/* 페이지별 라우팅 */}
        <main className="flex-1 overflow-auto p-6">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/customers" element={<CustomersPage />} />
            <Route path="/customers/:customerId" element={<CustomerDetailPage />} />
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
            <Route path="/priority-dashboard" element={<PriorityDashboardPage />} />
            <Route path="/opportunity-analysis" element={<OpportunityAnalysisPage />} />
            {/* 정의되지 않은 경로는 대시보드로 리다이렉트 */}
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
