/**
 * ProductsPage 컴포넌트
 * -----------------------------------------------------
 * 주요 동작 요약:
 * - 제품 정보를 관리하는 페이지로, 제품 목록을 테이블 형태로 표시합니다.
 * - Supabase products 테이블에서 제품 데이터를 조회하며 모델명 기준 정렬합니다.
 * - 검색, 필터링(카테고리/크기/가격 범위), CSV/JSON 내보내기 기능을 제공합니다.
 * - 원가/판매가 통화 포맷팅, 인치 단위 표시 등 데이터 가독성을 높였습니다.
 *
 * 상세 설명:
 * - 페이지 진입 시 제품 데이터 자동 조회 및 로딩 상태 관리
 * - 필터 유형: 
 *   - 카테고리 다중 선택(모니터/TV/노트북 등)
 *   - 인치 크기 슬라이더(10~85인치)
 *   - 원가/판매가 숫자 범위 검색
 * - 컬럼별 커스텀 렌더링으로 가격(원화 표기), 크기(인치) 포맷팅
 * - 에러 발생 시 사용자 친화적 토스트 알림 제공
 */

import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import PageHeader from '@/components/common/PageHeader';
import DataTable from '@/components/common/DataTable';

const ProductsPage = () => {
  // 상태 관리
  const [products, setProducts] = useState([]);  // 제품 데이터 목록
  const [loading, setLoading] = useState(true);  // 데이터 로딩 상태
  const { toast } = useToast();                  // 토스트 알림 훅

  // 컴포넌트 마운트 시 데이터 조회
  useEffect(() => {
    fetchProducts();
  }, []);

  /**
   * 제품 데이터 조회 함수
   * - Supabase products 테이블 전체 조회
   * - 모델명(model) 기준 오름차순 정렬
   * - 에러 발생 시 토스트 알림 및 콘솔 로깅
   */
  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('model');

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('제품 데이터 로딩 오류:', error);
      toast({
        title: "오류",
        description: "제품 데이터를 불러오는데 실패했습니다.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // 테이블 컬럼 정의
  const columns = [
    { key: 'product_id', label: '제품 ID' },
    { key: 'model', label: '모델명' },
    { key: 'category', label: '카테고리' },
    { 
      key: 'inch', 
      label: '크기(인치)',
      render: (value: number) => value ? `${value}"` : '-'  // 인치 단위 추가
    },
    { 
      key: 'originalprice', 
      label: '원가',
      render: (value: number) => value ? `${value.toLocaleString()}원` : '-'  // 통화 포맷
    },
    { 
      key: 'sellingprice', 
      label: '판매가',
      render: (value: number) => value ? `${value.toLocaleString()}원` : '-' 
    },
    { key: 'notes', label: '비고' }
  ];

  // 필터 설정
  const filterFields = [
    {
      key: 'model',
      label: '모델델',
      type: 'multiSelect' as const,  // 다중 선택 필터
      options: [
        { value: 'Dynapro HPX / Dynapro HT', label: 'Dynapro HPX / Dynapro HT' },
        { value: 'Enfren', label: 'Enfren' },
        { value: 'iON', label: 'iON' },
        { value: 'Kinergy ST / Kinergy AS EV', label: 'Kinergy ST / Kinergy AS EV' },
        { value: 'Smart Control / Smart Work', label: 'Smart Control / Smart Work' },
        { value: 'Smart Flex', label: 'Smart Flex' },
        { value: 'Ventus RS4', label: 'Ventus RS4' },
        { value: 'iON', label: 'iON' },
        { value: 'Ventus S1 evo3', label: 'Ventus S1 evo3' },
        { value: 'Ventus S2 AS', label: 'Ventus S2 AS' },
        { value: 'Ventus V12 evo2', label: 'Ventus V12 evo2' },
      ]
    },
    {
      key: 'category',
      label: '카테고리',
      type: 'multiSelect' as const,  // 다중 선택 필터
      options: [
        { value: 'Sports', label: '스포츠' },
        { value: 'SUV', label: 'SUV' },
        { value: '전기차', label: '전기차' },
        { value: '승용차', label: '승용차' },
        { value: '레이싱', label: '레이싱' },
        { value: '트럭', label: '트럭' }
      ]
    },
    {
      key: 'inch',
      label: '크기 (인치)',
      type: 'multiSelect' as const,  // 슬라이더 필터
      options: [
        { value: 15, label: "15"},
        { value: 16, label: "16"},
        { value: 17, label: "17"},
        { value: 18, label: "18"},
        { value: 19, label: "19"},
        { value: 20, label: "20"},
        { value: 21, label: "21"},
      ]
    },
    {
      key: 'originalprice',
      label: '원가',
      type: 'numberRange' as const  // 숫자 범위 필터
    },
    {
      key: 'sellingprice',
      label: '판매가',
      type: 'numberRange' as const
    }
  ];

  // 로딩 상태 표시
  if (loading) {
    return <div className="text-center py-8">제품 데이터를 불러오는 중...</div>;
  }

  return (
    <div>
      {/* 페이지 헤더 */}
      <PageHeader 
        title="제품 관리" 
        description="판매 제품 정보를 관리합니다. 카테고리, 크기, 가격별로 필터링할 수 있습니다."
      />
      
      {/* 제품 데이터 테이블 */}
      <DataTable 
        data={products}
        columns={columns}
        searchPlaceholder="제품명, 모델명으로 검색..."
        filterFields={filterFields}
        exportable={true}
        tableName="products"
      />
    </div>
  );
};

export default ProductsPage;
