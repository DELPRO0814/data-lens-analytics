
import React from 'react';
import { Input } from '@/components/ui/input';
import { FilterField } from './types';

interface TextFilterProps {
  field: FilterField;
  value: string;
  onChange: (value: string) => void;
}

const TextFilter: React.FC<TextFilterProps> = ({ field, value, onChange }) => {
  return (
    <Input
      placeholder={`${field.label} 검색...`}
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
    />
  );
};

export default TextFilter;
