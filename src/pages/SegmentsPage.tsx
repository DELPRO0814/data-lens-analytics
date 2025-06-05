/**
 * SegmentsPage 컴포넌트
 * -----------------------------------------------------
 * 주요 동작 요약:
 * - 고객 세그먼트 분류 및 위험도 분석 데이터를 관리하는 페이지
 * - CLV(고객생애가치), ARR(연간반복매출), 위험수준 등을 종합적으로 분석
 * - 고위험 세그먼트 감지 시 즉시 알림 배너 표시
 * - 세그먼트 라벨, 위험 수준, CLV 범위 등 다양한 조건으로 필터링 가능
 *
 * 상세 설명:
 * - segments 테이블을 중심으로 contacts/customers 테이블 조인
 * - CLV 기준 내림차순 정렬로 고가치 고객 우선 표시
 * - 고위험 세그먼트(predicted_risk_level=High + high_risk_probability>70%) 실시간 감지
 * - 금액 데이터(CLV, ARR)는 원화 포맷팅 처리
 * - 고위험 확률은 % 변환 후 소수점 1자리까지 표시
 */

import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import PageHeader from '@/components/common/PageHeader';
import DataTable from '@/components/common/DataTable';
import AlertBanner from '@/components/common/AlertBanner';

const SegmentsPage = () => {
  // 상태 관리
  const [segments, setSegments] = useState([]);    // 세그먼트 데이터 목록
  const [loading, setLoading] = useState(true);    // 데이터 로딩 상태
  const [alerts, setAlerts] = useState([]);        // 고위험 알림 상태
  const { toast } = useToast();                    // 토스트 알림 훅

  // 컴포넌트 마운트 시 데이터 초기화
  useEffect(() => {
    fetchSegments();
    checkHighRiskSegments();
  }, []);

  /**
   * 세그먼트 데이터 조회 함수
   * - segments 테이블과 contacts/customers 테이블 조인
   * - CLV 기준 내림차순 정렬
   * - 에러 발생 시 토스트 알림 및 콘솔 로깅
   */
  const fetchSegments = async () => {
    try {
      const { data, error } = await supabase
        .from('segments')
        .select(`
          *,
          contacts(name, customers(company_name))
        `)
        .order('clv', { ascending: false });

      if (error) throw error;
      setSegments(data || []);
    } catch (error) {
      console.error('세그먼트 데이터 로딩 오류:', error);
      toast({
        title: "오류",
        description: "세그먼트 데이터를 불러오는데 실패했습니다.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  /**
   * 고위험 세그먼트 체크 함수
   * - predicted_risk_level=High이고 high_risk_probability>70%인 데이터 필터링
   * - 발견 시 AlertBanner에 경고 메시지 추가
   */
  const checkHighRiskSegments = async () => {
    try {
      const { data } = await supabase
        .from('segments')
        .select('*')
        .eq('predicted_risk_level', 'High')
        .gt('high_risk_probability', 0.7);

      if (data?.length) {
        setAlerts([{
          id: '1',
          type: 'warning',
          title: '고위험 세그먼트 알림',
          message: `${data.length}개의 고위험 세그먼트가 감지되었습니다. 즉시 대응이 필요합니다.`,
          actionLabel: '상세 보기',
          onAction: () => console.log('High risk segments:', data)
        }]);
      }
    } catch (error) {
      console.error('고위험 세그먼트 체크 오류:', error);
    }
  };

  // 테이블 컬럼 설정
  const columns = [
    { 
      key: 'contacts', 
      label: '고객사',
      render: (value: any) => value?.customers?.company_name || '-'  // 3단계 관계형 데이터 접근
    },
    { 
      key: 'contacts', 
      label: '담당자',
      render: (value: any) => value?.name || '-'
    },
    { key: 'segment_label', label: '세그먼트' },
    { 
      key: 'clv', 
      label: 'CLV',
      render: (value: number) => `${value.toLocaleString()}원`  // 천단위 포맷
    },
    { 
      key: 'arr', 
      label: 'ARR',
      render: (value: number) => `${value.toLocaleString()}원` 
    },
    { key: 'predicted_risk_level', label: '위험 수준' },
    { 
      key: 'high_risk_probability', 
      label: '고위험 확률',
      render: (value: number) => value ? `${(value * 100).toFixed(1)}%` : '-'  // % 변환
    }
  ];

  // 필터 설정
  const filterFields = [
    {
      key: 'predicted_risk_level',
      label: '위험 수준',
      type: 'multiSelect' as const,
      options: [
        { value: 'Low', label: '낮음' },
        { value: 'Medium', label: '보통' },
        { value: 'High', label: '높음' }
      ]
    },
    {
      key: 'segment_label',
      label: '세그먼트',
      type: 'multiSelect' as const,
      options: [  // 하드코딩 대신 DB에서 동적 로드 가능
        { value: 'Premium', label: '프리미엄' },
        { value: 'Standard', label: '표준' },
        { value: 'Basic', label: '기본' },
        { value: 'VIP', label: 'VIP' }
      ]
    },
    {
      key: 'clv',
      label: 'CLV',
      type: 'numberRange' as const  // 숫자 범위 필터
    }
  ];

  // 로딩 상태 표시
  if (loading) {
    return <div className="text-center py-8">세그먼트 데이터를 불러오는 중...</div>;
  }

  return (
    <div>
      {/* 페이지 헤더 */}
      <PageHeader 
        title="고객 세그먼트" 
        description="고객 세그먼트 및 위험도 분석 정보를 관리합니다. CLV, 위험 수준, 세그먼트별 필터링이 가능합니다."
      />
      
      {/* 고위험 알림 배너 */}
      <AlertBanner 
        alerts={alerts} 
        onDismiss={(id) => setAlerts(alerts.filter(a => a.id !== id))} 
      />
      
      {/* 세그먼트 데이터 테이블 */}
      <DataTable 
        data={segments}
        columns={columns}
        searchPlaceholder="고객사, 세그먼트로 검색..."
        filterFields={filterFields}
        exportable={true}
        tableName="segments"
      />
    </div>
  );
};

export default SegmentsPage;
