
import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import PageHeader from '@/components/common/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { AlertTriangle, TrendingUp, DollarSign, Calendar } from 'lucide-react';

const PriorityDashboardPage = () => {
  const [highRiskCustomers, setHighRiskCustomers] = useState([]);
  const [stats, setStats] = useState({
    totalHighRisk: 0,
    totalClaimRisk: 0,
    avgCLV: 0,
    urgentIssues: 0
  });
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchPriorityData();
  }, []);

  const fetchPriorityData = async () => {
    try {
      // 고위험 세그먼트 고객 조회
      const { data: segmentData, error: segmentError } = await supabase
        .from('segments')
        .select(`
          *,
          contacts(name, customers(company_name))
        `)
        .eq('predicted_risk_level', 'High')
        .order('clv', { ascending: false });

      if (segmentError) throw segmentError;

      // 고위험 클레임 예측 고객 조회
      const { data: claimData, error: claimError } = await supabase
        .from('claims')
        .select(`
          *,
          contacts(name, customers(company_name))
        `)
        .eq('predicted_claim_level', 'High')
        .gte('predicted_claim_probability', 0.7);

      if (claimError) throw claimError;

      // 최근 영업 활동 조회
      const { data: activityData, error: activityError } = await supabase
        .from('sales_activities')
        .select('*')
        .order('activity_date', { ascending: false });

      if (activityError) throw activityError;

      // 미해결 이슈 조회
      const { data: issueData, error: issueError } = await supabase
        .from('issues')
        .select('*')
        .eq('severity', 'High')
        .neq('status', '해결됨');

      if (issueError) throw issueError;

      // 데이터 결합 및 처리
      const combinedData = [...(segmentData || []), ...(claimData || [])];
      const uniqueCustomers = combinedData.reduce((acc, curr) => {
        const key = curr.contacts?.customers?.company_name;
        if (!acc[key]) {
          acc[key] = {
            company: key,
            contact: curr.contacts?.name,
            clv: curr.clv || 0,
            riskLevel: curr.predicted_risk_level || curr.predicted_claim_level,
            claimProbability: curr.predicted_claim_probability || 0,
            lastActivity: activityData?.find(a => a.customer_id === curr.contacts?.customers?.customer_id)?.activity_date
          };
        }
        return acc;
      }, {});

      const priorityCustomers = Object.values(uniqueCustomers);
      setHighRiskCustomers(priorityCustomers);

      // 통계 계산
      setStats({
        totalHighRisk: segmentData?.length || 0,
        totalClaimRisk: claimData?.length || 0,
        avgCLV: segmentData?.reduce((sum, item) => sum + (item.clv || 0), 0) / (segmentData?.length || 1),
        urgentIssues: issueData?.length || 0
      });

      // 차트 데이터 준비
      const riskLevelChart = [
        { name: '세그먼트 위험', value: segmentData?.length || 0, color: '#ff6b6b' },
        { name: '클레임 위험', value: claimData?.length || 0, color: '#feca57' },
        { name: '미해결 이슈', value: issueData?.length || 0, color: '#ff9ff3' }
      ];
      setChartData(riskLevelChart);

    } catch (error) {
      console.error('우선순위 데이터 로딩 오류:', error);
      toast({
        title: "오류",
        description: "우선순위 데이터를 불러오는데 실패했습니다.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8">로딩중...</div>;
  }

  return (
    <div className="space-y-6">
      <PageHeader 
        title="우선순위 대시보드" 
        description="고위험 고객 및 즉시 대응이 필요한 이슈를 관리합니다."
      />

      {/* 주요 지표 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">고위험 세그먼트</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.totalHighRisk}</div>
            <p className="text-xs text-muted-foreground">즉시 관리 필요</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">클레임 위험</CardTitle>
            <TrendingUp className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.totalClaimRisk}</div>
            <p className="text-xs text-muted-foreground">사전 대응 필요</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">평균 CLV</CardTitle>
            <DollarSign className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {Math.round(stats.avgCLV).toLocaleString()}원
            </div>
            <p className="text-xs text-muted-foreground">고위험 고객 평균</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">긴급 이슈</CardTitle>
            <Calendar className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{stats.urgentIssues}</div>
            <p className="text-xs text-muted-foreground">미해결 심각 이슈</p>
          </CardContent>
        </Card>
      </div>

      {/* 차트 섹션 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>위험 유형별 분포</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>고위험 고객 CLV 분석</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={highRiskCustomers.slice(0, 10)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="company" 
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  fontSize={12}
                />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="clv" fill="#ff6b6b" name="CLV (원)" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* 우선순위 고객 테이블 */}
      <Card>
        <CardHeader>
          <CardTitle>우선순위 고객 목록</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border border-gray-300 px-4 py-2 text-left">고객사</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">담당자</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">CLV</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">위험도</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">클레임 확률</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">최근 활동</th>
                </tr>
              </thead>
              <tbody>
                {highRiskCustomers.slice(0, 20).map((customer, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="border border-gray-300 px-4 py-2">{customer.company || '-'}</td>
                    <td className="border border-gray-300 px-4 py-2">{customer.contact || '-'}</td>
                    <td className="border border-gray-300 px-4 py-2">
                      {customer.clv ? `${customer.clv.toLocaleString()}원` : '-'}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      <span className={`px-2 py-1 rounded text-sm ${
                        customer.riskLevel === 'High' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {customer.riskLevel}
                      </span>
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      {customer.claimProbability ? `${(customer.claimProbability * 100).toFixed(1)}%` : '-'}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      {customer.lastActivity ? new Date(customer.lastActivity).toLocaleDateString() : '활동 없음'}
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

export default PriorityDashboardPage;
