import React from 'react';
import { useNavigate } from 'react-router-dom';

interface MainTabsProps {
  activeTab: 'decisao' | 'dados';
  cpf?: string;
}

export const MainTabs: React.FC<MainTabsProps> = ({ activeTab, cpf }) => {
  const navigate = useNavigate();
  
  const handleTabClick = (tab: 'decisao' | 'dados') => {
    const query = cpf ? `?cpf=${cpf}` : '';
    
    switch (tab) {
      case 'decisao':
        navigate(`/processo/informacoes-da-decisao${query}`);
        break;
      case 'dados':
        navigate(`/dados-processo${query}`);
        break;
    }
  };
  
  return (
    <div className="border-b-2 border-gray-300 mb-4">
      <nav className="-mb-px flex space-x-8">
        <button 
          onClick={() => handleTabClick('decisao')}
          className={`border-b-4 py-3 px-1 text-base font-bold transition-colors ${
            activeTab === 'decisao'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
        >
          INFORMAÇÕES DA DECISÃO OU ACORDO
        </button>
        <button 
          onClick={() => handleTabClick('dados')}
          className={`border-b-4 py-3 px-1 text-base font-medium transition-colors ${
            activeTab === 'dados'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
        >
          DADOS DO PROCESSO
        </button>
      </nav>
    </div>
  );
};
