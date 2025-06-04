
import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import PageHeader from '@/components/common/PageHeader';
import DataTable from '@/components/common/DataTable';

const SalesActivitiesPage = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchActivities();
  }, []);

  const fetchActivities = async () => {
    try {
      const { data, error } = await supabase
        .from('sales_activities')
        .select(`
          *,
          customers(company_name),
          contacts(name)
        `)
        .order('activity_date', { ascending: false });

      if (error) throw error;
      setActivities(data || []);
    } catch (error) {
      console.error('영업 활동 데이터 로딩 오류:', error);
      toast({
        title: "오류",
        description: "영업 활동 데이터를 불러오는데 실패했습니다.",
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
      key: 'contacts', 
      label: '담당자',
      render: (value: any) => value?.name || '-'
    },
    { key: 'activity_type', label: '활동 유형' },
    { key: 'activity_details', label: '활동 내용' },
    { key: 'outcome', label: '결과' },
    { 
      key: 'activity_date', 
      label: '활동 날짜',
      render: (value: string) => value ? new Date(value).toLocaleDateString() : '-'
    }
  ];

  const filterFields = [
    {
      key: 'activity_type',
      label: '활동 유형',
      type: 'multiSelect' as const,
      options: [
        { value: 'Call', label: '전화' },
        { value: 'Meeting', label: '회의' },
        { value: 'Email', label: '이메일' },
        { value: 'Presentation', label: '프레젠테이션' },
        { value: 'Demo', label: '데모' }
      ]
    },
    {
      key: 'activity_date',
      label: '활동 날짜',
      type: 'dateRange' as const
    },
    {
      key: 'outcome',
      label: '결과',
      type: 'multiSelect' as const,
      options: [
        { value: 'Success', label: '성공' },
        { value: 'Follow-up', label: '후속조치' },
        { value: 'Postponed', label: '연기' },
        { value: 'Rejected', label: '거절' }
      ]
    }
  ];

  if (loading) {
    return <div className="text-center py-8">로딩중...</div>;
  }

  return (
    <div>
      <PageHeader 
        title="영업 활동" 
        description="영업팀의 고객 접촉 활동을 관리합니다."
      />
      <DataTable 
        data={activities}
        columns={columns}
        searchPlaceholder="고객사, 활동 유형으로 검색..."
        filterFields={filterFields}
        exportable={true}
        tableName="sales_activities"
      />
    </div>
  );
};

export default SalesActivitiesPage;
