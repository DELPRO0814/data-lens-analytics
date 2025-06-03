
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

const queryClient = new QueryClient();

const App = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
    return (
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <BrowserRouter>
            <AuthPage />
            <Toaster />
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <BrowserRouter>
          <div className="flex h-screen bg-gray-50">
            <Sidebar 
              isOpen={sidebarOpen} 
              onToggle={() => setSidebarOpen(!sidebarOpen)} 
            />
            
            <div className="flex-1 flex flex-col min-w-0">
              <Header 
                onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
                user={user}
              />
              
              <main className="flex-1 overflow-auto p-6">
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/customers" element={<div className="text-center py-12 text-gray-500">고객 페이지 (개발 예정)</div>} />
                  <Route path="/contacts" element={<div className="text-center py-12 text-gray-500">연락처 페이지 (개발 예정)</div>} />
                  <Route path="/products" element={<div className="text-center py-12 text-gray-500">제품 페이지 (개발 예정)</div>} />
                  <Route path="/predictions" element={<div className="text-center py-12 text-gray-500">예측 페이지 (개발 예정)</div>} />
                  <Route path="/segments" element={<div className="text-center py-12 text-gray-500">세그먼트 페이지 (개발 예정)</div>} />
                  <Route path="/sales-activities" element={<div className="text-center py-12 text-gray-500">영업 활동 페이지 (개발 예정)</div>} />
                  <Route path="/engagements" element={<div className="text-center py-12 text-gray-500">참여 페이지 (개발 예정)</div>} />
                  <Route path="/orders" element={<div className="text-center py-12 text-gray-500">주문 페이지 (개발 예정)</div>} />
                  <Route path="/issues" element={<div className="text-center py-12 text-gray-500">이슈 페이지 (개발 예정)</div>} />
                  <Route path="/claims" element={<div className="text-center py-12 text-gray-500">클레임 페이지 (개발 예정)</div>} />
                  <Route path="/sales-forecast" element={<div className="text-center py-12 text-gray-500">영업 접촉 예측 페이지 (개발 예정)</div>} />
                  <Route path="/profit-grade" element={<div className="text-center py-12 text-gray-500">고객 수익 등급 페이지 (개발 예정)</div>} />
                  <Route path="/order-forecast" element={<div className="text-center py-12 text-gray-500">고객 주문 예측 페이지 (개발 예정)</div>} />
                  <Route path="*" element={<Navigate to="/" />} />
                </Routes>
              </main>
            </div>
          </div>
          <Toaster />
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
