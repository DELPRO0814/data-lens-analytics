
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AddCustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCustomerAdded: () => void;
}

const AddCustomerModal: React.FC<AddCustomerModalProps> = ({
  isOpen,
  onClose,
  onCustomerAdded
}) => {
  const [formData, setFormData] = useState({
    company_name: '',
    company_type: '',
    region: '',
    reg_date: '',
    industry_type: '',
    country: '',
    company_size: ''
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.company_name || !formData.company_type) {
      toast({
        title: "오류",
        description: "회사명과 회사 유형은 필수입니다.",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      const { error } = await supabase
        .from('customers')
        .insert([{
          ...formData,
          reg_date: formData.reg_date || null
        }]);

      if (error) throw error;

      toast({
        title: "성공",
        description: "고객이 추가되었습니다.",
      });
      
      setFormData({
        company_name: '',
        company_type: '',
        region: '',
        reg_date: '',
        industry_type: '',
        country: '',
        company_size: ''
      });
      
      onCustomerAdded();
      onClose();
    } catch (error) {
      console.error('고객 추가 오류:', error);
      toast({
        title: "오류",
        description: "고객 추가에 실패했습니다.",
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
          <DialogTitle>새 고객 추가</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="company_name">회사명 *</Label>
              <Input
                id="company_name"
                value={formData.company_name}
                onChange={(e) => setFormData(prev => ({ ...prev, company_name: e.target.value }))}
                required
              />
            </div>
            
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
            
            <div>
              <Label htmlFor="region">지역</Label>
              <Input
                id="region"
                value={formData.region}
                onChange={(e) => setFormData(prev => ({ ...prev, region: e.target.value }))}
              />
            </div>
            
            <div>
              <Label htmlFor="country">국가</Label>
              <Input
                id="country"
                value={formData.country}
                onChange={(e) => setFormData(prev => ({ ...prev, country: e.target.value }))}
              />
            </div>
            
            <div>
              <Label htmlFor="industry_type">업종</Label>
              <Input
                id="industry_type"
                value={formData.industry_type}
                onChange={(e) => setFormData(prev => ({ ...prev, industry_type: e.target.value }))}
              />
            </div>
            
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
