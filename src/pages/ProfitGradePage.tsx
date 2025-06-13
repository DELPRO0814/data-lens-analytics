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

import React, { useEffect, useState, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import PageHeader from '@/components/common/PageHeader';
import DataTable from '@/components/common/DataTable';
import { Badge } from '@/components/ui/badge';
import { 
  Building2, 
  User, 
  Gem, 
  Award, 
  Medal,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Percent,
  MinusCircle
} from 'lucide-react';

const ProfitGradePage = () => {
  // 상태 관리
  const [grades, setGrades] = useState([]);      // 원본 수익 등급 데이터
  const [loading, setLoading] = useState(true);  // 로딩 상태
  const { toast } = useToast();                  // 토스트 알림 훅

  // 컴포넌트 마운트 시 데이터 조회
  useEffect(() => {
    fetchGrades();
  }, []);

  /**
   * 고객 수익 등급 데이터 조회 함수
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

  // useMemo를 사용한 데이터 가공 (데이터 평탄화)
  const tableData = useMemo(() => {
    return grades.map(grade => ({
      ...grade,
      companyName: grade.contacts?.customers?.company_name || null,
      contactName: grade.contacts?.name || null,
    }));
  }, [grades]);


  // 테이블 컬럼 설정
  const columns = [
    { 
      key: 'companyName', 
      label: '고객사',
      render: (value, row) => (
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-gray-400" />
            <span className="font-medium">{value || '-'}</span>
          </div>
          {row.contactName && (
            <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
              <User className="w-3 h-3 ml-0.5" />
              <span>{row.contactName}</span>
            </div>
          )}
        </div>
      )
    },
    { 
      key: 'customer_grade', 
      label: '수익 등급',
      render: (value) => {
        switch (value) {
          case 'A':
            return <Badge className="bg-yellow-400 text-yellow-900 hover:bg-yellow-500 border-yellow-500"><Gem className="w-3.5 h-3.5 mr-1" />A 등급</Badge>;
          case 'B':
            return <Badge className="bg-slate-300 text-slate-800 hover:bg-slate-400 border-slate-400"><Award className="w-3.5 h-3.5 mr-1" />B 등급</Badge>;
          case 'C':
            return <Badge className="bg-orange-400 text-orange-900 hover:bg-orange-500 border-orange-500"><Medal className="w-3.5 h-3.5 mr-1" />C 등급</Badge>;
          case 'D':
             return <Badge variant="secondary" className="text-gray-600"><MinusCircle className="w-3.5 h-3.5 mr-1" />D 등급</Badge>;
          default:
            return <Badge variant="outline">{value}</Badge>;
        }
      }
    },
    { 
      key: 'total_sales', 
      label: '총 매출',
      render: (value) => (
        <div className="flex items-center gap-2 text-blue-600">
          <TrendingUp className="w-4 h-4" />
          <span className="font-medium">{value ? `${value.toLocaleString()}원` : '-'}</span>
        </div>
      )
    },
    { 
      key: 'total_cost', 
      label: '총 비용',
      render: (value) => (
        <div className="flex items-center gap-2 text-red-600">
          <TrendingDown className="w-4 h-4" />
          <span className="font-medium">{value ? `${value.toLocaleString()}원` : '-'}</span>
        </div>
      )
    },
    { 
      key: 'total_profit', 
      label: '총 수익',
      render: (value) => (
        <div className="flex items-center gap-2 text-green-700">
          <DollarSign className="w-4 h-4" />
          <span className="font-semibold">{value ? `${value.toLocaleString()}원` : '-'}</span>
        </div>
      )
    },
    { 
      key: 'profit_margin', 
      label: '수익률',
      render: (value) => (
         <div className="flex items-center gap-2">
          <Percent className="w-4 h-4 text-gray-500" />
          <span className="font-semibold text-gray-800">{value ? `${(value * 100).toFixed(1)}%` : '-'}</span>
        </div>
      )
    }
  ];

  // 필터 설정
  const filterFields = [
    // {
    //   key: 'companyName',
    //   label: '고객사',
    //   type: 'text' as const,
    // },
    {
      key: 'customer_grade',
      label: '수익 등급',
      type: 'multiSelect' as const,
      options: [
        { value: 'VIP', label: 'VIP' },
        { value: 'Gold', label: 'Gold' },
        { value: 'Silver', label: 'Silver' },
        { value: 'Bronze', label: 'Bronze' }
      ]
    },
    {
      key: 'total_sales',
      label: '총 매출',
      type: 'numberRange' as const
    },
    {
      key: 'profit_margin',
      label: '수익률 (0~1 사이)',
      type: 'numberRange' as const
    }
  ];

  // 로딩 상태 표시
  if (loading) {
    return <div className="text-center py-8">수익 등급 데이터를 불러오는 중...</div>;
  }

  return (
    <div>
      <PageHeader 
        title="고객 수익 등급" 
        description="고객별 수익성 분석 및 등급을 관리합니다. 등급, 매출, 수익률별로 필터링할 수 있습니다."
      />
      
      <DataTable 
        data={tableData}
        columns={columns}
        searchPlaceholder="고객사, 등급으로 검색..."
        filterFields={filterFields}
        exportable={true}
        tableName="customer_profit_grade"
      />
    </div>
  );
};

export default ProfitGradePage;