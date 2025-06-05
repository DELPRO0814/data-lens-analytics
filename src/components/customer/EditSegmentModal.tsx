/**
 * EditSegmentModal 컴포넌트
 * -----------------------------------------------------
 * 주요 동작 요약:
 * - 세그먼트 정보를 수정하는 모달 폼입니다.
 * - 세그먼트 라벨, 위험 수준(필수), 고위험 확률, ARR, CLV를 수정할 수 있습니다.
 * - '저장' 버튼 클릭 시 Supabase DB에 세그먼트 정보가 업데이트되고, 성공 시 부모 컴포넌트에 알림을 보냅니다.
 * - 입력값 검증(위험 수준 필수), 저장 중 로딩 처리, 에러 발생 시 toast로 안내 등 사용자 경험을 고려했습니다.
 * - '취소' 버튼 또는 모달 바깥 클릭 시 모달이 닫힙니다.
 *
 * 상세 설명:
 * - segment prop이 바뀔 때마다 폼 상태가 해당 세그먼트 정보로 초기화됩니다.
 * - 위험 수준(predicted_risk_level)은 필수 입력값입니다.
 * - 고위험 확률(high_risk_probability)은 0~1 사이의 소수, ARR/CLV는 숫자값으로 입력받습니다.
 * - Supabase의 segments 테이블 update 요청을 보내고, 성공하면 onSegmentUpdated를 호출합니다.
 * - 저장 중에는 버튼이 비활성화되고, 실패 시 toast로 에러 메시지를 안내합니다.
 * - Tailwind CSS 기반의 반응형 UI와 일관된 입력 컴포넌트를 사용합니다.
 */

import React, { useState, useEffect } from 'react';
// 모달(다이얼로그), 버튼, 입력창, 셀렉트, 라벨 등 UI 컴포넌트 불러오기
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
// Supabase: DB 연동(세그먼트 수정)
import { supabase } from '@/integrations/supabase/client';
// toast: 사용자에게 알림 메시지 표시
import { useToast } from '@/hooks/use-toast';

// 이 모달이 받을 수 있는 props(속성) 타입 정의
interface EditSegmentModalProps {
  isOpen: boolean; // 모달이 열려있는지 여부
  onClose: () => void; // 모달을 닫을 때 실행할 함수
  segment: any; // 수정할 세그먼트 데이터
  onSegmentUpdated: () => void; // 세그먼트 수정 성공 시 실행할 함수(부모에게 알림)
}

