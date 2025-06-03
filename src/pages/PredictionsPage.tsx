
import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import PageHeader from '@/components/common/PageHeader';
import DataTable from '@/components/common/DataTable';

const PredictionsPage = () => {
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchPredictions();
  }, []);

  const fetchPredictions = async () => {
    try {
      const { data, error } = await supabase
        .from('predictions')
        .select(`
          *,
          contacts(name, customers(company_name))
        `)
        .order('predicted_date', { ascending: false });

      if (error) throw error;
      setPredictions(data || []);
    } catch (error) {
      console.error('예측 데이터 로딩 오류:', error);
      toast({
        title: "오류",
        description: "예측 데이터를 불러오는데 실패했습니다.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { 
      key: 'contacts', 
      label: '고객사',
      render: (value: any) => value?.customers?.company_name || '-'
    },
    { 
      key: 'contacts', 
      label: '담당자',
      render: (value: any) => value?.name || '-'
    },
    { key: 'predicted_product', label: '예측 제품' },
    { 
      key: 'predicted_quantity', 
      label: '예측 수량',
      render: (value: number) => value ? `${value.toLocaleString()}개` : '-'
    },
    { 
      key: 'predicted_date', 
      label: '예측 날짜',
      render: (value: string) => value ? new Date(value).toLocaleDateString() : '-'
    }
  ];

  if (loading) {
    return <div className="text-center py-8">로딩중...</div>;
  }

  return (
    <div>
      <PageHeader 
        title="예측 관리" 
        description="AI 기반 구매 예측 정보를 관리합니다."
      />
      <DataTable 
        data={predictions}
        columns={columns}
        searchPlaceholder="고객사, 제품명으로 검색..."
      />
    </div>
  );
};

export default PredictionsPage;
