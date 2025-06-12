import React, { useState, useMemo } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
// ✅ 1. 정렬 아이콘 추가
import { Search, FileText, FileSpreadsheet, ChevronLeft, ChevronRight, ArrowUp, ArrowDown } from 'lucide-react';
import { Pagination, PaginationContent, PaginationItem, PaginationLink } from '@/components/ui/pagination';
import AdvancedFilter from './AdvancedFilter';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// --- DataTableProps 인터페이스는 변경할 필요 없습니다 ---
interface DataTableProps {
  data: any[];
  columns: {
    key: string;
    label: string;
    render?: (value: any, row: any) => React.ReactNode;
  }[];
  searchPlaceholder?: string;
  onRowClick?: (row: any) => void;
  filterFields?: Array<{
    key: string;
    label: string;
    type: 'text' | 'select' | 'multiSelect' | 'dateRange' | 'numberRange' | 'slider' | 'checkbox';
    options?: Array<{ value: string | number; label: string }>;
    min?: number;
    max?: number;
    step?: number;
  }>;
  exportable?: boolean;
  tableName?: string;
  pageSize?: number;
}


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
  const [searchTerm, setSearchTerm] = useState('');
  const [advancedFilters, setAdvancedFilters] = useState<Record<string, any>>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [searchColumn, setSearchColumn] = useState('all');
  
  // ✅ 2. 정렬 상태를 관리하는 state 추가 (key: 컬럼 키, direction: 정렬 방향)
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);

  const filteredData = useMemo(() => {
    let filtered = [...data]; // 원본 데이터 수정을 방지하기 위해 복사본 사용

    // 1. 기본 검색 필터
    if (searchTerm) {
      const lowercasedTerm = searchTerm.toLowerCase();
      filtered = filtered.filter(row => {
        if (searchColumn === 'all') {
          return columns.some(col => 
            String(row[col.key] ?? '').toLowerCase().includes(lowercasedTerm)
          );
        } else {
          return String(row[searchColumn] ?? '').toLowerCase().includes(lowercasedTerm);
        }
      });
    }

    // 2. 고급 필터 적용
    Object.entries(advancedFilters).forEach(([key, value]) => {
      if (!value || (Array.isArray(value) && value.length === 0)) return;
      const field = filterFields.find(f => f.key === key);
      if (!field) return;

      filtered = filtered.filter(row => {
        const rowValue = row[key];
        // (기존 고급 필터 로직은 생략...)
        switch (field.type) {
            case 'text': return String(rowValue).toLowerCase().includes(String(value).toLowerCase());
            case 'select': return rowValue === value;
            case 'multiSelect': return Array.isArray(value) && value.includes(rowValue);
            case 'dateRange':
                if (!value.from && !value.to) return true;
                const rowDate = new Date(rowValue);
                if (value.from && rowDate < new Date(value.from)) return false;
                if (value.to && rowDate > new Date(value.to)) return false;
                return true;
            case 'numberRange':
                const numValue = parseFloat(rowValue);
                if (value.min && numValue < parseFloat(value.min)) return false;
                if (value.max && numValue > parseFloat(value.max)) return false;
                return true;
            case 'slider': return parseFloat(rowValue) >= value;
            case 'checkbox': return value ? rowValue : true;
            default: return true;
        }
      });
    });

    // ✅ 3. 정렬 로직 적용
    if (sortConfig !== null) {
      filtered.sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];

        // 값이 null이거나 undefined일 경우 맨 뒤로 정렬
        if (aValue == null) return 1;
        if (bValue == null) return -1;

        // 숫자형 데이터 비교
        if (typeof aValue === 'number' && typeof bValue === 'number') {
            return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue;
        }
        
        // 날짜형 데이터 비교 (YYYY-MM-DD 형식 등)
        const dateA = new Date(aValue).getTime();
        const dateB = new Date(bValue).getTime();
        if (!isNaN(dateA) && !isNaN(dateB)) {
            return sortConfig.direction === 'asc' ? dateA - dateB : dateB - dateA;
        }

        // 문자열 데이터 비교 (기본)
        const stringA = String(aValue).toLowerCase();
        const stringB = String(bValue).toLowerCase();

        if (stringA < stringB) {
            return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (stringA > stringB) {
            return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }

    return filtered;
  }, [data, searchTerm, searchColumn, advancedFilters, filterFields, columns, sortConfig]); // ✅ 의존성 배열에 sortConfig 추가

  // 페이지네이션 관련 값 계산
  const totalPages = Math.ceil(filteredData.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedData = filteredData.slice(startIndex, endIndex);

  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, searchColumn, advancedFilters, sortConfig]); // ✅ 정렬 변경 시 1페이지로 이동

  // ✅ 4. 정렬 상태를 변경하는 핸들러 함수
  const handleSort = (columnKey: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    // 현재 클릭된 컬럼이 이미 오름차순 정렬 상태이면, 내림차순으로 변경
    if (sortConfig && sortConfig.key === columnKey && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key: columnKey, direction });
  };
  
  // (exportToCSV, exportToJSON, handlePageChange, getVisiblePages 함수는 기존과 동일하여 생략)
  const exportToCSV = () => {
    const headers = columns.map(col => col.label);
    const csvContent = [
      headers.join(','),
      ...filteredData.map(row => 
        columns.map(col => {
          const value = row[col.key];
          return `"${String(value || '').replace(/"/g, '""')}"`;
        }).join(',')
      )
    ].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${tableName}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  const exportToJSON = () => {
    const jsonContent = JSON.stringify(filteredData, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${tableName}_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };
  const getVisiblePages = () => {
    const delta = 2;
    const range = [];
    for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
        range.push(i);
    }
    const rangeWithDots: (string | number)[] = [];
    if (totalPages > 1) rangeWithDots.push(1);
    if (currentPage - delta > 2) rangeWithDots.push('...');
    rangeWithDots.push(...range);
    if (currentPage + delta < totalPages - 1 && totalPages > 1) rangeWithDots.push('...');
    if (range.indexOf(totalPages) === -1 && totalPages > 1) rangeWithDots.push(totalPages)

    // 중복 제거 및 1페이지만 있을 경우 처리
    const uniquePages = Array.from(new Set(rangeWithDots));
    if(uniquePages.length === 2 && uniquePages[1] === '...') return [1];

    return uniquePages;
  };

  return (
    <div className="space-y-4">
      {/* 검색 및 상단 UI 영역... */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-2 sm:space-y-0 sm:space-x-2">
        <div className="flex items-center gap-2 flex-1 max-w-lg">
          <Select value={searchColumn} onValueChange={setSearchColumn}><SelectTrigger className="w-[140px] bg-white/80 backdrop-blur-sm border-white/30 shadow-sm"><SelectValue placeholder="검색 기준" /></SelectTrigger><SelectContent><SelectItem value="all">전체</SelectItem>{columns.map(col => (<SelectItem key={col.key} value={col.key}>{col.label}</SelectItem>))}</SelectContent></Select>
          <div className="relative flex-1"><Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" /><Input placeholder={searchPlaceholder} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10 bg-white/80 backdrop-blur-sm border-white/30 shadow-sm"/></div>
        </div>
        {exportable && (<div className="flex space-x-2"><Button variant="outline" size="sm" onClick={exportToCSV} className="bg-white/80 backdrop-blur-sm border-white/30 hover:bg-white/90"><FileSpreadsheet className="w-4 h-4 mr-2" /> CSV</Button><Button variant="outline" size="sm" onClick={exportToJSON} className="bg-white/80 backdrop-blur-sm border-white/30 hover:bg-white/90"><FileText className="w-4 h-4 mr-2" /> JSON</Button></div>)}
      </div>
      {filterFields.length > 0 && (<AdvancedFilter fields={filterFields} onFilterChange={setAdvancedFilters} onReset={() => setAdvancedFilters({})} />)}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-2 sm:space-y-0 text-sm text-gray-600">
        <div>총 {filteredData.length}개 항목 (전체 {data.length}개 중) {filteredData.length > 0 && (<span className="ml-2">{startIndex + 1}-{Math.min(endIndex, filteredData.length)} 표시</span>)}</div>
        {totalPages > 1 && (<div className="text-sm">페이지 {currentPage} / {totalPages}</div>)}
      </div>

      <div className="glass-card rounded-xl overflow-hidden">
        {/* ✅ Table 컴포넌트에 table-fixed와 w-full 클래스 추가 */}
        <Table className="table-fixed w-full">
    <TableHeader>
      <TableRow>
        {columns.map((column) => (
          <TableHead 
            key={column.key} 
            // [수정] 헤더 패딩(px-6 py-3)과 폰트 크기(text-sm) 적용
            className="bg-muted/30 backdrop-blur-sm px-6 py-3 text-sm font-semibold cursor-pointer hover:bg-muted/50 transition-colors"
            onClick={() => handleSort(column.key)}
          >
            <div className="flex items-center justify-between">
              <span className="truncate">{column.label}</span>
              <span className="w-4 h-4 shrink-0 ml-2">
                {sortConfig?.key === column.key && (
                  sortConfig.direction === 'asc' ? 
                    <ArrowUp className="h-4 w-4" /> : 
                    <ArrowDown className="h-4 w-4" />
                )}
              </span>
            </div>
          </TableHead>
        ))}
      </TableRow>
    </TableHeader>
    <TableBody>
      {paginatedData.map((row, index) => (
        <TableRow 
          key={index} 
          className={onRowClick ? "cursor-pointer hover:bg-muted/40" : ""}
          onClick={() => onRowClick?.(row)}
        >
          {columns.map((column) => (
            <TableCell 
              key={column.key} 
              // [수정] 셀 패딩(px-6 py-4)과 폰트 크기(text-sm) 적용
              className="border-b border-muted px-8 py-3 text-sm truncate"
            >
              {column.render ? 
                column.render(row[column.key], row) : 
                String(row[column.key] ?? '-')
              }
            </TableCell>
          ))}
        </TableRow>
      ))}
    </TableBody>
  </Table>
</div>

      {/* 데이터 없음 및 페이지네이션 UI... */}
      {paginatedData.length === 0 && (<div className="text-center py-8 text-gray-500 glass-card rounded-xl">{searchTerm || Object.keys(advancedFilters).length > 0 ? "검색 결과가 없습니다." : "데이터가 없습니다."}</div>)}
      {totalPages > 1 && (<div className="flex justify-center"><Pagination><PaginationContent><PaginationItem><Button variant="outline" size="sm" onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} className="flex items-center gap-1 bg-white/80 backdrop-blur-sm border-white/30"><ChevronLeft className="h-4 w-4" /> 이전</Button></PaginationItem>{getVisiblePages().map((page, index) => (<PaginationItem key={index}>{page === '...' ? (<span className="px-3 py-2">...</span>) : (<PaginationLink onClick={() => handlePageChange(page as number)} isActive={currentPage === page} className={`cursor-pointer ${currentPage === page ? 'bg-primary text-white' : 'bg-white/80 backdrop-blur-sm border-white/30'}`}>{page}</PaginationLink>)}</PaginationItem>))}<PaginationItem><Button variant="outline" size="sm" onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} className="flex items-center gap-1 bg-white/80 backdrop-blur-sm border-white/30">다음 <ChevronRight className="h-4 w-4" /></Button></PaginationItem></PaginationContent></Pagination></div>)}

    </div>
  );
};

export default DataTable;