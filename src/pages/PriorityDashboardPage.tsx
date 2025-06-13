/**
 * PriorityDashboardPage 컴포넌트
 * -----------------------------------------------------
 * 주요 동작 요약:
 * - 고위험 고객(세그먼트/클레임), 미해결 이슈 등 즉시 관리가 필요한 고객과 이슈를 통합적으로 대시보드로 제공합니다.
 * - Supabase에서 여러 테이블(segments, claims, sales_activities, issues)을 병렬로 조회해 데이터를 결합합니다.
 * - 주요 지표 카드(고위험 세그먼트, 클레임 위험, 평균 CLV, 긴급 이슈), 위험 유형별 파이차트, 상위 고객 CLV 바차트, 상세 테이블을 제공합니다.
 * - 데이터 결합, 통계 산출, 차트 데이터 가공 등 실무 대시보드에 필요한 모든 로직이 포함되어 있습니다.
 *
 * 상세 설명:
 * - fetchPriorityData에서 4개 테이블을 병렬로 조회, 회사명 기준으로 데이터를 결합해 고위험 고객 목록을 만듭니다.
 * - 세그먼트/클레임/이슈 각각의 위험 건수, 평균 CLV, 미해결 이슈 수 등 주요 통계를 산출합니다.
 * - PieChart, BarChart로 위험 유형별 분포와 상위 고객 CLV를 시각화합니다.
 * - 상세 테이블에서 고객사, 담당자, CLV, 위험도, 클레임 확률, 최근 활동일을 한눈에 확인할 수 있습니다.
 * - 로딩/에러 상태를 처리하며, 실무에서 바로 활용 가능한 구조입니다.
 */

/**
 * PriorityDashboardPage 컴포넌트
 * -----------------------------------------------------
 * 주요 동작 요약:
 * - 고위험 고객(세그먼트/클레임), 미해결 이슈 등 즉시 관리가 필요한 고객과 이슈를 통합적으로 대시보드로 제공합니다.
 * - Supabase에서 여러 테이블(segments, claims, sales_activities, issues)을 병렬로 조회해 데이터를 결합합니다.
 * - 주요 지표 카드(고위험 세그먼트, 클레임 위험, 평균 CLV, 긴급 이슈), 위험 유형별 파이차트, 상위 고객 CLV 바차트, 상세 테이블을 제공합니다.
 * - 데이터 결합, 통계 산출, 차트 데이터 가공 등 실무 대시보드에 필요한 모든 로직이 포함되어 있습니다.
 *
 * 상세 설명:
 * - fetchPriorityData에서 4개 테이블을 병렬로 조회, 회사명 기준으로 데이터를 결합해 고위험 고객 목록을 만듭니다.
 * - 세그먼트/클레임/이슈 각각의 위험 건수, 평균 CLV, 미해결 이슈 수 등 주요 통계를 산출합니다.
 * - PieChart, BarChart로 위험 유형별 분포와 상위 고객 CLV를 시각화합니다.
 * - 상세 테이블에서 고객사, 담당자, CLV, 위험도, 클레임 확률, 최근 활동일을 한눈에 확인할 수 있습니다.
 * - 로딩/에러 상태를 처리하며, 실무에서 바로 활용 가능한 구조입니다.
 */

import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import PageHeader from '@/components/common/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { AlertTriangle, TrendingUp, DollarSign, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom'; // << [수정 1] Link 컴포넌트 import

// 고위험 고객 데이터 타입 정의
interface CombinedCustomerData {
  customer_id: number | string; // << [수정 2] customer_id 속성 추가
  company: string;
  contact: string;
  clv: number;
  riskLevel: string;
  claimProbability: number;
  lastActivity: string | null;
}

