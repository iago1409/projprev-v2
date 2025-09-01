import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { TipoContratoOption } from '../types';

interface SelectInputProps {
  value: string;
  onChange: (value: string) => void;
  options: TipoContratoOption[];
  placeholder?: string;
  required?: boolean;
  error?: string;
  disabled?: boolean;
  label?: string;
}

export const SelectInput: React.FC<SelectInputProps> = ({
  value,
  onChange,
  options,
  placeholder = "Selecione uma opção",
  required = false,
  error,
  disabled = false,
  label
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const selectRef = useRef<HTMLDivElement>(null);
  
  const selectedOption = options.find(opt => opt.value === value);
  const displayText = selectedOption ? `${selectedOption.value} - ${selectedOption.label}` : '';
  
  const filteredOptions = options.filter(option =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
    option.value.includes(searchTerm) ||
    option.description.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  const handleOptionClick = (option: TipoContratoOption) => {
    onChange(option.value);
    setIsOpen(false);
    setSearchTerm('');
  };
  
  return (
    <div className="space-y-2" ref={selectRef}>
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        <div
          onClick={() => !disabled && setIsOpen(!isOpen)}
          className={`w-full px-3 py-2 pr-10 border rounded-md cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            error 
              ? 'border-red-500 focus:border-red-500 focus:ring-red-200' 
              : 'border-gray-300 focus:border-blue-500'
          } ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white hover:border-gray-400'}`}
        >
          <span className={displayText ? 'text-gray-900' : 'text-gray-500'}>
            {displayText || placeholder}
          </span>
        </div>
        
        <ChevronDown className={`absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 transition-transform ${
          isOpen ? 'rotate-180' : ''
        }`} />
        
        {isOpen && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-80 overflow-hidden">
            <div className="p-2 border-b border-gray-200">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar opção..."
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                autoFocus
              />
            </div>
            
            <div className="max-h-60 overflow-y-auto">
              {filteredOptions.length > 0 ? (
                filteredOptions.map((option) => (
                  <div
                    key={option.value}
                    onClick={() => handleOptionClick(option)}
                    className="px-3 py-3 cursor-pointer hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                  >
                    <div className="font-medium text-gray-900">
                      {option.value} - {option.label}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      {option.description}
                    </div>
                  </div>
                ))
              ) : (
                <div className="px-3 py-3 text-gray-500 text-center">
                  Nenhuma opção encontrada
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};