/**
 * ContactsPage 컴포넌트
 * -----------------------------------------------------
 * 주요 동작 요약:
 * - 고객사 담당자 연락처의 종합 관리 페이지
 * - 연락처 기본 정보, 고객사 정보, 키맨/임원 여부 등을 표시
 * - 고위험 세그먼트 연락처 발견 시 경고 배너 표시
 * - 다중 조건 필터링 및 데이터 내보내기 기능 제공
 * 
 * 상세 설명:
 * - 3개의 Supabase 테이블(contacts/customers/segments) 연동
 * - 초기 마운트 시 연락처/고객사 데이터 동시 조회
 * - 고위험 세그먼트는 CLV 상위 3건만 표시
 * - 체크박스/다중선택/날짜범위 등 5가지 필터 유형 지원
 */

import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import PageHeader from '@/components/common/PageHeader';
import DataTable from '@/components/common/DataTable';
import AlertBanner from '@/components/common/AlertBanner';

// Supabase 이진 플래그 타입(0: 비활성, 1: 활성)
type BinaryFlag = '0' | '1';

const ContactsPage = () => {
  // 상태 관리
  const [contacts, setContacts] = useState([]);  // 연락처 목록 상태
  const [customers, setCustomers] = useState([]); // 필터용 고객사 목록
  const [loading, setLoading] = useState(true);  // 데이터 로딩 상태
  const [alerts, setAlerts] = useState([]);      // 고위험 알림 상태
  const { toast } = useToast();                 // 토스트 알림 훅

  // 컴포넌트 마운트 시 데이터 초기화
  useEffect(() => {
    fetchContacts();
    fetchCustomers();
    checkHighPriorityContacts();
  }, []);

  /**
   * 연락처 데이터 조회 함수
   * - contacts 테이블과 customers 테이블 조인
   * - 이름 기준 오름차순 정렬
   * - 에러 발생 시 토스트 알림 및 콘솔 로깅
   */
  const fetchContacts = async () => {
    try {
      const { data, error } = await supabase
        .from('contacts')
        .select(`*, customers(company_name)`)
        .order('name');

      if (error) throw error;
      setContacts(data || []);
    } catch (error) {
      console.error('연락처 데이터 로딩 오류:', error);
      toast({ 
        title: "오류", 
        description: "연락처 데이터 불러오기 실패", 
        variant: "destructive" 
      });
    } finally {
      setLoading(false);
    }
  };

  /**
   * 고객사 목록 조회 함수 (필터용)
   * - customer_id와 company_name만 선택해 최적화
   * - 회사명 기준 오름차순 정렬
   */
  const fetchCustomers = async () => {
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('customer_id, company_name')
        .order('company_name');

      if (!error) setCustomers(data || []);
    } catch (error) {
      console.error('고객 데이터 로딩 오류:', error);
    }
  };

  /**
   * 고위험 연락처 체크 함수
   * - segments 테이블에서 High 리스크 + 상위 3개 CLV 기준
   * - 발견 시 AlertBanner에 경고 메시지 추가
   */
  const checkHighPriorityContacts = async () => {
    try {
      const { data } = await supabase
        .from('segments')
        .select(`contact_id, predicted_risk_level, clv, contacts(name, customers(company_name))`)
        .eq('predicted_risk_level', 'High')
        .order('clv', { ascending: false })
        .limit(3);

      if (data?.length) {
        setAlerts([{
          id: '1',
          type: 'warning',
          title: '높은 위험도 고객 발견',
          message: `${data.length}명의 고위험 고객이 있습니다. 즉시 확인이 필요합니다.`,
          actionLabel: '세그먼트 보기',
          onAction: () => window.location.href = '/segments'
        }]);
      }
    } catch (error) {
      console.error('위험도 체크 오류:', error);
    }
  };

  // 테이블 컬럼 설정
  const columns = [
    { key: 'name', label: '이름' },
    { 
      key: 'customers', 
      label: '회사명',
      render: (value: any) => value?.company_name || '-'  // 고객사명 관계형 조회
    },
    { key: 'position', label: '직책' },
    { key: 'department', label: '부서' },
    { key: 'email', label: '이메일' },
    { key: 'phone', label: '전화번호' },
    { 
      key: 'is_keyman', 
      label: '키맨',
      render: (value: BinaryFlag) => value === '1' ? '✓' : '✗'  // 이진 값 변환
    },
    { 
      key: 'is_executive', 
      label: '임원',
      render: (value: BinaryFlag) => value === '1' ? '✓' : '✗'
    }
  ];

  // 필터 설정
  const filterFields = [
    {
      key: 'customer_id',
      label: '고객사',
      type: 'select' as const,  // 타입 단언
      options: customers.map(customer => ({
        value: customer.customer_id.toString(),
        label: customer.company_name
      }))
    },
    {
      key: 'is_keyman',
      label: '키맨',
      type: 'checkbox' as const  // 타입 단언
    },
    {
      key: 'is_executive',
      label: '임원',
      type: 'checkbox' as const
    },
    {
      key: 'preferred_channel',
      label: '선호 채널',
      type: 'multiSelect' as const,
      options: [
        { value: 'Email', label: '이메일' },
        { value: 'Phone', label: '전화' },
        { value: 'SMS', label: 'SMS' },
        { value: 'Meeting', label: '회의' }
      ]
    },
    {
      key: 'contact_date',
      label: '연락일',
      type: 'dateRange' as const
    }
  ];

  // 로딩 상태 표시
  if (loading) {
    return <div className="text-center py-8">연락처 정보를 불러오는 중...</div>;
  }

  return (
    <div>
      {/* 페이지 헤더: 제목과 설명 */}
      <PageHeader 
        title="연락처 관리" 
        description="고객사 담당자 연락처를 관리합니다. 키맨/임원 여부, 최근 연락일 등을 확인할 수 있습니다."
      />
      
      {/* 고위험 알림 배너: 사용자 닫기 가능 */}
      <AlertBanner 
        alerts={alerts} 
        onDismiss={(id) => setAlerts(alerts.filter(a => a.id !== id))} 
      />
      
      {/* 데이터 테이블: 필터/검색/내보내기 기능 */}
      <DataTable 
        data={contacts}
        columns={columns}
        searchPlaceholder="이름, 회사명, 이메일로 검색..."
        filterFields={filterFields}
        exportable={true}
        tableName="contacts"
      />
    </div>
  );
};

export default ContactsPage;
