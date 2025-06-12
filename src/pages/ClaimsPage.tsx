/**
 * ClaimsPage 컴포넌트
 * -----------------------------------------------------
 * 주요 동작 요약:
 * - AI 예측 클레임 데이터를 표시/관리하는 페이지입니다.
 * - Supabase에서 claims 테이블 데이터를 조회하며 연관된 contacts/customers 테이블과 조인합니다.
 * - 데이터 테이블에 검색, 고급 필터링(다중 선택/날짜 범위/숫자 범위), CSV/JSON 내보내기 기능을 제공합니다.
 * - 컬럼별 커스텀 렌더링으로 % 변환, 날짜 포맷팅, 관계형 데이터 표시를 처리합니다.
 * - 로딩 상태 관리 및 에러 발생 시 사용자 알림 기능을 포함합니다.
 *
 * 상세 설명:
 * - 페이지 진입 시 useEffect로 Supabase에서 클레임 데이터 자동 조회
 * - claims 테이블과 contacts(연락처), customers(고객사) 테이블을 조인해 데이터 가져옴
 * - 예측일(prediction_date) 기준 최신순 정렬
 * - DataTable 컴포넌트에 페이지네이션, 컬럼 정렬, 행 클릭 기능 등 기본 제공
 * - filterFields로 다중 선택/날짜 범위/숫자 범위 등 4가지 유형의 필터 구현
 * - 확률/신뢰도는 소수점 → % 변환, 날짜는 locale 형식으로 포맷팅
 */

