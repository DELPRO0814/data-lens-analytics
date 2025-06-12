
import React from 'react';
import { Input } from '@/components/ui/input';
import { FilterField } from './types';

interface NumberRangeFilterProps {
  field: FilterField;
  value: { min?: string; max?: string };
  onChange: (value: { min?: string; max?: string }) => void;
}

const NumberRangeFilter: React.FC<NumberRangeFilterProps> = ({ value, onChange }) => {
  return (
    <div className="flex space-x-2">
      <Input
        type="number"
        placeholder="최소값"
        value={value?.min || ''}
        onChange={(e) => onChange({ ...value, min: e.target.value })}
      />
      <Input
        type="number"
        placeholder="최대값"
        value={value?.max || ''}
        onChange={(e) => onChange({ ...value, max: e.target.value })}
      />
    </div>
  );
};

export default NumberRangeFilter;
