
import React from 'react';
import { FilterField } from './types';
import TextFilter from './TextFilter';
import SelectFilter from './SelectFilter';
import MultiSelectFilter from './MultiSelectFilter';
import DateRangeFilter from './DateRangeFilter';
import NumberRangeFilter from './NumberRangeFilter';
import SliderFilter from './SliderFilter';
import CheckboxFilter from './CheckboxFilter';

interface FilterFieldRendererProps {
  field: FilterField;
  value: any;
  onChange: (value: any) => void;
}

const FilterFieldRenderer: React.FC<FilterFieldRendererProps> = ({ field, value, onChange }) => {
  switch (field.type) {
    case 'text':
      return <TextFilter field={field} value={value} onChange={onChange} />;
    case 'select':
      return <SelectFilter field={field} value={value} onChange={onChange} />;
    case 'multiSelect':
      return <MultiSelectFilter field={field} value={value} onChange={onChange} />;
    case 'dateRange':
      return <DateRangeFilter field={field} value={value} onChange={onChange} />;
    case 'numberRange':
      return <NumberRangeFilter field={field} value={value} onChange={onChange} />;
    case 'slider':
      return <SliderFilter field={field} value={value} onChange={onChange} />;
    case 'checkbox':
      return <CheckboxFilter field={field} value={value} onChange={onChange} />;
    default:
      return null;
  }
};

export default FilterFieldRenderer;
