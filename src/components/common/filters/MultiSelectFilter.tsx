
import React from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { FilterField } from './types';

interface MultiSelectFilterProps {
  field: FilterField;
  value: any[];
  onChange: (value: any[]) => void;
}

const MultiSelectFilter: React.FC<MultiSelectFilterProps> = ({ field, value, onChange }) => {
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
              onChange(newValues);
            }}
          />
          <label htmlFor={`${field.key}-${String(option.value)}`} className="text-sm">
            {option.label}
          </label>
        </div>
      ))}
    </div>
  );
};

export default MultiSelectFilter;
