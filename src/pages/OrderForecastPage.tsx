/**
 * OrderForecastPage 컴포넌트
 * -----------------------------------------------------
 * 주요 동작 요약:
 * - 고객별 AI 주문 예측 데이터를 테이블로 시각화, 검색, 필터링, 내보내기 기능을 제공합니다.
 * - Supabase의 customer_order_forecast 테이블과 customers 테이블을 조인해 데이터를 조회합니다.
 * - 예측 수량, 주문일, 예측 모델, MAPE(정확도), 생성일시 등 주요 정보를 한눈에 볼 수 있습니다.
 * - 예측 모델, 주문일(날짜 범위), 예측 수량(숫자 범위) 등 다양한 필터로 데이터 탐색이 가능합니다.
 *
 * 상세 설명:
 * - 페이지 마운트 시 Supabase에서 데이터를 불러오고, 로딩/에러 상태를 관리합니다.
 * - 컬럼별 커스텀 렌더링으로 날짜, 수량, MAPE(%) 등 가독성을 높입니다.
 * - DataTable 컴포넌트의 exportable 옵션으로 CSV/JSON 내보내기를 지원합니다.
 * - 실무에서 AI 예측 결과를 운영/분석 목적으로 활용할 수 있는 표준적인 구조입니다.
 */

import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import PageHeader from '@/components/common/PageHeader';
import DataTable from '@/components/common/DataTable';

const OrderForecastPage = () => {
  // 예측 데이터 상태
  const [forecasts, setForecasts] = useState([]);
  // 로딩 상태
  const [loading, setLoading] = useState(true);
  // 토스트 알림 훅
  const { toast } = useToast();

  // 컴포넌트 마운트 시 데이터 조회
  useEffect(() => {
    fetchForecasts();
  }, []);

  /**
   * 고객 주문 예측 데이터 조회 함수
   * - Supabase에서 customer_order_forecast + customers 조인
   * - 예측일 내림차순 정렬
   * - 에러 발생 시 토스트 알림
   */
  const fetchForecasts = async () => {
    try {
      const { data, error } = await supabase
        .from('customer_order_forecast')
        .select(`
          *,
          customers(company_name)
        `)
        .order('predicted_date', { ascending: false });

      if (error) throw error;
      setForecasts(data || []);
    } catch (error) {
      console.error('고객 주문 예측 데이터 로딩 오류:', error);
      toast({
        title: "오류",
        description: "고객 주문 예측 데이터를 불러오는데 실패했습니다.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // 테이블 컬럼 정의
  const columns = [
    { key: 'cof_id', label: '예측번호' },
    { 
      key: 'customers', 
      label: '고객사',
      render: (value: any) => value?.company_name || '-'
    },
    { 
      key: 'predicted_quantity', 
      label: '예측 수량',
      render: (value: number) => value ? `${value.toLocaleString()}개` : '-'
    },
    { 
      key: 'predicted_date', 
      label: '예측 주문일',
      render: (value: string) => value ? new Date(value).toLocaleDateString() : '-'
    },
    { key: 'prediction_model', label: '예측 모델' },
    { 
      key: 'mape', 
      label: 'MAPE',
      render: (value: number) => value ? `${(value * 100).toFixed(2)}%` : '-'
    },
    { 
      key: 'forecast_generation_datetime', 
      label: '생성일시',
      render: (value: string) => value ? new Date(value).toLocaleString() : '-'
    }
  ];

  // 필터 정의
  const filterFields = [
    {
      key: 'prediction_model',
      label: '예측 모델',
      type: 'multiSelect' as const,
      options: [
        { value: 'ARIMA', label: 'ARIMA' },
        { value: 'LinearRegression', label: '선형회귀' },
        { value: 'RandomForest', label: '랜덤포레스트' },
        { value: 'NeuralNetwork', label: '신경망' }
      ]
    },
    {
      key: 'predicted_date',
      label: '예측 주문일',
      type: 'dateRange' as const
    },
    {
      key: 'predicted_quantity',
      label: '예측 수량',
      type: 'numberRange' as const
    }
  ];

  // 로딩 중 안내
  if (loading) {
    return <div className="text-center py-8">로딩중...</div>;
  }

  return (
    <div>
      {/* 페이지 헤더 */}
      <PageHeader 
        title="고객 주문 예측" 
        description="AI 기반 고객별 주문 시점 및 수량을 예측합니다."
      />
      {/* 예측 데이터 테이블 */}
      <DataTable 
        data={forecasts}
        columns={columns}
        searchPlaceholder="고객사, 예측 모델로 검색..."
        // filterFields={filterFields}
        exportable={true}
        tableName="customer_order_forecast"
      />
    </div>
  );
};

export default OrderForecastPage;
