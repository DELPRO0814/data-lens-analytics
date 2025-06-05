/**
 * SalesActivitiesPage 컴포넌트
 * -----------------------------------------------------
 * 주요 동작 요약:
 * - 영업팀의 고객 접촉 활동(전화/회의/이메일 등)을 종합적으로 관리하는 페이지
 * - Supabase의 sales_activities 테이블을 중심으로 customers/contacts 테이블 조인
 * - 활동 유형, 결과, 날짜별 필터링 및 검색 기능 제공
 * - 활동 내용, 결과, 날짜 등을 테이블 형태로 직관적으로 표시
 *
 * 상세 설명:
 * - 페이지 진입 시 최신 영업 활동 데이터 자동 조회(활동일 기준 내림차순)
 * - 3단계 관계형 데이터 조인(sales_activities → customers/contacts)
 * - 필터 유형:
 *   - 활동 유형: 다중 선택(전화/회의/이메일/프레젠테이션/데모)
 *   - 활동 날짜: 날짜 범위 선택
 *   - 결과: 다중 선택(성공/후속조치/연기/거절)
 * - 모든 날짜 필드는 로케일 형식으로 변환되어 표시
 * - CSV/JSON 내보내기 기능으로 데이터 외부 활용 가능
 */

import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import PageHeader from '@/components/common/PageHeader';
import DataTable from '@/components/common/DataTable';

const SalesActivitiesPage = () => {
  // 상태 관리
  const [activities, setActivities] = useState([]);  // 영업 활동 데이터
  const [loading, setLoading] = useState(true);     // 로딩 상태
  const { toast } = useToast();                     // 토스트 알림 훅

  // 컴포넌트 마운트 시 데이터 조회
  useEffect(() => {
    fetchActivities();
  }, []);

  /**
   * 영업 활동 데이터 조회 함수
   * - sales_activities 테이블과 customers/contacts 테이블 조인
   * - 활동일(activity_date) 기준 최신순 정렬
   * - 에러 발생 시 토스트 알림 및 콘솔 로깅
   */
  const fetchActivities = async () => {
    try {
      const { data, error } = await supabase
        .from('sales_activities')
        .select(`
          *,
          customers(company_name),
          contacts(name)
        `)
        .order('activity_date', { ascending: false });

      if (error) throw error;
      setActivities(data || []);
    } catch (error) {
      console.error('영업 활동 데이터 로딩 오류:', error);
      toast({
        title: "오류",
        description: "영업 활동 데이터를 불러오는데 실패했습니다.",
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
      render: (value: any) => value?.company_name || '-'  // 고객사명 표시
    },
    { 
      key: 'contacts', 
      label: '담당자',
      render: (value: any) => value?.name || '-'         // 담당자명 표시
    },
    { key: 'activity_type', label: '활동 유형' },
    { key: 'activity_details', label: '활동 내용' },
    { key: 'outcome', label: '결과' },
    { 
      key: 'activity_date', 
      label: '활동 날짜',
      render: (value: string) => value ? new Date(value).toLocaleDateString() : '-'  // 날짜 포맷 변환
    }
  ];

  // 필터 설정
  const filterFields = [
    {
      key: 'activity_type',
      label: '활동 유형',
      type: 'multiSelect' as const,
      options: [
        { value: 'Call', label: '전화' },
        { value: 'Meeting', label: '회의' },
        { value: 'Email', label: '이메일' },
        { value: 'Presentation', label: '프레젠테이션' },
        { value: 'Demo', label: '데모' }
      ]
    },
    {
      key: 'activity_date',
      label: '활동 날짜',
      type: 'dateRange' as const  // 날짜 범위 필터
    },
    {
      key: 'outcome',
      label: '결과',
      type: 'multiSelect' as const,
      options: [
        { value: 'Success', label: '성공' },
        { value: 'Follow-up', label: '후속조치' },
        { value: 'Postponed', label: '연기' },
        { value: 'Rejected', label: '거절' }
      ]
    }
  ];

  // 로딩 상태 표시
  if (loading) {
    return <div className="text-center py-8">영업 활동 데이터를 불러오는 중...</div>;
  }

  return (
    <div>
      {/* 페이지 헤더 */}
      <PageHeader 
        title="영업 활동" 
        description="영업팀의 고객 접촉 활동을 관리합니다. 활동 유형, 결과, 기간별로 필터링할 수 있습니다."
      />
      
      {/* 영업 활동 데이터 테이블 */}
      <DataTable 
        data={activities}
        columns={columns}
        searchPlaceholder="고객사, 활동 유형으로 검색..."
        filterFields={filterFields}
        exportable={true}
        tableName="sales_activities"
      />
    </div>
  );
};

export default SalesActivitiesPage;
