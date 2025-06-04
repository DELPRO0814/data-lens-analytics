import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Edit } from 'lucide-react';
import EditSegmentModal from './EditSegmentModal';

interface SegmentsSectionProps {
  segments: any[];
  onSegmentUpdated: () => void;
}

const SegmentsSection: React.FC<SegmentsSectionProps> = ({ segments, onSegmentUpdated }) => {
  const [riskLevelFilter, setRiskLevelFilter] = useState('');
  const [segmentLabelFilter, setSegmentLabelFilter] = useState('');
  const [editingSegment, setEditingSegment] = useState(null);

  const filteredSegments = segments.filter(segment => {
    const matchesRiskLevel = riskLevelFilter === 'all' || !riskLevelFilter || segment.predicted_risk_level === riskLevelFilter;
    const matchesSegmentLabel = segmentLabelFilter === 'all' || !segmentLabelFilter || segment.segment_label === segmentLabelFilter;
    return matchesRiskLevel && matchesSegmentLabel;
  });

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

      {/* Table */}
      <div className="overflow-x-auto">
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
            {filteredSegments.length === 0 ? (
              <tr>
                <td colSpan={7} className="border border-gray-300 px-4 py-8 text-center text-gray-500">
                  세그먼트가 없습니다.
                </td>
              </tr>
            ) : (
              filteredSegments.map(segment => (
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