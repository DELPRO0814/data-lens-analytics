/**
 * Dashboard 컴포넌트
 * -----------------------------------------------------
 * 주요 동작 요약:
 * - Supabase에서 여러 테이블의 데이터를 병렬로 불러와 대시보드에 필요한 다양한 지표와 차트 데이터를 계산합니다.
 * - 핵심 숫자 지표(고객/연락처/제품/주문 등)는 MetricCard로, 분포 데이터는 ChartCard로 시각화합니다.
 * - 에러/로딩 처리, 데이터 가공 및 집계, 차트용 데이터 변환 등 대시보드 페이지에서 필요한 모든 로직이 포함되어 있습니다.
 *
 * 상세 설명:
 * - useEffect에서 fetchDashboardData를 호출해 customers, contacts, products, predictions, orders, issues 등 주요 테이블의 데이터를 병렬로 불러옵니다.
 * - 각종 합계, 평균, 분포(파이/막대 차트용) 데이터를 계산하여 DashboardData 형태로 상태에 저장합니다.
 * - MetricCard는 주요 숫자 지표(예: 총 고객 수, 총 연락처 수 등)를 카드로 표시합니다.
 * - ChartCard는 파이/막대 차트로 고객 유형, 위험도, 결제 상태, 이슈 상태 분포를 시각화합니다.
 * - 데이터 로딩 중에는 스피너, 에러 시 안내 메시지를 표시합니다.
 * - Tailwind CSS 기반의 반응형 UI와 일관된 디자인, 상세한 주석이 포함되어 있습니다.
 */

import React, { useEffect, useState } from 'react';
// 페이지 이동을 위한 라우터 훅
import { useNavigate } from 'react-router-dom';
// Supabase: DB에서 데이터 조회
import { supabase } from '@/integrations/supabase/client';
// toast: 사용자에게 알림 메시지 표시
import { useToast } from '@/hooks/use-toast';
// 대시보드에 표시할 카드/차트 컴포넌트
import MetricCard from './MetricCard';
import ChartCard from './ChartCard';
// lucide-react: 카드에 사용할 아이콘들
import { 
  Users, 
  Phone, 
  Package, 
  TrendingUp, 
  Target, 
  Activity, 
  ShoppingCart, 
  AlertTriangle 
} from 'lucide-react';

// 대시보드 데이터 구조 타입 정의
interface DashboardData {
  totalCustomers: number;           // 총 고객 수
  totalContacts: number;            // 총 연락처 수
  keyContacts: number;              // 주요 연락처(키맨) 수
  totalProducts: number;            // 총 제품 수
  avgPrice: number;                 // 평균 제품 가격
  totalPredictions: number;         // 예측 데이터 수
  avgPredictedQuantity: number;     // 평균 예측 수량
  totalOrders: number;              // 총 주문 수
  avgOrderAmount: number;           // 평균 주문 금액
  totalIssues: number;              // 이슈(문제) 총 개수
  customerTypeData: any[];          // 고객 유형별 분포(파이차트)
  riskLevelData: any[];             // 위험도별 세그먼트 분포(파이차트)
  paymentStatusData: any[];         // 결제 상태별 주문 분포(막대차트)
  issueStatusData: any[];           // 이슈 상태별 분포(막대차트)
  issueTypeData: any[];             // 이슈 타입 (막대차트트)
}

