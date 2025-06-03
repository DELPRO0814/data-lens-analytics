
import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import PageHeader from '@/components/common/PageHeader';
import DataTable from '@/components/common/DataTable';

const SegmentsPage = () => {
  const [segments, setSegments] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchSegments();
  }, []);

  const fetchSegments = async () => {
    try {
      const { data, error } = await supabase
        .from('segments')
        .select(`
          *,
          contacts!inner(name, customers!inner(company_name))
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
    { key: 'segment_label', label: '세그먼트' },
    { 
      key: 'clv', 
      label: 'CLV',
      render: (value: number) => `${value.toLocaleString()}원`
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
      render: (value: number) => value ? `${(value * 100).toFixed(1)}%` : '-'
    }
  ];

  if (loading) {
    return <div className="text-center py-8">로딩중...</div>;
  }

  return (
    <div>
      <PageHeader 
        title="고객 세그먼트" 
        description="고객 세그먼트 및 위험도 분석 정보를 관리합니다."
      />
      <DataTable 
        data={segments}
        columns={columns}
        searchPlaceholder="고객사, 세그먼트로 검색..."
      />
    </div>
  );
};

export default SegmentsPage;
