/**
 * OrdersPage 컴포넌트
 * -----------------------------------------------------
 * 주요 동작 요약:
 * - 고객 주문 내역을 종합적으로 관리하는 페이지입니다.
 * - 주문 정보, 결제/배송 상태, 제품 정보 등을 테이블로 표시합니다.
 * - Supabase에서 orders 테이블을 중심으로 contacts, customers, products 테이블과 조인해 데이터를 조회합니다.
 * - 결제 상태, 배송 상태, 주문일, 금액 범위 등 다양한 필터로 데이터 탐색이 가능합니다.
 *
 * 상세 설명:
 * - 주문 데이터는 주문일(order_date) 기준 최신순으로 정렬됩니다.
 * - 관계형 데이터 조인(contacts→customers, products)으로 고객사명과 제품 모델명을 표시합니다.
 * - 금액과 수량은 한국식 숫자 포맷으로 가독성을 높였습니다.
 * - CSV/JSON 내보내기 기능으로 데이터 외부 활용이 가능합니다.
 */

import React, { useEffect, useState, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import PageHeader from '@/components/common/PageHeader';
import DataTable from '@/components/common/DataTable';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar, 
  Truck, 
  Building2, 
  User, 
  Package, 
  Hash, 
  Banknote, 
  Percent,
  CheckCircle2,
  Clock,
  XCircle
} from 'lucide-react';

