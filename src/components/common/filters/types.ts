
export interface FilterField {
  key: string;
  label: string;
  type: 'text' | 'select' | 'multiSelect' | 'dateRange' | 'numberRange' | 'slider' | 'checkbox';
  options?: Array<{ value: string | number; label: string }>;
  min?: number;
  max?: number;
  step?: number;
}

export interface AdvancedFilterProps {
  fields: FilterField[];
  onFilterChange: (filters: Record<string, any>) => void;
  onReset: () => void;
}
