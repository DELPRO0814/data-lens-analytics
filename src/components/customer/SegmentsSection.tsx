/**
 * SegmentsSection 컴포넌트
 * -----------------------------------------------------
 * 주요 동작 요약:
 * - 위험 수준, 세그먼트 라벨별 필터와 페이지네이션, 세그먼트 수정 모달 등
 *   세그먼트 관리에 필요한 모든 기능을 제공합니다.
 * - 위험 수준(High/Medium/Low)과 세그먼트 라벨별로 필터링할 수 있으며,
 *   필터 조건이 바뀌면 자동으로 1페이지로 이동합니다.
 * - 각 세그먼트 행의 '수정' 버튼 클릭 시 EditSegmentModal이 열려 정보를 수정할 수 있습니다.
 * - 페이지네이션은 ... 생략, 이전/다음 버튼 등 UX를 고려해 구현되어 있습니다.
 * - Tailwind CSS 기반의 반응형 디자인과 일관된 UI를 제공합니다.
 *
 * 상세 설명:
 * - segments 배열을 받아 필터 조건에 따라 실시간으로 목록을 필터링합니다.
 * - uniqueSegmentLabels로 세그먼트 라벨 목록을 동적으로 추출해 필터 옵션으로 제공합니다.
 * - 각 행에는 담당자, 세그먼트 라벨, 위험 수준(색상 뱃지), 고위험 확률, ARR, CLV, 수정 버튼이 표시됩니다.
 * - 수정 버튼 클릭 시 해당 세그먼트 정보가 모달로 전달되어 수정할 수 있습니다.
 * - 데이터가 없으면 안내 메시지가 표시되며, 페이지네이션이 필요한 경우 UX를 고려해 페이지 번호가 표시됩니다.
 */

import React, { useState } from 'react';
// UI 컴포넌트 및 아이콘 불러오기
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Edit, ChevronLeft, ChevronRight } from 'lucide-react';
import { Pagination, PaginationContent, PaginationItem, PaginationLink } from '@/components/ui/pagination';
import EditSegmentModal from './EditSegmentModal';

// 이 컴포넌트가 받을 수 있는 props(속성) 타입 정의
interface SegmentsSectionProps {
  segments: any[]; // 세그먼트 데이터 배열
  onSegmentUpdated: () => void; // 세그먼트 수정 후 실행할 함수(부모에게 알림)
}

