
/**
 * AdvancedFilter 컴포넌트
 * -----------------------------------------------------
 * 주요 동작 요약:
 * - 여러 조건(텍스트, 날짜, 숫자, 체크박스 등)으로 데이터를 필터링할 수 있는 고급 필터 UI입니다.
 * - 각 필터 항목은 타입에 따라 입력 방식이 다르며, 필드 목록(fields)로 동적으로 생성됩니다.
 * - 사용자가 값을 입력하면 onFilterChange로 부모 컴포넌트에 현재 필터 상태를 전달합니다.
 * - '초기화' 버튼을 누르면 모든 필터가 리셋됩니다.
 * - '고급 필터' 버튼을 누르면 필터 UI가 펼쳐지고, 다시 누르면 닫힙니다.
 * 
 * 상세 설명:
 * - 필터 UI는 isOpen 상태로 열림/닫힘을 제어합니다.
 * - 각 필드별로 타입(text, select, multiSelect, dateRange, numberRange, slider, checkbox)에 따라 입력 UI가 자동으로 바뀝니다.
 * - 입력값이 바뀔 때마다 handleFilterChange가 호출되어 상태를 갱신하고, 부모 컴포넌트에 변경사항을 알립니다.
 * - '초기화' 버튼 클릭 시 handleReset으로 모든 필터가 초기화되고, 부모에도 알림이 전달됩니다.
 * - Tailwind CSS와 다양한 UI 컴포넌트(Button, Input, Select 등)를 활용해 반응형 디자인과 일관된 UI를 제공합니다.
 */

import React, { useState } from 'react';
// 다양한 UI 컴포넌트와 아이콘, 유틸리티 함수들을 불러옵니다.
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { CalendarIcon, Filter, X, RotateCcw } from 'lucide-react';
import { format } from 'date-fns';

// 필터로 사용할 각 필드의 타입을 정의합니다.
// 예: 텍스트, 셀렉트, 날짜, 숫자, 슬라이더, 체크박스 등
interface FilterField {
  key: string; // 필드의 고유 이름(데이터에서 어떤 값을 필터링할지 지정)
  label: string; // 사용자에게 보여줄 라벨
  type: 'text' | 'select' | 'multiSelect' | 'dateRange' | 'numberRange' | 'slider' | 'checkbox'; // 필터 종류
  options?: Array<{ value: string | number; label: string }>; // select/multiSelect 타입에서 선택지 목록 - string 또는 number 값 지원
  min?: number; // slider/numberRange에서 최소값
  max?: number; // slider/numberRange에서 최대값
  step?: number; // slider에서 증가 단위
}

// 이 컴포넌트가 받을 수 있는 props(속성) 타입 정의
interface AdvancedFilterProps {
  fields: FilterField[]; // 필터로 사용할 필드 목록
  onFilterChange: (filters: Record<string, any>) => void; // 필터 값이 바뀔 때 호출되는 함수
  onReset: () => void; // 필터를 초기화할 때 호출되는 함수
}

