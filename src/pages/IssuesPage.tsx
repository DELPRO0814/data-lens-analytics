
import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import PageHeader from '@/components/common/PageHeader';
import DataTable from '@/components/common/DataTable';

const IssuesPage = () => {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchIssues();
  }, []);

  const fetchIssues = async () => {
    try {
      const { data, error } = await supabase
        .from('issues')
        .select(`
          *,
          orders(contacts!inner(name, customers!inner(company_name)))
        `)
        .order('issue_date', { ascending: false });

      if (error) throw error;
      setIssues(data || []);
    } catch (error) {
      console.error('이슈 데이터 로딩 오류:', error);
      toast({
        title: "오류",
        description: "이슈 데이터를 불러오는데 실패했습니다.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { key: 'issue_id', label: '이슈번호' },
    { 
      key: 'orders', 
      label: '고객사',
      render: (value: any) => value?.contacts?.customers?.company_name || '-'
    },
    { key: 'issue_type', label: '이슈 유형' },
    { key: 'severity', label: '심각도' },
    { key: 'status', label: '상태' },
    { key: 'description', label: '설명' },
    { 
      key: 'issue_date', 
      label: '발생일',
      render: (value: string) => value ? new Date(value).toLocaleDateString() : '-'
    },
    { 
      key: 'resolved_date', 
      label: '해결일',
      render: (value: string) => value ? new Date(value).toLocaleDateString() : '미해결'
    }
  ];

  if (loading) {
    return <div className="text-center py-8">로딩중...</div>;
  }

  return (
    <div>
      <PageHeader 
        title="이슈 관리" 
        description="고객 이슈 및 문제 해결 현황을 관리합니다."
      />
      <DataTable 
        data={issues}
        columns={columns}
        searchPlaceholder="이슈번호, 고객사로 검색..."
      />
    </div>
  );
};

export default IssuesPage;
