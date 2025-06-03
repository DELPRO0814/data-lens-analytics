
import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import PageHeader from '@/components/common/PageHeader';
import DataTable from '@/components/common/DataTable';

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          contacts!inner(name, customers!inner(company_name)),
          products(model)
        `)
        .order('order_date', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error('주문 데이터 로딩 오류:', error);
      toast({
        title: "오류",
        description: "주문 데이터를 불러오는데 실패했습니다.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { key: 'order_id', label: '주문번호' },
    { 
      key: 'contacts', 
      label: '고객사',
      render: (value: any) => value?.customers?.company_name || '-'
    },
    { 
      key: 'products', 
      label: '제품',
      render: (value: any) => value?.model || '-'
    },
    { 
      key: 'quantity', 
      label: '수량',
      render: (value: number) => value ? `${value.toLocaleString()}개` : '-'
    },
    { 
      key: 'amount', 
      label: '금액',
      render: (value: number) => value ? `${value.toLocaleString()}원` : '-'
    },
    { key: 'payment_status', label: '결제상태' },
    { key: 'delivery_status', label: '배송상태' },
    { 
      key: 'order_date', 
      label: '주문일',
      render: (value: string) => value ? new Date(value).toLocaleDateString() : '-'
    }
  ];

  if (loading) {
    return <div className="text-center py-8">로딩중...</div>;
  }

  return (
    <div>
      <PageHeader 
        title="주문 관리" 
        description="고객 주문 내역을 관리합니다."
      />
      <DataTable 
        data={orders}
        columns={columns}
        searchPlaceholder="주문번호, 고객사로 검색..."
      />
    </div>
  );
};

export default OrdersPage;
