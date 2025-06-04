
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
  const { customerId } = useParams();
  const [customer, setCustomer] = useState<any>(null);
  const [contacts, setContacts] = useState([]);
  const [segments, setSegments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddContactModal, setShowAddContactModal] = useState(false);
  const [showAddSegmentModal, setShowAddSegmentModal] = useState(false);
  const { toast } = useToast();

  // Convert customerId to number
  const customerIdNum = customerId ? parseInt(customerId, 10) : null;

  useEffect(() => {
    if (customerIdNum) {
      fetchCustomerData();
    }
  }, [customerIdNum]);

  const fetchCustomerData = async () => {
    try {
      setLoading(true);
      
      // Fetch customer basic info
      const { data: customerData, error: customerError } = await supabase
        .from('customers')
        .select('*')
        .eq('customer_id', customerIdNum)
        .single();

      if (customerError) throw customerError;
      setCustomer(customerData);

      // Fetch contacts
      const { data: contactsData, error: contactsError } = await supabase
        .from('contacts')
        .select('*')
        .eq('customer_id', customerIdNum)
        .order('name');

      if (contactsError) throw contactsError;
      setContacts(contactsData || []);

      // Fetch segments for contacts of this customer
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
        {/* Contacts Section */}
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
          <ContactsSection contacts={contacts} onContactUpdated={fetchCustomerData} />
        </div>

        {/* Segments Section */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">세그먼트</h2>
              <Button 
                onClick={() => setShowAddSegmentModal(true)}
                className="flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>세그먼트 추가</span>
              </Button>
            </div>
          </div>
          <SegmentsSection segments={segments} onSegmentUpdated={fetchCustomerData} />
        </div>
      </div>

      {/* Modals */}
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
