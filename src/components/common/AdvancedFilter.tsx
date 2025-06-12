
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Filter, X, RotateCcw } from 'lucide-react';
import { AdvancedFilterProps } from './filters/types';
import FilterFieldRenderer from './filters/FilterFieldRenderer';

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
                <FilterFieldRenderer
                  field={field}
                  value={filters[field.key]}
                  onChange={(value) => handleFilterChange(field.key, value)}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvancedFilter;
