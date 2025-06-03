
import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import PageHeader from '@/components/common/PageHeader';
import DataTable from '@/components/common/DataTable';

const EngagementsPage = () => {
  const [engagements, setEngagements] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchEngagements();
  }, []);

  const fetchEngagements = async () => {
    try {
      const { data, error } = await supabase
        .from('engagements')
        .select(`
          *,
          customers!inner(company_name)
        `)
        .order('last_active_date', { ascending: false });

      if (error) throw error;
      setEngagements(data || []);
    } catch (error) {
      console.error('참여도 데이터 로딩 오류:', error);
      toast({
        title: "오류",
        description: "참여도 데이터를 불러오는데 실패했습니다.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { 
      key: 'customers', 
      label: '고객사',
      render: (value: any) => value?.company_name || '-'
    },
    { 
      key: 'site_visits', 
      label: '사이트 방문',
      render: (value: number) => value ? `${value}회` : '0회'
    },
    { 
      key: 'newsletter_opens', 
      label: '뉴스레터 열람',
      render: (value: number) => value ? `${value}회` : '0회'
    },
    { key: 'survey_response', label: '설문 응답' },
    { 
      key: 'last_active_date', 
      label: '최근 활동일',
      render: (value: string) => value ? new Date(value).toLocaleDateString() : '-'
    }
  ];

  if (loading) {
    return <div className="text-center py-8">로딩중...</div>;
  }

  return (
    <div>
      <PageHeader 
        title="고객 참여도" 
        description="고객의 디지털 참여도 및 활동을 관리합니다."
      />
      <DataTable 
        data={engagements}
        columns={columns}
        searchPlaceholder="고객사, 활동으로 검색..."
      />
    </div>
  );
};

export default EngagementsPage;
