import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PageLayout } from '../components/layout/PageLayout';
import { PageHeader } from '../components/layout/PageHeader';
import { CPFInput } from '../components/CPFInput';
import { createWorkerRepository } from '../services/workerRepository';
import { WorkerSearchResult } from '../types';

const workerRepository = createWorkerRepository();

export const Landing: React.FC = () => {
  const navigate = useNavigate();
  
  const handleSearch = async (cpf: string): Promise<WorkerSearchResult[]> => {
    return await workerRepository.searchByCpfPrefix(cpf);
  };
  
  const handleResultClick = (cpf: string) => {
    navigate(`/registrar?cpf=${cpf}`);
  };
  
  const handleRegisterClick = (cpf: string) => {
    const queryParam = cpf ? `?cpf=${cpf}` : '';
    navigate(`/registrar${queryParam}`);
  };
  
  // Breadcrumb items para a página inicial
  const breadcrumbItems = [
    {
      label: 'Início'
    }
  ];
  
  return (
    <PageLayout breadcrumbItems={breadcrumbItems}>
      <div className="py-4">
        <PageHeader
          title="Processo Trabalhista"
        />
        
        <CPFInput
          onSearch={handleSearch}
          onResultClick={handleResultClick}
          onRegisterClick={handleRegisterClick}
        />
      </div>
    </PageLayout>
  );
};