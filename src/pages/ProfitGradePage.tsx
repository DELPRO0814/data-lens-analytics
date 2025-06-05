/**
 * ProfitGradePage 컴포넌트
 * -----------------------------------------------------
 * 주요 동작 요약:
 * - 고객별 수익 등급(A/B/C/D) 및 재무 지표(매출/비용/수익/수익률)를 관리하는 페이지
 * - Supabase의 customer_profit_grade 테이블과 contacts, customers 테이블을 조인해 데이터 표시
 * - 총 매출, 비용, 수익은 원화 포맷팅, 수익률은 % 변환하여 가독성 높임
 * - 등급별 필터링, 매출/수익률 범위 검색, 데이터 내보내기 기능 제공
 *
 * 상세 설명:
 * - 수익 등급은 총 수익(total_profit)을 기준으로 내림차순 정렬되어 표시
 * - 고객사와 담당자 정보는 3단계 관계형 조인(profit_grade → contacts → customers)으로 추출
 * - 필터: 등급 다중 선택, 매출 범위, 수익률 범위 검색
 * - 모든 금액 관련 컬럼은 천 단위 콤마와 '원' 단위를 추가해 표시
 */

import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import PageHeader from '@/components/common/PageHeader';
import DataTable from '@/components/common/DataTable';

const ProfitGradePage = () => {
  // 상태 관리
  const [grades, setGrades] = useState([]);      // 수익 등급 데이터
  const [loading, setLoading] = useState(true);  // 로딩 상태
  const { toast } = useToast();                  // 토스트 알림 훅

  // 컴포넌트 마운트 시 데이터 조회
  useEffect(() => {
    fetchGrades();
  }, []);

  /**
   * 고객 수익 등급 데이터 조회 함수
   * - customer_profit_grade 테이블을 중심으로 contacts/customers 테이블 조인
   * - 총 수익(total_profit) 기준 내림차순 정렬
   * - 에러 발생 시 토스트 알림 및 콘솔 로깅
   */
  const fetchGrades = async () => {
    try {
      const { data, error } = await supabase
        .from('customer_profit_grade')
        .select(`
          *,
          contacts(name, customers(company_name))
        `)
        .order('total_profit', { ascending: false });

      if (error) throw error;
      setGrades(data || []);
    } catch (error) {
      console.error('고객 수익 등급 데이터 로딩 오류:', error);
      toast({
        title: "오류",
        description: "고객 수익 등급 데이터를 불러오는데 실패했습니다.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // 테이블 컬럼 설정
  const columns = [
    { 
      key: 'contacts', 
      label: '고객사',
      render: (value: any) => value?.customers?.company_name || '-'  // 3단계 관계형 데이터 접근
    },
    { 
      key: 'contacts', 
      label: '담당자',
      render: (value: any) => value?.name || '-'
    },
    { key: 'customer_grade', label: '수익 등급' },
    { 
      key: 'total_sales', 
      label: '총 매출',
      render: (value: number) => value ? `${value.toLocaleString()}원` : '-'  // 천단위 포맷
    },
    { 
      key: 'total_cost', 
      label: '총 비용',
      render: (value: number) => value ? `${value.toLocaleString()}원` : '-'
    },
    { 
      key: 'total_profit', 
      label: '총 수익',
      render: (value: number) => value ? `${value.toLocaleString()}원` : '-'
    },
    { 
      key: 'profit_margin', 
      label: '수익률',
      render: (value: number) => value ? `${(value * 100).toFixed(2)}%` : '-'  // % 변환
    }
  ];

  // 필터 설정
  const filterFields = [
    {
      key: 'customer_grade',
      label: '수익 등급',
      type: 'multiSelect' as const,
      options: [
        { value: 'A', label: 'A등급' },
        { value: 'B', label: 'B등급' },
        { value: 'C', label: 'C등급' },
        { value: 'D', label: 'D등급' }
      ]
    },
    {
      key: 'total_sales',
      label: '총 매출',
      type: 'numberRange' as const  // 숫자 범위 필터
    },
    {
      key: 'profit_margin',
      label: '수익률',
      type: 'numberRange' as const
    }
  ];

  // 로딩 상태 표시
  if (loading) {
    return <div className="text-center py-8">수익 등급 데이터를 불러오는 중...</div>;
  }

  return (
    <div>
      {/* 페이지 헤더 */}
      <PageHeader 
        title="고객 수익 등급" 
        description="고객별 수익성 분석 및 등급을 관리합니다. 등급, 매출, 수익률별로 필터링할 수 있습니다."
      />
      
      {/* 수익 등급 데이터 테이블 */}
      <DataTable 
        data={grades}
        columns={columns}
        searchPlaceholder="고객사, 등급으로 검색..."
        // filterFields={filterFields}
        exportable={true}
        tableName="customer_profit_grade"
      />
    </div>
  );
};

export default ProfitGradePage;
