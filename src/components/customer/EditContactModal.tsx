
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface EditContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  contact: any;
  onContactUpdated: () => void;
}

const EditContactModal: React.FC<EditContactModalProps> = ({
  isOpen,
  onClose,
  contact,
  onContactUpdated
}) => {
  const [formData, setFormData] = useState({
    name: '',
    department: '',
    position: '',
    phone: '',
    email: '',
    contact_date: '',
    is_keyman: false,
    is_executive: false,
    preferred_channel: ''
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (contact) {
      setFormData({
        name: contact.name || '',
        department: contact.department || '',
        position: contact.position || '',
        phone: contact.phone || '',
        email: contact.email || '',
        contact_date: contact.contact_date || '',
        is_keyman: contact.is_keyman === '1',
        is_executive: contact.is_executive === '1',
        preferred_channel: contact.preferred_channel || ''
      });
    }
  }, [contact]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) {
      toast({
        title: "오류",
        description: "이름은 필수입니다.",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      const { error } = await supabase
        .from('contacts')
        .update({
          name: formData.name,
          department: formData.department || null,
          position: formData.position || null,
          phone: formData.phone || null,
          email: formData.email || null,
          contact_date: formData.contact_date || null,
          is_keyman: formData.is_keyman ? '1' : '0',
          is_executive: formData.is_executive ? '1' : '0',
          preferred_channel: formData.preferred_channel || null
        })
        .eq('contact_id', contact.contact_id);

      if (error) throw error;

      toast({
        title: "성공",
        description: "연락처가 수정되었습니다.",
      });
      
      onContactUpdated();
      onClose();
    } catch (error) {
      console.error('연락처 수정 오류:', error);
      toast({
        title: "오류",
        description: "연락처 수정에 실패했습니다.",
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
          <DialogTitle>연락처 수정</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">이름 *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                required
              />
            </div>
            
            <div>
              <Label htmlFor="department">부서</Label>
              <Input
                id="department"
                value={formData.department}
                onChange={(e) => setFormData(prev => ({ ...prev, department: e.target.value }))}
              />
            </div>
            
            <div>
              <Label htmlFor="position">직책</Label>
              <Input
                id="position"
                value={formData.position}
                onChange={(e) => setFormData(prev => ({ ...prev, position: e.target.value }))}
              />
            </div>
            
            <div>
              <Label htmlFor="phone">전화번호</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
              />
            </div>
            
            <div>
              <Label htmlFor="email">이메일</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              />
            </div>
            
            <div>
              <Label htmlFor="contact_date">연락일</Label>
              <Input
                id="contact_date"
                type="date"
                value={formData.contact_date}
                onChange={(e) => setFormData(prev => ({ ...prev, contact_date: e.target.value }))}
              />
            </div>
            
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

export default EditContactModal;
