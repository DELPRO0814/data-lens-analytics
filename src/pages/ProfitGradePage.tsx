
import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import PageHeader from '@/components/common/PageHeader';
import DataTable from '@/components/common/DataTable';

const ProfitGradePage = () => {
  const [grades, setGrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchGrades();
  }, []);

  const fetchGrades = async () => {
    try {
      const { data, error } = await supabase
        .from('customer_profit_grade')
        .select(`
          *,
          contacts!inner(name, customers!inner(company_name))
        `)
        .order('total_profit', { ascending: false });

      if (error) throw error;
      setGrades(data || []);
    } catch (error) {
      console.error('고객 수익 등급 데이터 로딩 오류:', error);
      toast({
        title: "오류",
        description: "고객 수익 등급 데이터를 불러오는데 실패했습니다.",
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
    { key: 'customer_grade', label: '수익 등급' },
    { 
      key: 'total_sales', 
      label: '총 매출',
      render: (value: number) => value ? `${value.toLocaleString()}원` : '-'
    },
    { 
      key: 'total_cost', 
      label: '총 비용',
      render: (value: number) => value ? `${value.toLocaleString()}원` : '-'
    },
    { 
      key: 'total_profit', 
      label: '총 수익',
      render: (value: number) => value ? `${value.toLocaleString()}원` : '-'
    },
    { 
      key: 'profit_margin', 
      label: '수익률',
      render: (value: number) => value ? `${(value * 100).toFixed(2)}%` : '-'
    }
  ];

  if (loading) {
    return <div className="text-center py-8">로딩중...</div>;
  }

  return (
    <div>
      <PageHeader 
        title="고객 수익 등급" 
        description="고객별 수익성 분석 및 등급을 관리합니다."
      />
      <DataTable 
        data={grades}
        columns={columns}
        searchPlaceholder="고객사, 등급으로 검색..."
      />
    </div>
  );
};

export default ProfitGradePage;
