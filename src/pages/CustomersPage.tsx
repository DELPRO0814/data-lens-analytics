/**
 * CustomersPage 컴포넌트
 * -----------------------------------------------------
 * 주요 동작 요약:
 * - 등록된 고객사 목록을 표시하고 관리하는 페이지입니다.
 * - 테이블 형태로 고객사 정보를 보여주며 검색, 필터링, 정렬 기능을 제공합니다.
 * - '고객 추가' 버튼을 통해 새 고객을 등록할 수 있는 모달을 표시합니다.
 * - Supabase에서 고객 데이터를 조회하며 실시간 동기화를 지원합니다.
 * - 주요 필터: 회사 유형, 지역, 업종, 규모, 국가, 등록일 범위 등
 *
 * 상세 설명:
 * - 초기 마운트 시 Supabase에서 고객 데이터를 한 번에 조회합니다.
 * - 컬럼 렌더링 시 회사명을 클릭하면 해당 고객의 상세 페이지로 이동합니다.
 * - 다중 선택(multiSelect), 날짜 범위(dateRange) 등 6가지 필터 유형을 제공합니다.
 * - 데이터 테이블에는 CSV/JSON 내보내기 기능이 기본으로 내장되어 있습니다.
 * - AlertBanner를 통해 시스템 알림이나 중요한 공지를 표시할 수 있습니다.
 */

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
import { Badge } from '@/components/ui/badge';

const CustomersPage = () => {
  // 상태 관리
  const [customers, setCustomers] = useState([]);      // 고객사 목록 데이터
  const [loading, setLoading] = useState(true);       // 데이터 로딩 상태
  const [alerts, setAlerts] = useState([]);           // 상단 알림 배너 정보
  const [showAddModal, setShowAddModal] = useState(false);  // 고객 추가 모달 표시 상태
  const { toast } = useToast();                       // 토스트 알림 훅

  // 컴포넌트 마운트 시 고객 데이터 조회
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

  /**
   * 고객 데이터 조회 함수
   * - Supabase customers 테이블에서 전체 데이터 조회
   * - 회사명(company_name) 기준 오름차순 정렬
   * - 에러 발생 시 토스트 알림 및 콘솔 로깅
   */
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

  /**
   * 고객 추가 성공 처리 함수
   * - 데이터 다시 불러오기
   * - 모달 닫기
   * - 성공 토스트 알림 표시
   */
  const handleCustomerAdded = () => {
    fetchCustomers();
    setShowAddModal(false);
    toast({
      title: "성공",
      description: "고객이 추가되었습니다.",
    });
  };

  // 테이블 컬럼 설정
  // [추가] 회사 유형에 따른 Badge 스타일 맵
const typeVariantMap = {
  '고객사': 'default',
  '협력사': 'outline',
  '잠재고객': 'secondary',
};

// [추가] 회사 규모에 따른 Badge 스타일 맵
const sizeVariantMap = {
  '대기업': 'default',
  '중소기업': 'secondary',
  '스타트업': 'outline',
};

const columns = [
  { 
    key: 'company_name', 
    label: '회사명',
    // 기존 링크 기능은 그대로 유지합니다.
    render: (value, row) => (
      <Link 
        to={`/customers/${row.customer_id}`}
        className="font-medium text-primary underline-offset-4 hover:underline"
      >
        {value}
      </Link>
    )
  },
  { 
    key: 'company_type', 
    label: '회사 유형',
    // [Badge 적용] 회사 유형에 따라 다른 스타일의 배지를 보여줍니다.
    render: (value) => {
      const variant = typeVariantMap[value] || 'secondary';
      return <Badge variant={variant}>{value}</Badge>;
    }
  },
  { 
    key: 'industry_type', 
    label: '업종',
    // [Badge 적용] 업종은 일관된 아웃라인 스타일로 태그처럼 표시합니다.
    render: (value) => value ? <Badge variant="outline">{value}</Badge> : '-'
  },
  { 
    key: 'company_size', 
    label: '회사 규모',
    // [Badge 적용] 회사 규모에 따라 다른 스타일의 배지를 보여줍니다.
    render: (value) => {
      const variant = sizeVariantMap[value] || 'secondary';
      return <Badge variant={variant}>{value}</Badge>;
    }
  },
  { 
    key: 'region', 
    label: '지역',
    // [Badge 적용] 지역 정보는 회색(secondary) 배지로 간결하게 표시합니다.
    render: (value) => value ? <Badge variant="secondary">{value}</Badge> : '-'
  },
  { 
    key: 'country', 
    label: '국가' 
  },
  { 
    key: 'reg_date', 
    label: '등록일',
    render: (value) => value ? new Date(value).toLocaleDateString() : '-' 
  }
];

  // 필터 설정
  const filterFields = [
    {
      key: 'company_size',
      label: '회사 규모',
      type: 'multiSelect' as const,
      options: [
        { value: '대기업', label: '대기업' },
        { value: '중견기업', label: '중견기업' },
        { value: '중소기업', label: '중소기업' },
      ]
    },
    {
      key: 'company_type',
      label: '회사 유형',
      type: 'multiSelect' as const,
      options: [
        { value: '완성차', label: '완성차' },
        { value: '유통', label: '유통' },
        { value: '정비소', label: '정비소' },
        { value: '렌터카', label: '렌터카' },
      ]
    },
  ];
  // 로딩 상태 표시
  if (loading) {
    return <div className="text-center py-8">로딩중...</div>;
  }

  return (
    <div>
      {/* 상단 헤더 영역 */}
      <div className="flex items-center justify-between mb-6">
        <PageHeader 
          title="고객 관리" 
          description="등록된 고객 회사 정보를 관리합니다."
        />
        {/* 고객 추가 버튼 */}
        <Button 
          onClick={() => setShowAddModal(true)}
          className="flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>고객 추가</span>
        </Button>
      </div>
      
      {/* 시스템 알림 배너 */}
      <AlertBanner 
        alerts={alerts} 
        onDismiss={(id) => setAlerts(alerts.filter(a => a.id !== id))} 
      />
      
      {/* 고객 데이터 테이블 */}
      <DataTable 
        data={customers}
        columns={columns}
        searchPlaceholder="회사명, 업종으로 검색..."
        filterFields={filterFields}
        exportable={true}
        tableName="customers"
      />

      {/* 고객 추가 모달 */}
      <AddCustomerModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onCustomerAdded={handleCustomerAdded}
      />
    </div>
  );
};

export default CustomersPage;
