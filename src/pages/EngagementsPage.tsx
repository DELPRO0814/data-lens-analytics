/**
 * EngagementsPage 컴포넌트
 * -----------------------------------------------------
 * 주요 동작 요약:
 * - 고객의 디지털 참여도(사이트 방문, 뉴스레터 열람 등) 데이터를 관리하는 페이지
 * - Supabase engagements 테이블과 customers 테이블을 조인해 데이터 표시
 * - 숫자 범위, 다중 선택, 날짜 범위 필터를 통해 데이터 탐색 가능
 * - CSV/JSON 내보내기 기능으로 데이터 외부 활용 지원
 * 
 * 상세 설명:
 * - engagements 테이블에서 고객 활동 데이터 조회 (최신 활동일 순 정렬)
 * - customers 테이블과 조인해 고객사명 표시
 * - 사이트 방문/뉴스레터 열람 수는 숫자 범위 필터 적용
 * - 설문 응답 여부는 Y/N으로 필터링 가능
 * - 최근 활동일은 날짜 범위 선택으로 필터링
 */

import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import PageHeader from '@/components/common/PageHeader';
import DataTable from '@/components/common/DataTable';

const EngagementsPage = () => {
  // 상태 관리
  const [engagements, setEngagements] = useState([]);  // 참여도 데이터
  const [loading, setLoading] = useState(true);        // 로딩 상태
  const { toast } = useToast();                       // 토스트 알림 훅

  // 컴포넌트 마운트 시 데이터 조회
  useEffect(() => {
    fetchEngagements();
  }, []);

  /**
   * 참여도 데이터 조회 함수
   * - engagements 테이블과 customers 테이블 조인
   * - 최근 활동일(last_active_date) 기준 내림차순 정렬
   * - 에러 발생 시 토스트 알림 및 콘솔 로깅
   */
  const fetchEngagements = async () => {
    try {
      const { data, error } = await supabase
        .from('engagements')
        .select(`
          *,
          customers(company_name)
        `)
        .order('last_active_date', { ascending: false });

      if (error) throw error;
      setEngagements(data || []);
    } catch (error) {
      console.error('참여도 데이터 로딩 오류:', error);
      toast({
        title: "오류",
        description: "참여도 데이터를 불러오는데 실패했습니다.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // 테이블 컬럼 설정
  const columns = [
    { 
      key: 'customers', 
      label: '고객사',
      render: (value: any) => value?.company_name || '-'  // 고객사명 조회
    },
    { 
      key: 'site_visits', 
      label: '사이트 방문',
      render: (value: number) => value ? `${value}회` : '0회'  // 회차 표시
    },
    { 
      key: 'newsletter_opens', 
      label: '뉴스레터 열람',
      render: (value: number) => value ? `${value}회` : '0회'
    },
    { key: 'survey_response', label: '설문 응답' },  // 기본 값 표시
    { 
      key: 'last_active_date', 
      label: '최근 활동일',
      render: (value: string) => value ? new Date(value).toLocaleDateString() : '-'  // 날짜 포맷팅
    }
  ];

  // 필터 설정
  const filterFields = [
    {
      key: 'newsletter_opens',
      label: '뉴스레터 열람 수',
      type: 'numberRange' as const  // 숫자 범위 필터
    },
    {
      key: 'site_visits',
      label: '사이트 방문 수',
      type: 'numberRange' as const
    },
    {
      key: 'survey_response',
      label: '설문 응답',
      type: 'multiSelect' as const,  // 다중 선택 필터
      options: [
        { value: 'Y', label: '응답함' },
        { value: 'N', label: '응답안함' }
      ]
    },
    {
      key: 'last_active_date',
      label: '최근 활동일',
      type: 'dateRange' as const  // 날짜 범위 필터
    }
  ];

  // 로딩 상태 표시
  if (loading) {
    return <div className="text-center py-8">참여도 데이터를 불러오는 중...</div>;
  }

  return (
    <div>
      {/* 페이지 헤더 */}
      <PageHeader 
        title="고객 참여도" 
        description="고객의 디지털 참여도 및 활동을 관리합니다. 사이트 방문, 뉴스레터 열람, 설문 응답 데이터를 확인할 수 있습니다."
      />
      
      {/* 데이터 테이블 */}
      <DataTable 
        data={engagements}
        columns={columns}
        searchPlaceholder="고객사, 활동으로 검색..."
        // filterFields={filterFields}
        exportable={true}
        tableName="engagements"
      />
    </div>
  );
};

export default EngagementsPage;
