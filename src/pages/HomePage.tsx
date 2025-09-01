import React from 'react';
import { Link } from 'react-router-dom';
import { PageLayout } from '../components/layout/PageLayout';
import { PageHeader } from '../components/layout/PageHeader';
import { FileText } from 'lucide-react';

function HomePage() {
  // Empty breadcrumb for home page
  const breadcrumbItems: never[] = [];

  return (
    <PageLayout breadcrumbItems={breadcrumbItems}>
      <PageHeader
        title="Sistema de Processos"
        subtitle="Gerencie seus processos de forma eficiente"
      />
      
      <div className="max-w-md mx-auto">
        <div className="bg-white p-8 rounded-xl shadow-lg">
          <div className="text-center mb-8">
            <FileText className="mx-auto h-16 w-16 text-blue-600 mb-4" />
          </div>
          
          <div className="space-y-4">
            <Link
              to="/dados-processo"
              className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 text-center"
            >
              Cadastrar Novo Processo
            </Link>
            
            <button className="block w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-4 rounded-lg transition-colors duration-200">
              Consultar Processos
            </button>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}

export default HomePage;