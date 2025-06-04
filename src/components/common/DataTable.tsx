
import React, { useState, useMemo } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Download, FileText, FileSpreadsheet, ChevronLeft, ChevronRight } from 'lucide-react';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import AdvancedFilter from './AdvancedFilter';

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
    options?: Array<{ value: string; label: string }>;
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

  const filteredData = useMemo(() => {
    let filtered = data;

    // Basic search filter
    if (searchTerm) {
      filtered = filtered.filter(row =>
        Object.values(row).some(value =>
          String(value).toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    // Advanced filters
    Object.entries(advancedFilters).forEach(([key, value]) => {
      if (!value || (Array.isArray(value) && value.length === 0)) return;

      const field = filterFields.find(f => f.key === key);
      if (!field) return;

      filtered = filtered.filter(row => {
        const rowValue = row[key];

        switch (field.type) {
          case 'text':
            return String(rowValue).toLowerCase().includes(String(value).toLowerCase());
          
          case 'select':
            return rowValue === value;
          
          case 'multiSelect':
            return Array.isArray(value) && value.includes(rowValue);
          
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
          
          case 'slider':
            return parseFloat(rowValue) >= value;
          
          case 'checkbox':
            return value ? rowValue : true;
          
          default:
            return true;
        }
      });
    });

    return filtered;
  }, [data, searchTerm, advancedFilters, filterFields]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredData.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedData = filteredData.slice(startIndex, endIndex);

  // Reset to first page when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, advancedFilters]);

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
    link.style.visibility = 'hidden';
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
    link.style.visibility = 'hidden';
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

  return (
    <div className="space-y-4">
      {/* Search and Export */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-2 sm:space-y-0 sm:space-x-2">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder={searchPlaceholder}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
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

      {/* Advanced Filters */}
      {filterFields.length > 0 && (
        <AdvancedFilter
          fields={filterFields}
          onFilterChange={setAdvancedFilters}
          onReset={() => setAdvancedFilters({})}
        />
      )}

      {/* Results Count and Pagination Info */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-2 sm:space-y-0 text-sm text-gray-600">
        <div>
          총 {filteredData.length}개 항목 (전체 {data.length}개 중) 
          {filteredData.length > 0 && (
            <span className="ml-2">
              {startIndex + 1}-{Math.min(endIndex, filteredData.length)} 표시
            </span>
          )}
        </div>
        {totalPages > 1 && (
          <div className="text-sm">
            페이지 {currentPage} / {totalPages}
          </div>
        )}
      </div>

      {/* Table */}
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column) => (
                <TableHead key={column.key} className="bg-gray-50 font-semibold">
                  {column.label}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.map((row, index) => (
              <TableRow 
                key={index} 
                className={onRowClick ? "cursor-pointer hover:bg-muted/50" : ""}
                onClick={() => onRowClick?.(row)}
              >
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

      {paginatedData.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          {searchTerm || Object.keys(advancedFilters).length > 0 
            ? "검색 결과가 없습니다." 
            : "데이터가 없습니다."
          }
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center">
          <Pagination>
            <PaginationContent>
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
