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

import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import PageHeader from '@/components/common/PageHeader';
import DataTable from '@/components/common/DataTable';

const OrdersPage = () => {
  // 상태 관리
  const [orders, setOrders] = useState([]);       // 주문 데이터 목록
  const [loading, setLoading] = useState(true);  // 데이터 로딩 상태
  const { toast } = useToast();                  // 토스트 알림 훅

  // 컴포넌트 마운트 시 데이터 조회
  useEffect(() => {
    fetchOrders();
  }, []);

  /**
   * 주문 데이터 조회 함수
   * - orders 테이블을 중심으로 contacts, customers, products 테이블 조인
   * - 주문일(order_date) 기준 내림차순 정렬
   * - 에러 발생 시 토스트 알림 및 콘솔 로깅
   */
  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          contacts(name, customers(company_name)),
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

  // 테이블 컬럼 설정
  const columns = [
    { key: 'order_id', label: '주문번호' },
    { 
      key: 'contacts', 
      label: '고객사',
      render: (value: any) => value?.customers?.company_name || '-'  // 3단계 관계형 데이터 접근
    },
    { 
      key: 'products', 
      label: '제품',
      render: (value: any) => value?.model || '-'  // 제품 모델명 표시
    },
    { 
      key: 'quantity', 
      label: '수량',
      render: (value: number) => value ? `${value.toLocaleString()}개` : '-'  // 천단위 콤마 포맷
    },
    { 
      key: 'amount', 
      label: '금액',
      render: (value: number) => value ? `${value.toLocaleString()}원` : '-'  // 통화 포맷
    },
    { key: 'payment_status', label: '결제상태' },
    { key: 'delivery_status', label: '배송상태' },
    { 
      key: 'order_date', 
      label: '주문일',
      render: (value: string) => value ? new Date(value).toLocaleDateString() : '-'  // 날짜 포맷 변환
    }
  ];

  // 필터 설정
  const filterFields = [
    {
      key: 'payment_status',
      label: '결제상태',
      type: 'multiSelect' as const,
      options: [
        { value: 'Pending', label: '대기중' },
        { value: 'Paid', label: '결제완료' },
        { value: 'Failed', label: '결제실패' },
        { value: 'Refunded', label: '환불' }
      ]
    },
    {
      key: 'delivery_status',
      label: '배송상태',
      type: 'multiSelect' as const,
      options: [
        { value: 'Preparing', label: '준비중' },
        { value: 'Shipped', label: '배송중' },
        { value: 'Delivered', label: '배송완료' },
        { value: 'Cancelled', label: '취소' }
      ]
    },
    {
      key: 'order_date',
      label: '주문일',
      type: 'dateRange' as const  // 날짜 범위 선택 필터
    },
    {
      key: 'amount',
      label: '주문금액',
      type: 'numberRange' as const  // 숫자 범위 입력 필터
    }
  ];

  // 로딩 상태 표시
  if (loading) {
    return <div className="text-center py-8">주문 데이터를 불러오는 중...</div>;
  }

  return (
    <div>
      {/* 페이지 헤더 */}
      <PageHeader 
        title="주문 관리" 
        description="고객 주문 내역을 관리합니다. 결제 상태, 배송 상태, 기간별로 필터링할 수 있습니다."
      />
      
      {/* 주문 데이터 테이블 */}
      <DataTable 
        data={orders}
        columns={columns}
        searchPlaceholder="주문번호, 고객사로 검색..."
        filterFields={filterFields}
        exportable={true}
        tableName="orders"
      />
    </div>
  );
};

export default OrdersPage;