// 세그먼트 목록, 필터, 페이지네이션, 수정 모달을 모두 포함한 컴포넌트
const SegmentsSection: React.FC<SegmentsSectionProps> = ({ segments, onSegmentUpdated }) => {
  // 위험 수준(High/Medium/Low) 필터 상태
  const [riskLevelFilter, setRiskLevelFilter] = useState('');
  // 세그먼트 라벨(프리미엄/표준 등) 필터 상태
  const [segmentLabelFilter, setSegmentLabelFilter] = useState('');
  // 현재 수정 중인 세그먼트(모달로 열기)
  const [editingSegment, setEditingSegment] = useState(null);
  // 현재 페이지 번호(페이지네이션)
  const [currentPage, setCurrentPage] = useState(1);
  // 한 페이지에 보여줄 세그먼트 수
  const pageSize = 15;

  // 위험 수준, 세그먼트 라벨 필터에 따라 세그먼트 목록을 필터링
  const filteredSegments = segments.filter(segment => {
    // 위험 수준 필터 적용
    const matchesRiskLevel = riskLevelFilter === 'all' || !riskLevelFilter || segment.predicted_risk_level === riskLevelFilter;
    // 세그먼트 라벨 필터 적용
    const matchesSegmentLabel = segmentLabelFilter === 'all' || !segmentLabelFilter || segment.segment_label === segmentLabelFilter;
    // 두 조건 모두 만족하는 세그먼트만 남김
    return matchesRiskLevel && matchesSegmentLabel;
  });

  // 페이지네이션 계산
  const totalPages = Math.ceil(filteredSegments.length / pageSize); // 전체 페이지 수
  const startIndex = (currentPage - 1) * pageSize; // 현재 페이지의 첫 세그먼트 인덱스
  const endIndex = startIndex + pageSize; // 현재 페이지의 마지막 세그먼트 인덱스
  const paginatedSegments = filteredSegments.slice(startIndex, endIndex); // 현재 페이지에 보여줄 세그먼트 배열

  // 필터가 바뀌면 항상 1페이지로 이동
  React.useEffect(() => {
    setCurrentPage(1);
  }, [riskLevelFilter, segmentLabelFilter]);

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

  // 세그먼트 라벨 목록을 중복 없이 추출(필터용)
  const uniqueSegmentLabels = [...new Set(segments.map(s => s.segment_label).filter(Boolean))];

  return (
    <div className="p-6">
      {/* 필터 영역: 위험 수준, 세그먼트 라벨 */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* 위험 수준 필터 드롭다운 */}
        <Select value={riskLevelFilter} onValueChange={setRiskLevelFilter}>
          <SelectTrigger>
            <SelectValue placeholder="위험 수준 선택" />
          </SelectTrigger>
          <SelectContent className="bg-white border shadow-lg z-50">
            <SelectItem value="all">전체</SelectItem>
            <SelectItem value="High">높음</SelectItem>
            <SelectItem value="Medium">보통</SelectItem>
            <SelectItem value="Low">낮음</SelectItem>
          </SelectContent>
        </Select>
        {/* 세그먼트 라벨 필터 드롭다운 */}
        <Select value={segmentLabelFilter} onValueChange={setSegmentLabelFilter}>
          <SelectTrigger>
            <SelectValue placeholder="세그먼트 라벨 선택" />
          </SelectTrigger>
          <SelectContent className="bg-white border shadow-lg z-50">
            <SelectItem value="all">전체</SelectItem>
            {uniqueSegmentLabels.map(label => (
              <SelectItem key={label} value={label}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* 결과 개수 및 표시 범위 안내 */}
      <div className="mb-4 text-sm text-gray-600">
        총 {filteredSegments.length}개 세그먼트 
        {filteredSegments.length > 0 && (
          <span className="ml-2">
            ({startIndex + 1}-{Math.min(endIndex, filteredSegments.length)} 표시)
          </span>
        )}
      </div>

      {/* 세그먼트 테이블 */}
      <div className="overflow-x-auto mb-4">
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-50">
              <th className="border border-gray-300 px-4 py-2 text-left">담당자</th>
              <th className="border border-gray-300 px-4 py-2 text-left">세그먼트</th>
              <th className="border border-gray-300 px-4 py-2 text-left">위험 수준</th>
              <th className="border border-gray-300 px-4 py-2 text-right">고위험 확률</th>
              <th className="border border-gray-300 px-4 py-2 text-right">ARR</th>
              <th className="border border-gray-300 px-4 py-2 text-right">CLV</th>
              <th className="border border-gray-300 px-4 py-2 text-center">작업</th>
            </tr>
          </thead>
          <tbody>
            {/* 세그먼트가 없으면 안내 메시지 표시 */}
            {paginatedSegments.length === 0 ? (
              <tr>
                <td colSpan={7} className="border border-gray-300 px-4 py-8 text-center text-gray-500">
                  세그먼트가 없습니다.
                </td>
              </tr>
            ) : (
              // 세그먼트 행 렌더링
              paginatedSegments.map(segment => (
                <tr key={segment.contact_id} className="hover:bg-gray-50">
                  {/* 담당자명: 관계형 조인 시 segment.contacts?.name */}
                  <td className="border border-gray-300 px-4 py-2">
                    {segment.contacts?.name || '-'}
                  </td>
                  {/* 세그먼트 라벨 */}
                  <td className="border border-gray-300 px-4 py-2">{segment.segment_label || '-'}</td>
                  {/* 위험 수준: 색상 뱃지로 표시 */}
                  <td className="border border-gray-300 px-4 py-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      segment.predicted_risk_level === 'High' ? 'bg-red-100 text-red-800' :
                      segment.predicted_risk_level === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {segment.predicted_risk_level}
                    </span>
                  </td>
                  {/* 고위험 확률: 0~1 → %로 변환 */}
                  <td className="border border-gray-300 px-4 py-2 text-right">
                    {segment.high_risk_probability ? `${(segment.high_risk_probability * 100).toFixed(1)}%` : '-'}
                  </td>
                  {/* ARR: 숫자 천단위 콤마 및 '원' 표시 */}
                  <td className="border border-gray-300 px-4 py-2 text-right">
                    {segment.arr ? `${segment.arr.toLocaleString()}원` : '-'}
                  </td>
                  {/* CLV: 숫자 천단위 콤마 및 '원' 표시 */}
                  <td className="border border-gray-300 px-4 py-2 text-right">
                    {segment.clv ? `${segment.clv.toLocaleString()}원` : '-'}
                  </td>
                  {/* 수정 버튼: 클릭 시 세그먼트 수정 모달 오픈 */}
                  <td className="border border-gray-300 px-4 py-2 text-center">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setEditingSegment(segment)}
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

      {/* 세그먼트 수정 모달: editingSegment가 있으면 표시 */}
      {editingSegment && (
        <EditSegmentModal
          isOpen={!!editingSegment}
          onClose={() => setEditingSegment(null)}
          segment={editingSegment}
          onSegmentUpdated={onSegmentUpdated}
        />
      )}
    </div>
  );
};

export default SegmentsSection;
