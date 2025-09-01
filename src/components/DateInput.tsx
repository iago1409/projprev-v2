import React, { useState, useEffect, useRef } from 'react';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';

interface DateInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  error?: string;
  disabled?: boolean;
  label?: string;
  tooltip?: string;
}

export const DateInput: React.FC<DateInputProps> = ({
  value,
  onChange,
  placeholder = "DD/MM/AAAA",
  required = false,
  error,
  disabled = false,
  label,
  tooltip
}) => {
  const [displayValue, setDisplayValue] = useState(value);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const calendarRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    setDisplayValue(value);
  }, [value]);
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (calendarRef.current && !calendarRef.current.contains(event.target as Node)) {
        setIsCalendarOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  const formatDate = (input: string): string => {
    const digits = input.replace(/\D/g, '');
    
    if (digits.length <= 2) return digits;
    if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
    return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4, 8)}`;
  };
  
  const parseDate = (dateString: string): Date | null => {
    if (dateString.length !== 10) return null;
    
    const [day, month, year] = dateString.split('/');
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    
    if (date.getDate() == parseInt(day) && 
        date.getMonth() == parseInt(month) - 1 && 
        date.getFullYear() == parseInt(year)) {
      return date;
    }
    
    return null;
  };
  
  const formatDateForDisplay = (date: Date): string => {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatDate(e.target.value);
    setDisplayValue(formatted);
    
    if (formatted.length === 10) {
      const parsedDate = parseDate(formatted);
      if (parsedDate) {
        onChange(formatted);
      }
    } else if (formatted === '') {
      onChange('');
    }
  };
  
  const handleCalendarIconClick = () => {
    if (!disabled) {
      setIsCalendarOpen(!isCalendarOpen);
      
      // Se há uma data válida no input, usar ela como mês atual
      if (displayValue.length === 10) {
        const parsedDate = parseDate(displayValue);
        if (parsedDate) {
          setCurrentMonth(parsedDate);
        }
      }
    }
  };
  
  const handleDateSelect = (date: Date) => {
    const formatted = formatDateForDisplay(date);
    setDisplayValue(formatted);
    onChange(formatted);
    setIsCalendarOpen(false);
  };
  
  const getDaysInMonth = (date: Date): Date[] => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    
    const days: Date[] = [];
    
    // Adicionar dias vazios do início do mês
    const firstDayOfWeek = firstDay.getDay();
    for (let i = 0; i < firstDayOfWeek; i++) {
      const prevDate = new Date(year, month, -firstDayOfWeek + i + 1);
      days.push(prevDate);
    }
    
    // Adicionar dias do mês atual
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    // Adicionar dias vazios do final do mês para completar a grade
    const remainingDays = 42 - days.length; // 6 semanas * 7 dias
    for (let i = 1; i <= remainingDays; i++) {
      days.push(new Date(year, month + 1, i));
    }
    
    return days;
  };
  
  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth(prev => {
      const newMonth = new Date(prev);
      if (direction === 'prev') {
        newMonth.setMonth(prev.getMonth() - 1);
      } else {
        newMonth.setMonth(prev.getMonth() + 1);
      }
      return newMonth;
    });
  };
  
  const isSelectedDate = (date: Date): boolean => {
    if (displayValue.length !== 10) return false;
    const selectedDate = parseDate(displayValue);
    if (!selectedDate) return false;
    
    return date.getDate() === selectedDate.getDate() &&
           date.getMonth() === selectedDate.getMonth() &&
           date.getFullYear() === selectedDate.getFullYear();
  };
  
  const isCurrentMonth = (date: Date): boolean => {
    return date.getMonth() === currentMonth.getMonth();
  };
  
  const isToday = (date: Date): boolean => {
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  };
  
  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];
  
  const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  
  return (
    <div className="space-y-2" ref={calendarRef}>
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
          {tooltip && (
            <span className="ml-2 text-gray-400 cursor-help" title={tooltip}>
              ℹ️
            </span>
          )}
        </label>
      )}
      
      <div className="relative">
        <input
          type="text"
          value={displayValue}
          onChange={handleInputChange}
          placeholder={placeholder}
          maxLength={10}
          disabled={disabled}
          className={`w-full px-3 py-2 pr-10 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            error 
              ? 'border-red-500 focus:border-red-500 focus:ring-red-200' 
              : 'border-gray-300 focus:border-blue-500'
          } ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''}`}
        />
        <button
          type="button"
          onClick={handleCalendarIconClick}
          disabled={disabled}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full transition-colors disabled:cursor-not-allowed"
        >
          <Calendar className="w-4 h-4 text-gray-400" />
        </button>
        
        {isCalendarOpen && (
          <div className="absolute z-50 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg p-4 w-80">
            {/* Header do calendário */}
            <div className="flex items-center justify-between mb-4">
              <button
                type="button"
                onClick={() => navigateMonth('prev')}
                className="p-1 hover:bg-gray-100 rounded-full transition-colors"
              >
                <ChevronLeft className="w-4 h-4 text-gray-600" />
              </button>
              
              <h3 className="text-sm font-medium text-gray-900">
                {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
              </h3>
              
              <button
                type="button"
                onClick={() => navigateMonth('next')}
                className="p-1 hover:bg-gray-100 rounded-full transition-colors"
              >
                <ChevronRight className="w-4 h-4 text-gray-600" />
              </button>
            </div>
            
            {/* Dias da semana */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {weekDays.map(day => (
                <div key={day} className="text-xs font-medium text-gray-500 text-center py-2">
                  {day}
                </div>
              ))}
            </div>
            
            {/* Grade de dias */}
            <div className="grid grid-cols-7 gap-1">
              {getDaysInMonth(currentMonth).map((date, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleDateSelect(date)}
                  className={`
                    text-sm py-2 px-1 rounded-md transition-colors
                    ${isSelectedDate(date) 
                      ? 'bg-blue-500 text-white' 
                      : isToday(date)
                        ? 'bg-blue-100 text-blue-700 font-medium'
                        : isCurrentMonth(date)
                          ? 'text-gray-900 hover:bg-gray-100'
                          : 'text-gray-400 hover:bg-gray-50'
                    }
                  `}
                >
                  {date.getDate()}
                </button>
              ))}
            </div>
            
            {/* Botão para hoje */}
            <div className="mt-4 pt-3 border-t border-gray-200">
              <button
                type="button"
                onClick={() => handleDateSelect(new Date())}
                className="w-full text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                Hoje
              </button>
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