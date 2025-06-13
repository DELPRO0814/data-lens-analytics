/**
 * SalesActivitiesPage 컴포넌트
 * -----------------------------------------------------
 * 주요 동작 요약:
 * - 영업팀의 고객 접촉 활동(전화/회의/이메일 등)을 종합적으로 관리하는 페이지
 * - Supabase의 sales_activities 테이블을 중심으로 customers/contacts 테이블 조인
 * - 활동 유형, 결과, 날짜별 필터링 및 검색 기능 제공
 * - 활동 내용, 결과, 날짜 등을 테이블 형태로 직관적으로 표시
 *
 * 상세 설명:
 * - 페이지 진입 시 최신 영업 활동 데이터 자동 조회(활동일 기준 내림차순)
 * - 3단계 관계형 데이터 조인(sales_activities → customers/contacts)
 * - 필터 유형:
 * - 활동 유형: 다중 선택(전화/회의/이메일/프레젠테이션/데모)
 * - 활동 날짜: 날짜 범위 선택
 * - 결과: 다중 선택(성공/후속조치/연기/거절)
 * - 모든 날짜 필드는 로케일 형식으로 변환되어 표시
 * - CSV/JSON 내보내기 기능으로 데이터 외부 활용 가능
 */

import React, { useEffect, useState, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import PageHeader from '@/components/common/PageHeader';
import DataTable from '@/components/common/DataTable';
import { Badge } from '@/components/ui/badge';
import { Building2, User, Activity, FileText, Target, Calendar, Phone, Mail, Users, Monitor, Play } from 'lucide-react';

const SalesActivitiesPage = () => {
  // 상태 관리
  const [activities, setActivities] = useState([]); // 원본 데이터
  const [loading, setLoading] = useState(true);     // 로딩 상태
  const { toast } = useToast();                      // 토스트 알림 훅

  // 컴포넌트 마운트 시 데이터 조회
  useEffect(() => {
    fetchActivities();
  }, []);

  /**
   * 영업 활동 데이터 조회 함수
   * - sales_activities 테이블과 customers/contacts 테이블 조인
   * - 활동일(activity_date) 기준 최신순 정렬
   * - 에러 발생 시 토스트 알림 및 콘솔 로깅
   */
  const fetchActivities = async () => {
    try {
      const { data, error } = await supabase
        .from('sales_activities')
        .select(`
          *,
          customers(company_name),
          contacts(name)
        `)
        .order('activity_date', { ascending: false });

      if (error) throw error;
      setActivities(data || []);
    } catch (error) {
      console.error('영업 활동 데이터 로딩 오류:', error);
      toast({
        title: "오류",
        description: "영업 활동 데이터를 불러오는데 실패했습니다.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // useMemo를 사용한 데이터 가공 (데이터 평탄화)
  const tableData = useMemo(() => {
    return activities.map(activity => ({
      ...activity,
      // 중첩된 객체의 값을 최상위 레벨의 키로 만듭니다.
      companyName: activity.customers?.company_name || null,
      contactName: activity.contacts?.name || null,
    }));
  }, [activities]);

  // 활동 유형별 아이콘 및 색상 매핑
  const getActivityTypeIcon = (type) => {
    const iconMap = {
      'Call': <Phone className="w-3 h-3" />,
      'Meeting': <Users className="w-3 h-3" />,
      'Email': <Mail className="w-3 h-3" />,
      'Presentation': <Monitor className="w-3 h-3" />,
      'Demo': <Play className="w-3 h-3" />
    };
    return iconMap[type] || <Activity className="w-3 h-3" />;
  };

  const getActivityTypeColor = (type) => {
    const colorMap = {
      'Call': 'bg-blue-100 text-blue-800 border-blue-200',
      'Meeting': 'bg-green-100 text-green-800 border-green-200',
      'Email': 'bg-purple-100 text-purple-800 border-purple-200',
      'Presentation': 'bg-orange-100 text-orange-800 border-orange-200',
      'Demo': 'bg-red-100 text-red-800 border-red-200'
    };
    return colorMap[type] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  // 테이블 컬럼 설정 (현대적 UI 적용)
  const columns = [
    {
      key: 'companyName',
      label: '고객사',
      render: (value) => (
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-blue-50 rounded-md">
            <Building2 className="w-3.5 h-3.5 text-blue-600" />
          </div>
          <span className="font-medium text-gray-900">
            {value || (
              <span className="text-gray-400 italic">미등록</span>
            )}
          </span>
        </div>
      )
    },
    {
      key: 'contactName',
      label: '담당자',
      render: (value) => (
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-green-50 rounded-md">
            <User className="w-3.5 h-3.5 text-green-600" />
          </div>
          <span className="font-medium text-gray-900">
            {value || (
              <span className="text-gray-400 italic">미지정</span>
            )}
          </span>
        </div>
      )
    },
    {
      key: 'activity_type',
      label: '활동 유형',
      render: (value) => {
        const typeLabels = {
          'Call': '전화',
          'Meeting': '회의',
          'Email': '이메일',
          'Presentation': '프레젠테이션',
          'Demo': '데모'
        };
        
        const label = typeLabels[value] || value || '미분류';
        const colorClass = getActivityTypeColor(value);
        const icon = getActivityTypeIcon(value);
        
        return (
          <Badge variant="outline" className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${colorClass}`}>
            {icon}
            {label}
          </Badge>
        );
      }
    },
    {
      key: 'activity_details',
      label: '활동 내용',
      render: (value) => (
        <div className="max-w-xs">
          <p className="text-sm text-gray-700 line-clamp-2 leading-relaxed">
            {value || (
              <span className="text-gray-400 italic">내용 없음</span>
            )}
          </p>
        </div>
      )
    },
    {
      key: 'outcome',
      label: '결과',
      render: (value) => {
        const outcomeLabels = {
          'Success': '성공',
          'Follow-up': '후속조치',
          'Postponed': '연기',
          'Rejected': '거절'
        };
        
        const outcomeColors = {
          'Success': 'bg-green-100 text-green-800 border-green-200',
          'Follow-up': 'bg-yellow-100 text-yellow-800 border-yellow-200',
          'Postponed': 'bg-orange-100 text-orange-800 border-orange-200',
          'Rejected': 'bg-red-100 text-red-800 border-red-200'
        };
        
        const label = outcomeLabels[value] || value || '미정';
        const colorClass = outcomeColors[value] || 'bg-gray-100 text-gray-800 border-gray-200';
        
        return (
          <Badge variant="outline" className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${colorClass}`}>
            <div className="w-2 h-2 rounded-full bg-current opacity-70"></div>
            {label}
          </Badge>
        );
      }
    },
    {
      key: 'activity_date',
      label: '활동 날짜',
      render: (value) => {
        if (!value) {
          return (
            <span className="text-gray-400 italic text-sm">날짜 미정</span>
          );
        }
        
        const date = new Date(value);
        const today = new Date();
        const diffTime = today.getTime() - date.getTime();
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        
        let badgeColor = 'bg-gray-100 text-gray-700 border-gray-200';
        let timeText = '';
        
        if (diffDays === 0) {
          badgeColor = 'bg-green-100 text-green-700 border-green-200';
          timeText = '오늘';
        } else if (diffDays === 1) {
          badgeColor = 'bg-blue-100 text-blue-700 border-blue-200';
          timeText = '어제';
        } else if (diffDays <= 7) {
          badgeColor = 'bg-purple-100 text-purple-700 border-purple-200';
          timeText = `${diffDays}일 전`;
        } else if (diffDays <= 30) {
          badgeColor = 'bg-orange-100 text-orange-700 border-orange-200';
          timeText = `${Math.floor(diffDays / 7)}주 전`;
        } else {
          timeText = `${Math.floor(diffDays / 30)}개월 전`;
        }
        
        return (
          <div className="flex flex-col gap-1">
            <span className="text-sm font-medium text-gray-900">
              {date.toLocaleDateString('ko-KR', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
              })}
            </span>
            {timeText && (
              <Badge variant="outline" className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium border w-fit ${badgeColor}`}>
                <Calendar className="w-3 h-3" />
                {timeText}
              </Badge>
            )}
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
      key: 'activity_type',
      label: '활동 유형',
      type: 'multiSelect' as const,
      options: [
        { value: 'Call', label: '전화' },
        { value: 'Meeting', label: '회의' },
        { value: 'Email', label: '이메일' },
        { value: 'Presentation', label: '프레젠테이션' },
        { value: 'Demo', label: '데모' }
      ]
    },
    {
      key: 'activity_date',
      label: '활동 날짜',
      type: 'dateRange' as const
    },
    {
      key: 'outcome',
      label: '결과',
      type: 'multiSelect' as const,
      options: [
        { value: 'Success', label: '성공' },
        { value: 'Follow-up', label: '후속조치' },
        { value: 'Postponed', label: '연기' },
        { value: 'Rejected', label: '거절' }
      ]
    }
  ];

  // 로딩 상태 표시
  if (loading) {
    return <div className="text-center py-8">영업 활동 데이터를 불러오는 중...</div>;
  }

  return (
    <div>
      <PageHeader 
        title="영업 활동" 
        description="영업팀의 고객 접촉 활동을 관리합니다. 활동 유형, 결과, 기간별로 필터링할 수 있습니다."
      />
      
      <DataTable 
        data={tableData}
        columns={columns}
        searchPlaceholder="고객사, 활동 유형으로 검색..."
        filterFields={filterFields}
        exportable={true}
        tableName="sales_activities"
      />
    </div>
  );
};

export default SalesActivitiesPage;