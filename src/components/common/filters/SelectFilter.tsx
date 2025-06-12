
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FilterField } from './types';

interface SelectFilterProps {
  field: FilterField;
  value: string;
  onChange: (value: string) => void;
}

const SelectFilter: React.FC<SelectFilterProps> = ({ field, value, onChange }) => {
  return (
    <Select
      value={value || 'all'}
      onValueChange={(val) => onChange(val === 'all' ? '' : val)}
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
};

export default SelectFilter;
