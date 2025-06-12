
import React from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { FilterField } from './types';

interface CheckboxFilterProps {
  field: FilterField;
  value: boolean;
  onChange: (value: boolean) => void;
}

const CheckboxFilter: React.FC<CheckboxFilterProps> = ({ field, value, onChange }) => {
  return (
    <div className="flex items-center space-x-2">
      <Checkbox
        id={field.key}
        checked={value || false}
        onCheckedChange={(checked) => onChange(!!checked)}
      />
      <label htmlFor={field.key} className="text-sm">
        {field.label}
      </label>
    </div>
  );
};

export default CheckboxFilter;
