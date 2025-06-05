/**
 * AddContactModal 컴포넌트
 * -----------------------------------------------------
 * 주요 동작 요약:
 * - 고객의 연락처(담당자 등)를 추가하는 모달 폼입니다.
 * - 이름, 부서, 직책, 전화번호, 이메일, 연락일, 선호 채널, 키맨/임원 여부를 입력할 수 있습니다.
 * - '저장' 버튼 클릭 시 Supabase DB에 연락처가 등록되고, 성공 시 부모 컴포넌트에 알림을 보냅니다.
 * - 입력값 검증(이름 필수), 저장 중 로딩 처리, 에러 발생 시 toast로 안내 등 사용자 경험을 고려했습니다.
 * - '취소' 버튼 또는 모달 바깥 클릭 시 모달이 닫힙니다.
 *
 * 상세 설명:
 * - formData 상태로 입력값을 관리하고, 각 필드 값은 useState로 실시간 반영됩니다.
 * - 이름이 비어 있으면 저장 시도 시 에러 메시지로 안내합니다.
 * - Supabase에 contacts 테이블 insert 요청을 보내고, 성공하면 onContactAdded를 호출합니다.
 * - 저장 중에는 버튼이 비활성화되고, 실패 시 toast로 에러 메시지를 안내합니다.
 * - Tailwind CSS 기반의 반응형 UI와 일관된 입력 컴포넌트를 사용합니다.
 */

import React, { useState } from 'react';
// 다이얼로그(모달), 버튼, 입력창, 셀렉트, 라벨, 체크박스 등 UI 컴포넌트 불러오기
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
// Supabase: DB 연동(연락처 추가)
import { supabase } from '@/integrations/supabase/client';
// toast: 사용자에게 알림 메시지 표시
import { useToast } from '@/hooks/use-toast';

// 이 모달이 받을 수 있는 props(속성) 타입 정의
interface AddContactModalProps {
  isOpen: boolean; // 모달이 열려있는지 여부
  onClose: () => void; // 모달을 닫을 때 실행할 함수
  customerId: number; // 어떤 고객의 연락처인지(고객 id)
  onContactAdded: () => void; // 연락처 추가 성공 시 실행할 함수(부모에게 알림)
}

// AddContactModal 컴포넌트 정의
const AddContactModal: React.FC<AddContactModalProps> = ({
  isOpen,
  onClose,
  customerId,
  onContactAdded
}) => {
  // 입력 폼의 각 필드 상태값 관리
  const [formData, setFormData] = useState({
    name: '',                // 이름(필수)
    department: '',          // 부서
    position: '',            // 직책
    phone: '',               // 전화번호
    email: '',               // 이메일
    contact_date: '',        // 연락일(날짜)
    is_keyman: false,        // 키맨 여부
    is_executive: false,     // 임원 여부
    preferred_channel: ''    // 선호 연락채널
  });
  // 저장 중 로딩 상태
  const [loading, setLoading] = useState(false);
  // toast 메시지 훅
  const { toast } = useToast();

  // 폼 제출(저장 버튼 클릭) 처리 함수
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // 폼 기본 동작(새로고침) 방지

    // 이름이 비어 있으면 에러 메시지 표시
    if (!formData.name) {
      toast({
        title: "오류",
        description: "이름은 필수입니다.",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true); // 저장 중 로딩 시작
      // Supabase에 contacts 테이블에 새 연락처 추가 요청
      const { error } = await supabase
        .from('contacts')
        .insert([{
          customer_id: customerId, // 고객 ID
          name: formData.name,
          department: formData.department || null,
          position: formData.position || null,
          phone: formData.phone || null,
          email: formData.email || null,
          contact_date: formData.contact_date || null,
          is_keyman: formData.is_keyman ? '1' : '0', // true/false를 '1'/'0'으로 변환
          is_executive: formData.is_executive ? '1' : '0',
          preferred_channel: formData.preferred_channel || null
        }]);

      // 에러 발생 시 catch로 이동
      if (error) throw error;

      // 성공 시 부모에게 연락처 추가됨을 알림
      onContactAdded();
    } catch (error) {
      // 실패 시 콘솔 출력 및 에러 메시지 표시
      console.error('연락처 추가 오류:', error);
      toast({
        title: "오류",
        description: "연락처 추가에 실패했습니다.",
        variant: "destructive",
      });
    } finally {
      setLoading(false); // 로딩 종료
    }
  };

  return (
    // Dialog: 모달 창(열림/닫힘 제어)
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>새 연락처 추가</DialogTitle>
        </DialogHeader>
        
        {/* 연락처 입력 폼 */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 2열 그리드로 입력 필드 배치 (반응형) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* 이름(필수) */}
            <div>
              <Label htmlFor="name">이름 *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                required
              />
            </div>
            {/* 부서 */}
            <div>
              <Label htmlFor="department">부서</Label>
              <Input
                id="department"
                value={formData.department}
                onChange={(e) => setFormData(prev => ({ ...prev, department: e.target.value }))}
              />
            </div>
            {/* 직책 */}
            <div>
              <Label htmlFor="position">직책</Label>
              <Input
                id="position"
                value={formData.position}
                onChange={(e) => setFormData(prev => ({ ...prev, position: e.target.value }))}
              />
            </div>
            {/* 전화번호 */}
            <div>
              <Label htmlFor="phone">전화번호</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
              />
            </div>
            {/* 이메일 */}
            <div>
              <Label htmlFor="email">이메일</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              />
            </div>
            {/* 연락일(날짜) */}
            <div>
              <Label htmlFor="contact_date">연락일</Label>
              <Input
                id="contact_date"
                type="date"
                value={formData.contact_date}
                onChange={(e) => setFormData(prev => ({ ...prev, contact_date: e.target.value }))}
              />
            </div>
            {/* 선호 연락채널(드롭다운) */}
            <div>
              <Label htmlFor="preferred_channel">선호 채널</Label>
              <Select value={formData.preferred_channel} onValueChange={(value) => setFormData(prev => ({ ...prev, preferred_channel: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="선호 채널 선택" />
                </SelectTrigger>
                <SelectContent className="bg-white border shadow-lg z-50">
                  <SelectItem value="Email">이메일</SelectItem>
                  <SelectItem value="Phone">전화</SelectItem>
                  <SelectItem value="SMS">SMS</SelectItem>
                  <SelectItem value="Meeting">회의</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {/* 키맨/임원 체크박스 */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="is_keyman"
                  checked={formData.is_keyman}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_keyman: !!checked }))}
                />
                <Label htmlFor="is_keyman">키맨</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="is_executive"
                  checked={formData.is_executive}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_executive: !!checked }))}
                />
                <Label htmlFor="is_executive">임원</Label>
              </div>
            </div>
          </div>
          
          {/* 하단 버튼: 취소/저장 */}
          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              취소
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? '저장 중...' : '저장'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddContactModal;
