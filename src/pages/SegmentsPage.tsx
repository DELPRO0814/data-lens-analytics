
import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import PageHeader from '@/components/common/PageHeader';
import DataTable from '@/components/common/DataTable';
import AlertBanner from '@/components/common/AlertBanner';

const SegmentsPage = () => {
  const [segments, setSegments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alerts, setAlerts] = useState([]);
  const { toast } = useToast();

  useEffect(() => {
    fetchSegments();
    checkHighRiskSegments();
  }, []);

  const fetchSegments = async () => {
    try {
      const { data, error } = await supabase
        .from('segments')
        .select(`
          *,
          contacts(name, customers(company_name))
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

  const checkHighRiskSegments = async () => {
    try {
      const { data, error } = await supabase
        .from('segments')
        .select('*')
        .eq('predicted_risk_level', 'High')
        .gt('high_risk_probability', 0.7);

      if (error) throw error;
      
      if (data && data.length > 0) {
        setAlerts([
          {
            id: '1',
            type: 'warning',
            title: '고위험 세그먼트 알림',
            message: `${data.length}개의 고위험 세그먼트가 감지되었습니다. 즉시 대응이 필요합니다.`,
            actionLabel: '상세 보기',
            onAction: () => console.log('High risk segments:', data)
          }
        ]);
      }
    } catch (error) {
      console.error('고위험 세그먼트 체크 오류:', error);
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

  const filterFields = [
    {
      key: 'predicted_risk_level',
      label: '위험 수준',
      type: 'multiSelect' as const,
      options: [
        { value: 'Low', label: '낮음' },
        { value: 'Medium', label: '보통' },
        { value: 'High', label: '높음' }
      ]
    },
    {
      key: 'segment_label',
      label: '세그먼트',
      type: 'multiSelect' as const,
      options: [
        { value: 'Premium', label: '프리미엄' },
        { value: 'Standard', label: '표준' },
        { value: 'Basic', label: '기본' },
        { value: 'VIP', label: 'VIP' }
      ]
    },
    {
      key: 'clv',
      label: 'CLV',
      type: 'numberRange' as const
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
      <AlertBanner 
        alerts={alerts} 
        onDismiss={(id) => setAlerts(alerts.filter(a => a.id !== id))} 
      />
      <DataTable 
        data={segments}
        columns={columns}
        searchPlaceholder="고객사, 세그먼트로 검색..."
        filterFields={filterFields}
        exportable={true}
        tableName="segments"
      />
    </div>
  );
};

export default SegmentsPage;