const PriorityDashboardPage = () => {
  // 고위험 고객 목록
  const [highRiskCustomers, setHighRiskCustomers] = useState<CombinedCustomerData[]>([]);
  // 주요 통계 상태
  const [stats, setStats] = useState({
    totalHighRisk: 0,
    totalClaimRisk: 0,
    avgCLV: 0,
    urgentIssues: 0
  });
  // 차트 데이터 상태
  const [chartData, setChartData] = useState<any[]>([]);
  // 로딩 상태
  const [loading, setLoading] = useState(true);
  // 토스트 알림 훅
  const { toast } = useToast();

  // 페이지 마운트 시 데이터 조회
  useEffect(() => {
    fetchPriorityData();
  }, []);

  /**
   * 우선순위 대시보드 데이터 종합 조회 및 가공
   * - 고위험 세그먼트, 고위험 클레임, 최근 영업활동, 미해결 이슈 데이터 병렬 조회
   * - 회사명 기준으로 데이터를 결합, 통계/차트/테이블용 데이터 가공
   */
  const fetchPriorityData = async () => {
    try {
      // 1. 고위험 세그먼트 고객 조회
      const { data: segmentData, error: segmentError } = await supabase
        .from('segments')
        .select(`*, contacts(name, customers(company_name, customer_id))`)
        .eq('predicted_risk_level', 'High')
        .order('clv', { ascending: false });
      if (segmentError) throw segmentError;

      // 2. 고위험 클레임 예측 고객 조회
      const { data: claimData, error: claimError } = await supabase
        .from('claims')
        .select(`*, contacts(name, customers(company_name, customer_id))`)
        .eq('predicted_claim_level', 'High')
        .gte('predicted_claim_probability', 0.7);
      if (claimError) throw claimError;

      // 3. 최근 영업 활동 조회
      const { data: activityData, error: activityError } = await supabase
        .from('sales_activities')
        .select('*')
        .order('activity_date', { ascending: false });
      if (activityError) throw activityError;

      // 4. 미해결 이슈 조회
      const { data: issueData, error: issueError } = await supabase
        .from('issues')
        .select('*')
        .eq('severity', 'High')
        .neq('status', '해결됨');
      if (issueError) throw issueError;

      // 5. 데이터 결합(회사명 기준) 및 고위험 고객 목록 생성
      const combinedData: Record<string, CombinedCustomerData> = {};
      // 세그먼트 데이터 처리
      segmentData?.forEach(segment => {
        const key = segment.contacts?.customers?.company_name;
        const customerId = segment.contacts?.customers?.customer_id; // << [수정 3] customer_id 추출
        if (key && !combinedData[key] && customerId) {
          combinedData[key] = {
            customer_id: customerId, // << [수정 3] customer_id 저장
            company: key,
            contact: segment.contacts?.name || '',
            clv: segment.clv || 0,
            riskLevel: segment.predicted_risk_level || 'Unknown',
            claimProbability: 0,
            lastActivity: activityData?.find(a => a.customer_id === customerId)?.activity_date || null
          };
        }
      });
      // 클레임 데이터 처리 및 결합
      claimData?.forEach(claim => {
        const key = claim.contacts?.customers?.company_name;
        const customerId = claim.contacts?.customers?.customer_id; // << [수정 3] customer_id 추출
        if (key && customerId) {
          if (!combinedData[key]) {
            combinedData[key] = {
              customer_id: customerId, // << [수정 3] customer_id 저장
              company: key,
              contact: claim.contacts?.name || '',
              clv: 0,
              riskLevel: claim.predicted_claim_level || 'Unknown',
              claimProbability: claim.predicted_claim_probability || 0,
              lastActivity: activityData?.find(a => a.customer_id === customerId)?.activity_date || null
            };
          } else {
            combinedData[key].claimProbability = claim.predicted_claim_probability || 0;
            if (!combinedData[key].riskLevel || combinedData[key].riskLevel === 'Unknown') {
              combinedData[key].riskLevel = claim.predicted_claim_level || 'Unknown';
            }
          }
        }
      });
      // 최종 고위험 고객 목록
      const priorityCustomers = Object.values(combinedData);
      setHighRiskCustomers(priorityCustomers);

      // 6. 주요 통계 계산
      const segmentCount = segmentData?.length || 0;
      const claimCount = claimData?.length || 0;
      const totalCLV = segmentData?.reduce((sum, item) => sum + (item.clv || 0), 0) || 0;
      const avgCLV = segmentCount > 0 ? totalCLV / segmentCount : 0;
      setStats({
        totalHighRisk: segmentCount,
        totalClaimRisk: claimCount,
        avgCLV: avgCLV,
        urgentIssues: issueData?.length || 0
      });

      // 7. 위험 유형별 차트 데이터 준비
      const riskLevelChart = [
        { name: '세그먼트 위험', value: segmentCount, color: '#ff6b6b' },
        { name: '클레임 위험', value: claimCount, color: '#feca57' },
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

  // 로딩 상태 표시
  if (loading) {
    return <div className="text-center py-8">로딩중...</div>;
  }

  return (
    <div className="space-y-6">
      {/* 페이지 헤더 */}
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
                    {/* // << [수정 4] 고객사명에 Link 적용 시작 */}
                    <td className="border border-gray-300 px-4 py-2">
                      <Link
                        to={`/customers/${customer.customer_id}`} // href -> to로 변경
                        className="font-medium text-blue-600 underline-offset-4 hover:underline"
                      >
                        {customer.company || '-'}
                      </Link>
                      </td>
                    {/* // << [수정 4] 고객사명에 Link 적용 끝 */}
                    <td className="border border-gray-300 px-4 py-2">{customer.contact || '-'}</td>
                    <td className="border border-gray-300 px-4 py-2">
                      {customer.clv ? `${customer.clv.toLocaleString()}원` : '-'}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      <span className={`px-2 py-1 rounded text-sm ${customer.riskLevel === 'High' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
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