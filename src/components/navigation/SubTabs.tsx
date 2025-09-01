import React from 'react';
import { useNavigate } from 'react-router-dom';

interface SubTabsProps {
  activeTab: 'contrato' | 'sucessao' | 'consolidacao';
  cpf?: string;
}

export const SubTabs: React.FC<SubTabsProps> = ({ activeTab, cpf }) => {
  const navigate = useNavigate();
  
  const handleTabClick = (tab: string) => {
    const query = cpf ? `?cpf=${cpf}&tab=${tab}` : `?tab=${tab}`;
    navigate(`/registrar${query}`);
  };
  
  return (
    <div className="border-b border-gray-200">
      <nav className="-mb-px flex space-x-8">
        <button 
          onClick={() => handleTabClick('contrato')}
          className={`border-b-2 py-2 px-1 text-sm font-medium transition-colors ${
            activeTab === 'contrato'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
        >
          INFORMAÇÕES DO CONTRATO (COMPLETO)
        </button>
        <button 
          onClick={() => handleTabClick('sucessao')}
          className={`border-b-2 py-2 px-1 text-sm font-medium transition-colors ${
            activeTab === 'sucessao'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
        >
          INFORMAÇÕES DE SUCESSÃO DE VÍNCULO
        </button>
        <button 
          onClick={() => handleTabClick('consolidacao')}
          className={`border-b-2 py-2 px-1 text-sm font-medium transition-colors ${
            activeTab === 'consolidacao'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
        >
          CONSOLIDAÇÃO DOS VALORES
        </button>
      </nav>
    </div>
  );
};