import React, { useEffect, useState, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import PageHeader from '@/components/common/PageHeader';
import DataTable from '@/components/common/DataTable';
import { Badge } from '@/components/ui/badge';
import ClaimStatsCards from '@/components/claims/ClaimStatsCards';

const ClaimsPage = () => {
  // 상태 관리: 클레임 데이터와 로딩 상태
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // 컴포넌트 마운트 시 클레임 데이터 불러오기
  useEffect(() => {
    fetchClaims();
  }, []);

  /**
   * 클레임 데이터 조회 함수
   * - Supabase 쿼리: claims 테이블 + contacts(name) + customers(company_name) 조인
   * - 예측일(prediction_date) 내림차순 정렬
   * - 에러 발생 시 toast 알림 및 콘솔 로깅
   */
  const fetchClaims = async () => {
    try {
      const { data, error } = await supabase
        .from('claims')
        .select(`
          *,
          contacts(name, customers!inner(company_name))
        `)
        .order('prediction_date', { ascending: false });

      if (error) throw error;
      setClaims(data || []);
    } catch (error) {
      console.error('클레임 데이터 로딩 오류:', error);
      toast({
        title: "오류",
        description: "클레임 데이터를 불러오는데 실패했습니다.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // ✅ 1. '데이터 평탄화' 로직 추가
    const tableData = useMemo(() => {
      if (!claims || claims.length === 0) return [];
      
      return claims.map(item => ({
        ...item,
        // 중첩된 데이터를 최상위 키로 만듭니다.
        companyName: item.contacts?.customers?.company_name || '-',
        managerName: item.contacts?.name || '-',
      }));
    }, [claims]);

  /**
   * 테이블 컬럼 정의
   * - key: 데이터 필드명
   * - label: 컬럼 헤더 텍스트
   * - render: 커스텀 렌더링 함수(옵션)
   */
  // 예측 클레임 수준에 따른 색상 맵
const levelColorMap = {
  High: 'red',
  Medium: 'orange',
  Low: 'green',
};

// ✅ [2. 추가] 요약 통계 계산 로직
  const summaryStats = useMemo(() => {
    const totalCount = tableData.length;
    if (totalCount === 0) {
      return { totalCount: 0, highRiskCount: 0, avgProbability: 0, avgConfidence: 0 };
    }

    const highRiskCount = tableData.filter(
      (claim) => claim.predicted_claim_level === 'High'
    ).length;

    const totalProbability = tableData.reduce(
      (sum, claim) => sum + (claim.predicted_claim_probability || 0), 0
    );
    const avgProbability = (totalProbability / totalCount) * 100;

    const totalConfidence = tableData.reduce(
      (sum, claim) => sum + (claim.confidence_score || 0), 0
    );
    const avgConfidence = (totalConfidence / totalCount) * 100;

    return { totalCount, highRiskCount, avgProbability, avgConfidence };
  }, [tableData]);

 const columns = [
  { 
    key: 'claim_id', 
    label: '클레임번호',
    width: 120,
    align: 'center' as const,
    headerAlign: 'center' as const,
    fontWeight: '600',
    cellClassName: "font-mono text-muted-foreground"
  },
  { 
    key: 'companyName',
    label: '고객사',
    minWidth: 150,
    fontWeight: '500',
  },
  { 
    key: 'managerName',
    label: '담당자',
    minWidth: 120,
    sortable: false, // 담당자 이름은 정렬 기능 비활성화
  },
  { 
    key: 'predicted_claim_level', 
    label: '예측 클레임 수준',
    align: 'center' as const,
    headerAlign: 'center' as const,
    width: 150,
     render: (level: 'High' | 'Medium' | 'Low') => {
      // ✅ [수정] Medium의 variant를 'default'로 변경하여 파란색으로 표시합니다.
      const variant = level === 'High' ? 'destructive' : level === 'Medium' ? 'default' : 'secondary';
      return <Badge variant={variant} className="text-xs px-2 py-0.5">{level || 'N/A'}</Badge>;
    }
  },
  { 
    key: 'predicted_claim_type', 
    label: '예측 클레임 유형',
    width: 150,
  },
  { 
    key: 'predicted_claim_probability', 
    label: '발생 확률',
    align: 'right' as const,
    headerAlign: 'right' as const,
    width: 120,
    // 확률 값에 따라 동적으로 글자 색상 변경
    color: (value: number) => {
      if (!value) return undefined;
      if (value >= 0.7) return 'hsl(var(--destructive))'; // destructive 색상 (보통 빨간색)
      if (value >= 0.5) return 'hsl(var(--primary))';     // primary 색상 (보통 주황/노란색 계열)
      return undefined; // 기본값
    },
    render: (value: number) => value ? `${(value * 100).toFixed(1)}%` : '-'
  },
  { 
    key: 'confidence_score', 
    label: '신뢰도',
    width: 150,
    sortable: false,
    // 신뢰도 점수를 프로그레스 바 형태로 시각화
    render: (value: number) => {
      const score = (value || 0) * 100;
      let bgColor = 'bg-green-500';
      if (score < 80) bgColor = 'bg-yellow-500';
      if (score < 60) bgColor = 'bg-red-500';
      
      return (
        <div className="flex items-center gap-2">
          <div className="w-full bg-muted rounded-full h-2.5">
            <div className={`${bgColor} h-2.5 rounded-full`} style={{ width: `${score}%` }}></div>
          </div>
          <span className="font-semibold w-12 text-right">{score.toFixed(0)}%</span>
        </div>
      );
    }
  },
  { 
    key: 'prediction_date', 
    label: '예측일',
    align: 'center' as const,
    headerAlign: 'center' as const,
    width: 140,
    render: (value: string) => value ? new Date(value).toLocaleDateString() : '-'
  }
];

  const filterFields = [
    {
      key: 'predicted_claim_level',
      label: '예측 클레임 수준',
      type: 'multiSelect' as const,
      options: [
        { value: 'Low', label: '낮음' },
        { value: 'Medium', label: '보통' },
        { value: 'High', label: '높음' }
      ]
    },
    {
      key: 'predicted_claim_type',
      label: '예측 클레임 유형',
      type: 'multiSelect' as const,
      options: [
        { value: '제품 불량', label: '품질' },
        { value: '배송 지연', label: '배송' },
        { value: '기타 문제', label: '기타' },
        { value: '없음', label: '없음' },
        { value: '알 수 없음', label: '알 수 없음' }
      ]
    },
    {
      key: 'prediction_date',
      label: '예측일',
      type: 'dateRange' as const
    },
    {
      key: 'confidence_score',
      label: '신뢰도',
      type: 'numberRange' as const
    }
  ];

  // 로딩 상태 표시
  if (loading) {
    return <div className="text-center py-8">클레임 데이터를 불러오는 중...</div>;
  }

  


  return (
    <div>
      {/* 페이지 헤더: 제목과 설명 */}
      <PageHeader 
        title="클레임 예측" 
        description="AI 기반 클레임 발생 예측 정보를 관리합니다. 예측일, 유형, 신뢰도별로 필터링할 수 있습니다."
      />
      
      {/* ✅ [3. 추가] 계산된 통계를 카드 섹션에 전달하여 렌더링 */}
      <div className="mb-6">
        <ClaimStatsCards stats={summaryStats} />
      </div>

      {/* 데이터 테이블: 검색/필터/내보내기 기능 포함 */}
      <DataTable 
        data={tableData}
        columns={columns}
        searchPlaceholder="클레임번호, 고객사로 검색..."
        filterFields={filterFields}
        exportable={true}
        tableName="claims"
      />
    </div>
  );
};

export default ClaimsPage;
