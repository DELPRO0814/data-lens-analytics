/**
 * IssuesPage 컴포넌트
 * (설명 주석은 기존과 동일)
 */

import React, { useEffect, useState, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import PageHeader from '@/components/common/PageHeader';
import DataTable from '@/components/common/DataTable';
import AlertBanner from '@/components/common/AlertBanner';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { 
  Building2, 
  User, 
  Tag,
  MessageSquare,
  ShieldAlert,
  TriangleAlert,
  Info,
  Wrench,
  Clock,
  CheckCircle2,
  Calendar
} from 'lucide-react';

const IssuesPage = () => {
  // 상태 관리
  const [issues, setIssues] = useState([]);      // 원본 이슈 데이터
  const [loading, setLoading] = useState(true);  // 로딩 상태
  const [alerts, setAlerts] = useState([]);      // 경고 배너 상태
  const { toast } = useToast();                  // 토스트 알림

  // 컴포넌트 마운트 시 데이터 조회
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchIssues(), checkCriticalIssues()]);
      setLoading(false);
    };
    loadData();
  }, []);

  /**
   * 전체 이슈 데이터 조회
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
    }
  };

  /**
   * 심각한(High) 미해결 이슈 체크
   */
  const checkCriticalIssues = async () => {
    try {
      const { data, error } = await supabase
        .from('issues')
        .select('issue_id')
        .eq('severity', 'High')
        .neq('status', '해결됨');

      if (error) throw error;
      
      if (data && data.length > 0) {
        setAlerts([
          {
            id: 'critical-issues',
            type: 'warning',
            title: '주의: 심각한 미해결 이슈 발견',
            message: `현재 ${data.length}개의 심각도가 '높음'인 미해결 이슈가 있습니다. 빠른 조치가 필요합니다.`,
            actionLabel: '필터링',
            onAction: () => console.log('심각한 이슈 필터링 기능 구현 위치') // 실제로는 필터 상태를 변경하는 로직 추가
          }
        ]);
      } else {
        setAlerts([]);
      }
    } catch (error) {
      console.error('심각한 이슈 체크 오류:', error);
    }
  };

  // useMemo를 사용한 데이터 가공
  const tableData = useMemo(() => {
    return issues.map(issue => ({
      ...issue,
      companyName: issue.orders?.contacts?.customers?.company_name || null,
      contactName: issue.orders?.contacts?.name || null,
    }));
  }, [issues]);

  // 테이블 컬럼 정의
  const columns = [
    { 
      key: 'issue_id', 
      label: '이슈번호',
      render: (value) => <span className="font-mono text-sm text-gray-600">{value}</span>
    },
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
      key: 'issue_type', 
      label: '이슈 유형',
      render: (value) => <Badge variant="outline"><Tag className="w-3 h-3 mr-1.5"/>{value}</Badge>
    },
    { 
      key: 'severity', 
      label: '심각도',
      render: (value) => {
        switch (value) {
          case 'High':
            return <Badge className="bg-red-100 text-red-800 hover:bg-red-200"><ShieldAlert className="w-3.5 h-3.5 mr-1" />높음</Badge>;
          case 'Medium':
            return <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-200"><TriangleAlert className="w-3.5 h-3.5 mr-1" />보통</Badge>;
          case 'Low':
            return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200"><Info className="w-3.5 h-3.5 mr-1" />낮음</Badge>;
          default:
            return <Badge variant="secondary">{value}</Badge>;
        }
      }
    },
    { 
      key: 'status', 
      label: '상태',
      render: (value) => {
        switch (value) {
          case '해결됨':
            return <Badge className="bg-green-100 text-green-800 hover:bg-green-200"><CheckCircle2 className="w-3.5 h-3.5 mr-1" />{value}</Badge>;
          case '처리중':
            return <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-200"><Clock className="w-3.5 h-3.5 mr-1" />{value}</Badge>;
          case '미해결':
            return <Badge variant="secondary"><Wrench className="w-3.5 h-3.5 mr-1" />{value}</Badge>;
          default:
            return <Badge variant="outline">{value}</Badge>;
        }
      }
    },
    { 
      key: 'description', 
      label: '설명',
      render: (value) => (
        <Tooltip>
          <TooltipTrigger>
            <p className="max-w-xs text-sm text-gray-700 line-clamp-2">{value || '-'}</p>
          </TooltipTrigger>
          <TooltipContent className="max-w-md">
            <p className="text-sm leading-relaxed">{value}</p>
          </TooltipContent>
        </Tooltip>
      )
    },
    { 
      key: 'issue_date', 
      label: '발생일',
      render: (value) => {
        if (!value) return '-';
        const date = new Date(value);
        return <span className="text-sm">{date.toLocaleDateString('ko-KR')}</span>
      }
    },
    { 
      key: 'resolved_date', 
      label: '해결일',
      render: (value) => {
        if (!value) return <span className="text-sm text-gray-500">미해결</span>;
        const date = new Date(value);
        return <span className="text-sm">{date.toLocaleDateString('ko-KR')}</span>
      }
    }
  ];

  // 필터 정의
  const filterFields = [
    // {
    //   key: 'companyName',
    //   label: '고객사',
    //   type: 'text' as const,
    // },
    {
      key: 'issue_type',
      label: '이슈 유형',
      type: 'multiSelect' as const,
      options: [
        { value: '교환/반품', label: '교환/반품' },
        { value: '배송 지연', label: '배송 지연' },
        { value: 'AS 요청', label: 'AS 요청' },
        { value: '제품 불량', label: '제품 불량' },
        { value: '결제 문제', label: '결제 문제' },
        { value: '기타 문제', label: '기타 문제' }
      ]
    },
    {
      key: 'severity',
      label: '심각도',
      type: 'multiSelect' as const,
      options: [
        { value: 'High', label: '높음' },
        { value: 'Medium', label: '보통' },
        { value: 'Low', label: '낮음' },
      ]
    },
    {
      key: 'status',
      label: '상태',
      type: 'multiSelect' as const,
      options: [
        { value: '미해결', label: '미해결' },
        { value: '처리중', label: '처리중' },
        { value: '해결됨', label: '해결됨' },
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
    <TooltipProvider>
      <div>
        <PageHeader 
          title="이슈 관리" 
          description="고객 이슈 및 문제 해결 현황을 관리합니다. 심각도, 유형, 상태, 기간별로 이슈를 탐색할 수 있습니다."
        />
        <AlertBanner 
          alerts={alerts} 
          onDismiss={(id) => setAlerts(alerts.filter(a => a.id !== id))} 
        />
        <DataTable 
          data={tableData}
          columns={columns}
          searchPlaceholder="이슈번호, 고객사, 설명으로 검색..."
          filterFields={filterFields}
          exportable={true}
          tableName="issues"
        />
      </div>
    </TooltipProvider>
  );
};

export default IssuesPage;