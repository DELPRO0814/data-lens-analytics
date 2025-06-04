
import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import PageHeader from '@/components/common/PageHeader';
import DataTable from '@/components/common/DataTable';
import AlertBanner from '@/components/common/AlertBanner';

type BinaryFlag = '0' | '1';

const ContactsPage = () => {
  const [contacts, setContacts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alerts, setAlerts] = useState([]);
  const { toast } = useToast();

  useEffect(() => {
    fetchContacts();
    fetchCustomers();
    checkHighPriorityContacts();
  }, []);

  const fetchContacts = async () => {
    try {
      const { data, error } = await supabase
        .from('contacts')
        .select(`
          *,
          customers(company_name)
        `)
        .order('name');

      if (error) throw error;
      setContacts(data || []);
    } catch (error) {
      console.error('연락처 데이터 로딩 오류:', error);
      toast({
        title: "오류",
        description: "연락처 데이터를 불러오는데 실패했습니다.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomers = async () => {
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('customer_id, company_name')
        .order('company_name');

      if (error) throw error;
      setCustomers(data || []);
    } catch (error) {
      console.error('고객 데이터 로딩 오류:', error);
    }
  };

  const checkHighPriorityContacts = async () => {
    try {
      const { data, error } = await supabase
        .from('segments')
        .select(`
          contact_id,
          predicted_risk_level,
          clv,
          contacts(name, customers(company_name))
        `)
        .eq('predicted_risk_level', 'High')
        .order('clv', { ascending: false })
        .limit(3);

      if (error) throw error;
      
      if (data && data.length > 0) {
        setAlerts([
          {
            id: '1',
            type: 'warning',
            title: '높은 위험도 고객 발견',
            message: `${data.length}명의 고위험 고객이 있습니다. 즉시 확인이 필요합니다.`,
            actionLabel: '세그먼트 보기',
            onAction: () => window.location.href = '/segments'
          }
        ]);
      }
    } catch (error) {
      console.error('위험도 체크 오류:', error);
    }
  };

  const columns = [
    { key: 'name', label: '이름' },
    { 
      key: 'customers', 
      label: '회사명',
      render: (value: any) => value?.company_name || '-'
    },
    { key: 'position', label: '직책' },
    { key: 'department', label: '부서' },
    { key: 'email', label: '이메일' },
    { key: 'phone', label: '전화번호' },
    { 
      key: 'is_keyman', 
      label: '키맨',
      render: (value: BinaryFlag) => value === '1' ? '✓' : '✗'
    },
    { 
      key: 'is_executive', 
      label: '임원',
      render: (value: BinaryFlag) => value === '1' ? '✓' : '✗'
    }
  ];

  const filterFields = [
    {
      key: 'customer_id',
      label: '고객사',
      type: 'select' as const,
      options: customers.map(customer => ({
        value: customer.customer_id.toString(),
        label: customer.company_name
      }))
    },
    {
      key: 'is_keyman',
      label: '키맨',
      type: 'checkbox' as const
    },
    {
      key: 'is_executive',
      label: '임원',
      type: 'checkbox' as const
    },
    {
      key: 'preferred_channel',
      label: '선호 채널',
      type: 'multiSelect' as const,
      options: [
        { value: 'Email', label: '이메일' },
        { value: 'Phone', label: '전화' },
        { value: 'SMS', label: 'SMS' },
        { value: 'Meeting', label: '회의' }
      ]
    },
    {
      key: 'contact_date',
      label: '연락일',
      type: 'dateRange' as const
    }
  ];

  if (loading) {
    return <div className="text-center py-8">로딩중...</div>;
  }

  return (
    <div>
      <PageHeader 
        title="연락처 관리" 
        description="고객사 담당자 연락처를 관리합니다."
      />
      <AlertBanner 
        alerts={alerts} 
        onDismiss={(id) => setAlerts(alerts.filter(a => a.id !== id))} 
      />
      <DataTable 
        data={contacts}
        columns={columns}
        searchPlaceholder="이름, 회사명, 이메일로 검색..."
        filterFields={filterFields}
        exportable={true}
        tableName="contacts"
      />
    </div>
  );
};

export default ContactsPage;
