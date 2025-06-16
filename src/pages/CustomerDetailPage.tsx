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
import { useParams, Link, useNavigate } from 'react-router-dom'; // useNavigate 추가
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Plus, Edit, Trash2, Save, X } from 'lucide-react'; // 아이콘 추가
import ContactsSection from '@/components/customer/ContactsSection';
import SegmentsSection from '@/components/customer/SegmentsSection';
import AddContactModal from '@/components/customer/AddContactModal';
import AddSegmentModal from '@/components/customer/AddSegmentModal';

const CustomerDetailPage = () => {
  const { customerId } = useParams();
  const navigate = useNavigate(); // 페이지 이동을 위한 hook
  const { toast } = useToast();

  const [customer, setCustomer] = useState<any>(null);
  const [contacts, setContacts] = useState([]);
  const [segments, setSegments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddContactModal, setShowAddContactModal] = useState(false);
  const [showAddSegmentModal, setShowAddSegmentModal] = useState(false);

  // --- 추가된 상태 ---
  const [isEditing, setIsEditing] = useState(false); // 수정 모드 상태
  const [editedCustomer, setEditedCustomer] = useState<any>(null); // 수정 중인 고객 정보

  const customerIdNum = customerId ? parseInt(customerId, 10) : null;

  useEffect(() => {
    if (customerIdNum) {
      fetchCustomerData();
    }
  }, [customerIdNum]);

  const fetchCustomerData = async () => {
    try {
      setLoading(true);

      // 고객 정보 조회
      const { data: customerData, error: customerError } = await supabase
        .from('customers')
        .select('*')
        .eq('customer_id', customerIdNum)
        .single();

      if (customerError) throw customerError;
      setCustomer(customerData);
      setEditedCustomer(customerData); // 수정용 상태에도 초기 데이터 설정

      // 연락처 목록 조회
      const { data: contactsData, error: contactsError } = await supabase
        .from('contacts')
        .select('*')
        .eq('customer_id', customerIdNum)
        .order('name');

      if (contactsError) throw contactsError;
      setContacts(contactsData || []);

      // 세그먼트 목록 조회
      const { data: segmentsData, error: segmentsError } = await supabase
        .from('segments')
        .select(`*, contacts!inner(customer_id, name)`)
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
  
  // --- 핸들러 함수들 (추가 및 수정) ---

  /**
   * 수정 모드 활성화/비활성화
   */
  const handleToggleEdit = () => {
    if (isEditing) {
      // 수정 취소 시, 원래 데이터로 복구
      setEditedCustomer(customer);
    }
    setIsEditing(!isEditing);
  };
  
  /**
   * 입력 필드 변경 핸들러
   */
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEditedCustomer({ ...editedCustomer, [name]: value });
  };

  /**
   * 고객 정보 업데이트
   */
  const handleUpdateCustomer = async () => {
    if (!editedCustomer) return;

    try {
      const { error } = await supabase
        .from('customers')
        .update({
          company_name: editedCustomer.company_name,
          company_type: editedCustomer.company_type,
          industry_type: editedCustomer.industry_type,
          region: editedCustomer.region,
          country: editedCustomer.country,
          company_size: editedCustomer.company_size,
        })
        .eq('customer_id', customerIdNum);

      if (error) throw error;

      await fetchCustomerData(); // 데이터 새로고침
      setIsEditing(false); // 수정 모드 종료
      toast({
        title: "성공",
        description: "고객 정보가 성공적으로 수정되었습니다.",
      });
    } catch (error) {
      console.error('고객 정보 업데이트 오류:', error);
      toast({
        title: "오류",
        description: "고객 정보 수정에 실패했습니다.",
        variant: "destructive",
      });
    }
  };
  
  /**
   * 고객 정보 삭제
   */
  const handleDeleteCustomer = async () => {
    if (window.confirm(`'${customer.company_name}' 고객 정보를 정말 삭제하시겠습니까? 관련된 모든 연락처와 세그먼트 정보도 함께 삭제됩니다.`)) {
      try {
        // Supabase의 CASCADE 설정에 따라 관련 데이터(contacts, segments)도 삭제될 수 있습니다.
        // 만약 CASCADE 설정이 없다면, contacts와 segments를 먼저 삭제해야 합니다.
        const { error } = await supabase
          .from('customers')
          .delete()
          .eq('customer_id', customerIdNum);

        if (error) throw error;

        toast({
          title: "삭제 완료",
          description: "고객 정보가 삭제되었습니다.",
        });
        navigate('/customers'); // 고객 목록 페이지로 이동
      } catch (error) {
        console.error('고객 정보 삭제 오류:', error);
        toast({
          title: "오류",
          description: "고객 정보 삭제에 실패했습니다.",
          variant: "destructive",
        });
      }
    }
  };


  const handleContactAdded = () => {
    fetchCustomerData();
    setShowAddContactModal(false);
    toast({
      title: "성공",
      description: "연락처가 추가되었습니다.",
    });
  };

  const handleSegmentAdded = () => {
    fetchCustomerData();
    setShowAddSegmentModal(false);
    toast({
      title: "성공",
      description: "세그먼트가 추가되었습니다.",
    });
  };

  if (loading) {
    return <div className="text-center py-8">로딩중...</div>;
  }

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
          <div className="flex justify-between items-start mb-4">
            {isEditing ? (
              <input
                type="text"
                name="company_name"
                value={editedCustomer.company_name}
                onChange={handleInputChange}
                className="text-2xl font-bold text-gray-900 border-b-2 border-blue-500 focus:outline-none"
              />
            ) : (
              <h1 className="text-2xl font-bold text-gray-900">{customer.company_name}</h1>
            )}
            
            {/* --- 수정/삭제 버튼 영역 --- */}
            <div className="flex items-center space-x-2">
              {isEditing ? (
                <>
                  <Button onClick={handleUpdateCustomer} size="sm" className="bg-blue-600 hover:bg-blue-700">
                    <Save className="w-4 h-4 mr-2" /> 저장
                  </Button>
                  <Button onClick={handleToggleEdit} size="sm" variant="outline">
                    <X className="w-4 h-4 mr-2" /> 취소
                  </Button>
                </>
              ) : (
                <>
                  <Button onClick={handleToggleEdit} size="sm" variant="outline">
                    <Edit className="w-4 h-4 mr-2" /> 수정
                  </Button>
                  <Button onClick={handleDeleteCustomer} size="sm" variant="destructive">
                    <Trash2 className="w-4 h-4 mr-2" /> 삭제
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* --- 정보 표시/입력 영역 --- */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
            {isEditing ? (
              <>
                <div>
                  <label className="font-medium text-gray-500">회사 유형</label>
                  <input type="text" name="company_type" value={editedCustomer.company_type || ''} onChange={handleInputChange} className="w-full p-1 border rounded"/>
                </div>
                <div>
                  <label className="font-medium text-gray-500">업종</label>
                  <input type="text" name="industry_type" value={editedCustomer.industry_type || ''} onChange={handleInputChange} className="w-full p-1 border rounded"/>
                </div>
                <div>
                  <label className="font-medium text-gray-500">지역</label>
                  <input type="text" name="region" value={editedCustomer.region || ''} onChange={handleInputChange} className="w-full p-1 border rounded"/>
                </div>
                <div>
                  <label className="font-medium text-gray-500">국가</label>
                  <input type="text" name="country" value={editedCustomer.country || ''} onChange={handleInputChange} className="w-full p-1 border rounded"/>
                </div>
                <div>
                  <label className="font-medium text-gray-500">회사 규모</label>
                  <input type="text" name="company_size" value={editedCustomer.company_size || ''} onChange={handleInputChange} className="w-full p-1 border rounded"/>
                </div>
              </>
            ) : (
              <>
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
              </>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-8">
        {/* 연락처 섹션 */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">연락처</h2>
              <Button onClick={() => setShowAddContactModal(true)} className="flex items-center space-x-2">
                <Plus className="w-4 h-4" />
                <span>연락처 추가</span>
              </Button>
            </div>
          </div>
          <ContactsSection contacts={contacts} onContactUpdated={fetchCustomerData} />
        </div>

        {/* 세그먼트 섹션 */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">세그먼트</h2>
            </div>
          </div>
          <SegmentsSection segments={segments} onSegmentUpdated={fetchCustomerData} />
        </div>
      </div>

      <AddContactModal
        isOpen={showAddContactModal}
        onClose={() => setShowAddContactModal(false)}
        customerId={customerIdNum}
        onContactAdded={handleContactAdded}
      />

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