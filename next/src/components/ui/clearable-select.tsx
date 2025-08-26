import React, { useState, useEffect, useRef } from 'react';
import { useFrappeGetDocList } from 'frappe-react-sdk';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { X } from 'lucide-react';

interface ClearableSelectProps {
  doctype: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  filters?: any;
}

const ClearableSelect: React.FC<ClearableSelectProps> = ({
  doctype,
  value,
  onChange,
  placeholder = 'Select...',
  filters = {},
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const { data, error, isLoading } = useFrappeGetDocList(doctype, {
    fields: ['name'],
    filters: searchTerm ? [['name', 'like', `%${searchTerm}%`], ...filters] : filters,
    limit: 10,
  });

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [wrapperRef]);
  
  const handleSelect = (selectedValue: string) => {
    onChange(selectedValue);
    setSearchTerm(selectedValue);
    setIsOpen(false);
  };

  const handleClear = () => {
    onChange('');
    setSearchTerm('');
  };

  return (
    <div className="relative" ref={wrapperRef}>
      <div className="flex items-center">
        <Input
          type="text"
          value={searchTerm || value}
          onChange={(e) => setSearchTerm(e.target.value)}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className="w-full"
        />
        {value && (
          <Button variant="ghost" size="icon" onClick={handleClear} className="ml-2">
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
          <ScrollArea className="h-40">
            {isLoading && <div className="p-2">Loading...</div>}
            {error && <div className="p-2 text-red-500">{error.message}</div>}
            {data && data.length > 0 ? (
              data.map((doc) => (
                <div
                  key={doc.name}
                  onClick={() => handleSelect(doc.name)}
                  className="p-2 cursor-pointer hover:bg-gray-100"
                >
                  {doc.name}
                </div>
              ))
            ) : (
              !isLoading && <div className="p-2">No results found</div>
            )}
          </ScrollArea>
        </div>
      )}
    </div>
  );
};

export default ClearableSelect;