// 고급 필터 컴포넌트 정의
const AdvancedFilter: React.FC<AdvancedFilterProps> = ({ fields, onFilterChange, onReset }) => {
  // 필터 UI가 열려있는지(보이는지) 여부
  const [isOpen, setIsOpen] = useState(false);
  // 각 필드별로 현재 적용된 필터 값 저장
  const [filters, setFilters] = useState<Record<string, any>>({});

  // 필터 값이 바뀔 때 호출: 상태를 갱신하고 부모에 알림
  const handleFilterChange = (key: string, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters); // 부모 컴포넌트에 변경된 값 전달
  };

  // 모든 필터를 초기 상태로 되돌리는 함수
  const handleReset = () => {
    setFilters({});
    onReset(); // 부모 컴포넌트에 초기화 알림
  };

  // 필드 타입에 따라 적절한 입력 UI를 반환하는 함수
  // 각 타입별로 입력 방식이 다릅니다.
  const renderFilterField = (field: FilterField) => {
    const value = filters[field.key]; // 해당 필드의 현재 값

    switch (field.type) {
      case 'text':
        // 일반 텍스트 입력(검색어 등)
        return (
          <Input
            placeholder={`${field.label} 검색...`}
            value={value || ''}
            onChange={(e) => handleFilterChange(field.key, e.target.value)}
          />
        );

      case 'select':
        // 드롭다운에서 하나만 선택하는 경우
        return (
          <Select
            value={value || 'all'}
            onValueChange={(val) => handleFilterChange(field.key, val === 'all' ? '' : val)}
          >
            <SelectTrigger>
              <SelectValue placeholder={`${field.label} 선택`} />
            </SelectTrigger>
            <SelectContent className="bg-white border shadow-lg z-50">
              <SelectItem value="all">전체</SelectItem>
              {field.options?.map((option) => (
                <SelectItem key={String(option.value)} value={String(option.value)}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case 'multiSelect':
        // 여러 개를 동시에 선택할 수 있는 체크박스 목록
        return (
          <div className="space-y-2">
            {field.options?.map((option) => (
              <div key={String(option.value)} className="flex items-center space-x-2">
                <Checkbox
                  id={`${field.key}-${String(option.value)}`}
                  checked={value?.includes(option.value) || false}
                  onCheckedChange={(checked) => {
                    const currentValues = value || [];
                    const newValues = checked
                      ? [...currentValues, option.value]
                      : currentValues.filter((v: any) => v !== option.value);
                    handleFilterChange(field.key, newValues);
                  }}
                />
                <label htmlFor={`${field.key}-${String(option.value)}`} className="text-sm">
                  {option.label}
                </label>
              </div>
            ))}
          </div>
        );

      case 'dateRange':
        // 시작일과 종료일을 선택할 수 있는 달력 UI
        return (
          <div className="flex space-x-2">
            {/* 시작일 선택 */}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start text-left font-normal">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {value?.from ? format(value.from, 'yyyy-MM-dd') : '시작일'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 bg-white border shadow-lg z-50">
                <Calendar
                  mode="single"
                  selected={value?.from}
                  onSelect={(date) =>
                    handleFilterChange(field.key, { ...value, from: date })
                  }
                />
              </PopoverContent>
            </Popover>
            {/* 종료일 선택 */}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start text-left font-normal">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {value?.to ? format(value.to, 'yyyy-MM-dd') : '종료일'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 bg-white border shadow-lg z-50">
                <Calendar
                  mode="single"
                  selected={value?.to}
                  onSelect={(date) =>
                    handleFilterChange(field.key, { ...value, to: date })
                  }
                />
              </PopoverContent>
            </Popover>
          </div>
        );

      case 'numberRange':
        // 숫자 범위(최소/최대) 입력
        return (
          <div className="flex space-x-2">
            <Input
              type="number"
              placeholder="최소값"
              value={value?.min || ''}
              onChange={(e) =>
                handleFilterChange(field.key, { ...value, min: e.target.value })
              }
            />
            <Input
              type="number"
              placeholder="최대값"
              value={value?.max || ''}
              onChange={(e) =>
                handleFilterChange(field.key, { ...value, max: e.target.value })
              }
            />
          </div>
        );

      case 'slider':
        // 슬라이더(막대)를 이용한 숫자 선택
        return (
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-gray-500">
              <span>{field.min}</span>
              <span>{value || field.min}</span>
              <span>{field.max}</span>
            </div>
            <Slider
              value={[value || field.min]}
              onValueChange={(val) => handleFilterChange(field.key, val[0])}
              max={field.max}
              min={field.min}
              step={field.step || 1}
            />
          </div>
        );

      case 'checkbox':
        // 단일 체크박스(예: '완료됨' 같은 필터)
        return (
          <div className="flex items-center space-x-2">
            <Checkbox
              id={field.key}
              checked={value || false}
              onCheckedChange={(checked) => handleFilterChange(field.key, checked)}
            />
            <label htmlFor={field.key} className="text-sm">
              {field.label}
            </label>
          </div>
        );

      default:
        // 정의되지 않은 타입이면 아무것도 표시하지 않음
        return null;
    }
  };

  return (
    <div className="mb-4">
      {/* 상단: '고급 필터' 버튼과 '초기화' 버튼 */}
      <div className="flex items-center space-x-2 mb-2">
        {/* 고급 필터 열기/닫기 버튼 */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center space-x-2"
        >
          <Filter className="w-4 h-4" />
          <span>고급 필터</span>
          {isOpen ? <X className="w-4 h-4" /> : null}
        </Button>
        {/* 필터가 적용 중일 때만 보이는 초기화 버튼 */}
        {Object.keys(filters).length > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleReset}
            className="flex items-center space-x-2"
          >
            <RotateCcw className="w-4 h-4" />
            <span>초기화</span>
          </Button>
        )}
      </div>
      {/* 실제 고급 필터 UI: 버튼 클릭 시에만 펼쳐짐 */}
      {isOpen && (
        <div className="border rounded-lg p-4 bg-gray-50 space-y-4">
          {/* 필드 개수에 따라 반응형 그리드로 배치 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* 각 필드별로 입력 UI를 렌더링 */}
            {fields.map((field) => (
              <div key={field.key} className="space-y-2">
                <label className="text-sm font-medium">{field.label}</label>
                {renderFilterField(field)}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvancedFilter;
