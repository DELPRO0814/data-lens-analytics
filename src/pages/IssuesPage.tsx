/**
 * IssuesPage 컴포넌트
 * -----------------------------------------------------
 * 주요 동작 요약:
 * - 고객 이슈(문제/버그/클레임 등) 현황을 종합적으로 관리하는 페이지입니다.
 * - Supabase issues 테이블과 orders, contacts, customers 테이블을 조인해 고객사 정보까지 함께 표시합니다.
 * - 심각한 미해결 이슈가 있으면 상단에 AlertBanner로 경고 메시지를 띄웁니다.
 * - 이슈 유형, 심각도, 상태, 발생일/해결일 등 다양한 필터와 검색 기능을 제공합니다.
 * - CSV/JSON 내보내기, 상세 설명, 날짜 포맷팅 등 실무에 필요한 기능을 모두 포함합니다.
 *
 * 상세 설명:
 * - 페이지 진입 시 이슈 전체 데이터와 심각한 미해결 이슈를 각각 조회합니다.
 * - columns에서 orders → contacts → customers로 관계형 데이터를 탐색해 고객사명을 표시합니다.
 * - filterFields로 다중 선택/날짜 범위 등 다양한 조건으로 이슈를 필터링할 수 있습니다.
 * - AlertBanner의 action은 실제 서비스에서는 상세 페이지로 이동 등으로 확장 가능합니다.
 * - 로딩/에러/경고 등 다양한 상태를 사용자에게 명확히 안내합니다.
 */

import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import PageHeader from '@/components/common/PageHeader';
import DataTable from '@/components/common/DataTable';
import AlertBanner from '@/components/common/AlertBanner';

const IssuesPage = () => {
  // 상태 관리
  const [issues, setIssues] = useState([]);      // 이슈 데이터 목록
  const [loading, setLoading] = useState(true);  // 로딩 상태
  const [alerts, setAlerts] = useState([]);      // 경고 배너 상태
  const { toast } = useToast();                  // 토스트 알림

  // 컴포넌트 마운트 시 데이터 조회
  useEffect(() => {
    fetchIssues();
    checkCriticalIssues();
  }, []);

  /**
   * 전체 이슈 데이터 조회
   * - orders(contacts(customers))까지 조인해 고객사명까지 탐색
   * - 발생일(issue_date) 기준 내림차순 정렬
   */
  const fetchIssues = async () => {
    try {
      const { data, error } = await supabase
        .from('issues')
        .select(`
          *,
          orders(contacts(name, customers(company_name)))
        `)
        .order('issue_date', { ascending: false });

      if (error) throw error;
      setIssues(data || []);
    } catch (error) {
      console.error('이슈 데이터 로딩 오류:', error);
      toast({
        title: "오류",
        description: "이슈 데이터를 불러오는데 실패했습니다.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  /**
   * 심각한(High) 미해결 이슈 체크
   * - severity=High, status!=해결됨 인 이슈가 있으면 경고 배너 표시
   */
  const checkCriticalIssues = async () => {
    try {
      const { data, error } = await supabase
        .from('issues')
        .select('*')
        .eq('severity', 'High')
        .neq('status', '해결됨');

      if (error) throw error;
      
      if (data && data.length > 0) {
        setAlerts([
          {
            id: '1',
            type: 'warning',
            title: '심각한 이슈 발견',
            message: `${data.length}개의 심각한 미해결 이슈가 있습니다. 즉시 처리가 필요합니다.`,
            actionLabel: '상세 보기',
            onAction: () => console.log('Critical issues:', data)
          }
        ]);
      }
    } catch (error) {
      console.error('심각한 이슈 체크 오류:', error);
    }
  };

  // 테이블 컬럼 정의
  const columns = [
    { key: 'issue_id', label: '이슈번호' },
    { 
      key: 'orders', 
      label: '고객사',
      render: (value: any) => value?.contacts?.customers?.company_name || '-'
    },
    { key: 'issue_type', label: '이슈 유형' },
    { key: 'severity', label: '심각도' },
    { key: 'status', label: '상태' },
    { key: 'description', label: '설명' },
    { 
      key: 'issue_date', 
      label: '발생일',
      render: (value: string) => value ? new Date(value).toLocaleDateString() : '-'
    },
    { 
      key: 'resolved_date', 
      label: '해결일',
      render: (value: string) => value ? new Date(value).toLocaleDateString() : '미해결'
    }
  ];

  // 필터 정의
  const filterFields = [
    {
      key: 'issue_type',
      label: '이슈 유형',
      type: 'multiSelect' as const,
      options: [
        { value: 'Bug', label: '버그' },
        { value: 'Quality', label: '품질' },
        { value: 'Delivery', label: '배송' },
        { value: 'Service', label: '서비스' },
        { value: 'Technical', label: '기술' }
      ]
    },
    {
      key: 'severity',
      label: '심각도',
      type: 'multiSelect' as const,
      options: [
        { value: 'Low', label: '낮음' },
        { value: 'Medium', label: '보통' },
        { value: 'High', label: '높음' },
        { value: 'Critical', label: '긴급' }
      ]
    },
    {
      key: 'status',
      label: '상태',
      type: 'multiSelect' as const,
      options: [
        { value: '접수', label: '접수' },
        { value: '처리중', label: '처리중' },
        { value: '해결됨', label: '해결됨' },
        { value: '종료', label: '종료' }
      ]
    },
    {
      key: 'issue_date',
      label: '발생일',
      type: 'dateRange' as const
    },
    {
      key: 'resolved_date',
      label: '해결일',
      type: 'dateRange' as const
    }
  ];

  // 로딩 상태 표시
  if (loading) {
    return <div className="text-center py-8">이슈 데이터를 불러오는 중...</div>;
  }

  return (
    <div>
      {/* 페이지 헤더 */}
      <PageHeader 
        title="이슈 관리" 
        description="고객 이슈 및 문제 해결 현황을 관리합니다. 심각도, 유형, 상태, 기간별로 이슈를 탐색할 수 있습니다."
      />
      {/* 경고 배너 */}
      <AlertBanner 
        alerts={alerts} 
        onDismiss={(id) => setAlerts(alerts.filter(a => a.id !== id))} 
      />
      {/* 이슈 데이터 테이블 */}
      <DataTable 
        data={issues}
        columns={columns}
        searchPlaceholder="이슈번호, 고객사로 검색..."
        filterFields={filterFields}
        exportable={true}
        tableName="issues"
      />
    </div>
  );
};

export default IssuesPage;
