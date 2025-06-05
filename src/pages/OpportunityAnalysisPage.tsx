/**
 * OpportunityAnalysisPage 컴포넌트
 * -----------------------------------------------------
 * 주요 동작 요약:
 * - 영업 접촉 예측, 주문 예측, 수익 등 여러 AI 기반 데이터를 결합해 영업 기회(오퍼튜니티)를 분석합니다.
 * - Supabase에서 sales_contact_forecast, customer_order_forecast, customer_profit_grade 테이블을 조회해 데이터를 통합합니다.
 * - 주요 지표(총 기회 수, 예상 매출, 평균 정확도, 이번주 예정 기회) 카드, 월별 매출/기회 추이 차트, 상위 10개 기회 바차트, 상세 테이블을 제공합니다.
 * - 데이터 로딩, 에러 처리, 통계 계산, 차트 데이터 가공 등 실무 대시보드에 필요한 모든 로직이 포함되어 있습니다.
 *
 * 상세 설명:
 * - fetchOpportunityData에서 3개 테이블을 병렬로 조회하고, 회사명 기준으로 데이터를 매칭/결합합니다.
 * - 정확도(MAPE 역수), 예상 매출, 우선순위(정확도 기반) 등 다양한 지표를 산출합니다.
 * - 월별 매출/기회 데이터는 YYYY-MM별로 집계하며, 차트와 표에 모두 활용합니다.
 * - 상위 10개 기회는 예상 매출 기준으로 정렬해 바차트와 상세 테이블에 표시합니다.
 * - 로딩 상태/에러 발생 시 사용자에게 안내 메시지를 제공합니다.
 * - Tailwind CSS와 recharts, lucide-react 아이콘을 활용해 일관된 UI와 시각화를 구현합니다.
 */

import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import PageHeader from '@/components/common/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { TrendingUp, Calendar, Target, DollarSign } from 'lucide-react';

