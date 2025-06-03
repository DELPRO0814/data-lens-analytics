
import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import PageHeader from '@/components/common/PageHeader';
import DataTable from '@/components/common/DataTable';

const ClaimsPage = () => {
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchClaims();
  }, []);

  const fetchClaims = async () => {
    try {
      const { data, error } = await supabase
        .from('claims')
        .select(`
          *,
          contacts!inner(name, customers!inner(company_name))
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

  const columns = [
    { key: 'claim_id', label: '클레임번호' },
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
    { key: 'predicted_claim_level', label: '예측 클레임 수준' },
    { key: 'predicted_claim_type', label: '예측 클레임 유형' },
    { 
      key: 'predicted_claim_probability', 
      label: '발생 확률',
      render: (value: number) => value ? `${(value * 100).toFixed(1)}%` : '-'
    },
    { 
      key: 'confidence_score', 
      label: '신뢰도',
      render: (value: number) => value ? `${(value * 100).toFixed(1)}%` : '-'
    },
    { 
      key: 'prediction_date', 
      label: '예측일',
      render: (value: string) => value ? new Date(value).toLocaleDateString() : '-'
    }
  ];

  if (loading) {
    return <div className="text-center py-8">로딩중...</div>;
  }

  return (
    <div>
      <PageHeader 
        title="클레임 예측" 
        description="AI 기반 클레임 발생 예측 정보를 관리합니다."
      />
      <DataTable 
        data={claims}
        columns={columns}
        searchPlaceholder="클레임번호, 고객사로 검색..."
      />
    </div>
  );
};

export default ClaimsPage;
