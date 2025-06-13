/**
 * Dashboard 컴포넌트
 * -----------------------------------------------------
 * 주요 동작 요약:
 * - Supabase에서 여러 테이블의 데이터를 병렬로 불러와 대시보드에 필요한 다양한 지표와 차트 데이터를 계산합니다.
 * - 핵심 숫자 지표(고객/연락처/제품/주문 등)는 MetricCard로, 분포 데이터는 ChartCard로 시각화합니다.
 * - 연도별 월별 매출액을 보여주는 라인 차트를 추가했습니다. (recharts 사용)
 * - 에러/로딩 처리, 데이터 가공 및 집계, 차트용 데이터 변환 등 대시보드 페이지에서 필요한 모든 로직이 포함되어 있습니다.
 *
 * 상세 설명:
 * - useEffect에서 fetchDashboardData를 호출해 customers, contacts, products, predictions, orders, issues 등 주요 테이블의 데이터를 병렬로 불러옵니다.
 * - 각종 합계, 평균, 분포(파이/막대 차트용) 데이터를 계산하여 DashboardData 형태로 상태에 저장합니다.
 * - [추가] orders 데이터를 가공하여 연도별 월간 매출 데이터를 계산하고 별도 상태(yearlySalesData)로 관리합니다.
 * - MetricCard는 주요 숫자 지표(예: 총 고객 수, 총 연락처 수 등)를 카드로 표시합니다.
 * - ChartCard는 파이/막대 차트로 고객 유형, 위험도, 결제 상태, 이슈 상태 분포를 시각화합니다.
 * - [추가] LineChartCard는 연도 선택 기능과 함께 월별 매출 추이를 보여주는 선 그래프를 표시합니다.
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
  AlertTriangle,
  LineChart as LineChartIcon // 라인 차트 아이콘 추가
} from 'lucide-react';
// Recharts: 라인 차트 구현을 위한 라이브러리
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

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

// 월별 매출 차트 데이터 타입 정의
interface MonthlySales {
  month: string;
  "매출액": number;
}

// 연도별 매출 데이터 타입 정의
interface YearlySalesData {
  [year: number]: MonthlySales[];
}


// 대시보드 컴포넌트
const Dashboard: React.FC = () => {
  // 대시보드 데이터 상태
  const [data, setData] = useState<DashboardData | null>(null);
  // 로딩 상태(데이터 불러오는 중)
  const [loading, setLoading] = useState(true);
  
  // --- 라인 차트 관련 상태 ---
  // 선택된 연도 상태, 기본값은 현재 연도
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  // 데이터가 있는 모든 연도 목록 상태
  const [availableYears, setAvailableYears] = useState<number[]>([]);
  // 연도별로 정리된 월별 매출 데이터 상태
  const [yearlySalesData, setYearlySalesData] = useState<YearlySalesData>({});
  
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
      ] = await Promise.all([
        supabase.from('customers').select('*'),
        supabase.from('contacts').select('*'),
        supabase.from('products').select('*'),
        supabase.from('predictions').select('*'),
        supabase.from('orders').select('*'), // 결제 상태를 위해 모든 컬럼 선택
        supabase.from('issues').select('*'),
      ]);
      // 에러 발생 시 예외 처리
      if (customersResult.error) throw customersResult.error;
      if (contactsResult.error) throw contactsResult.error;
      if (productsResult.error) throw productsResult.error;
      if (predictionsResult.error) throw predictionsResult.error;
      if (ordersResult.error) throw ordersResult.error;
      if (issuesResult.error) throw issuesResult.error;

      // 각 테이블 데이터 추출(없으면 빈 배열)
      const customers = customersResult.data || [];
      const contacts = contactsResult.data || [];
      const products = productsResult.data || [];
      const predictions = predictionsResult.data || [];
      const orders = ordersResult.data || [];
      const issues = issuesResult.data || [];
      
      // --- 월별 매출 데이터 가공 로직 (추가된 부분) ---
      const salesByYearMonth = orders.reduce((acc, order) => {
        if (!order.order_date || typeof order.amount !== 'number') return acc;

        const orderDate = new Date(order.order_date);
        const year = orderDate.getFullYear();
        const month = orderDate.getMonth(); // 0 (Jan) - 11 (Dec)

        if (!acc[year]) {
          // 해당 연도 데이터가 없으면 12개월치 기본 구조 생성
          acc[year] = Array(12).fill(null).map((_, i) => ({
            month: `${i + 1}월`,
            "매출액": 0,
          }));
        }
        acc[year][month]["매출액"] += order.amount;
        return acc;
      }, {} as YearlySalesData);

      // 데이터가 있는 연도 목록 추출 및 내림차순 정렬
      const years = Object.keys(salesByYearMonth).map(Number).sort((a, b) => b - a);
      
      // 상태 업데이트
      setAvailableYears(years);
      setYearlySalesData(salesByYearMonth);

      // 만약 데이터가 있는 연도 중에 현재 선택된 연도가 없다면, 가장 최신 연도로 변경
      if (years.length > 0 && !years.includes(selectedYear)) {
        setSelectedYear(years[0]);
      }


      // --- 기존 핵심 메트릭 계산 ---
      const totalCustomers = customers.length;
      const totalContacts = contacts.length;
      const keyContacts = contacts.filter(c => c.is_keyman === '1').length;
      const totalProducts = products.length;
      const avgPrice = products.length > 0 ? 
        products.reduce((sum, p) => sum + (p.sellingprice || 0), 0) / products.length : 0;
      const totalPredictions = predictions.length;
      const avgPredictedQuantity = predictions.length > 0 ?
        predictions.reduce((sum, p) => sum + (p.predicted_quantity || 0), 0) / predictions.length : 0;
      const totalOrders = orders.length;
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
      console.error('Dashboard data fetch error:', error);
      toast({
        title: "오류",
        description: "대시보드 데이터를 불러오는 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // 데이터 로딩 중이면 로딩 스피너 표시
  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent border-solid rounded-full animate-spin"></div>
          <p className="mt-4 text-lg text-gray-600">데이터 로딩중...</p>
        </div>
      </div>
    );
  }

  // 데이터가 없으면 안내 메시지 표시
  if (!data) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
            <AlertTriangle className="h-6 w-6 text-red-600" />
          </div>
          <h3 className="mt-4 text-lg font-medium text-gray-900">데이터를 불러올 수 없습니다.</h3>
          <p className="mt-2 text-sm text-gray-500">잠시 후 다시 시도해주세요.</p>
        </div>
      </div>
    );
  }

  // 현재 선택된 연도의 월별 매출 데이터
  const currentYearSalesData = yearlySalesData[selectedYear] || Array(12).fill(null).map((_, i) => ({
    month: `${i + 1}월`,
    "매출액": 0,
  }));

  // 대시보드 메인 렌더링
  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* 상단: 대시보드 타이틀/설명 */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
            <div>
                <h1 className="text-3xl font-bold text-gray-800">대시보드 개요</h1>
                <p className="mt-1 text-gray-600">CRM 시스템의 주요 지표를 한눈에 확인하세요</p>
            </div>
            <div className="flex items-center space-x-2">
                <Activity className="h-8 w-8 text-blue-500" />
                <TrendingUp className="h-8 w-8 text-green-500" />
                <Target className="h-8 w-8 text-red-500" />
            </div>
        </div>
      </div>
      
      {/* 메트릭 카드: 주요 숫자 지표를 카드로 보여줌 (color 속성 수정) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <MetricCard icon={Users} title="총 고객 수" value={data.totalCustomers} color="blue" onClick={() => navigate('/customers')} />
        <MetricCard icon={Phone} title="총 연락처" value={data.totalContacts} color="green" onClick={() => navigate('/contacts')} />
        <MetricCard icon={Users} title="주요 연락처" value={data.keyContacts} color="orange" onClick={() => navigate('/contacts')} />
        <MetricCard icon={Package} title="총 제품 수" value={data.totalProducts} color="purple" onClick={() => navigate('/products')} />
        <MetricCard icon={TrendingUp} title="평균 제품 단가" value={`₩${Math.round(data.avgPrice).toLocaleString()}`} color="red" onClick={() => navigate('/products')} />
        <MetricCard icon={Target} title="평균 예측 수량" value={data.avgPredictedQuantity.toFixed(2)} color="blue" onClick={() => navigate('/predictions')} />
        <MetricCard icon={ShoppingCart} title="총 주문 수" value={data.totalOrders} color="green" onClick={() => navigate('/orders')} />
        <MetricCard icon={TrendingUp} title="평균 주문 금액" value={`₩${Math.round(data.avgOrderAmount).toLocaleString()}`} color="purple" onClick={() => navigate('/orders')} />
      </div>

      {/* --- 월별 매출액 라인 차트 (추가된 부분) --- */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
              <div>
                  <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                      <LineChartIcon className="w-5 h-5 mr-2 text-blue-500" />
                      연간 월별 매출액
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">선택된 연도의 월별 총 매출액 추이를 확인하세요.</p>
              </div>
              <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(Number(e.target.value))}
                  className="mt-2 sm:mt-0 block w-full sm:w-32 px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              >
                  {availableYears.length > 0 ? (
                      availableYears.map(year => (
                          <option key={year} value={year}>{year}년</option>
                      ))
                  ) : (
                      <option value={new Date().getFullYear()}>{new Date().getFullYear()}년</option>
                  )}
              </select>
          </div>
          <div style={{ width: '100%', height: 350 }}>
              <ResponsiveContainer>
                  <LineChart
                      data={currentYearSalesData}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                      <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                      <XAxis dataKey="month" tick={{ fill: '#6b7280' }} />
                      <YAxis tickFormatter={(value) => `₩${(Number(value) / 1000000).toLocaleString()}M`} tick={{ fill: '#6b7280' }} />
                      <Tooltip 
                        formatter={(value: number) => [`₩${value.toLocaleString()}`, "매출액"]}
                        labelStyle={{ color: '#333' }}
                        itemStyle={{ color: '#8884d8' }}
                        wrapperClassName="rounded-md border bg-white px-3 py-2 shadow-sm"
                      />
                      <Legend />
                      <Line type="monotone" dataKey="매출액" stroke="#8884d8" strokeWidth={2} activeDot={{ r: 8 }} />
                  </LineChart>
              </ResponsiveContainer>
          </div>
      </div>

      {/* 차트 섹션 제목 */}
      <div className="mb-6 mt-10">
        <h2 className="text-2xl font-bold text-gray-800">데이터 분석</h2>
        <p className="mt-1 text-gray-600">다양한 관점에서 살펴보는 비즈니스 인사이트</p>
      </div>
      
      {/* 차트 카드: 파이/막대 차트로 주요 분포 시각화 (기존 코드 유지) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
        <ChartCard title="고객 유형 분포" type="pie" data={data.customerTypeData} />
        <ChartCard title="고객 위험도 분포" type="pie" data={data.riskLevelData} />
        {/* <ChartCard title="주문 결제 상태" type="bar" data={data.paymentStatusData} /> */}
        <ChartCard title="이슈 상태" type="bar" data={data.issueStatusData} />
        <ChartCard title="이슈 유형" type="bar" data={data.issueTypeData} />
      </div>
    </div>
  );
};

export default Dashboard;