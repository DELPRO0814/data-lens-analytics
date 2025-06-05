/**
 * CustomerDetailPage 컴포넌트
 * -----------------------------------------------------
 * 주요 동작 요약:
 * - 특정 고객(회사)의 상세 정보, 담당자(연락처) 목록, 세그먼트(위험 분석 등) 정보를 한 페이지에서 종합적으로 보여줍니다.
 * - 고객 정보, 연락처, 세그먼트 데이터를 Supabase에서 각각 조회합니다.
 * - 연락처/세그먼트 추가 모달을 통해 실시간으로 데이터를 추가할 수 있습니다.
 * - 데이터 추가/수정/삭제 후에는 자동으로 최신 데이터를 다시 불러옵니다.
 * - URL 파라미터(customerId)로 대상 고객을 식별합니다.
 * - 로딩/에러/데이터 없음 등 다양한 상태를 사용자에게 안내합니다.
 *
 * 상세 설명:
 * - useParams로 customerId를 추출하고, 숫자로 변환해 사용합니다.
 * - fetchCustomerData 함수에서 고객 정보, 연락처, 세그먼트 데이터를 순차적으로 조회합니다.
 * - 연락처/세그먼트 추가 시 모달을 열고, 성공 시 데이터 갱신 및 토스트 알림을 띄웁니다.
 * - 고객 정보는 카드 형태로, 연락처/세그먼트 목록은 별도의 섹션 컴포넌트로 분리해 관리합니다.
 * - 각 섹션에는 추가 버튼(Plus 아이콘)과 목록 테이블이 포함되어 있습니다.
 */

import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Plus } from 'lucide-react';
import ContactsSection from '@/components/customer/ContactsSection';
import SegmentsSection from '@/components/customer/SegmentsSection';
import AddContactModal from '@/components/customer/AddContactModal';
import AddSegmentModal from '@/components/customer/AddSegmentModal';

