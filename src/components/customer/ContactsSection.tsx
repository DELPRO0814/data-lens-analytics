
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Edit, Search } from 'lucide-react';
import EditContactModal from './EditContactModal';

interface ContactsSectionProps {
  contacts: any[];
  onContactUpdated: () => void;
}

const ContactsSection: React.FC<ContactsSectionProps> = ({ contacts, onContactUpdated }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [keymanFilter, setKeymanFilter] = useState('');
  const [executiveFilter, setExecutiveFilter] = useState('');
  const [editingContact, setEditingContact] = useState(null);

  const filteredContacts = contacts.filter(contact => {
    const matchesSearch = contact.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         contact.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         contact.phone?.includes(searchTerm);
    
    const matchesDepartment = !departmentFilter || contact.department === departmentFilter;
    const matchesKeyman = !keymanFilter || contact.is_keyman === keymanFilter;
    const matchesExecutive = !executiveFilter || contact.is_executive === executiveFilter;

    return matchesSearch && matchesDepartment && matchesKeyman && matchesExecutive;
  });

  const uniqueDepartments = [...new Set(contacts.map(c => c.department).filter(Boolean))];

  return (
    <div className="p-6">
      {/* Filters */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="이름, 이메일, 전화번호 검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
          <SelectTrigger>
            <SelectValue placeholder="부서 선택" />
          </SelectTrigger>
          <SelectContent className="bg-white border shadow-lg z-50">
            <SelectItem value="all">전체 부서</SelectItem>
            {uniqueDepartments.map(dept => (
              <SelectItem key={dept} value={dept}>{dept}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={keymanFilter} onValueChange={setKeymanFilter}>
          <SelectTrigger>
            <SelectValue placeholder="키맨 여부" />
          </SelectTrigger>
          <SelectContent className="bg-white border shadow-lg z-50">
            <SelectItem value="all">전체</SelectItem>
            <SelectItem value="1">키맨</SelectItem>
            <SelectItem value="0">일반</SelectItem>
          </SelectContent>
        </Select>

        <Select value={executiveFilter} onValueChange={setExecutiveFilter}>
          <SelectTrigger>
            <SelectValue placeholder="임원 여부" />
          </SelectTrigger>
          <SelectContent className="bg-white border shadow-lg z-50">
            <SelectItem value="all">전체</SelectItem>
            <SelectItem value="1">임원</SelectItem>
            <SelectItem value="0">일반</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-50">
              <th className="border border-gray-300 px-4 py-2 text-left">이름</th>
              <th className="border border-gray-300 px-4 py-2 text-left">부서</th>
              <th className="border border-gray-300 px-4 py-2 text-left">직책</th>
              <th className="border border-gray-300 px-4 py-2 text-left">전화번호</th>
              <th className="border border-gray-300 px-4 py-2 text-left">이메일</th>
              <th className="border border-gray-300 px-4 py-2 text-center">키맨</th>
              <th className="border border-gray-300 px-4 py-2 text-center">임원</th>
              <th className="border border-gray-300 px-4 py-2 text-left">선호 채널</th>
              <th className="border border-gray-300 px-4 py-2 text-center">작업</th>
            </tr>
          </thead>
          <tbody>
            {filteredContacts.length === 0 ? (
              <tr>
                <td colSpan={9} className="border border-gray-300 px-4 py-8 text-center text-gray-500">
                  연락처가 없습니다.
                </td>
              </tr>
            ) : (
              filteredContacts.map(contact => (
                <tr key={contact.contact_id} className="hover:bg-gray-50">
                  <td className="border border-gray-300 px-4 py-2">{contact.name}</td>
                  <td className="border border-gray-300 px-4 py-2">{contact.department || '-'}</td>
                  <td className="border border-gray-300 px-4 py-2">{contact.position || '-'}</td>
                  <td className="border border-gray-300 px-4 py-2">{contact.phone || '-'}</td>
                  <td className="border border-gray-300 px-4 py-2">{contact.email || '-'}</td>
                  <td className="border border-gray-300 px-4 py-2 text-center">
                    {contact.is_keyman === '1' ? '✓' : '✗'}
                  </td>
                  <td className="border border-gray-300 px-4 py-2 text-center">
                    {contact.is_executive === '1' ? '✓' : '✗'}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">{contact.preferred_channel || '-'}</td>
                  <td className="border border-gray-300 px-4 py-2 text-center">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setEditingContact(contact)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {editingContact && (
        <EditContactModal
          isOpen={!!editingContact}
          onClose={() => setEditingContact(null)}
          contact={editingContact}
          onContactUpdated={onContactUpdated}
        />
      )}
    </div>
  );
};

export default ContactsSection;
