import React, { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { formatCPF, removeCPFMask, isValidCPF } from '../utils/cpfUtils';
import { WorkerSearchResult } from '../types';
import { useDebounce } from '../hooks/useDebounce';

interface CPFInputProps {
  onSearch: (cpf: string) => Promise<WorkerSearchResult[]>;
  onResultClick: (cpf: string) => void;
  onRegisterClick: (cpf: string) => void;
}

export const CPFInput: React.FC<CPFInputProps> = ({
  onSearch,
  onResultClick,
  onRegisterClick
}) => {
  const [cpf, setCpf] = useState('');
  const [hasError, setHasError] = useState(false);
  const [results, setResults] = useState<WorkerSearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const debouncedCpf = useDebounce(cpf, 350);
  
  useEffect(() => {
    const searchCpf = async () => {
      const digits = removeCPFMask(debouncedCpf);
      
      if (digits.length >= 3) {
        setIsLoading(true);
        try {
          const searchResults = await onSearch(digits);
          setResults(searchResults);
        } catch (error) {
          console.error('Erro ao buscar CPF:', error);
          setResults([]);
        } finally {
          setIsLoading(false);
        }
      } else {
        setResults([]);
      }
    };
    
    searchCpf();
  }, [debouncedCpf, onSearch]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const formattedValue = formatCPF(value);
    setCpf(formattedValue);
    setHasError(false);
  };
  
  const handleInputBlur = () => {
    const digits = removeCPFMask(cpf);
    if (digits.length > 0 && digits.length < 11) {
      setHasError(true);
    } else if (digits.length === 11 && !isValidCPF(cpf)) {
      setHasError(true);
    }
  };
  
  const handleClear = () => {
    setCpf('');
    setHasError(false);
    setResults([]);
    inputRef.current?.focus();
  };
  
  const handleResultClick = (result: WorkerSearchResult) => {
    setCpf(formatCPF(result.cpfWithoutMask));
    setResults([]);
    onResultClick(result.cpfWithoutMask);
  };
  
  const handleRegisterClick = () => {
    const digits = removeCPFMask(cpf);
    const validCpf = digits.length === 11 && isValidCPF(cpf) ? digits : '';
    onRegisterClick(validCpf);
  };
  
  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Campo de CPF */}
      <div className="mb-6">
        <label className="block text-lg font-medium text-gray-800 mb-3">
          Selecione o trabalhador pelo CPF completo <span className="text-red-500">*</span>
        </label>
        
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            value={cpf}
            onChange={handleInputChange}
            onBlur={handleInputBlur}
            placeholder="___.___.___-__"
            maxLength={14}
            className={`w-full px-4 py-3 pr-12 text-lg border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
              hasError 
                ? 'border-red-500 focus:border-red-500 focus:ring-red-200' 
                : 'border-gray-300 focus:border-blue-500'
            }`}
          />
          
          {cpf && (
            <button
              onClick={handleClear}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full transition-colors"
              type="button"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          )}
        </div>
        
        {hasError && (
          <p className="mt-2 text-sm text-red-600">
            Digite um CPF válido com 11 dígitos
          </p>
        )}
      </div>
      
      {/* Lista de Resultados */}
      {(results.length > 0 || isLoading) && (
        <div className="mb-6 space-y-2">
          {isLoading ? (
            <div className="bg-gray-100 border border-gray-200 rounded-lg p-4 text-center text-gray-600">
              Buscando...
            </div>
          ) : (
            results.map((result, index) => (
              <button
                key={index}
                onClick={() => handleResultClick(result)}
                className="w-full bg-gray-100 border border-gray-200 rounded-lg p-4 text-left hover:bg-gray-200 hover:border-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <span className="text-gray-800 font-mono text-sm">
                  {result.displayText}
                </span>
              </button>
            ))
          )}
        </div>
      )}
      
      {/* CTA de Cadastro */}
      <div className="w-full">
        <button
          onClick={handleRegisterClick}
          className="w-full border-2 border-gray-400 bg-white hover:bg-gray-50 text-gray-800 font-medium py-4 px-6 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 text-center"
        >
          CASO O TRABALHADOR NÃO ESTEJA NO CADASTRO, CLIQUE AQUI PARA REGISTRAR O PROCESSO
        </button>
      </div>
    </div>
  );
};