const OrdersPage = () => {
  // 상태 관리
  const [orders, setOrders] = useState([]);      // 원본 주문 데이터
  const [loading, setLoading] = useState(true);  // 데이터 로딩 상태
  const { toast } = useToast();                  // 토스트 알림 훅

  // 컴포넌트 마운트 시 데이터 조회
  useEffect(() => {
    fetchOrders();
  }, []);

  /**
   * 주문 데이터 조회 함수
   */
  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          contacts(name, customers(company_name)),
          products(model, category) 
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

  // useMemo를 사용한 데이터 가공 (데이터 평탄화)
  const tableData = useMemo(() => {
    if (!orders || orders.length === 0) return [];
    
    return orders.map(item => ({
      ...item,
      // 중첩된 데이터를 최상위 키로 만듭니다.
      companyName: item.contacts?.customers?.company_name || null,
      contactName: item.contacts?.name || null,
      productModel: item.products?.model || null,
      productCategory: item.products?.category || null,
    }));
  }, [orders]);

  // 테이블 컬럼 설정
  const columns = [
    { 
      key: 'order_id', 
      label: '주문번호',
      render: (value) => <span className="font-mono text-sm text-gray-600">{value}</span>
    },
    { 
      key: 'companyName', 
      label: '고객사',
      render: (value) => (
        <div className="flex items-center gap-2">
          <Building2 className="w-4 h-4 text-gray-400" />
          <span className="font-medium">{value || '-'}</span>
        </div>
      )
    },
    { 
      key: 'contactName', 
      label: '담당자',
       render: (value) => (
        <div className="flex items-center gap-2">
          <User className="w-4 h-4 text-gray-400" />
          <span>{value || '-'}</span>
        </div>
      )
    },
    { 
      key: 'productModel', 
      label: '제품',
      render: (value, row) => (
        <div className="flex items-center gap-2">
          <Package className="w-4 h-4 text-gray-400" />
          <div>
            <p className="font-medium">{value || row.product_id || '-'}</p>
            {row.productCategory && <p className="text-sm text-gray-500">{row.productCategory}</p>}
          </div>
        </div>
      )
    },
    { 
      key: 'quantity', 
      label: '수량',
      render: (value) => (
         <div className="flex items-center gap-2">
          <Hash className="w-4 h-4 text-gray-400" />
          <span className="font-medium">{value ? `${value.toLocaleString()} 개` : '-'}</span>
        </div>
      )
    },
    { 
      key: 'amount', 
      label: '주문금액',
      render: (value) => (
        <div className="flex items-center gap-2">
          <Banknote className="w-4 h-4 text-gray-400" />
          <span className="font-semibold">₩{value ? value.toLocaleString() : '0'}</span>
        </div>
      )
    },
    {
      key: 'margin_rate',
      label: '마진율',
      render: (value) => {
        const rate = (value || 0) * 1;
        const textColor = rate > 25 ? 'text-green-600' : rate > 15 ? 'text-blue-600' : 'text-gray-600';
        return (
          <div className="flex items-center gap-2">
            <Percent className="w-4 h-4 text-gray-400" />
            <span className={`${textColor} font-semibold`}>{rate.toFixed(1)}%</span>
          </div>
        );
      }
    },
    { 
      key: 'order_date', 
      label: '주문일',
      render: (value) => {
        if (!value) return '-';
        const date = new Date(value);
        return (
          <div className="flex flex-col gap-1">
             <span className="font-medium">{date.toLocaleDateString('ko-KR')}</span>
             <span className="text-sm text-gray-500">{date.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
        )
      }
    },
    { 
      key: 'payment_status', 
      label: '결제상태',
      render: (value) => {
        switch (value) {
          case '결제완료':
            return <Badge className="bg-green-100 text-green-800 hover:bg-green-200"><CheckCircle2 className="w-3.5 h-3.5 mr-1" />{value}</Badge>;
          case '결제대기':
            return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200"><Clock className="w-3.5 h-3.5 mr-1" />{value}</Badge>;
          case '미결제':
            return <Badge className="bg-red-100 text-red-800 hover:bg-red-200"><XCircle className="w-3.5 h-3.5 mr-1" />{value}</Badge>;
          default:
            return <Badge variant="outline">{value || '미분류'}</Badge>;
        }
      }
    },
    { 
      key: 'delivery_status', 
      label: '배송상태',
      render: (value) => {
         switch (value) {
          case '배송완료':
            return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200"><CheckCircle2 className="w-3.5 h-3.5 mr-1" />{value}</Badge>;
          case '배송중':
            return <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-200"><Truck className="w-3.5 h-3.5 mr-1" />{value}</Badge>;
          case '미배송':
             return <Badge variant="secondary"><Package className="w-3.5 h-3.5 mr-1" />{value}</Badge>;
          default:
            return <Badge variant="outline">{value || '미분류'}</Badge>;
        }
      }
    },
  ];

  // 필터 설정
  const filterFields = [
    {
      key: 'companyName',
      label: '고객사',
      type: 'text' as const,
    },
    {
      key: 'payment_status',
      label: '결제상태',
      type: 'multiSelect' as const,
      options: [
        { value: '결제완료', label: '결제완료' },
        { value: '결제대기', label: '결제대기' },
        { value: '미결제', label: '미결제' },
      ]
    },
    {
      key: 'delivery_status',
      label: '배송상태',
      type: 'multiSelect' as const,
      options: [
        { value: '배송완료', label: '배송완료' },
        { value: '배송중', label: '배송중' },
        { value: '미배송', label: '미배송' }
      ]
    },
    {
      key: 'order_date',
      label: '주문일',
      type: 'dateRange' as const
    },
    {
      key: 'amount',
      label: '주문금액',
      type: 'numberRange' as const
    }
  ];

  // 로딩 상태 표시
  if (loading) {
    return <div className="text-center py-8">주문 데이터를 불러오는 중...</div>;
  }

  return (
    <div>
      <PageHeader 
        title="주문 관리" 
        description="고객 주문 내역을 관리합니다. 결제 상태, 배송 상태, 기간별로 필터링할 수 있습니다."
      />
      
      <DataTable 
        data={tableData}
        columns={columns}
        searchPlaceholder="주문번호, 고객사, 제품명으로 검색..."
        filterFields={filterFields}
        exportable={true}
        tableName="orders"
      />
    </div>
  );
};

export default OrdersPage;