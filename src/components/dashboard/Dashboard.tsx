
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import MetricCard from './MetricCard';
import ChartCard from './ChartCard';
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

interface DashboardData {
  totalCustomers: number;
  totalContacts: number;
  keyContacts: number;
  totalProducts: number;
  avgPrice: number;
  totalPredictions: number;
  avgPredictedQuantity: number;
  totalOrders: number;
  avgOrderAmount: number;
  totalIssues: number;
  customerTypeData: any[];
  riskLevelData: any[];
  paymentStatusData: any[];
  issueStatusData: any[];
}

const Dashboard: React.FC = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // 병렬로 모든 데이터 가져오기
      const [
        customersResult,
        contactsResult,
        productsResult,
        predictionsResult,
        ordersResult,
        issuesResult
      ] = await Promise.all([
        supabase.from('customers').select('*'),
        supabase.from('contacts').select('*'),
        supabase.from('products').select('*'),
        supabase.from('predictions').select('*'),
        supabase.from('orders').select('*'),
        supabase.from('issues').select('*')
      ]);

      if (customersResult.error) throw customersResult.error;
      if (contactsResult.error) throw contactsResult.error;
      if (productsResult.error) throw productsResult.error;
      if (predictionsResult.error) throw predictionsResult.error;
      if (ordersResult.error) throw ordersResult.error;
      if (issuesResult.error) throw issuesResult.error;

      const customers = customersResult.data || [];
      const contacts = contactsResult.data || [];
      const products = productsResult.data || [];
      const predictions = predictionsResult.data || [];
      const orders = ordersResult.data || [];
      const issues = issuesResult.data || [];

      // 기본 메트릭 계산
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

      // 차트 데이터 준비
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

      // segments 테이블에서 위험도 데이터 가져오기
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
        issueStatusData
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">데이터를 불러올 수 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">대시보드 개요</h1>
        <p className="text-gray-600">CRM 시스템의 주요 지표를 한눈에 확인하세요</p>
      </div>

      {/* 메트릭 카드 */}
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

      {/* 차트 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
          title="결제 상태별 주문 분포"
          data={data.paymentStatusData}
          type="bar"
        />
        <ChartCard
          title="이슈 상태별 분포"
          data={data.issueStatusData}
          type="bar"
        />
      </div>
    </div>
  );
};

export default Dashboard;
