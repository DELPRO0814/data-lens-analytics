
import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import PageHeader from '@/components/common/PageHeader';
import DataTable from '@/components/common/DataTable';

const OrderForecastPage = () => {
  const [forecasts, setForecasts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchForecasts();
  }, []);

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

  if (loading) {
    return <div className="text-center py-8">로딩중...</div>;
  }

  return (
    <div>
      <PageHeader 
        title="고객 주문 예측" 
        description="AI 기반 고객별 주문 시점 및 수량을 예측합니다."
      />
      <DataTable 
        data={forecasts}
        columns={columns}
        searchPlaceholder="고객사, 예측 모델로 검색..."
        filterFields={filterFields}
        exportable={true}
        tableName="customer_order_forecast"
      />
    </div>
  );
};

export default OrderForecastPage;
