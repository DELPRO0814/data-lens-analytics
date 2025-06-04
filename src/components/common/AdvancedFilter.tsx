
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { CalendarIcon, Filter, X, RotateCcw } from 'lucide-react';
import { format } from 'date-fns';

interface FilterField {
  key: string;
  label: string;
  type: 'text' | 'select' | 'multiSelect' | 'dateRange' | 'numberRange' | 'slider' | 'checkbox';
  options?: Array<{ value: string; label: string }>;
  min?: number;
  max?: number;
  step?: number;
}

interface AdvancedFilterProps {
  fields: FilterField[];
  onFilterChange: (filters: Record<string, any>) => void;
  onReset: () => void;
}

const AdvancedFilter: React.FC<AdvancedFilterProps> = ({ fields, onFilterChange, onReset }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [filters, setFilters] = useState<Record<string, any>>({});

  const handleFilterChange = (key: string, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleReset = () => {
    setFilters({});
    onReset();
  };

  const renderFilterField = (field: FilterField) => {
    const value = filters[field.key];

    switch (field.type) {
      case 'text':
        return (
          <Input
            placeholder={`${field.label} 검색...`}
            value={value || ''}
            onChange={(e) => handleFilterChange(field.key, e.target.value)}
          />
        );

      case 'select':
        return (
          <Select value={value || 'all'} onValueChange={(val) => handleFilterChange(field.key, val === 'all' ? '' : val)}>
            <SelectTrigger>
              <SelectValue placeholder={`${field.label} 선택`} />
            </SelectTrigger>
            <SelectContent className="bg-white border shadow-lg z-50">
              <SelectItem value="all">전체</SelectItem>
              {field.options?.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case 'multiSelect':
        return (
          <div className="space-y-2">
            {field.options?.map((option) => (
              <div key={option.value} className="flex items-center space-x-2">
                <Checkbox
                  id={`${field.key}-${option.value}`}
                  checked={value?.includes(option.value) || false}
                  onCheckedChange={(checked) => {
                    const currentValues = value || [];
                    const newValues = checked
                      ? [...currentValues, option.value]
                      : currentValues.filter((v: string) => v !== option.value);
                    handleFilterChange(field.key, newValues);
                  }}
                />
                <label htmlFor={`${field.key}-${option.value}`} className="text-sm">
                  {option.label}
                </label>
              </div>
            ))}
          </div>
        );

      case 'dateRange':
        return (
          <div className="flex space-x-2">
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
                  onSelect={(date) => handleFilterChange(field.key, { ...value, from: date })}
                />
              </PopoverContent>
            </Popover>
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
                  onSelect={(date) => handleFilterChange(field.key, { ...value, to: date })}
                />
              </PopoverContent>
            </Popover>
          </div>
        );

      case 'numberRange':
        return (
          <div className="flex space-x-2">
            <Input
              type="number"
              placeholder="최소값"
              value={value?.min || ''}
              onChange={(e) => handleFilterChange(field.key, { ...value, min: e.target.value })}
            />
            <Input
              type="number"
              placeholder="최대값"
              value={value?.max || ''}
              onChange={(e) => handleFilterChange(field.key, { ...value, max: e.target.value })}
            />
          </div>
        );

      case 'slider':
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
        return null;
    }
  };

  return (
    <div className="mb-4">
      <div className="flex items-center space-x-2 mb-2">
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

      {isOpen && (
        <div className="border rounded-lg p-4 bg-gray-50 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