// EditSegmentModal 컴포넌트 정의
const EditSegmentModal: React.FC<EditSegmentModalProps> = ({
  isOpen,
  onClose,
  segment,
  onSegmentUpdated
}) => {
  // 입력 폼의 각 필드 상태값 관리
  const [formData, setFormData] = useState({
    segment_label: '',           // 세그먼트 라벨(옵션)
    predicted_risk_level: '',    // 위험 수준(필수)
    high_risk_probability: '',   // 고위험 확률(0~1, 옵션)
    arr: '',                     // ARR(옵션)
    clv: ''                      // CLV(옵션)
  });
  // 저장 중 로딩 상태
  const [loading, setLoading] = useState(false);
  // toast 메시지 훅
  const { toast } = useToast();

  // segment prop이 바뀔 때마다 폼 상태를 해당 세그먼트 정보로 초기화
  useEffect(() => {
    if (segment) {
      setFormData({
        segment_label: segment.segment_label || '',
        predicted_risk_level: segment.predicted_risk_level || '',
        high_risk_probability: segment.high_risk_probability ? segment.high_risk_probability.toString() : '',
        arr: segment.arr ? segment.arr.toString() : '',
        clv: segment.clv ? segment.clv.toString() : ''
      });
    }
  }, [segment]);

  // 폼 제출(저장 버튼 클릭) 처리 함수
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // 폼의 기본 동작(새로고침) 방지

    // 위험 수준이 비어 있으면 에러 메시지 표시
    if (!formData.predicted_risk_level) {
      toast({
        title: "오류",
        description: "위험 수준은 필수입니다.",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true); // 저장 중 로딩 시작
      // Supabase에 segments 테이블에서 해당 세그먼트를 업데이트
      const { error } = await supabase
        .from('segments')
        .update({
          segment_label: formData.segment_label || null,
          predicted_risk_level: formData.predicted_risk_level,
          high_risk_probability: formData.high_risk_probability ? parseFloat(formData.high_risk_probability) : null,
          arr: formData.arr ? parseFloat(formData.arr) : 0,
          clv: formData.clv ? parseFloat(formData.clv) : 0
        })
        .eq('contact_id', segment.contact_id); // contact_id로 해당 세그먼트만 수정

      // 에러 발생 시 catch로 이동
      if (error) throw error;

      // 성공 시 toast로 안내
      toast({
        title: "성공",
        description: "세그먼트가 수정되었습니다.",
      });

      // 부모 컴포넌트에 세그먼트 수정됨을 알리고 모달 닫기
      onSegmentUpdated();
      onClose();
    } catch (error) {
      // 실패 시 콘솔 출력 및 에러 메시지 표시
      console.error('세그먼트 수정 오류:', error);
      toast({
        title: "오류",
        description: "세그먼트 수정에 실패했습니다.",
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
          <DialogTitle>세그먼트 수정</DialogTitle>
        </DialogHeader>
        
        {/* 세그먼트 정보 입력 폼 */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 2열 그리드로 입력 필드 배치 (반응형) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* 세그먼트 라벨(옵션, 드롭다운) */}
            <div>
              <Label htmlFor="segment_label">세그먼트 라벨</Label>
              <Select value={formData.segment_label} onValueChange={(value) => setFormData(prev => ({ ...prev, segment_label: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="세그먼트 선택" />
                </SelectTrigger>
                <SelectContent className="bg-white border shadow-lg z-50">
                  <SelectItem value="Premium">프리미엄</SelectItem>
                  <SelectItem value="Standard">표준</SelectItem>
                  <SelectItem value="Basic">기본</SelectItem>
                  <SelectItem value="VIP">VIP</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {/* 위험 수준(필수, 드롭다운) */}
            <div>
              <Label htmlFor="predicted_risk_level">위험 수준 *</Label>
              <Select value={formData.predicted_risk_level} onValueChange={(value) => setFormData(prev => ({ ...prev, predicted_risk_level: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="위험 수준 선택" />
                </SelectTrigger>
                <SelectContent className="bg-white border shadow-lg z-50">
                  <SelectItem value="High">높음</SelectItem>
                  <SelectItem value="Medium">보통</SelectItem>
                  <SelectItem value="Low">낮음</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {/* 고위험 확률(옵션, 0~1 사이의 소수) */}
            <div>
              <Label htmlFor="high_risk_probability">고위험 확률 (0-1)</Label>
              <Input
                id="high_risk_probability"
                type="number"
                step="0.01"
                min="0"
                max="1"
                value={formData.high_risk_probability}
                onChange={(e) => setFormData(prev => ({ ...prev, high_risk_probability: e.target.value }))}
              />
            </div>
            {/* ARR(옵션, 숫자) */}
            <div>
              <Label htmlFor="arr">ARR</Label>
              <Input
                id="arr"
                type="number"
                value={formData.arr}
                onChange={(e) => setFormData(prev => ({ ...prev, arr: e.target.value }))}
              />
            </div>
            {/* CLV(옵션, 숫자, 2열 전체 차지) */}
            <div className="md:col-span-2">
              <Label htmlFor="clv">CLV</Label>
              <Input
                id="clv"
                type="number"
                value={formData.clv}
                onChange={(e) => setFormData(prev => ({ ...prev, clv: e.target.value }))}
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

export default EditSegmentModal;
