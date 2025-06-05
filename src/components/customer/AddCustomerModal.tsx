/**
 * AddCustomerModal 컴포넌트
 * -----------------------------------------------------
 * 주요 동작 요약:
 * - 고객(회사) 정보를 추가하는 모달 폼입니다.
 * - 회사명, 회사 유형(필수), 지역, 국가, 업종, 회사 규모, 등록일을 입력할 수 있습니다.
 * - '저장' 버튼 클릭 시 Supabase DB에 고객 정보가 등록되고, 성공 시 부모 컴포넌트에 알림을 보냅니다.
 * - 입력값 검증(회사명/회사유형 필수), 저장 중 로딩 처리, 에러 발생 시 toast로 안내 등 사용자 경험을 고려했습니다.
 * - '취소' 버튼 또는 모달 바깥 클릭 시 모달이 닫힙니다.
 *
 * 상세 설명:
 * - 회사명(company_name)과 회사 유형(company_type)은 필수 입력 항목입니다.
 * - 회사 유형은 드롭다운으로 선택 가능하며 완성차/유통/정비소/렌터카 중 선택합니다.
 * - 등록일(reg_date)은 날짜 선택기로 입력받으며 필수 항목은 아닙니다.
 * - 회사 규모(company_size)는 중소기업/중견기업/대기업 중 드롭다운으로 선택합니다.
 * - 폼 제출 시 Supabase의 customers 테이블에 데이터를 삽입합니다.
 * - 성공 시 폼을 초기화하고 부모 컴포넌트에 갱신 신호를 보냅니다.
 * - Tailwind CSS를 사용한 반응형 그리드 레이아웃이 적용되어 있습니다.
 */

import React, { useState } from 'react';
// 모달(다이얼로그), 버튼, 입력창, 셀렉트, 라벨 등 UI 컴포넌트 불러오기
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
// Supabase: DB 연동(고객 추가)
import { supabase } from '@/integrations/supabase/client';
// toast: 사용자에게 알림 메시지 표시
import { useToast } from '@/hooks/use-toast';

// 이 모달이 받을 수 있는 props(속성) 타입 정의
interface AddCustomerModalProps {
  isOpen: boolean; // 모달이 열려있는지 여부
  onClose: () => void; // 모달을 닫을 때 실행할 함수
  onCustomerAdded: () => void; // 고객 추가 성공 시 실행할 함수(부모에게 알림)
}

// AddCustomerModal 컴포넌트 정의
const AddCustomerModal: React.FC<AddCustomerModalProps> = ({
  isOpen,
  onClose,
  onCustomerAdded
}) => {
  // 입력 폼의 각 필드 상태값 관리
  const [formData, setFormData] = useState({
    company_name: '',      // 회사명(필수)
    company_type: '',      // 회사 유형(필수)
    region: '',            // 지역
    reg_date: '',          // 등록일(날짜)
    industry_type: '',     // 업종
    country: '',           // 국가
    company_size: ''       // 회사 규모
  });
  // 저장 중 로딩 상태
  const [loading, setLoading] = useState(false);
  // toast 메시지 훅
  const { toast } = useToast();

  // 폼 제출(저장 버튼 클릭) 처리 함수
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // 폼의 기본 동작(새로고침) 방지

    // 회사명과 회사 유형이 비어 있으면 에러 메시지 표시
    if (!formData.company_name || !formData.company_type) {
      toast({
        title: "오류",
        description: "회사명과 회사 유형은 필수입니다.",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true); // 저장 중 로딩 시작
      // Supabase에 customers 테이블에 새 고객 추가 요청
      const { error } = await supabase
        .from('customers')
        .insert([{
          ...formData,
          reg_date: formData.reg_date || null // 등록일이 없으면 null로 저장
        }]);

      // 에러 발생 시 catch로 이동
      if (error) throw error;

      // 성공 시 toast로 안내
      toast({
        title: "성공",
        description: "고객이 추가되었습니다.",
      });

      // 폼 초기화(입력값 모두 비움)
      setFormData({
        company_name: '',
        company_type: '',
        region: '',
        reg_date: '',
        industry_type: '',
        country: '',
        company_size: ''
      });

      // 부모 컴포넌트에 고객 추가됨을 알리고 모달 닫기
      onCustomerAdded();
      onClose();
    } catch (error) {
      // 실패 시 콘솔 출력 및 에러 메시지 표시
      console.error('고객 추가 오류:', error);
      toast({
        title: "오류",
        description: "고객 추가에 실패했습니다.",
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
          <DialogTitle>새 고객 추가</DialogTitle>
        </DialogHeader>
        
        {/* 고객 정보 입력 폼 */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 2열 그리드로 입력 필드 배치 (반응형) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* 회사명(필수) */}
            <div>
              <Label htmlFor="company_name">회사명 *</Label>
              <Input
                id="company_name"
                value={formData.company_name}
                onChange={(e) => setFormData(prev => ({ ...prev, company_name: e.target.value }))}
                required
              />
            </div>
            {/* 회사 유형(필수, 드롭다운) */}
            <div>
              <Label htmlFor="company_type">회사 유형 *</Label>
              <Select value={formData.company_type} onValueChange={(value) => setFormData(prev => ({ ...prev, company_type: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="회사 유형 선택" />
                </SelectTrigger>
                <SelectContent className="bg-white border shadow-lg z-50">
                  <SelectItem value="완성차">완성차</SelectItem>
                  <SelectItem value="유통">유통</SelectItem>
                  <SelectItem value="정비소">정비소</SelectItem>
                  <SelectItem value="렌터카">렌터카</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {/* 지역 */}
            <div>
              <Label htmlFor="region">지역</Label>
              <Input
                id="region"
                value={formData.region}
                onChange={(e) => setFormData(prev => ({ ...prev, region: e.target.value }))}
              />
            </div>
            {/* 국가 */}
            <div>
              <Label htmlFor="country">국가</Label>
              <Input
                id="country"
                value={formData.country}
                onChange={(e) => setFormData(prev => ({ ...prev, country: e.target.value }))}
              />
            </div>
            {/* 업종 */}
            <div>
              <Label htmlFor="industry_type">업종</Label>
              <Input
                id="industry_type"
                value={formData.industry_type}
                onChange={(e) => setFormData(prev => ({ ...prev, industry_type: e.target.value }))}
              />
            </div>
            {/* 회사 규모(드롭다운) */}
            <div>
              <Label htmlFor="company_size">회사 규모</Label>
              <Select value={formData.company_size} onValueChange={(value) => setFormData(prev => ({ ...prev, company_size: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="회사 규모 선택" />
                </SelectTrigger>
                <SelectContent className="bg-white border shadow-lg z-50">
                  <SelectItem value="중소기업">중소기업</SelectItem>
                  <SelectItem value="중견기업">중견기업</SelectItem>
                  <SelectItem value="대기업">대기업</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {/* 등록일(날짜) */}
            <div className="md:col-span-2">
              <Label htmlFor="reg_date">등록일</Label>
              <Input
                id="reg_date"
                type="date"
                value={formData.reg_date}
                onChange={(e) => setFormData(prev => ({ ...prev, reg_date: e.target.value }))}
              />
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

export default AddCustomerModal;