// 대시보드 컴포넌트
const Dashboard: React.FC = () => {
  // 대시보드 데이터 상태
  const [data, setData] = useState<DashboardData | null>(null);
  // 로딩 상태(데이터 불러오는 중)
  const [loading, setLoading] = useState(true);
  // toast 메시지 훅
  const { toast } = useToast();
  // 페이지 이동 훅
  const navigate = useNavigate();

  // 컴포넌트가 처음 마운트될 때 데이터 불러오기
  useEffect(() => {
    fetchDashboardData();
  }, []);

  // 대시보드 데이터 불러오는 함수
  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // 여러 테이블에서 데이터를 병렬로 불러옴
      const [
        customersResult,
        contactsResult,
        productsResult,
        predictionsResult,
        ordersResult,
        issuesResult,
        issueTypeCountResult
      ] = await Promise.all([
        supabase.from('customers').select('*'),
        supabase.from('contacts').select('*'),
        supabase.from('products').select('*'),
        supabase.from('predictions').select('*'),
        supabase.from('orders').select('*'),
        supabase.from('issues').select('*'),
        supabase.from('issues').select('*'),
      ]);

      // 에러 발생 시 예외 처리
      if (customersResult.error) throw customersResult.error;
      if (contactsResult.error) throw contactsResult.error;
      if (productsResult.error) throw productsResult.error;
      if (predictionsResult.error) throw predictionsResult.error;
      if (ordersResult.error) throw ordersResult.error;
      if (issuesResult.error) throw issuesResult.error;
      if (issueTypeCountResult.error) throw issueTypeCountResult.error;

      // 각 테이블 데이터 추출(없으면 빈 배열)
      const customers = customersResult.data || [];
      const contacts = contactsResult.data || [];
      const products = productsResult.data || [];
      const predictions = predictionsResult.data || [];
      const orders = ordersResult.data || [];
      const issues = issuesResult.data || [];
      const issueTypeCount = issueTypeCountResult.data || [];

      // 핵심 메트릭 계산
      const totalCustomers = customers.length;
      const totalContacts = contacts.length;
      // is_keyman이 '1'인 연락처(중요 담당자) 수
      const keyContacts = contacts.filter(c => c.is_keyman === '1').length;
      const totalProducts = products.length;
      // 평균 제품 가격
      const avgPrice = products.length > 0 ? 
        products.reduce((sum, p) => sum + (p.sellingprice || 0), 0) / products.length : 0;
      const totalPredictions = predictions.length;
      // 평균 예측 수량
      const avgPredictedQuantity = predictions.length > 0 ?
        predictions.reduce((sum, p) => sum + (p.predicted_quantity || 0), 0) / predictions.length : 0;
      const totalOrders = orders.length;
      // 평균 주문 금액
      const avgOrderAmount = orders.length > 0 ?
        orders.reduce((sum, o) => sum + (o.amount || 0), 0) / orders.length : 0;
      const totalIssues = issues.length;

      // 고객 유형별 분포(파이차트용 데이터)
      const customerTypeData = customers.reduce((acc, customer) => {
        const type = customer.company_type || '기타';
        const existing = acc.find(item => item.name === type);
        if (existing) {
          existing.value++;
        } else {
          acc.push({ name: type, value: 1 });
        }
        return acc;
      }, [] as any[]);

      // segments 테이블에서 위험도별 세그먼트 분포 데이터 가져오기
      const segmentsResult = await supabase.from('segments').select('*');
      const segments = segmentsResult.data || [];
      const riskLevelData = segments.reduce((acc, segment) => {
        const risk = segment.predicted_risk_level || '알 수 없음';
        const existing = acc.find(item => item.name === risk);
        if (existing) {
          existing.value++;
        } else {
          acc.push({ name: risk, value: 1 });
        }
        return acc;
      }, [] as any[]);

      // 결제 상태별 주문 분포(막대차트용 데이터)
      const paymentStatusData = orders.reduce((acc, order) => {
        const status = order.payment_status || '알 수 없음';
        const existing = acc.find(item => item.name === status);
        if (existing) {
          existing.value++;
        } else {
          acc.push({ name: status, value: 1 });
        }
        return acc;
      }, [] as any[]);

      // 이슈 상태별 분포(막대차트용 데이터)
      const issueStatusData = issues.reduce((acc, issue) => {
        const status = issue.status || '알 수 없음';
        const existing = acc.find(item => item.name === status);
        if (existing) {
          existing.value++;
        } else {
          acc.push({ name: status, value: 1 });
        }
        return acc;
      }, [] as any[]);

      // 이슈 타입별 데이터 준비
      const issueTypeData = issues.reduce((acc, issue) => {
        const type = issue.issue_type || '알 수 없음';
        const existing = acc.find(item => item.name === type);
        if (existing) {
          existing.value++;
        } else {
          acc.push({ name: type, value: 1 });
        }
        return acc;
      }, [] as any[]);

      // 모든 대시보드 데이터 상태에 저장
      setData({
        totalCustomers,
        totalContacts,
        keyContacts,
        totalProducts,
        avgPrice,
        totalPredictions,
        avgPredictedQuantity,
        totalOrders,
        avgOrderAmount,
        totalIssues,
        customerTypeData,
        riskLevelData,
        paymentStatusData,
        issueStatusData,
        issueTypeData
      });

    } catch (error) {
      // 에러 발생 시 콘솔 출력 및 toast로 안내
      console.error('Dashboard data fetch error:', error);
      toast({
        title: "오류",
        description: "대시보드 데이터를 불러오는 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    } finally {
      setLoading(false); // 로딩 종료
    }
  };

  // 데이터 로딩 중이면 로딩 스피너 표시
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200"></div>
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent absolute top-0 left-0"></div>
          <div className="mt-4 text-center text-gray-600 font-medium">데이터 로딩중...</div>
        </div>
      </div>
    );
  }

  // 데이터가 없으면 안내 메시지 표시
  if (!data) {
    return (
      <div className="text-center py-12">
        <div className="glass-card rounded-2xl p-8 max-w-md mx-auto">
          <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-white text-2xl">!</span>
          </div>
          <p className="text-gray-700 font-medium">데이터를 불러올 수 없습니다.</p>
          <p className="text-gray-500 text-sm mt-2">잠시 후 다시 시도해주세요.</p>
        </div>
      </div>
    );
  }

  // 대시보드 메인 렌더링
  return (
    <div className="space-y-8 p-6">
      {/* 상단: 대시보드 타이틀/설명 */}
      <div className="text-center relative">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 rounded-3xl -rotate-1"></div>
        <div className="relative glass-card rounded-3xl p-8">
          <h1 className="text-4xl font-bold gradient-text mb-4">대시보드 개요</h1>
          <p className="text-gray-600 text-lg">CRM 시스템의 주요 지표를 한눈에 확인하세요</p>
          <div className="mt-4 flex justify-center space-x-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
            <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-2 h-2 bg-pink-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
          </div>
        </div>
      </div>

      {/* 메트릭 카드: 주요 숫자 지표를 카드로 보여줌 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="총 고객 수"
          value={data.totalCustomers.toLocaleString()}
          icon={Users}
          color="blue"
          onClick={() => navigate('/customers')}
        />
        <MetricCard
          title="총 연락처 수"
          value={data.totalContacts.toLocaleString()}
          icon={Phone}
          color="green"
          onClick={() => navigate('/contacts')}
        />
        <MetricCard
          title="주요 연락처"
          value={data.keyContacts.toLocaleString()}
          icon={Target}
          color="purple"
          onClick={() => navigate('/contacts')}
        />
        <MetricCard
          title="총 제품 수"
          value={data.totalProducts.toLocaleString()}
          icon={Package}
          color="orange"
          onClick={() => navigate('/products')}
        />
        <MetricCard
          title="평균 제품 가격"
          value={`₩${Math.round(data.avgPrice).toLocaleString()}`}
          icon={Package}
          color="blue"
          onClick={() => navigate('/products')}
        />
        <MetricCard
          title="총 예측 수"
          value={data.totalPredictions.toLocaleString()}
          icon={TrendingUp}
          color="green"
          onClick={() => navigate('/predictions')}
        />
        <MetricCard
          title="총 주문 수"
          value={data.totalOrders.toLocaleString()}
          icon={ShoppingCart}
          color="purple"
          onClick={() => navigate('/orders')}
        />
        <MetricCard
          title="평균 주문 금액"
          value={`₩${Math.round(data.avgOrderAmount).toLocaleString()}`}
          icon={ShoppingCart}
          color="orange"
          onClick={() => navigate('/orders')}
        />
      </div>

      {/* 차트 섹션 제목 */}
      <div className="text-center mt-12 mb-8">
        <h2 className="text-2xl font-bold gradient-text mb-2">데이터 분석</h2>
        <p className="text-gray-600">다양한 관점에서 살펴보는 비즈니스 인사이트</p>
      </div>

      {/* 차트 카드: 파이/막대 차트로 주요 분포 시각화 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <ChartCard
          title="고객 유형별 분포"
          data={data.customerTypeData}
          type="pie"
        />
        <ChartCard
          title="위험도별 세그먼트 분포"
          data={data.riskLevelData}
          type="pie"
        />
        <ChartCard
          title="이슈 상태별 분포"
          data={data.issueStatusData}
          type="bar"
        />
        <ChartCard
          title="이슈 타입별 분포"
          data={data.issueTypeData}
          type="bar"
        />
      </div>
    </div>
  );
};

export default Dashboard;
