
import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import PageHeader from '@/components/common/PageHeader';
import DataTable from '@/components/common/DataTable';

const CustomersPage = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .order('company_name');

      if (error) throw error;
      setCustomers(data || []);
    } catch (error) {
      console.error('고객 데이터 로딩 오류:', error);
      toast({
        title: "오류",
        description: "고객 데이터를 불러오는데 실패했습니다.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { key: 'company_name', label: '회사명' },
    { key: 'company_type', label: '회사 유형' },
    { key: 'industry_type', label: '업종' },
    { key: 'company_size', label: '회사 규모' },
    { key: 'region', label: '지역' },
    { key: 'country', label: '국가' },
    { 
      key: 'reg_date', 
      label: '등록일',
      render: (value: string) => value ? new Date(value).toLocaleDateString() : '-'
    }
  ];

  if (loading) {
    return <div className="text-center py-8">로딩중...</div>;
  }

  return (
    <div>
      <PageHeader 
        title="고객 관리" 
        description="등록된 고객 회사 정보를 관리합니다."
      />
      <DataTable 
        data={customers}
        columns={columns}
        searchPlaceholder="회사명, 업종으로 검색..."
      />
    </div>
  );
};

export default CustomersPage;
