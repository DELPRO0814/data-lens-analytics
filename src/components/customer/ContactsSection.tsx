/**
 * ContactsSection 컴포넌트
 * -----------------------------------------------------
 * 주요 동작 요약:
 * - 연락처 목록, 검색, 부서/키맨/임원 필터, 페이지네이션, 연락처 수정 모달 등
 *   연락처 관리에 필요한 모든 기능을 제공합니다.
 * - 검색어, 필터, 현재 페이지 등 상태를 useState로 관리하며,
 *   각 조건에 따라 필터링된 연락처와 페이지네이션 결과를 계산합니다.
 * - 행의 '수정' 버튼 클릭 시 연락처 수정 모달(EditContactModal)이 열립니다.
 * - 필터, 검색, 페이지네이션, 데이터 없음 안내 등 실무에서 필요한 UI/UX를 모두 갖추고 있습니다.
 *
 * 상세 설명:
 * - 검색어는 이름/이메일/전화번호에 대해 부분 일치로 필터링합니다.
 * - 부서/키맨/임원 여부는 드롭다운 셀렉트로 필터링할 수 있습니다.
 * - 페이지네이션은 ... 생략 처리 등 UX를 고려해 구현되어 있습니다.
 * - 행의 수정 버튼 클릭 시 해당 연락처 정보가 모달로 전달되어 수정할 수 있습니다.
 * - Tailwind CSS 기반의 반응형 디자인과 일관된 UI를 제공합니다.
 */

import React, { useState } from 'react';
// UI 컴포넌트 및 아이콘 불러오기
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Edit, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { Pagination, PaginationContent, PaginationItem, PaginationLink } from '@/components/ui/pagination';
import EditContactModal from './EditContactModal';

// 이 컴포넌트가 받을 수 있는 props(속성) 타입 정의
interface ContactsSectionProps {
  contacts: any[]; // 연락처 데이터 배열
  onContactUpdated: () => void; // 연락처 수정 후 실행할 함수
}

// 연락처 목록, 검색, 필터, 페이지네이션, 수정 모달을 모두 포함한 컴포넌트
const ContactsSection: React.FC<ContactsSectionProps> = ({ contacts, onContactUpdated }) => {
  // 검색어 상태
  const [searchTerm, setSearchTerm] = useState('');
  // 부서 필터 상태
  const [departmentFilter, setDepartmentFilter] = useState('');
  // 키맨(중요 담당자) 필터 상태
  const [keymanFilter, setKeymanFilter] = useState('');
  // 임원 필터 상태
  const [executiveFilter, setExecutiveFilter] = useState('');
  // 현재 수정 중인 연락처(모달로 열기)
  const [editingContact, setEditingContact] = useState(null);
  // 현재 페이지 번호(페이지네이션)
  const [currentPage, setCurrentPage] = useState(1);
  // 한 페이지에 보여줄 연락처 수
  const pageSize = 15;

  // 검색어, 필터 조건에 따라 연락처를 필터링
  const filteredContacts = contacts.filter(contact => {
    // 이름, 이메일, 전화번호 중 하나라도 검색어를 포함하면 true
    const matchesSearch = contact.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         contact.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         contact.phone?.includes(searchTerm);
    // 부서 필터 적용
    const matchesDepartment = !departmentFilter || departmentFilter === 'all' || contact.department === departmentFilter;
    // 키맨 필터 적용
    const matchesKeyman = !keymanFilter || keymanFilter === 'all' || contact.is_keyman === keymanFilter;
    // 임원 필터 적용
    const matchesExecutive = !executiveFilter || executiveFilter === 'all' || contact.is_executive === executiveFilter;

    // 모든 조건을 만족하는 연락처만 남김
    return matchesSearch && matchesDepartment && matchesKeyman && matchesExecutive;
  });

  // 페이지네이션 계산
  const totalPages = Math.ceil(filteredContacts.length / pageSize); // 전체 페이지 수
  const startIndex = (currentPage - 1) * pageSize; // 현재 페이지의 첫 연락처 인덱스
  const endIndex = startIndex + pageSize; // 현재 페이지의 마지막 연락처 인덱스
  const paginatedContacts = filteredContacts.slice(startIndex, endIndex); // 현재 페이지에 보여줄 연락처 배열

  // 검색어나 필터가 바뀌면 항상 1페이지로 이동
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, departmentFilter, keymanFilter, executiveFilter]);

  // 페이지 이동 함수(범위 내에서만 동작)
  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // 페이지네이션에 표시할 페이지 번호 목록 계산(... 처리 포함)
  const getVisiblePages = () => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];

    for (let i = Math.max(2, currentPage - delta); 
         i <= Math.min(totalPages - 1, currentPage + delta); 
         i++) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, '...');
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages);
    } else if (totalPages > 1) {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots;
  };

  // 연락처에서 부서 목록을 중복 없이 추출(필터용)
  const uniqueDepartments = [...new Set(contacts.map(c => c.department).filter(Boolean))];

  return (
    <div className="p-6">
      {/* 필터 영역: 검색, 부서, 키맨, 임원 */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 검색창 */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="이름, 이메일, 전화번호 검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        {/* 부서 필터 드롭다운 */}
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
        {/* 키맨 필터 드롭다운 */}
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
        {/* 임원 필터 드롭다운 */}
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

      {/* 결과 개수 및 표시 범위 안내 */}
      <div className="mb-4 text-sm text-gray-600">
        총 {filteredContacts.length}개 연락처 
        {filteredContacts.length > 0 && (
          <span className="ml-2">
            ({startIndex + 1}-{Math.min(endIndex, filteredContacts.length)} 표시)
          </span>
        )}
      </div>

      {/* 연락처 테이블 */}
      <div className="overflow-x-auto mb-4">
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
            {/* 연락처가 없으면 안내 메시지 표시 */}
            {paginatedContacts.length === 0 ? (
              <tr>
                <td colSpan={9} className="border border-gray-300 px-4 py-8 text-center text-gray-500">
                  연락처가 없습니다.
                </td>
              </tr>
            ) : (
              // 연락처 행 렌더링
              paginatedContacts.map(contact => (
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
                    {/* 수정 버튼: 클릭 시 연락처 수정 모달 오픈 */}
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

      {/* 페이지네이션(페이지 이동 UI) */}
      {totalPages > 1 && (
        <div className="flex justify-center">
          <Pagination>
            <PaginationContent>
              {/* 이전 페이지 버튼 */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="flex items-center gap-1"
              >
                <ChevronLeft className="h-4 w-4" />
                이전
              </Button>
              {/* 페이지 번호 및 ... 표시 */}
              {getVisiblePages().map((page, index) => (
                <PaginationItem key={index}>
                  {page === '...' ? (
                    <span className="px-3 py-2">...</span>
                  ) : (
                    <PaginationLink
                      onClick={() => handlePageChange(page as number)}
                      isActive={currentPage === page}
                      className="cursor-pointer"
                    >
                      {page}
                    </PaginationLink>
                  )}
                </PaginationItem>
              ))}
              {/* 다음 페이지 버튼 */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="flex items-center gap-1"
              >
                다음
                <ChevronRight className="h-4 w-4" />
              </Button>
            </PaginationContent>
          </Pagination>
        </div>
      )}

      {/* 연락처 수정 모달: editingContact가 있으면 표시 */}
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