const OpportunityAnalysisPage = () => {
  // 상태: 기회 목록, 월별 예측, 주요 통계, 로딩
  const [opportunities, setOpportunities] = useState([]);
  const [monthlyForecast, setMonthlyForecast] = useState([]);
  const [stats, setStats] = useState({
    totalOpportunities: 0,
    expectedRevenue: 0,
    avgAccuracy: 0,
    upcomingContacts: 0
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // 마운트 시 데이터 조회
  useEffect(() => {
    fetchOpportunityData();
  }, []);

  /**
   * 영업 기회 데이터 종합 조회 및 가공
   * - 접촉 예측/주문 예측/수익 등 3개 테이블 병렬 조회
   * - 회사명 기준으로 데이터 매칭 및 결합
   * - 정확도, 매출, 우선순위, 월별 집계 등 각종 지표 산출
   */
  const fetchOpportunityData = async () => {
    try {
      // 1. 영업 접촉 예측 데이터 조회
      const { data: contactForecast, error: contactError } = await supabase
        .from('sales_contact_forecast')
        .select(`*, customers(company_name)`)
        .order('scf_recommended_date', { ascending: true });
      if (contactError) throw contactError;

      // 2. 고객 주문 예측 데이터 조회
      const { data: orderForecast, error: orderError } = await supabase
        .from('customer_order_forecast')
        .select(`*, customers(company_name)`)
        .order('predicted_date', { ascending: true });
      if (orderError) throw orderError;

      // 3. 고객 수익 데이터 조회
      const { data: profitData, error: profitError } = await supabase
        .from('customer_profit_grade')
        .select(`*, contacts(customers(company_name))`)
        .order('total_sales', { ascending: false });
      if (profitError) throw profitError;

      // 4. 데이터 결합 및 통합 기회 목록 생성
      const combinedOpportunities = [];
      // 접촉 예측 데이터 기반 기회 생성
      contactForecast?.forEach(contact => {
        const relatedOrder = orderForecast?.find(order => order.customer_id === contact.customer_id);
        const relatedProfit = profitData?.find(profit => profit.contacts?.customers?.company_name === contact.customers?.company_name);

        const contactMape = typeof contact.scf_mape === 'number' ? contact.scf_mape : 0;
        const profitSales = typeof relatedProfit?.total_sales === 'number' ? relatedProfit.total_sales : 0;
        const orderQuantity = typeof relatedOrder?.predicted_quantity === 'number' ? Number(relatedOrder.predicted_quantity) : 0;

        combinedOpportunities.push({
          id: `contact-${contact.scf_id}`,
          type: 'contact',
          company: contact.customers?.company_name,
          date: contact.scf_recommended_date,
          contactType: contact.scf_type,
          accuracy: 1 - contactMape,
          expectedRevenue: profitSales,
          expectedQuantity: orderQuantity,
          priority: contactMape < 0.1 ? 'High' : contactMape < 0.3 ? 'Medium' : 'Low'
        });
      });
      // 주문 예측 데이터 기반 기회 생성
      orderForecast?.forEach(order => {
        const relatedProfit = profitData?.find(profit => profit.contacts?.customers?.company_name === order.customers?.company_name);

        const orderMape = typeof order.mape === 'number' ? Number(order.mape) : 0;
        const profitSales = typeof relatedProfit?.total_sales === 'number' ? relatedProfit.total_sales : 0;
        const orderQuantity = typeof order.predicted_quantity === 'number' ? Number(order.predicted_quantity) : 0;

        combinedOpportunities.push({
          id: `order-${order.cof_id}`,
          type: 'order',
          company: order.customers?.company_name,
          date: order.predicted_date,
          model: order.prediction_model,
          accuracy: 1 - orderMape,
          expectedRevenue: profitSales,
          expectedQuantity: orderQuantity,
          priority: orderMape < 0.1 ? 'High' : orderMape < 0.3 ? 'Medium' : 'Low'
        });
      });

      // 5. 상위 10개 기회(예상 매출 기준) 추출
      const topOpportunities = combinedOpportunities
        .sort((a, b) => {
          const aRevenue = typeof a.expectedRevenue === 'number' ? a.expectedRevenue : 0;
          const bRevenue = typeof b.expectedRevenue === 'number' ? b.expectedRevenue : 0;
          return bRevenue - aRevenue;
        })
        .slice(0, 10);
      setOpportunities(topOpportunities);

      // 6. 월별 예측 데이터 집계
      const monthlyData = {};
      combinedOpportunities.forEach(opp => {
        const month = new Date(opp.date).toISOString().slice(0, 7);
        if (!monthlyData[month]) {
          monthlyData[month] = { month, revenue: 0, contacts: 0, orders: 0 };
        }
        const oppRevenue = typeof opp.expectedRevenue === 'number' ? opp.expectedRevenue : 0;
        monthlyData[month].revenue += oppRevenue;
        if (opp.type === 'contact') monthlyData[month].contacts++;
        if (opp.type === 'order') monthlyData[month].orders++;
      });
      setMonthlyForecast(Object.values(monthlyData).slice(0, 12));

      // 7. 주요 통계 계산(총 기회, 매출, 정확도, 7일 내 예정)
      const today = new Date();
      const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
      const upcomingCount = combinedOpportunities.filter(opp => {
        const oppDate = new Date(opp.date);
        return oppDate >= today && oppDate <= nextWeek;
      }).length;
      const totalRevenue = combinedOpportunities.reduce((sum, opp) => {
        const oppRevenue = typeof opp.expectedRevenue === 'number' ? opp.expectedRevenue : 0;
        return sum + oppRevenue;
      }, 0);
      const avgAccuracy = combinedOpportunities.length > 0 
        ? combinedOpportunities.reduce((sum, opp) => {
            const oppAccuracy = typeof opp.accuracy === 'number' ? opp.accuracy : 0;
            return sum + oppAccuracy;
          }, 0) / combinedOpportunities.length * 100
        : 0;
      setStats({
        totalOpportunities: combinedOpportunities.length,
        expectedRevenue: totalRevenue,
        avgAccuracy: avgAccuracy,
        upcomingContacts: upcomingCount
      });

    } catch (error) {
      console.error('영업 기회 데이터 로딩 오류:', error);
      toast({
        title: "오류",
        description: "영업 기회 데이터를 불러오는데 실패했습니다.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // 로딩 상태 처리
  if (loading) {
    return <div className="text-center py-8">로딩중...</div>;
  }

  return (
    <div className="space-y-6">
      {/* 페이지 헤더 */}
      <PageHeader 
        title="영업 기회 분석" 
        description="AI 예측 기반 영업 기회를 분석하고 우선순위를 제시합니다."
      />

      {/* 주요 지표 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">총 영업 기회</CardTitle>
            <Target className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.totalOpportunities}</div>
            <p className="text-xs text-muted-foreground">예측된 기회</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">예상 매출</CardTitle>
            <DollarSign className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {Math.round((typeof stats.expectedRevenue === 'number' ? stats.expectedRevenue : 0) / 1000000).toLocaleString()}M원
            </div>
            <p className="text-xs text-muted-foreground">총 예상 매출</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">평균 정확도</CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {(typeof stats.avgAccuracy === 'number' ? stats.avgAccuracy : 0).toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">예측 정확도</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">이번주 기회</CardTitle>
            <Calendar className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.upcomingContacts}</div>
            <p className="text-xs text-muted-foreground">7일 내 예정</p>
          </CardContent>
        </Card>
      </div>

      {/* 차트 섹션 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>월별 예상 매출 추이</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyForecast}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip 
                  formatter={(value, name) => [
                    name === 'revenue' ? `${((typeof value === 'number' ? value : 0) / 1000000).toFixed(1)}M원` : value,
                    name === 'revenue' ? '예상 매출' : name === 'contacts' ? '접촉 예정' : '주문 예정'
                  ]}
                />
                <Legend />
                <Line type="monotone" dataKey="revenue" stroke="#8884d8" name="매출" />
                <Line type="monotone" dataKey="contacts" stroke="#82ca9d" name="접촉" />
                <Line type="monotone" dataKey="orders" stroke="#ffc658" name="주문" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>상위 10 영업 기회</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={opportunities} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis 
                  dataKey="company" 
                  type="category"
                  width={80}
                  fontSize={12}
                />
                <Tooltip 
                  formatter={(value) => [`${((typeof value === 'number' ? value : 0) / 1000000).toFixed(1)}M원`, '예상 매출']}
                />
                <Bar dataKey="expectedRevenue" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* 상위 영업 기회 상세 테이블 */}
      <Card>
        <CardHeader>
          <CardTitle>상위 영업 기회 상세</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border border-gray-300 px-4 py-2 text-left">고객사</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">유형</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">예정일</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">예상 매출</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">정확도</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">우선순위</th>
                </tr>
              </thead>
              <tbody>
                {opportunities.map((opportunity) => (
                  <tr key={opportunity.id} className="hover:bg-gray-50">
                    <td className="border border-gray-300 px-4 py-2">{opportunity.company}</td>
                    <td className="border border-gray-300 px-4 py-2">
                      <span className={`px-2 py-1 rounded text-sm ${
                        opportunity.type === 'contact' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                      }`}>
                        {opportunity.type === 'contact' ? '영업 접촉' : '주문 예측'}
                      </span>
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      {new Date(opportunity.date).toLocaleDateString()}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      {((typeof opportunity.expectedRevenue === 'number' ? opportunity.expectedRevenue : 0) / 1000000).toFixed(1)}M원
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      {((typeof opportunity.accuracy === 'number' ? opportunity.accuracy : 0) * 100).toFixed(1)}%
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      <span className={`px-2 py-1 rounded text-sm ${
                        opportunity.priority === 'High' ? 'bg-red-100 text-red-800' :
                        opportunity.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {opportunity.priority}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OpportunityAnalysisPage;
