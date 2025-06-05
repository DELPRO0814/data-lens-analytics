/**
 * DataTable 컴포넌트
 * -----------------------------------------------------
 * 주요 동작 요약:
 * - 검색, 고급 필터, 페이지네이션, 행 클릭, 내보내기(CSV/JSON) 등 데이터 테이블에서 필요한 거의 모든 기능이 포함되어 있습니다.
 * - 검색어, 고급 필터, 페이지네이션 등 각 상태를 useState로 관리하며, useMemo로 필터링된 데이터를 효율적으로 계산합니다.
 * - CSV/JSON 내보내기, 행 클릭, 고급 필터, 데이터 없음 안내, 반응형 UI 등 실무에 필요한 다양한 기능을 제공합니다.
 * 
 * 상세 설명:
 * - 검색어 입력 시 모든 컬럼을 대상으로 실시간 필터링이 동작합니다.
 * - 고급 필터(AdvancedFilter)에서는 텍스트, 셀렉트, 날짜, 숫자, 슬라이더, 체크박스 등 다양한 조건으로 데이터 필터링이 가능합니다.
 * - 페이지네이션은 현재 페이지, 총 페이지, ... 생략 등 UX를 고려해 구현되어 있습니다.
 * - CSV/JSON 내보내기는 현재 필터링된 데이터만을 파일로 저장합니다.
 * - 행 클릭(onRowClick) 시 상세 보기 등 추가 액션을 연결할 수 있습니다.
 * - Tailwind CSS 기반의 반응형 디자인과 일관된 UI를 제공합니다.
 */

import React, { useState, useMemo } from 'react';
// 테이블, 입력창, 버튼 등 UI 컴포넌트와 아이콘을 불러옵니다.
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, FileText, FileSpreadsheet, ChevronLeft, ChevronRight } from 'lucide-react';
import { Pagination, PaginationContent, PaginationItem, PaginationLink } from '@/components/ui/pagination';
import AdvancedFilter from './AdvancedFilter'; // 고급 필터 컴포넌트

// DataTable 컴포넌트가 받을 수 있는 props(속성) 타입 정의
interface DataTableProps {
  data: any[]; // 테이블에 표시할 원본 데이터 배열
  columns: {
    key: string; // 각 컬럼이 참조할 데이터의 키
    label: string; // 테이블 헤더에 표시될 컬럼 이름
    render?: (value: any, row: any) => React.ReactNode; // (선택) 셀을 커스텀 렌더링할 함수
  }[];
  searchPlaceholder?: string; // 검색창 플레이스홀더 텍스트
  onRowClick?: (row: any) => void; // (선택) 행 클릭 시 실행할 함수
  filterFields?: Array<{
    key: string;
    label: string;
    type: 'text' | 'select' | 'multiSelect' | 'dateRange' | 'numberRange' | 'slider' | 'checkbox';
    options?: Array<{ value: string; label: string }>;
    min?: number;
    max?: number;
    step?: number;
  }>;
  exportable?: boolean; // 내보내기 버튼(엑셀/JSON) 활성화 여부
  tableName?: string; // 내보내기 파일 이름
  pageSize?: number; // 한 페이지에 보여줄 데이터 개수
}

