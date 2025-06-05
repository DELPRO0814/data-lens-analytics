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

import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import PageHeader from '@/components/common/PageHeader';
import DataTable from '@/components/common/DataTable';

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

  /**
   * 테이블 컬럼 정의
   * - key: 데이터 필드명
   * - label: 컬럼 헤더 텍스트
   * - render: 커스텀 렌더링 함수(옵션)
   */
  const columns = [
    // 클레임 고유 번호
    { key: 'claim_id', label: '클레임번호' },
    // 고객사명(contacts → customers 관계 탐색)
    { 
      key: 'contacts', 
      label: '고객사',
      render: (value: any) => value?.customers?.company_name || '-' 
    },
    // 담당자명(contacts 테이블 직접 참조)
    { 
      key: 'contacts', 
      label: '담당자',
      render: (value: any) => value?.name || '-' 
    },
    // AI 예측 클레임 수준(High/Medium/Low)
    { key: 'predicted_claim_level', label: '예측 클레임 수준' },
    // AI 예측 클레임 유형(Quality/Delivery 등)
    { key: 'predicted_claim_type', label: '예측 클레임 유형' },
    // 발생 확률(% 변환)
    { 
      key: 'predicted_claim_probability', 
      label: '발생 확률',
      render: (value: number) => value ? `${(value * 100).toFixed(1)}%` : '-'
    },
    // AI 신뢰도(% 변환)
    { 
      key: 'confidence_score', 
      label: '신뢰도',
      render: (value: number) => value ? `${(value * 100).toFixed(1)}%` : '-'
    },
    // 예측일(날짜 포맷 변환)
    { 
      key: 'prediction_date', 
      label: '예측일',
      render: (value: string) => value ? new Date(value).toLocaleDateString() : '-'
    }
  ];

  /**
   * 필터 설정
   * - type: 필터 유형(multiSelect/dateRange/numberRange)
   * - options: 선택형 필터의 옵션 목록
   */
  const filterFields = [
    // 클레임 수준 다중 선택 필터
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
    // 클레임 유형 다중 선택 필터
    {
      key: 'predicted_claim_type',
      label: '예측 클레임 유형',
      type: 'multiSelect' as const,
      options: [
        { value: 'Quality', label: '품질' },
        { value: 'Delivery', label: '배송' },
        { value: 'Service', label: '서비스' },
        { value: 'Warranty', label: '보증' }
      ]
    },
    // 예측일 범위 선택 필터
    {
      key: 'prediction_date',
      label: '예측일',
      type: 'dateRange' as const
    },
    // 신뢰도 범위 입력 필터(0~1 사이 값)
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
      
      {/* 데이터 테이블: 검색/필터/내보내기 기능 포함 */}
      <DataTable 
        data={claims}
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
