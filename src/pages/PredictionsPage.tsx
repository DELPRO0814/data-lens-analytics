/**
 * PredictionsPage 컴포넌트
 * -----------------------------------------------------
 * 주요 동작 요약:
 * - AI 기반 구매 예측 정보를 조회하고 관리하는 페이지입니다.
 * - Supabase의 predictions 테이블과 contacts, customers 테이블을 조인해 데이터를 가져옵니다.
 * - 고객사, 담당자, 예측 제품, 예측 수량, 예측 날짜 등의 정보를 테이블 형태로 제공합니다.
 * - 텍스트, 숫자 범위, 날짜 범위 필터를 통해 데이터를 세밀하게 탐색할 수 있습니다.
 * - CSV/JSON 내보내기 기능을 지원해 데이터 활용도를 높였습니다.
 *
 * 상세 설명:
 * - 페이지 진입 시 fetchPredictions 함수로 데이터를 비동기 조회하며, 로딩 및 에러 상태를 관리합니다.
 * - 컬럼별 커스텀 렌더링으로 관계형 데이터(고객사명, 담당자명)와 포맷팅된 수량/날짜를 표시합니다.
 * - filterFields 배열에 텍스트, 숫자 범위, 날짜 범위 필터를 정의해 DataTable 컴포넌트에 전달합니다.
 * - 로딩 중에는 사용자에게 로딩 메시지를 보여줍니다.
 */

import React, { useEffect, useState, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import PageHeader from '@/components/common/PageHeader';
import DataTable from '@/components/common/DataTable';
import { Badge } from "@/components/ui/badge";

const PredictionsPage = () => {
  // 예측 데이터 상태
  const [predictions, setPredictions] = useState([]);
  // 로딩 상태
  const [loading, setLoading] = useState(true);
  // 토스트 알림 훅
  const { toast } = useToast();

  // 컴포넌트 마운트 시 데이터 조회
  useEffect(() => {
    fetchPredictions();
  }, []);

  /**
   * 구매 예측 데이터 조회 함수
   * - predictions 테이블과 contacts, customers 테이블 조인
   * - 예측일 기준 내림차순 정렬
   * - 에러 발생 시 토스트 알림 및 콘솔 로깅
   */

  
  const fetchPredictions = async () => {
    try {
      const { data, error } = await supabase
        .from('predictions')
        .select(`
          *,
          contacts(name, customers(company_name))
        `)
        .order('predicted_date', { ascending: false });

      if (error) throw error;
      setPredictions(data || []);
    } catch (error) {
      console.error('예측 데이터 로딩 오류:', error);
      toast({
        title: "오류",
        description: "예측 데이터를 불러오는데 실패했습니다.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // ✅ 1. '데이터 평탄화' 로직 추가
      const tableData = useMemo(() => {
        if (!predictions || predictions.length === 0) return [];
        
        return predictions.map(item => ({
          ...item,
          // 중첩된 데이터를 최상위 키로 만듭니다.
          companyName: item.contacts?.customers?.company_name || '-',
          contactsName: item.contacts?.name || '-',
        }));
      }, [predictions]);

  // 테이블 컬럼 설정
  const columns = [
    { 
      key: 'companyName', 
      label: '고객사',
      // 첫 번째 예시와 유사하게 회사명 스타일 적용   
    },
    { 
      key: 'contactsName', 
      label: '담당자',
      // 담당자 이름은 강조하고, 직책도 함께 표시 (Supabase 조회문에 position 추가 필요)
    },
    { 
      key: 'predicted_product', 
      label: '예측 제품',
      // 파란색 계열의 Badge를 사용하여 제품명을 강조
      render: (value: string) => (
        value ? 
        <Badge className="border-transparent bg-blue-100 text-blue-800 hover:bg-blue-100/80">{value}</Badge> 
        : '-'
      )
    },
    { 
      key: 'predicted_quantity', 
      label: '예측 수량',
      // 수량에 font-medium 스타일을 적용하여 강조
      render: (value: number) => (
        <span className="font-medium text-gray-900">
          {value ? `${value.toLocaleString()} 개` : '-'}
        </span>
      )
    },
    { 
      key: 'predicted_date', 
      label: '예측 날짜',
      // 날짜는 회색 텍스트로 표시
      render: (value: string) => (
        <span className="text-gray-600">
          {value ? new Date(value).toLocaleDateString() : '-'}
        </span>
      )
    },
    {
  key: 'status',
  label: '상태',
  sortable: true, // DataTable에서 이 컬럼을 클릭하여 정렬할 수 있도록 설정
  sortKey: 'predicted_date', // 정렬 시 실제로는 'predicted_date' 값을 기준으로 사용
  render: (_, row: any) => {
    // 예측 날짜가 없으면 '-' 표시
    if (!row.predicted_date) {
      return '-';
    }

    // 시간대를 무시하고 날짜만 비교하기 위해 모든 시간 정보를 자정으로 설정
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const predictedDate = new Date(row.predicted_date);
    predictedDate.setHours(0, 0, 0, 0);

    // 1. 예측 날짜가 오늘보다 이전(이미 지남)이면 '-'를 표시합니다.
    if (predictedDate < today) {
      return '-';
    }
    
    // 2. 오늘로부터 한 달 후의 날짜를 계산합니다.
    const oneMonthFromNow = new Date(today);
    oneMonthFromNow.setMonth(oneMonthFromNow.getMonth() + 1);

    // 3. 예측 날짜가 오늘부터 한 달 안에 포함되면 '임박' 뱃지를 표시합니다.
    if (predictedDate <= oneMonthFromNow) {
      return <Badge variant="destructive">임박</Badge>;
    } 
    
    // 4. 예측 날짜가 한 달보다 더 미래이면 '일반' 뱃지를 표시합니다.
    else {
      return <Badge className="border-transparent bg-green-100 text-green-800 hover:bg-green-100/80">일반</Badge>;
    }
  }
}
  ];

  // 필터 설정
  const filterFields = [
    {
      key: 'predicted_product',
      label: '예측 제품',
      type: 'text' as const
    },
    {
      key: 'predicted_quantity',
      label: '예측 수량',
      type: 'numberRange' as const
    },
    {
      key: 'predicted_date',
      label: '예측 날짜',
      type: 'dateRange' as const
    }
  ];

  // 로딩 상태 표시
  if (loading) {
    return <div className="text-center py-8">로딩중...</div>;
  }

  return (
    <div>
      {/* 페이지 헤더 */}
      <PageHeader 
        title="예측 관리" 
        description="AI 기반 구매 예측 정보를 관리합니다."
      />
      {/* 예측 데이터 테이블 */}
      <DataTable 
        data={tableData}
        columns={columns}
        searchPlaceholder="고객사, 제품명으로 검색..."
        filterFields={filterFields}
        exportable={true}
        tableName="predictions"
      />
    </div>
  );
};

export default PredictionsPage;
