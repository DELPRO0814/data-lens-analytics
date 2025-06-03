
import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import PageHeader from '@/components/common/PageHeader';
import DataTable from '@/components/common/DataTable';

const ContactsPage = () => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchContacts();
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
      render: (value: BinaryFlag) => value === '1' ? '✓' : '✗' // '1'로 변경
    },
    { 
      key: 'is_executive', 
      label: '임원',
      render: (value: BinaryFlag) => value === '1' ? '✓' : '✗' // '1'로 변경
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
      <DataTable 
        data={contacts}
        columns={columns}
        searchPlaceholder="이름, 회사명, 이메일로 검색..."
      />
    </div>
  );
};

export default ContactsPage;