const CustomerDetailPage = () => {
  // URL에서 customerId 추출 (문자열)
  const { customerId } = useParams();
  // 상태 관리
  const [customer, setCustomer] = useState<any>(null);        // 고객 정보
  const [contacts, setContacts] = useState([]);               // 연락처 목록
  const [segments, setSegments] = useState([]);               // 세그먼트 목록
  const [loading, setLoading] = useState(true);               // 로딩 상태
  const [showAddContactModal, setShowAddContactModal] = useState(false); // 연락처 추가 모달
  const [showAddSegmentModal, setShowAddSegmentModal] = useState(false); // 세그먼트 추가 모달
  const { toast } = useToast();

  // customerId를 숫자로 변환 (없으면 null)
  const customerIdNum = customerId ? parseInt(customerId, 10) : null;

  // customerId가 바뀔 때마다 데이터 새로 불러오기
  useEffect(() => {
    if (customerIdNum) {
      fetchCustomerData();
    }
  }, [customerIdNum]);

  /**
   * 고객 정보, 연락처, 세그먼트 데이터를 모두 조회하는 함수
   * - 고객 정보: customers 테이블에서 단일 레코드(single) 조회
   * - 연락처: contacts 테이블에서 customer_id로 필터
   * - 세그먼트: segments 테이블에서 contacts.customer_id로 필터 + 담당자 이름 포함
   */
  const fetchCustomerData = async () => {
    try {
      setLoading(true);

      // 1. 고객 기본 정보 조회
      const { data: customerData, error: customerError } = await supabase
        .from('customers')
        .select('*')
        .eq('customer_id', customerIdNum)
        .single();

      if (customerError) throw customerError;
      setCustomer(customerData);

      // 2. 연락처 목록 조회 (이 고객의 담당자)
      const { data: contactsData, error: contactsError } = await supabase
        .from('contacts')
        .select('*')
        .eq('customer_id', customerIdNum)
        .order('name');

      if (contactsError) throw contactsError;
      setContacts(contactsData || []);

      // 3. 세그먼트 목록 조회 (이 고객의 담당자별 세그먼트)
      const { data: segmentsData, error: segmentsError } = await supabase
        .from('segments')
        .select(`
          *,
          contacts!inner(customer_id, name)
        `)
        .eq('contacts.customer_id', customerIdNum);

      if (segmentsError) throw segmentsError;
      setSegments(segmentsData || []);
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
   * 연락처 추가 성공 시 실행 (데이터 갱신 + 모달 닫기 + 성공 알림)
   */
  const handleContactAdded = () => {
    fetchCustomerData();
    setShowAddContactModal(false);
    toast({
      title: "성공",
      description: "연락처가 추가되었습니다.",
    });
  };

  /**
   * 세그먼트 추가 성공 시 실행 (데이터 갱신 + 모달 닫기 + 성공 알림)
   */
  const handleSegmentAdded = () => {
    fetchCustomerData();
    setShowAddSegmentModal(false);
    toast({
      title: "성공",
      description: "세그먼트가 추가되었습니다.",
    });
  };

  // 데이터 로딩 중 표시
  if (loading) {
    return <div className="text-center py-8">로딩중...</div>;
  }

  // 고객 정보가 없거나 잘못된 ID일 때 안내
  if (!customer || !customerIdNum) {
    return (
      <div className="text-center py-8">
        <p>고객을 찾을 수 없습니다.</p>
        <Link to="/customers" className="text-blue-600 hover:underline">
          고객 목록으로 돌아가기
        </Link>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* 상단: 뒤로가기 링크 + 고객 정보 카드 */}
      <div className="mb-6">
        <Link 
          to="/customers" 
          className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          고객 목록으로 돌아가기
        </Link>
        
        {/* 고객사 정보 카드 */}
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">{customer.company_name}</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-500">회사 유형:</span>
              <p>{customer.company_type || '-'}</p>
            </div>
            <div>
              <span className="font-medium text-gray-500">업종:</span>
              <p>{customer.industry_type || '-'}</p>
            </div>
            <div>
              <span className="font-medium text-gray-500">지역:</span>
              <p>{customer.region || '-'}</p>
            </div>
            <div>
              <span className="font-medium text-gray-500">국가:</span>
              <p>{customer.country || '-'}</p>
            </div>
            <div>
              <span className="font-medium text-gray-500">회사 규모:</span>
              <p>{customer.company_size || '-'}</p>
            </div>
            <div>
              <span className="font-medium text-gray-500">등록일:</span>
              <p>{customer.reg_date ? new Date(customer.reg_date).toLocaleDateString() : '-'}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-8">
        {/* 연락처 섹션 */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">연락처</h2>
              <Button 
                onClick={() => setShowAddContactModal(true)}
                className="flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>연락처 추가</span>
              </Button>
            </div>
          </div>
          {/* 연락처 목록 테이블/섹션 */}
          <ContactsSection contacts={contacts} onContactUpdated={fetchCustomerData} />
        </div>

        {/* 세그먼트 섹션 */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">세그먼트</h2>
              {/* <Button 
                onClick={() => setShowAddSegmentModal(true)}
                className="flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>세그먼트 추가</span>
              </Button> */}
            </div>
          </div>
          {/* 세그먼트 목록 테이블/섹션 */}
          <SegmentsSection segments={segments} onSegmentUpdated={fetchCustomerData} />
        </div>
      </div>

      {/* 연락처 추가 모달 */}
      <AddContactModal
        isOpen={showAddContactModal}
        onClose={() => setShowAddContactModal(false)}
        customerId={customerIdNum}
        onContactAdded={handleContactAdded}
      />

      {/* 세그먼트 추가 모달 */}
      <AddSegmentModal
        isOpen={showAddSegmentModal}
        onClose={() => setShowAddSegmentModal(false)}
        customerId={customerIdNum}
        contacts={contacts}
        onSegmentAdded={handleSegmentAdded}
      />
    </div>
  );
};

export default CustomerDetailPage;
