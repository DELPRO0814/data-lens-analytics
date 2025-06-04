
import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import PageHeader from '@/components/common/PageHeader';
import DataTable from '@/components/common/DataTable';
import AlertBanner from '@/components/common/AlertBanner';

const SalesForecastPage = () => {
  const [forecasts, setForecasts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alerts, setAlerts] = useState([]);
  const { toast } = useToast();

  useEffect(() => {
    fetchForecasts();
    checkUpcomingContacts();
  }, []);

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

  const checkUpcomingContacts = async () => {
    try {
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const { data, error } = await supabase
        .from('sales_contact_forecast')
        .select(`
          *,
          customers(company_name)
        `)
        .gte('scf_recommended_date', today.toISOString().split('T')[0])
        .lte('scf_recommended_date', tomorrow.toISOString().split('T')[0]);

      if (error) throw error;
      
      if (data && data.length > 0) {
        setAlerts([
          {
            id: '1',
            type: 'info',
            title: '오늘/내일 추천 접촉',
            message: `${data.length}개의 추천 영업 접촉이 예정되어 있습니다.`,
            actionLabel: '상세 보기',
            onAction: () => console.log('Upcoming contacts:', data)
          }
        ]);
      }
    } catch (error) {
      console.error('다가오는 접촉 체크 오류:', error);
    }
  };

  const columns = [
    { key: 'scf_id', label: '예측번호' },
    { 
      key: 'customers', 
      label: '고객사',
      render: (value: any) => value?.company_name || '-'
    },
    { key: 'scf_type', label: '접촉 유형' },
    { 
      key: 'scf_recommended_date', 
      label: '권장 접촉일',
      render: (value: string) => value ? new Date(value).toLocaleDateString() : '-'
    },
    { 
      key: 'scf_mape', 
      label: 'MAPE',
      render: (value: number) => value ? `${(value * 100).toFixed(2)}%` : '-'
    },
    { 
      key: 'scf_generated_at', 
      label: '생성일',
      render: (value: string) => value ? new Date(value).toLocaleDateString() : '-'
    }
  ];

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
      type: 'dateRange' as const
    },
    {
      key: 'scf_mape',
      label: 'MAPE',
      type: 'numberRange' as const
    }
  ];

  if (loading) {
    return <div className="text-center py-8">로딩중...</div>;
  }

  return (
    <div>
      <PageHeader 
        title="영업 접촉 예측" 
        description="AI 기반 최적 영업 접촉 시점을 예측합니다."
      />
      <AlertBanner 
        alerts={alerts} 
        onDismiss={(id) => setAlerts(alerts.filter(a => a.id !== id))} 
      />
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
