
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface EditSegmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  segment: any;
  onSegmentUpdated: () => void;
}

const EditSegmentModal: React.FC<EditSegmentModalProps> = ({
  isOpen,
  onClose,
  segment,
  onSegmentUpdated
}) => {
  const [formData, setFormData] = useState({
    segment_label: '',
    predicted_risk_level: '',
    high_risk_probability: '',
    arr: '',
    clv: ''
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.predicted_risk_level) {
      toast({
        title: "오류",
        description: "위험 수준은 필수입니다.",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      const { error } = await supabase
        .from('segments')
        .update({
          segment_label: formData.segment_label || null,
          predicted_risk_level: formData.predicted_risk_level,
          high_risk_probability: formData.high_risk_probability ? parseFloat(formData.high_risk_probability) : null,
          arr: formData.arr ? parseFloat(formData.arr) : 0,
          clv: formData.clv ? parseFloat(formData.clv) : 0
        })
        .eq('contact_id', segment.contact_id);

      if (error) throw error;

      toast({
        title: "성공",
        description: "세그먼트가 수정되었습니다.",
      });
      
      onSegmentUpdated();
      onClose();
    } catch (error) {
      console.error('세그먼트 수정 오류:', error);
      toast({
        title: "오류",
        description: "세그먼트 수정에 실패했습니다.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>세그먼트 수정</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            
            <div>
              <Label htmlFor="arr">ARR</Label>
              <Input
                id="arr"
                type="number"
                value={formData.arr}
                onChange={(e) => setFormData(prev => ({ ...prev, arr: e.target.value }))}
              />
            </div>
            
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
