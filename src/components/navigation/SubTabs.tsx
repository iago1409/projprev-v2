import React from 'react';
import { useNavigate } from 'react-router-dom';

interface SubTabsProps {
  activeTab: 'contrato' | 'complementares' | 'vinculo' | 'vinculos' | 'sucessao' | 'termino' | 'consolidacao';
  cpf?: string;
}

export const SubTabs: React.FC<SubTabsProps> = ({ activeTab, cpf }) => {
  const navigate = useNavigate();
  
  const handleTabClick = (tab: string) => {
    const query = cpf ? `?cpf=${cpf}` : '';
    
    if (tab === 'vinculos') {
      navigate(`/processo/vinculos-incorporados${query}`);
    } else if (tab === 'sucessao') {
      navigate(`/processo/sucessaovinculo${query}`);
    } else if (tab === 'termino') {
      navigate(`/processo/termino-tsve${query}`);
    } else {
      const tabQuery = cpf ? `?cpf=${cpf}&tab=${tab}` : `?tab=${tab}`;
      navigate(`/registrar${tabQuery}`);
    }
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
          onClick={() => handleTabClick('vinculos')}
          className={`border-b-2 py-2 px-1 text-sm font-medium transition-colors ${
            activeTab === 'vinculos'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
        >
          VÍNCULOS INCORPORADOS
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
          onClick={() => handleTabClick('termino')}
          className={`border-b-2 py-2 px-1 text-sm font-medium transition-colors ${
            activeTab === 'termino'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
        >
          INFORMAÇÕES DE TÉRMINO DE TSVE
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
