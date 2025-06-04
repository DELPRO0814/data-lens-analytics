
import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import PageHeader from '@/components/common/PageHeader';
import DataTable from '@/components/common/DataTable';
import AlertBanner from '@/components/common/AlertBanner';

const IssuesPage = () => {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alerts, setAlerts] = useState([]);
  const { toast } = useToast();

  useEffect(() => {
    fetchIssues();
    checkCriticalIssues();
  }, []);

  const fetchIssues = async () => {
    try {
      const { data, error } = await supabase
        .from('issues')
        .select(`
          *,
          orders(contacts(name, customers(company_name)))
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

  const checkCriticalIssues = async () => {
    try {
      const { data, error } = await supabase
        .from('issues')
        .select('*')
        .eq('severity', 'High')
        .neq('status', '해결됨');

      if (error) throw error;
      
      if (data && data.length > 0) {
        setAlerts([
          {
            id: '1',
            type: 'warning',
            title: '심각한 이슈 발견',
            message: `${data.length}개의 심각한 미해결 이슈가 있습니다. 즉시 처리가 필요합니다.`,
            actionLabel: '상세 보기',
            onAction: () => console.log('Critical issues:', data)
          }
        ]);
      }
    } catch (error) {
      console.error('심각한 이슈 체크 오류:', error);
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

  const filterFields = [
    {
      key: 'issue_type',
      label: '이슈 유형',
      type: 'multiSelect' as const,
      options: [
        { value: 'Bug', label: '버그' },
        { value: 'Quality', label: '품질' },
        { value: 'Delivery', label: '배송' },
        { value: 'Service', label: '서비스' },
        { value: 'Technical', label: '기술' }
      ]
    },
    {
      key: 'severity',
      label: '심각도',
      type: 'multiSelect' as const,
      options: [
        { value: 'Low', label: '낮음' },
        { value: 'Medium', label: '보통' },
        { value: 'High', label: '높음' },
        { value: 'Critical', label: '긴급' }
      ]
    },
    {
      key: 'status',
      label: '상태',
      type: 'multiSelect' as const,
      options: [
        { value: '접수', label: '접수' },
        { value: '처리중', label: '처리중' },
        { value: '해결됨', label: '해결됨' },
        { value: '종료', label: '종료' }
      ]
    },
    {
      key: 'issue_date',
      label: '발생일',
      type: 'dateRange' as const
    },
    {
      key: 'resolved_date',
      label: '해결일',
      type: 'dateRange' as const
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
      <AlertBanner 
        alerts={alerts} 
        onDismiss={(id) => setAlerts(alerts.filter(a => a.id !== id))} 
      />
      <DataTable 
        data={issues}
        columns={columns}
        searchPlaceholder="이슈번호, 고객사로 검색..."
        filterFields={filterFields}
        exportable={true}
        tableName="issues"
      />
    </div>
  );
};

export default IssuesPage;
