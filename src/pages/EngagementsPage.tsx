/**
 * EngagementsPage 컴포넌트
 * -----------------------------------------------------
 * 주요 동작 요약:
 * - 고객의 디지털 참여도(사이트 방문, 뉴스레터 열람 등) 데이터를 관리하는 페이지
 * - Supabase engagements 테이블과 customers 테이블을 조인해 데이터 표시
 * - 숫자 범위, 다중 선택, 날짜 범위 필터를 통해 데이터 탐색 가능
 * - CSV/JSON 내보내기 기능으로 데이터 외부 활용 지원
 * * 상세 설명:
 * - engagements 테이블에서 고객 활동 데이터 조회 (최신 활동일 순 정렬)
 * - customers 테이블과 조인해 고객사명 표시
 * - 사이트 방문/뉴스레터 열람 수는 숫자 범위 필터 적용
 * - 설문 응답 여부는 Y/N으로 필터링 가능
 * - 최근 활동일은 날짜 범위 선택으로 필터링
 */

import React, { useEffect, useState, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import PageHeader from '@/components/common/PageHeader';
import DataTable from '@/components/common/DataTable';
import { Badge } from '@/components/ui/badge';
import { Building2, MousePointerClick, MailOpen, CheckCircle2, XCircle, Calendar } from 'lucide-react';

const EngagementsPage = () => {
  // 상태 관리
  const [engagements, setEngagements] = useState([]); // 원본 데이터
  const [loading, setLoading] = useState(true);      // 로딩 상태
  const { toast } = useToast();                      // 토스트 알림 훅

  // 컴포넌트 마운트 시 데이터 조회
  useEffect(() => {
    fetchEngagements();
  }, []);

  /**
   * 참여도 데이터 조회 함수
   * - engagements 테이블과 customers 테이블 조인
   * - 최근 활동일(last_active_date) 기준 내림차순 정렬
   * - 에러 발생 시 토스트 알림 및 콘솔 로깅
   */
  const fetchEngagements = async () => {
    try {
      const { data, error } = await supabase
        .from('engagements')
        .select(`
          *,
          customers(company_name)
        `)
        .order('last_active_date', { ascending: false });

      if (error) throw error;
      setEngagements(data || []);
    } catch (error) {
      console.error('참여도 데이터 로딩 오류:', error);
      toast({
        title: "오류",
        description: "참여도 데이터를 불러오는데 실패했습니다.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // useMemo를 사용한 데이터 가공 (데이터 평탄화)
  const tableData = useMemo(() => {
    return engagements.map(engagement => ({
      ...engagement,
      companyName: engagement.customers?.company_name || null,
    }));
  }, [engagements]);

  // 테이블 컬럼 설정
  const columns = [
    { 
      key: 'companyName', 
      label: '고객사',
      render: (value) => (
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-indigo-50 rounded-md">
            <Building2 className="w-3.5 h-3.5 text-indigo-600" />
          </div>
          <span className="font-medium text-gray-900">
            {value || <span className="text-gray-400 italic">미등록</span>}
          </span>
        </div>
      )
    },
    { 
      key: 'site_visits', 
      label: '사이트 방문',
      render: (value) => (
        <div className="flex items-center gap-2">
          <MousePointerClick className="w-4 h-4 text-gray-400" />
          <span className="font-medium">{value ? `${value}회` : '0회'}</span>
        </div>
      )
    },
    { 
      key: 'newsletter_opens', 
      label: '뉴스레터 열람',
      render: (value) => (
        <div className="flex items-center gap-2">
          <MailOpen className="w-4 h-4 text-gray-400" />
          <span className="font-medium">{value ? `${value}회` : '0회'}</span>
        </div>
      )
    },
    { 
      key: 'survey_response', 
      label: '설문 응답',
      render: (value) => {
        if (value === '1') {
          return (
            <Badge variant="outline" className="border-green-300 bg-green-50 text-green-700">
              <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
              응답함
            </Badge>
          );
        }
        if (value === '0') {
          return (
            <Badge variant="outline" className="border-gray-300 bg-gray-50 text-gray-600">
              <XCircle className="w-3.5 h-3.5 mr-1.5" />
              응답안함
            </Badge>
          );
        }
        return '-';
      }
    },
    { 
      key: 'last_active_date', 
      label: '최근 활동일',
      render: (value) => {
        if (!value) {
          return <span className="text-gray-400 italic text-sm">활동 기록 없음</span>;
        }
        
        const date = new Date(value);
        const today = new Date();
        const diffTime = today.getTime() - date.getTime();
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        
        let timeText = '';
        
        if (diffDays === 0) timeText = '오늘';
        else if (diffDays === 1) timeText = '어제';
        else if (diffDays < 30) timeText = `${diffDays}일 전`;
        else timeText = `${Math.floor(diffDays / 30)}개월 전`;

        return (
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-900">
              {date.toLocaleDateString('ko-KR')}
            </span>
            <Badge variant="secondary" className="font-normal">{timeText}</Badge>
          </div>
        );
      }
    }
  ];

  // 필터 설정
  const filterFields = [
    {
      key: 'companyName',
      label: '고객사',
      type: 'text' as const
    },
    {
      key: 'site_visits',
      label: '사이트 방문 수',
      type: 'numberRange' as const
    },
    {
      key: 'newsletter_opens',
      label: '뉴스레터 열람 수',
      type: 'numberRange' as const
    },
    {
      key: 'survey_response',
      label: '설문 응답',
      type: 'multiSelect' as const,
      options: [
        { value: '1', label: '응답함' },
        { value: '0', label: '응답안함' }
      ]
    },
    {
      key: 'last_active_date',
      label: '최근 활동일',
      type: 'dateRange' as const
    }
  ];

  // 로딩 상태 표시
  if (loading) {
    return <div className="text-center py-8">참여도 데이터를 불러오는 중...</div>;
  }

  return (
    <div>
      <PageHeader 
        title="고객 참여도" 
        description="고객의 디지털 참여도 및 활동을 관리합니다. 사이트 방문, 뉴스레터 열람, 설문 응답 데이터를 확인할 수 있습니다."
      />
      
      <DataTable 
        data={tableData}
        columns={columns}
        searchPlaceholder="고객사로 검색..."
        filterFields={filterFields}
        exportable={true}
        tableName="engagements"
      />
    </div>
  );
};

export default EngagementsPage;