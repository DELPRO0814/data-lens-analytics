
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Edit, ChevronLeft, ChevronRight } from 'lucide-react';
import { Pagination, PaginationContent, PaginationItem, PaginationLink } from '@/components/ui/pagination';
import EditSegmentModal from './EditSegmentModal';

interface SegmentsSectionProps {
  segments: any[];
  onSegmentUpdated: () => void;
}

const SegmentsSection: React.FC<SegmentsSectionProps> = ({ segments, onSegmentUpdated }) => {
  const [riskLevelFilter, setRiskLevelFilter] = useState('');
  const [segmentLabelFilter, setSegmentLabelFilter] = useState('');
  const [editingSegment, setEditingSegment] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 15;

  const filteredSegments = segments.filter(segment => {
    const matchesRiskLevel = riskLevelFilter === 'all' || !riskLevelFilter || segment.predicted_risk_level === riskLevelFilter;
    const matchesSegmentLabel = segmentLabelFilter === 'all' || !segmentLabelFilter || segment.segment_label === segmentLabelFilter;
    return matchesRiskLevel && matchesSegmentLabel;
  });

  // Pagination calculations
  const totalPages = Math.ceil(filteredSegments.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedSegments = filteredSegments.slice(startIndex, endIndex);

  // Reset to first page when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [riskLevelFilter, segmentLabelFilter]);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

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

  const uniqueSegmentLabels = [...new Set(segments.map(s => s.segment_label).filter(Boolean))];

  return (
    <div className="p-6">
      {/* Filters */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
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

      {/* Results Count */}
      <div className="mb-4 text-sm text-gray-600">
        총 {filteredSegments.length}개 세그먼트 
        {filteredSegments.length > 0 && (
          <span className="ml-2">
            ({startIndex + 1}-{Math.min(endIndex, filteredSegments.length)} 표시)
          </span>
        )}
      </div>

      {/* Table */}
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
            {paginatedSegments.length === 0 ? (
              <tr>
                <td colSpan={7} className="border border-gray-300 px-4 py-8 text-center text-gray-500">
                  세그먼트가 없습니다.
                </td>
              </tr>
            ) : (
              paginatedSegments.map(segment => (
                <tr key={segment.contact_id} className="hover:bg-gray-50">
                  <td className="border border-gray-300 px-4 py-2">
                    {segment.contacts?.name || '-'}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">{segment.segment_label || '-'}</td>
                  <td className="border border-gray-300 px-4 py-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      segment.predicted_risk_level === 'High' ? 'bg-red-100 text-red-800' :
                      segment.predicted_risk_level === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {segment.predicted_risk_level}
                    </span>
                  </td>
                  <td className="border border-gray-300 px-4 py-2 text-right">
                    {segment.high_risk_probability ? `${(segment.high_risk_probability * 100).toFixed(1)}%` : '-'}
                  </td>
                  <td className="border border-gray-300 px-4 py-2 text-right">
                    {segment.arr ? `${segment.arr.toLocaleString()}원` : '-'}
                  </td>
                  <td className="border border-gray-300 px-4 py-2 text-right">
                    {segment.clv ? `${segment.clv.toLocaleString()}원` : '-'}
                  </td>
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

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center">
          <Pagination>
            <PaginationContent>
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
