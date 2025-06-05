/**
 * SalesForecastPage 컴포넌트
 * -----------------------------------------------------
 * 주요 동작 요약:
 * - AI 기반 영업 접촉 최적 시점 예측 데이터를 관리하는 페이지
 * - 고객사별 권장 접촉일, 접촉 유형, 예측 정확도(MAPE) 등을 표시
 * - 다가오는 접촉 알림 기능으로 오늘/내일 예정 접촉을 즉시 확인 가능
 * - 접촉 유형, 날짜 범위, 예측 정확도 필터링 기능 제공
 *
 * 상세 설명:
 * - sales_contact_forecast 테이블과 customers 테이블 조인으로 고객사 정보 표시
 * - MAPE(Mean Absolute Percentage Error) 값을 %로 변환해 예측 정확도 표시
 * - 오늘/내일 예정된 접촉이 있을 경우 상단에 알림 배너 표시
 * - 모든 날짜 필드는 로케일 형식으로 변환되어 가독성 향상
 */

import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import PageHeader from '@/components/common/PageHeader';
import DataTable from '@/components/common/DataTable';
import AlertBanner from '@/components/common/AlertBanner';

const SalesForecastPage = () => {
  // 상태 관리
  const [forecasts, setForecasts] = useState([]);  // 예측 데이터 목록
  const [loading, setLoading] = useState(true);    // 로딩 상태
  const [alerts, setAlerts] = useState([]);        // 알림 배너 상태
  const { toast } = useToast();                    // 토스트 알림 훅

  // 컴포넌트 마운트 시 데이터 초기화
  useEffect(() => {
    fetchForecasts();
    checkUpcomingContacts();
  }, []);

  /**
   * 영업 접촉 예측 데이터 조회
   * - sales_contact_forecast 테이블과 customers 테이블 조인
   * - 권장 접촉일 기준 최신순 정렬
   * - 에러 발생 시 토스트 알림
   */
  const fetchForecasts = async () => {
    try {
      const { data, error } = await supabase
        .from('sales_contact_forecast')
        .select(`
          *,
          customers(company_name)
        `)
        .order('scf_recommended_date', { ascending: false });

      if (error) throw error;
      setForecasts(data || []);
    } catch (error) {
      console.error('영업 접촉 예측 데이터 로딩 오류:', error);
      toast({
        title: "오류",
        description: "영업 접촉 예측 데이터를 불러오는데 실패했습니다.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  /**
   * 다가오는 접촉 알림 체크
   * - 오늘과 내일 예정된 접촉 데이터 조회
   * - 결과 존재 시 AlertBanner에 알림 메시지 추가
   */
  const checkUpcomingContacts = async () => {
    try {
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const { data } = await supabase
        .from('sales_contact_forecast')
        .select(`
          *,
          customers(company_name)
        `)
        .gte('scf_recommended_date', today.toISOString().split('T')[0])
        .lte('scf_recommended_date', tomorrow.toISOString().split('T')[0]);

      if (data?.length) {
        setAlerts([{
          id: '1',
          type: 'info',
          title: '오늘/내일 추천 접촉',
          message: `${data.length}개의 추천 영업 접촉이 예정되어 있습니다.`,
          actionLabel: '상세 보기',
          onAction: () => console.log('Upcoming contacts:', data)
        }]);
      }
    } catch (error) {
      console.error('다가오는 접촉 체크 오류:', error);
    }
  };

  // 테이블 컬럼 설정
  const columns = [
    { key: 'scf_id', label: '예측번호' },
    { 
      key: 'customers', 
      label: '고객사',
      render: (value: any) => value?.company_name || '-'  // 고객사명 표시
    },
    { key: 'scf_type', label: '접촉 유형' },
    { 
      key: 'scf_recommended_date', 
      label: '권장 접촉일',
      render: (value: string) => value ? new Date(value).toLocaleDateString() : '-'  // 날짜 포맷
    },
    { 
      key: 'scf_mape', 
      label: 'MAPE',
      render: (value: number) => value ? `${(value * 100).toFixed(2)}%` : '-'  // % 변환
    },
    { 
      key: 'scf_generated_at', 
      label: '생성일',
      render: (value: string) => value ? new Date(value).toLocaleDateString() : '-'
    }
  ];

  // 필터 설정
  const filterFields = [
    {
      key: 'scf_type',
      label: '접촉 유형',
      type: 'multiSelect' as const,
      options: [
        { value: 'Call', label: '전화' },
        { value: 'Email', label: '이메일' },
        { value: 'Meeting', label: '회의' },
        { value: 'Visit', label: '방문' }
      ]
    },
    {
      key: 'scf_recommended_date',
      label: '권장 접촉일',
      type: 'dateRange' as const  // 날짜 범위 필터
    },
    {
      key: 'scf_mape',
      label: 'MAPE',
      type: 'numberRange' as const  // 숫자 범위 필터(0~1)
    }
  ];

  // 로딩 상태 표시
  if (loading) {
    return <div className="text-center py-8">예측 데이터를 불러오는 중...</div>;
  }

  return (
    <div>
      {/* 페이지 헤더 */}
      <PageHeader 
        title="영업 접촉 예측" 
        description="AI 기반 최적 영업 접촉 시점을 예측합니다. 접촉 유형, 예측 정확도별로 필터링할 수 있습니다."
      />
      
      {/* 다가오는 접촉 알림 배너 */}
      <AlertBanner 
        alerts={alerts} 
        onDismiss={(id) => setAlerts(alerts.filter(a => a.id !== id))} 
      />
      
      {/* 예측 데이터 테이블 */}
      <DataTable 
        data={forecasts}
        columns={columns}
        searchPlaceholder="고객사, 접촉 유형으로 검색..."
        filterFields={filterFields}
        exportable={true}
        tableName="sales_contact_forecast"
      />
    </div>
  );
};

export default SalesForecastPage;
