
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import PageHeader from '@/components/common/PageHeader';
import DataTable from '@/components/common/DataTable';
import AlertBanner from '@/components/common/AlertBanner';
import AddCustomerModal from '@/components/customer/AddCustomerModal';

const CustomersPage = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alerts, setAlerts] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchCustomers();
    // Set up sample alert for demonstration
    // setAlerts([
    //   {
    //     id: '1',
    //     type: 'info',
    //     title: '새로운 고객 등록',
    //     message: '이번 주에 5개의 새로운 고객이 등록되었습니다.',
    //     actionLabel: '확인',
    //     onAction: () => setAlerts([])
    //   }
    // ]);
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

  const handleCustomerAdded = () => {
    fetchCustomers();
    setShowAddModal(false);
    toast({
      title: "성공",
      description: "고객이 추가되었습니다.",
    });
  };

  const columns = [
    { 
      key: 'company_name', 
      label: '회사명',
      render: (value: string, row: any) => (
        <Link 
          to={`/customers/${row.customer_id}`}
          className="text-blue-600 hover:text-blue-800 hover:underline font-medium"
        >
          {value}
        </Link>
      )
    },
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

  const filterFields = [
    {
      key: 'company_type',
      label: '회사 유형',
      type: 'multiSelect' as const,
      options: [
        { value: '완성차', label: '완성차' },
        { value: '유통', label: '유통' },
        { value: '정비소', label: '정비소' },
        { value: '렌터카', label: '렌터카' }
      ]
    },
    {
      key: 'region',
      label: '지역',
      type: 'multiSelect' as const,
      options: [
        { value: '서울', label: '서울' },
        { value: '경기', label: '경기' },
        { value: '부산', label: '부산' },
        { value: '대구', label: '대구' },
        { value: '인천', label: '인천' }
      ]
    },
    {
      key: 'industry_type',
      label: '업종',
      type: 'multiSelect' as const,
      options: [
        { value: 'IT', label: 'IT' },
        { value: '제조업', label: '제조업' },
        { value: '금융', label: '금융' },
        { value: '교육', label: '교육' },
        { value: '의료', label: '의료' }
      ]
    },
    {
      key: 'company_size',
      label: '회사 규모',
      type: 'select' as const,
      options: [
        { value: '소규모', label: '소규모' },
        { value: '중규모', label: '중규모' },
        { value: '대규모', label: '대규모' }
      ]
    },
    {
      key: 'country',
      label: '국가',
      type: 'multiSelect' as const,
      options: [
        { value: '한국', label: '한국' },
        { value: '미국', label: '미국' },
        { value: '일본', label: '일본' },
        { value: '중국', label: '중국' }
      ]
    },
    {
      key: 'reg_date',
      label: '등록일',
      type: 'dateRange' as const
    }
  ];

  if (loading) {
    return <div className="text-center py-8">로딩중...</div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <PageHeader 
          title="고객 관리" 
          description="등록된 고객 회사 정보를 관리합니다."
        />
        <Button 
          onClick={() => setShowAddModal(true)}
          className="flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>고객 추가</span>
        </Button>
      </div>
      
      <AlertBanner 
        alerts={alerts} 
        onDismiss={(id) => setAlerts(alerts.filter(a => a.id !== id))} 
      />
      
      <DataTable 
        data={customers}
        columns={columns}
        searchPlaceholder="회사명, 업종으로 검색..."
        filterFields={filterFields}
        exportable={true}
        tableName="customers"
      />

      <AddCustomerModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onCustomerAdded={handleCustomerAdded}
      />
    </div>
  );
};

export default CustomersPage;
