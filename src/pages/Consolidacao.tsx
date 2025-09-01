import React from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { PageLayout } from '../components/layout/PageLayout';
import { PageHeader } from '../components/layout/PageHeader';
import { ActionButtons } from '../components/ui/ActionButtons';
import { formatCPF } from '../utils/cpfUtils';

export const Consolidacao: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const cpf = searchParams.get('cpf') || '';
  
  const handleAnterior = () => {
    navigate(`/indicadores?cpf=${cpf}`);
  };
  
  const handleCancelar = () => {
    navigate('/');
  };
  
  // Breadcrumb items
  const breadcrumbItems = [
    {
      label: 'Início',
      onClick: () => navigate('/')
    },
    {
      label: 'Registro de Processo',
      onClick: () => navigate(`/registrar?cpf=${cpf}`)
    },
    {
      label: 'Consolidação dos Valores'
    }
  ];
  
  return (
    <PageLayout breadcrumbItems={breadcrumbItems}>
      <PageHeader
        title="Consolidação dos Valores do Contrato"
        cpf={cpf}
        formatCPF={formatCPF}
      />
      
      {/* Abas */}
      <div className="mb-8">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button className="border-b-2 border-blue-500 py-2 px-1 text-sm font-medium text-blue-600">
              INFORMAÇÕES DA DECISÃO OU ACORDO
            </button>
            <button className="border-b-2 border-transparent py-2 px-1 text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300">
              DADOS DO PROCESSO
            </button>
          </nav>
        </div>
      </div>
      
      {/* Stepper */}
      <div className="mb-8">
        <div className="flex items-center">
          <div className="flex items-center">
            <div className="flex items-center justify-center w-8 h-8 bg-green-500 text-white rounded-full text-sm font-medium">
              ✓
            </div>
            <span className="ml-2 text-sm font-medium text-green-600">
              Informações do Contrato
            </span>
          </div>
          <div className="flex-1 mx-4 h-px bg-green-500"></div>
          <div className="flex items-center">
            <div className="flex items-center justify-center w-8 h-8 bg-green-500 text-white rounded-full text-sm font-medium">
              ✓
            </div>
            <span className="ml-2 text-sm font-medium text-green-600">
              Indicadores do Processo
            </span>
          </div>
          <div className="flex-1 mx-4 h-px bg-blue-500"></div>
          <div className="flex items-center">
            <div className="flex items-center justify-center w-8 h-8 bg-blue-500 text-white rounded-full text-sm font-medium">
              3
            </div>
            <span className="ml-2 text-sm font-medium text-blue-600">
              Consolidação dos Valores do Contrato
            </span>
          </div>
        </div>
      </div>
      
      {/* Conteúdo da página */}
      <div className="bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg p-8 max-w-2xl mx-auto mb-8">
        <p className="text-gray-600 text-center">
          Etapa "Consolidação dos Valores do Contrato" será implementada em breve.
        </p>
      </div>
      
      <ActionButtons
        onCancel={handleCancelar}
        onPrevious={handleAnterior}
        showSaveDraft={true}
        showNext={true}
        cancelLabel="CANCELAR"
        previousLabel="ANTERIOR"
        nextLabel="PRÓXIMO"
      />
    </PageLayout>
  );
};