// DataTable 컴포넌트 정의
const DataTable: React.FC<DataTableProps> = ({ 
  data, 
  columns, 
  searchPlaceholder = "검색...",
  onRowClick,
  filterFields = [],
  exportable = false,
  tableName = "data",
  pageSize = 15
}) => {
  // 사용자가 입력한 검색어 상태값
  const [searchTerm, setSearchTerm] = useState('');
  // 고급 필터 값 상태(필드별로 값 저장)
  const [advancedFilters, setAdvancedFilters] = useState<Record<string, any>>({});
  // 현재 보고 있는 페이지 번호 상태
  const [currentPage, setCurrentPage] = useState(1);

  // 검색어와 고급 필터를 모두 적용한 데이터 목록을 계산합니다.
  // useMemo를 사용해, 관련 값이 바뀔 때만 다시 계산합니다.
  const filteredData = useMemo(() => {
    let filtered = data;

    // 1. 기본 검색어 필터: 모든 컬럼의 값 중 하나라도 검색어를 포함하면 남김
    if (searchTerm) {
      filtered = filtered.filter(row =>
        Object.values(row).some(value =>
          String(value).toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    // 2. 고급 필터 적용: 각 필드 타입별로 필터링
    Object.entries(advancedFilters).forEach(([key, value]) => {
      // 값이 없거나(빈 배열 등) 필터링하지 않음
      if (!value || (Array.isArray(value) && value.length === 0)) return;

      // 필터 필드 정보 찾기
      const field = filterFields.find(f => f.key === key);
      if (!field) return;

      // 필드 타입에 따라 필터링 방식 다름
      filtered = filtered.filter(row => {
        const rowValue = row[key];

        /////////////////////////////////////////테스트///////////////
        if (field.key === 'predicted_claim_type' && field.type === 'multiSelect') {
          // value: 선택된 값들의 배열. '기타'는 ['없음', '알 수 없음'] 배열로 들어올 수 있음
          // value.flat()으로 펼치고 중복 제거
          const selected = value.flat ? Array.from(new Set(value.flat())) : value;
          return selected.includes(rowValue);
        }

        switch (field.type) {
          case 'text':
            // 텍스트 포함 여부
            return String(rowValue).toLowerCase().includes(String(value).toLowerCase());
          case 'select':
            // 정확히 일치하는 값만 남김
            return rowValue === value;
          case 'multiSelect':
            // 선택된 값 중 하나라도 일치하면 남김
            return Array.isArray(value) && value.includes(rowValue);
          case 'dateRange':
            // 날짜 범위(시작~끝) 내에 있는지 검사
            if (!value.from && !value.to) return true;
            const rowDate = new Date(rowValue);
            if (value.from && rowDate < new Date(value.from)) return false;
            if (value.to && rowDate > new Date(value.to)) return false;
            return true;
          case 'numberRange':
            // 숫자 범위 내에 있는지 검사
            const numValue = parseFloat(rowValue);
            if (value.min && numValue < parseFloat(value.min)) return false;
            if (value.max && numValue > parseFloat(value.max)) return false;
            return true;
          case 'slider':
            // 슬라이더 값 이상만 남김
            return parseFloat(rowValue) >= value;
          case 'checkbox':
            // 체크된 경우 true 값만 남김
            return value ? rowValue : true;
          default:
            return true;
        }
      });
    });

    return filtered;
  }, [data, searchTerm, advancedFilters, filterFields]);

  // 페이지네이션 관련 값 계산
  const totalPages = Math.ceil(filteredData.length / pageSize); // 전체 페이지 수
  const startIndex = (currentPage - 1) * pageSize; // 현재 페이지의 첫 데이터 인덱스
  const endIndex = startIndex + pageSize; // 현재 페이지의 마지막 데이터 인덱스
  const paginatedData = filteredData.slice(startIndex, endIndex); // 현재 페이지에 보여줄 데이터

  // 검색어나 필터가 바뀌면 항상 1페이지로 이동
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, advancedFilters]);

  // CSV 파일로 내보내기
  const exportToCSV = () => {
    // 1. 헤더(컬럼명) 생성
    const headers = columns.map(col => col.label);
    // 2. 각 행의 값을 CSV 포맷으로 변환
    const csvContent = [
      headers.join(','), // 첫 줄: 헤더
      ...filteredData.map(row => 
        columns.map(col => {
          const value = row[col.key];
          // 값에 "가 있으면 ""로 이스케이프
          return `"${String(value || '').replace(/"/g, '""')}"`;
        }).join(',')
      )
    ].join('\n');

    // 3. Blob 객체로 만들고, 다운로드 링크 생성 후 클릭(자동 다운로드)
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${tableName}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // JSON 파일로 내보내기
  const exportToJSON = () => {
    const jsonContent = JSON.stringify(filteredData, null, 2); // 보기 좋게 들여쓰기
    const blob = new Blob([jsonContent], { type: 'application/json' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${tableName}_${new Date().toISOString().split('T')[0]}.json`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // 페이지 이동 함수 (범위 내에서만 이동)
  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // 페이지네이션에 표시할 페이지 번호 목록 계산
  // ...으로 생략 표시도 지원
  const getVisiblePages = () => {
    const delta = 2; // 현재 페이지 기준 앞뒤로 몇 개까지 보여줄지
    const range = [];
    const rangeWithDots = [];

    // 2~(마지막-1)까지 범위 생성
    for (let i = Math.max(2, currentPage - delta); 
         i <= Math.min(totalPages - 1, currentPage + delta); 
         i++) {
      range.push(i);
    }

    // 첫 페이지와 ... 처리
    if (currentPage - delta > 2) {
      rangeWithDots.push(1, '...');
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    // 마지막 페이지와 ... 처리
    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages);
    } else if (totalPages > 1) {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots;
  };

  return (
    <div className="space-y-4">
      {/* 상단: 검색창과 내보내기 버튼 영역 */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-2 sm:space-y-0 sm:space-x-2">
        {/* 검색창: 입력한 텍스트가 테이블 데이터에서 실시간 검색에 사용됨 */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder={searchPlaceholder}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        {/* 내보내기 버튼: CSV, JSON 파일로 데이터 다운로드 (옵션) */}
        {exportable && (
          <div className="flex space-x-2">
            <Button variant="outline" size="sm" onClick={exportToCSV}>
              <FileSpreadsheet className="w-4 h-4 mr-2" />
              CSV
            </Button>
            <Button variant="outline" size="sm" onClick={exportToJSON}>
              <FileText className="w-4 h-4 mr-2" />
              JSON
            </Button>
          </div>
        )}
      </div>

      {/* 고급 필터 영역: 다양한 조건으로 데이터 필터링 가능 (옵션) */}
      {filterFields.length > 0 && (
        <AdvancedFilter
          fields={filterFields}
          onFilterChange={setAdvancedFilters}
          onReset={() => setAdvancedFilters({})}
        />
      )}

      {/* 결과 개수 및 페이지 정보 표시 */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-2 sm:space-y-0 text-sm text-gray-600">
        <div>
          총 {filteredData.length}개 항목 (전체 {data.length}개 중) 
          {filteredData.length > 0 && (
            <span className="ml-2">
              {startIndex + 1}-{Math.min(endIndex, filteredData.length)} 표시
            </span>
          )}
        </div>
        {/* 페이지 정보 */}
        {totalPages > 1 && (
          <div className="text-sm">
            페이지 {currentPage} / {totalPages}
          </div>
        )}
      </div>

      {/* 실제 테이블 표시 영역 */}
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              {/* 컬럼 헤더 표시 */}
              {columns.map((column) => (
                <TableHead key={column.key} className="bg-gray-50 font-semibold">
                  {column.label}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {/* 현재 페이지에 해당하는 데이터만 표시 */}
            {paginatedData.map((row, index) => (
              <TableRow 
                key={index} 
                className={onRowClick ? "cursor-pointer hover:bg-muted/50" : ""}
                onClick={() => onRowClick?.(row)}
              >
                {/* 각 셀에 데이터 표시 (커스텀 렌더링 함수가 있으면 그것 사용) */}
                {columns.map((column) => (
                  <TableCell key={column.key}>
                    {column.render ? 
                      column.render(row[column.key], row) : 
                      String(row[column.key] || '-')
                    }
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* 데이터가 없을 때 안내 문구 */}
      {paginatedData.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          {searchTerm || Object.keys(advancedFilters).length > 0 
            ? "검색 결과가 없습니다." 
            : "데이터가 없습니다."
          }
        </div>
      )}

      {/* 페이지네이션(페이지 이동) UI */}
      {totalPages > 1 && (
        <div className="flex justify-center">
          <Pagination>
            <PaginationContent>
              {/* 이전 페이지 버튼 */}
              <PaginationItem>
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
              </PaginationItem>
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
              <PaginationItem>
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
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
};

export default DataTable;
