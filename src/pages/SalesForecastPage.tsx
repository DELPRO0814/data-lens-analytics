
import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import PageHeader from '@/components/common/PageHeader';
import DataTable from '@/components/common/DataTable';

const SalesForecastPage = () => {
  const [forecasts, setForecasts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchForecasts();
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

  if (loading) {
    return <div className="text-center py-8">로딩중...</div>;
  }

  return (
    <div>
      <PageHeader 
        title="영업 접촉 예측" 
        description="AI 기반 최적 영업 접촉 시점을 예측합니다."
      />
      <DataTable 
        data={forecasts}
        columns={columns}
        searchPlaceholder="고객사, 접촉 유형으로 검색..."
      />
    </div>
  );
};

export default SalesForecastPage;
