
import React from 'react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { FilterField } from './types';

interface DateRangeFilterProps {
  field: FilterField;
  value: { from?: Date; to?: Date };
  onChange: (value: { from?: Date; to?: Date }) => void;
}

const DateRangeFilter: React.FC<DateRangeFilterProps> = ({ value, onChange }) => {
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
            onSelect={(date) => onChange({ ...value, from: date })}
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
            onSelect={(date) => onChange({ ...value, to: date })}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default DateRangeFilter;
