
import React from 'react';
import { Slider } from '@/components/ui/slider';
import { FilterField } from './types';

interface SliderFilterProps {
  field: FilterField;
  value: number;
  onChange: (value: number) => void;
}

const SliderFilter: React.FC<SliderFilterProps> = ({ field, value, onChange }) => {
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm text-gray-500">
        <span>{field.min}</span>
        <span>{value || field.min}</span>
        <span>{field.max}</span>
      </div>
      <Slider
        value={[value || field.min!]}
        onValueChange={(val) => onChange(val[0])}
        max={field.max}
        min={field.min}
        step={field.step || 1}
      />
    </div>
  );
};

export default SliderFilter;
